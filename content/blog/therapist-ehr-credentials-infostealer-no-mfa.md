---
title: "Therapists, Infostealers, and the Gap Between Policy and Practice"
description: "While processing infostealer logs, I found hundreds of credentials for mental health EHR platforms like SimplePractice and various patient portals, none with MFA enabled, all with access to patient PHI."
pubDate: 2026-03-15
animation: "filetree"
---

While processing infostealer logs through my pipeline, one category of credentials kept surfacing: mental health and therapy platforms. SimplePractice, TherapyNotes, patient portals tied to specific practices, telehealth login pages. The usernames were therapist email addresses. The passwords were plaintext in the log, as they always are. None of the accounts had MFA enabled.

This post is about what that means, and why the privacy policies plastered on those same platforms make it worse.

## What I Found

Therapists use Electronic Health Record (EHR) software to manage appointments, treatment notes, billing, and patient communication. Platforms like SimplePractice are purpose-built for private practice. Patient portals, either standalone or embedded within larger EHR systems, give patients access to their own records and messaging.

These platforms hold Protected Health Information (PHI): diagnoses, session notes, medication records, insurance details, home addresses. Under HIPAA, covered entities have legal obligations around how that data is secured and disclosed.

Across the logs I processed, I found credentials for:

- `account.simplepractice.com`
- `therapynotes.com/app/login`
- Various white-labeled patient portals running on shared EHR infrastructure
- Telehealth platforms linked to specific practices

The volume was not trivial. These were not one-off hits. When I queried my database for domains matching known therapy and mental health EHR platforms, I got consistent results across multiple log sources, multiple stealer families, and multiple time periods.

## MFA Was Off

SimplePractice supports MFA. So do most of the other platforms in this category. It is not a missing feature; it is a setting that can be toggled on by the practice administrator or the individual user.

None of the compromised accounts I found had MFA enforced or enabled. This is verifiable in a few ways: infostealer logs sometimes capture session cookies and browser autofill data alongside credentials, and the absence of TOTP or push notification artifacts in the logs is consistent with accounts that never configured it. Beyond that, the credentials themselves were plaintext and functional at time of collection; accounts protected by MFA would require an additional factor that the stealer could not silently capture.

This is a well-documented problem. MFA significantly reduces the effectiveness of credential-based attacks. A stolen username and password is not enough to authenticate if the second factor is hardware-bound or tied to a device the attacker does not control. For platforms holding PHI, the calculus for enabling it is not close.

## The Policy

Most of these platforms display HIPAA compliance notices prominently. The language is consistent across providers. A typical notice reads something like:

> I understand that health information about you and your health care is personal. I am committed to protecting health information about you. I create a record of the care and services you receive from me. I need this record to provide you with quality care and to comply with certain legal requirements.

Further down:

> Make sure that protected health information ("PHI") that identifies you is kept private.

These are not marketing claims. HIPAA's Security Rule requires covered entities to implement reasonable and appropriate safeguards for electronic PHI (ePHI). The guidance from HHS specifically calls out access controls, authentication, and audit controls as required or addressable implementation specifications. MFA is the most direct control available for preventing unauthorized access via stolen credentials.

A practice that publishes a notice committing to protect patient PHI, operates on a platform that offers MFA, and does not enable that MFA, has a gap between what they say and what they do.

## The Actual Attack Path

The machines that got compromised were running common infostealer families: LummaC2, Redline, StealC. The infection vector is typically a malicious download: a cracked application, a fake browser extension, a phishing document. The stealer runs in memory, scrapes saved credentials from browser stores, and exfiltrates them within minutes. The entire process is silent. No ransomware banner. No obvious system disruption. The therapist's computer keeps working. Their EHR credentials are now in a Telegram channel.

The question of whether a weak password contributed to the initial infection is separate from what happens after. Infostealers do not care about password strength; they read credentials out of browser storage after the browser has already decrypted them. Password complexity provides no protection here.

What matters after infection is the blast radius. If a credential is stolen and MFA is not enabled, the account is accessible to anyone who holds the credential. The attacker does not need to exploit anything else. They visit the login page, enter the username and password from the log, and they are in.

For a SimplePractice account, "in" means access to the full patient list, session notes, diagnoses, billing information, and secure messaging. For a patient portal, it means access to the same data from the patient side, plus the ability to impersonate the patient in communications with the practice.

## A Reasonable Question

If a therapist's computer is infected with an infostealer, their EHR credentials are stolen, those credentials are distributed through Telegram, and their patient records become accessible to anyone who queries a stealer log database; was not enabling MFA enough of a failure to constitute a HIPAA breach?

HIPAA's breach notification rules center on whether PHI was "acquired or disclosed in a way that compromises the security or privacy of the PHI." A credential in a stealer log, attached to an account with no MFA, on a platform containing patient records, is a reasonable candidate for that threshold.

The HIPAA Security Rule does not mandate MFA by name; it is an addressable implementation specification, meaning covered entities are supposed to implement it or document why it is not reasonable and appropriate for their environment. For a cloud-based EHR accessed via browser, "not reasonable and appropriate" is a difficult argument to make.

## What This Actually Looks Like at Scale

When I look at the distribution of EHR credentials across stealer logs, a few things stand out:

Solo practitioners are disproportionately represented. Large healthcare systems have IT departments, endpoint detection, and security policies that make widespread infostealer infections harder to sustain quietly. A therapist in private practice is running their own IT. They chose their own computer. They manage their own software. When they get infected, no one notices.

The infection timestamps are spread across months. These are not credentials from a single campaign. They represent an ongoing, steady-state exposure: therapists getting infected, credentials being stolen, logs being distributed, and accounts remaining accessible because nothing forced a password rotation or triggered an alert.

The platforms know this is happening. SimplePractice and similar vendors have security teams. They process login events. Logins from unusual IP addresses, unusual countries, or unusual times should be detectable. Whether those detections are in place and functioning is outside what I can assess from log data, but the credential exposure side of this is not a secret.

## This Has Already Happened

The scenario described above is not hypothetical. In October 2020, Vastaamo, at the time Finland's largest private psychotherapy network serving roughly 30,000 patients, was breached and its entire patient database was exfiltrated. The records included not just names and contact details but the actual written session notes therapists had entered after each appointment: diagnoses, disclosures of abuse, suicide attempts, substance use, relationship details. A hacker then extorted the company for 40 bitcoin and, when that failed, began emailing patients individually with ransom demands containing excerpts from their own therapy records.

The technical failures at Vastaamo were not exotic. A [peer-reviewed case study published in *Australasian Psychiatry*](https://pmc.ncbi.nlm.nih.gov/articles/PMC11804136/) documents what went wrong: the patient database was not encrypted at rest or in transit. There was no MFA. Passwords were weak and shared; Finnish media reported that the password "ammi70" was created at one clinic in 2012 and then used across workstations for years. At some point, the server's firewall protections were removed by internal IT staff to enable remote access, apparently without setting up a VPN, leaving the database accessible from the public internet protected only by a login screen with that password. The hacker claimed they had been sitting on the database for 18 months before realizing its value.

As [WIRED reported](https://www.wired.com/story/vastaamo-psychotherapy-patients-hack-data-breach/), Vastaamo was operating as a self-certified Class B health information system, a classification intended for small organizations that wouldn't be attractive targets. The company had grown to 20+ clinics and hundreds of therapists while remaining under that lighter regulatory burden. In 2024, the hacker was sentenced to six years and three months in prison for 30,000 crimes, one for each victim.

The [HIBP entry for Vastaamo](https://haveibeenpwned.com/Breach/Vastaamo) lists the breach as sensitive, searchable only by verified email owners, which reflects the nature of what was exposed. It is one of 74 breaches in the system flagged this way.

The difference between Vastaamo and what I am describing is the attack vector. Vastaamo was a direct server breach enabled by a disabled firewall and a trivially guessable password. The credentials I found in stealer logs represent a different path to the same outcome: an attacker does not need to compromise the EHR platform itself. They compromise the therapist's workstation through a phishing document or a malicious download, the infostealer reads the saved credentials from the browser, and those credentials end up in a Telegram channel. No firewall to bypass. No server to enumerate. Just a login page and a username and password that work.

MFA stops both paths cold. It did not exist at Vastaamo, and it is not enabled on the accounts I found.

## The Broader Point

The privacy notice in the image attached to this post is a real example pulled from a mental health practice's published HIPAA notice. It is a commitment, in writing, to protect PHI. The practice that published it almost certainly believes it is honoring that commitment. They chose a HIPAA-compliant platform. They signed a Business Associate Agreement. They put up the notice.

But a signed BAA and a posted notice do not protect patient data. The technical controls do. MFA is one of the most direct, highest-leverage controls available, and it was absent from every EHR credential I found in stealer logs.

Setting a complex password and assuming that is sufficient after getting compromised by malware that bypasses password complexity entirely is not a security posture. It is a policy without implementation.

The gap between "I am committed to protecting your health information" and "I did not enable the MFA option my EHR platform offers" is not a technicality. It is the entire attack surface.

---

If you work in security research or incident response and want to discuss credential exposure in healthcare, reach out at [nainainairobi@onionmail.org](mailto:nainainairobi@onionmail.org).
