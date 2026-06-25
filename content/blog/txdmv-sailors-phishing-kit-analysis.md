---
title: "Inside a TxDMV Phishing Kit: Real-Time Card Skimming and Live 3DS Bypass"
description: "A technical teardown of a phishing site impersonating the Texas DMV. The Sailors kit, a Chinese-origin phishing framework sold on Telegram, streams keystrokes to the operator in real time over an encrypted WebSocket and defeats 3D Secure bank authentication through live OTP interception."
pubDate: 2026-03-19
animation: "websocket-skim"
---

A phishing site impersonating the Texas Department of Motor Vehicles surfaced recently at `txdmv.com-zuo.com`. The lure is a fake toll payment page delivered by SMS. The underlying kit is more interesting than most.

![SMS phishing message impersonating TxDMV with link to txdmv.com-zuo.com](/images/txdmv/sms-lure.png)

This post is a technical teardown of how it works: the architecture, the encryption, the anti-analysis measures, and how I bypassed all of them to capture and decrypt the full WebSocket event stream.

## The Kit

The site is built on the **Sailors phishing kit**, a Chinese-origin framework sold through Telegram, actively used in toll scam and DMV impersonation campaigns targeting US residents. The attribution is not ambiguous. The entire CSS surface is namespaced with `sailors-` prefixes (`sailors-input`, `sailors-router-view`, `sailors-input-wrapper`, `sailors-input-field`), and the minified JavaScript bundle contains Chinese-language strings embedded in the obfuscated code:

- `手机验证页`: "phone verification page"
- `邮箱验证页`: "email verification page"

The frontend is a Vue 3 SPA with hash-mode routing, served as a single monolithic bundle (`ojnJIXLG.js`, 289KB). The filename is randomized per deployment. The bundle includes Vue, Vue Router, a Socket.io client, CryptoJS, and FingerprintJS Pro Botd.

## Anti-Analysis: Mobile UA Gate

The first barrier is a server-side User-Agent check. Any request arriving with a desktop UA receives an HTTP 404. There is no redirect, no error message, nothing else loads. This silently blocks researchers using standard browsers and automated scanners that do not spoof mobile UAs.

The working UA I used:

```
Mozilla/5.0 (iPhone; CPU iPhone OS 6_0 like Mac OS X) AppleWebKit/536.26 
(KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25
```

This was applied via a Burp Match & Replace rule on all outbound request headers. Without this, there is nothing to analyze.

## Application Architecture

The page presents a payment form for a fake toll balance. A victim-facing UUID is generated client-side on page load and stored in `localStorage`. A Socket.io WebSocket connection opens immediately to:

```
wss://txdmv.com-zuo.com/console/?uuid=[victim-uuid]&EIO=4&transport=websocket
```

The operator receives a live session the moment the victim loads the page. What follows is not a form submission to a server; it is a real-time stream of every field interaction, delivered keystroke by keystroke.

![Fake TxDMV payment form showing card fields and the CARD_BANK_NOT error message](/images/txdmv/payment-page.png)

### Victim Flow

```
1. Page load
   ├─ UUID generated client-side, stored in localStorage
   ├─ Socket.io WebSocket opened to /console/?uuid=[uuid]
   └─ Operator dashboard receives live session

2. Victim fills payment form
   └─ Every field update emitted as changleField event (keystroke-level)

3. Victim submits form
   ├─ Client-side Luhn validation
   ├─ submitData event: full card + PII sent to operator
   └─ Operator receives complete card data

4. Operator pushes next stage via WebSocket command
   └─ Server returns status: "VerificationPhone" → client navigates to OTP page

5. Victim enters SMS OTP
   ├─ submitCode event sends OTP to operator
   └─ Operator uses OTP in real time to authorize fraudulent transaction

6. Additional stages available: emailCode, appCode, PIN, expressCvv, customCode
```

The operator controls the entire victim UX by pushing `status` values over the WebSocket. The Vue Router responds to each status by navigating to the corresponding route:

| Status | Route | Purpose |
|---|---|---|
| *(default)* | `/index` | Payment card + PII collection |
| `VerificationPhone` | `/phoneCode` | SMS OTP harvest (3DS bypass) |
| `VerificationEmail` | `/emailCode` | Email OTP harvest |
| `VerificationPin` | `/osp` | Card PIN entry |
| `VerificationApp` | `/appCode` | Bank app push notification intercept |
| `VerificationCustomCode` | `/appCustomCode` | Configurable challenge fields |
| `rejected` | *(stays on payment)* | Show card error, prompt retry |
| `completed` | `/success` | Success page shown to victim |

The `rejected` status is particularly useful to the operator. It surfaces a card error message to the victim and prompts them to try a different card, which means a single session can yield multiple cards.

![OTP interception page shown to victim after card submission, collecting the 3DS verification code in real time](/images/txdmv/otp-page.png)

## WebSocket Protocol and Encryption

All WebSocket messages in both directions use Socket.io packet framing:

```
42["message","<base64-encoded-AES-ciphertext>"]
```

Every payload is AES-CBC encrypted before transmission. The encryption parameters:

| Property | Value |
|---|---|
| Algorithm | AES-CBC |
| Padding | PKCS7 |
| Library | CryptoJS (bundled) |
| AES Key | `KIKOCCJCFILDLDND` |
| AES IV | `OJGJHHFMJEJBDFAI` |

The key and IV are hardcoded in the obfuscated bundle. They are constructed by concatenating decoded entries from a self-rotating base64 string table:

```javascript
Le = Ce(389) + "CCJCFILDLDND"       // → "KIKOCCJCFILDLDND" (AES key)
Ee = "OJGJHHFM" + Ce(405) + "DFAI"  // → "OJGJHHFMJEJBDFAI" (AES IV)
```

The encryption function fires on every WebSocket emit:

```javascript
function Ge(e) {
    Me && Me.emit("message",
        CryptoJS.AES.encrypt(
            JSON.stringify(e), xe, { iv: We, mode: CBC, padding: Pkcs7 }
        ).toString()
    );
}
```

The same key and IV are used for every session across every victim. There is no session key derivation.

## JS Obfuscation

The bundle uses a self-rotating base64 string table with an integrity check. At startup, a self-executing function rotates the string array until a numeric checksum passes:

```javascript
for (;;) try {
    if (840766 == [integrity_equation_using_Se_calls]) break;
    o.push(o.shift());
} catch(i) { o.push(o.shift()); }
```

All string literals (API paths, event names, error messages, encryption keys) live encoded in this array and are decoded on access through `Se()`, `Ce()`, and `be()` wrapper functions. Static string search produces nothing useful. Key extraction required reproducing the rotation in Node.js with CryptoJS loaded as `Z` (the kit's internal reference name) to resolve `Le` and `Ee` to their plaintext values.

## Bot Detection

FingerprintJS Pro Botd is embedded in the bundle. It checks for:

- `navigator.webdriver`: Selenium, ChromeDriver
- PhantomJS, Puppeteer, Playwright
- HeadlessChrome, SlimerJS, NightmareJS, Sequentum
- ElectronJS, WebDriverIO, Rhino

Detection results are sent to the operator over the WebSocket. For flagged sessions, the operator returns `status: "rejected"` silently. The victim-facing UX is indistinguishable from a legitimate card decline.

Combined with the mobile UA gate, this creates two layers of filtering: desktop UAs are blocked at the server level before any JavaScript runs, and headless or automated browsers are identified at the application level after the page loads.

## Bypass Methodology

### Step 1: Mobile UA Spoofing

The site returns 404 on desktop UAs. A request header Match & Replace rule in Burp rewrites the User-Agent on all outbound requests:

| Match | Replace | Type |
|---|---|---|
| `^User-Agent.*$` | `User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25` | Request header / Regex |

This was the prerequisite. Without it, the site returns 404 and nothing else loads.

### Step 2: Patch Client-Side Validation

Three response body patches applied to `ojnJIXLG.js` as it transits through Burp:

| Match | Replace | Purpose |
|---|---|---|
| `a%10==0` | `true` | Disable Luhn check |
| `o[t]>=12` | `o[t]>=999` | Disable repeated-digit check |
| `navigator.webdriver` | `false` | Defeat bot detection |

The Luhn implementation also includes a secondary check that rejects card numbers where any single digit appears 12 or more times. This blocks naive test values like `4111 1111 1111 1111`. Both checks need to be patched together.

![Burp Suite HTTP match and replace rules used to patch the JS bundle in transit](/images/txdmv/burp-match-replace.png)

### Step 3: Session Reset Between Attempts

The kit stores the victim UUID in `localStorage` and the operator can permanently flag a UUID server-side. Between attempts:

1. DevTools -> Application -> Local Storage -> `https://txdmv.com-zuo.com`
2. Delete the `uuid` key
3. Hard refresh (`Ctrl+Shift+R`)

Without this, subsequent attempts reuse the same UUID and receive continued server-side rejections regardless of the Luhn patch.

### Step 4: Capture and Decrypt WebSocket Frames

With validation patched and a fresh UUID, the `submitData` event fires successfully. Frames are captured in Burp -> Proxy -> WebSockets history as `42["message","<ciphertext>"]` entries.

Decryption with the extracted key and IV:

```javascript
const CryptoJS = require('crypto-js');
const KEY = CryptoJS.enc.Utf8.parse('KIKOCCJCFILDLDND');
const IV  = CryptoJS.enc.Utf8.parse('OJGJHHFMJEJBDFAI');

const dec = CryptoJS.AES.decrypt(ciphertext, KEY, {
    iv: IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
});

console.log(dec.toString(CryptoJS.enc.Utf8));
```

## Decrypted Event Stream

What comes out of a captured session, in order:

| # | Direction | Event | Data |
|---|---|---|---|
| 1 | C->S | `notice` | `enterCardNumber` |
| 2 | C->S | `changleField` | `{"cardNumber":"4532 0151 3987 6543"}` |
| 3 | C->S | `changleField` | `{"expiryDate":"1"}` |
| 4 | C->S | `changleField` | `{"expiryDate":"12/"}` |
| 5 | C->S | `changleField` | `{"expiryDate":"12/2"}` |
| 6 | C->S | `changleField` | `{"expiryDate":"12/26"}` |
| 7 | C->S | `changleField` | `{"cvv":"331"}` |
| 8 | C->S | `changleField` | `{"fullName":"Noe Hernandez"}` |
| 9 | C->S | `submitData` | Full PII + card object |
| 10 | S->C | `config` | `{"status":"VerificationPhone"}` |

The `changleField` events stream every keystroke before the victim clicks Submit. The operator receives the card number digit by digit. By the time the victim hits the submit button, the operator already has the complete card data and has had several seconds to act on it.

The `submitData` payload collects the full picture:

```json
{
  "event": "submitData",
  "data": {
    "fullName": "",
    "address": "",
    "city": "",
    "state": "",
    "zipCode": "",
    "phone": "",
    "email": "",
    "cardHolder": "",
    "cardNumber": "",
    "expiryDate": "",
    "cvv": "",
    "code": "",
    "pin": "",
    "customCode": "",
    "expressCvv": ""
  }
}
```

After `submitData`, the operator pushed `status: "VerificationPhone"`, triggering the OTP intercept stage. In a real session, this is the moment the victim's bank sends an SMS code for 3D Secure authentication. The operator, already holding the card data, uses that OTP in real time to complete an unauthorized transaction.

## Indicators of Compromise

### Network

| Type | Indicator |
|---|---|
| Domain | `txdmv.com-zuo.com` |
| IP | `104.21.6.44` |
| WebSocket path | `/console/` |
| JS bundle | `/us/static/ojnJIXLG.js` |
| CSS bundle | `/us/static/BH_25xze.css` |
| UA gate | Mobile UA required; desktop returns 404 |

### Cryptographic

| Type | Value |
|---|---|
| AES key | `KIKOCCJCFILDLDND` |
| AES IV | `OJGJHHFMJEJBDFAI` |
| CF site token | `8c425b950f824327a177d3286d7951d4` |
| CF Ray IDs | `9def9e72...`, `9defa1dc...` (ATL PoP) |

### Kit Fingerprints

| Type | Value |
|---|---|
| CSS namespace | `sailors-*` |
| JS framework | Vue 3 + Vue Router (hash mode) |
| Transport | Socket.io / Engine.IO v4 |
| Obfuscation | Self-rotating base64 string table |
| Language artifacts | Chinese strings in bundle |

The Cloudflare Ray IDs are worth including in abuse reports. They allow CF to correlate to the origin server and potentially identify other Sailors kit deployments sharing the same account.

## Reporting

| Organization | Contact |
|---|---|
| FBI IC3 | `ic3.gov` |
| Texas AG Cyber Fraud | `oag.texas.gov` |
| CISA | `cisa.gov/report` |
| Cloudflare Abuse | `abuse.cloudflare.com` |
| Google Safe Browsing | `safebrowsing.google.com/safebrowsing/report_phish/` |
| PhishTank | `phishtank.org` |

---

*All test submissions used synthetic data. No real victim data was collected or retained.*
