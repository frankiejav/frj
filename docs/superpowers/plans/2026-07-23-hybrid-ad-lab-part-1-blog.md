# Hybrid AD Lab Part 1 Blog Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the Obsidian Hybrid AD Lab Part 1 note as a live Velite blog post with images and today's pubDate.

**Architecture:** Content lives in `content/blog/*.md` and is compiled by Velite. Static images are served from `public/images/`. No app code changes; copy three PNGs and add one markdown file with frontmatter matching the existing Navidrome post.

**Tech Stack:** Markdown + Velite + Next.js (existing site)

**Spec:** `docs/superpowers/specs/2026-07-23-hybrid-ad-lab-part-1-blog-design.md`

---

## File map

| Path | Role |
|---|---|
| `public/images/hybrid-ad-lab/devices-hybrid-joined-pending.png` | Entra devices screenshot |
| `public/images/hybrid-ad-lab/connect-upn-not-added.png` | Connect UPN warning screenshot |
| `public/images/hybrid-ad-lab/tenant-license.png` | Tenant license screenshot |
| `content/blog/hybrid-ad-lab-part-1-everything-that-broke.md` | Published post |

Source images:

- `/home/frj/Documents/obsidian/myNotes/Assets/images/devices-hybrid-joined-pending.png`
- `/home/frj/Documents/obsidian/myNotes/Assets/images/connect-upn-not-added.png`
- `/home/frj/Documents/obsidian/myNotes/Assets/images/tenant-license.png`

---

### Task 1: Copy images into public/

**Files:**
- Create: `public/images/hybrid-ad-lab/devices-hybrid-joined-pending.png`
- Create: `public/images/hybrid-ad-lab/connect-upn-not-added.png`
- Create: `public/images/hybrid-ad-lab/tenant-license.png`

- [ ] **Step 1: Create directory and copy the three PNGs**

```bash
mkdir -p public/images/hybrid-ad-lab
cp "/home/frj/Documents/obsidian/myNotes/Assets/images/devices-hybrid-joined-pending.png" \
   "/home/frj/Documents/obsidian/myNotes/Assets/images/connect-upn-not-added.png" \
   "/home/frj/Documents/obsidian/myNotes/Assets/images/tenant-license.png" \
   public/images/hybrid-ad-lab/
ls -la public/images/hybrid-ad-lab/
```

Expected: three PNG files listed.

- [ ] **Step 2: Commit images**

```bash
git add public/images/hybrid-ad-lab/
git commit -m "$(cat <<'EOF'
Add Hybrid AD Lab Part 1 screenshots.

EOF
)"
```

---

### Task 2: Add the blog markdown post

**Files:**
- Create: `content/blog/hybrid-ad-lab-part-1-everything-that-broke.md`

- [ ] **Step 1: Write the post file**

Create `content/blog/hybrid-ad-lab-part-1-everything-that-broke.md` with exactly this content:

```markdown
---
title: "Hybrid AD Lab Part 1 - Everything That Broke"
description: "Building a Windows Server 2025 Active Directory lab on Arch Linux, syncing to Entra ID, and every failure along the way to hybrid join."
pubDate: 2026-07-23
---

I'm documenting the process of building a windows server 2025 active directory lab on my arch linux workstation and syncing it to entra ID. This covers the domain controller setup, the OU structure, cloud sync, and every failure I ran into trying to get a windows 11 client hybrid joined, because the failures are the part worth reading.

## Infrastructure

The hypervisor is KVM/QEMU managed through virt-manager, with the SPICE guest tools installed for display and clipboard integration. The server VM runs windows server 2025 datacenter, the ISO came from the microsoft benefits tied to my school account. The client is windows 11 education. Nothing is exposed outside the default libvirt NAT network (192.168.122.0/24), so the entire environment stays contained on my workstation.

## Domain Controller Setup

Static IP first, with DNS pointing at itself since it will become the authoritative resolver for the domain:

```powershell
New-NetIPAddress -InterfaceAlias "Ethernet 3" -IPAddress 192.168.122.10 -PrefixLength 24 -DefaultGateway 192.168.122.1
Set-DnsClientServerAddress -InterfaceAlias "Ethernet 3" -ServerAddresses 192.168.122.10
```

Then the AD DS role and a new forest:

```powershell
Install-WindowsFeature -Name AD-Domain-Services -IncludeManagementTools

Install-ADDSForest `
  -DomainName "frlabs.local" `
  -DomainNetbiosName "FRLABS" `
  -InstallDns:$true `
  -SafeModeAdministratorPassword (ConvertTo-SecureString "REDACTED" -AsPlainText -Force) `
  -Force:$true
```

Because the end goal involved entra ID, I added my tenant's UPN suffix to the forest so on-prem users map cleanly onto cloud identities:

```powershell
Set-ADForest -Identity "frlabs.local" -UPNSuffixes @{Add="frlabs01.onmicrosoft.com"}
```

## OU Structure

I did not want a flat lab where everything sits in the default containers; half the value of doing this is practicing the organizational side. The layout has a root OU with tiered admin OUs underneath (a simplified version of the microsoft tiering model), department OUs with their own users and groups sub-OUs, and separate OUs for computer types, service accounts, and disabled accounts.

```powershell
$base = "DC=frlabs,DC=local"
New-ADOrganizationalUnit -Name "FRLabs" -Path $base
$root = "OU=FRLabs,$base"

New-ADOrganizationalUnit -Name "Admin" -Path $root
New-ADOrganizationalUnit -Name "Tier0-DomainAdmins" -Path "OU=Admin,$root"
New-ADOrganizationalUnit -Name "Tier1-ServerAdmins" -Path "OU=Admin,$root"
New-ADOrganizationalUnit -Name "Tier2-WorkstationAdmins" -Path "OU=Admin,$root"

New-ADOrganizationalUnit -Name "Departments" -Path $root
foreach ($dept in "IT","Sales","HR") {
    New-ADOrganizationalUnit -Name $dept -Path "OU=Departments,$root"
    New-ADOrganizationalUnit -Name "Users" -Path "OU=$dept,OU=Departments,$root"
    New-ADOrganizationalUnit -Name "Groups" -Path "OU=$dept,OU=Departments,$root"
}

New-ADOrganizationalUnit -Name "Computers" -Path $root
foreach ($type in "Workstations","Servers","Laptops") {
    New-ADOrganizationalUnit -Name $type -Path "OU=Computers,$root"
}
```

On top of that I scripted five sample users spread across the three departments, each with a UPN on the cloud routable suffix, plus one security group per department with the matching membership. Everything is in a script; if you cannot rebuild your lab from scratch you do not really have a lab, you have a snowflake.

## Cloud Sync

I installed the entra cloud sync provisioning agent on the DC, authenticated with a global admin account, and set the scope. Users appeared in the entra portal without any issues. Up to this point the whole thing behaves exactly like the tutorials say it will.

Then I tried to join the windows 11 client, and the tutorial phase ended.

## Failure 1: dsregcmd /join Does Not Join a Domain

I ran `dsregcmd /join` on the client and got nothing useful back. `dsregcmd /status` showed the actual state:

```
AzureAdJoined : NO
DomainJoined  : NO
```

I had conflated two separate operations. `dsregcmd /join` only performs the entra ID registration half of a hybrid join; it assumes the machine is already joined to on-prem AD. Despite the name, it does not join anything to a domain. The domain join itself is:

```powershell
Add-Computer -DomainName "frlabs.local" -Credential (Get-Credential) -Restart
```

That worked on the first attempt. DNS on the client was already pointed at the DC, the SRV records resolved correctly (`_ldap._tcp.dc._msdcs.frlabs.local`), and the machine came back from the reboot with `DomainJoined: YES`. First lesson: verify what a tool actually does before blaming the network.

## Failure 2: error_missing_device

With the domain join complete, `dsregcmd /join` now attempted the registration and failed with a server side error:

```
Server ErrorSubCode: error_missing_device
Server Message: "The device object by the given id (...) is not found."
```

The error is descriptive once you understand the hybrid join flow: the client generates its device identity locally, but entra ID must already know about the computer object because your sync tool is supposed to have pushed it there first. Mine had not, for a simple reason; device sync was disabled in my cloud sync configuration. Users and groups were syncing, computers were not.

I enabled device sync and both VMs showed up in the entra portal under devices, join type "Microsoft Entra hybrid joined", registration state pending.

![both lab VMs listed in entra ID as hybrid joined, stuck at pending registration](/images/hybrid-ad-lab/devices-hybrid-joined-pending.png)

Pending means the computer object made it up from on-prem but the device itself has never completed its half of the registration handshake. The loop is not closed. In my case it never closed.

## Failure 3: error_computer_id_timestamp_out_of_range

Retrying the join produced a new error:

```
Server ErrorSubCode: error_computer_id_timestamp_out_of_range
Server Message: "Failed to validate timestamp in computerIdentityData..."
```

I went through the standard playbook: `dsregcmd /leave`, deleted the device registration keys under `HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CDJ`, forced time sync against the DC, reset the machine account password. No change. I escalated to deleting the computer object from AD, unjoining, and rejoining to get a completely fresh identity.

The unjoin itself failed; `Remove-Computer` returned "No mapping between account names and security IDs was done" because I had already deleted the computer object on the DC, so the domain could no longer resolve the machine's SID. The workaround is to bypass the DC entirely and unjoin through WMI with local admin credentials:

```powershell
$computer = Get-WmiObject Win32_ComputerSystem
$computer.UnjoinDomainOrWorkGroup("local-admin-password", "Administrator", 0)
```

That returned `ReturnValue: 0`. Reboot, rejoin, new ObjectGUID, and then `dsregcmd /join` failed again, back to `error_missing_device` with the new device ID. Provision on demand in the entra portal could not even locate the computer object in AD (`ResourceNotFound`), with the scoping filter set to all objects.

## The Actual Cause

At this point I stopped suspecting my configuration and started suspecting the tool, which turned out to be correct.

Entra cloud sync does not support syncing device objects for hybrid join. Microsoft's own decision guide between connect sync and cloud sync still lists device synchronization as connect only. Classic hybrid join depends on the full entra connect sync engine and a device object flow that cloud sync does not implement; every error I hit, `error_missing_device`, the timestamp failure, the `ResourceNotFound` on provision on demand, was the same feature gap surfacing in different places.

I did run the full entra connect wizard to see where that road led, and it has its own wall: the sign-in configuration step flags both of my UPN suffixes as not added, because `frlabs.local` can never be a verified domain in any tenant and my tenant has no custom domain at all.

![entra connect wizard flagging both UPN suffixes as not added](/images/hybrid-ad-lab/connect-upn-not-added.png)

There is a checkbox to continue without matching UPN suffixes, but the warning under it tells you users will not be able to sign in with on-prem credentials. On top of that, the device writeback scenarios in connect expect entra ID P1; my tenant is on the free tier.

![tenant overview: primary domain frlabs01.onmicrosoft.com, license microsoft entra ID free](/images/hybrid-ad-lab/tenant-license.png)

So connect is blocked twice, by the unverifiable domain and by licensing, and cloud sync does not sync devices. Both documented paths to hybrid join are closed.

## Where This Leaves Me

The lab itself is healthy; domain join works, user sync works, the OU structure is in place and ready for GPO work. The only blocked piece is the hybrid joined device.

The reason this story has a part 2 is that microsoft released a client initiated hybrid join through entra kerberos in public preview in february 2026, aimed explicitly at environments running cloud sync. It does not depend on connect synced device objects, it requires no P1 license, and its prerequisites read like a description of my lab: a windows server 2025 DC and a current windows 11 client. Part 2 covers cloud kerberos trust, KDC proxy configuration, and whether the preview actually holds up.

## Takeaways

- `dsregcmd /join` is not a domain join. Hybrid join is two operations and the tool only performs one of them.
- Read the server error, not just the failure. `error_missing_device` and `ResourceNotFound` pointed at the sync layer the entire time; I spent effort on time sync and registry keys that were never the problem.
- Pending in the entra portal is a state, not a loading indicator. It means half a handshake, and it can remain that way permanently.
- Check the feature matrix before the configuration. Some failures cannot be fixed because the capability does not exist, and knowing when to stop debugging your setup and start debugging your assumptions is a skill on its own.
- Unjoin before you delete. Removing the computer object from AD first made a clean unjoin impossible and forced the WMI workaround.
```

- [ ] **Step 2: Verify image paths use the public prefix**

```bash
rg '!\[' content/blog/hybrid-ad-lab-part-1-everything-that-broke.md
```

Expected: three lines, each with `/images/hybrid-ad-lab/...` (not bare `images/...`).

- [ ] **Step 3: Commit the post**

```bash
git add content/blog/hybrid-ad-lab-part-1-everything-that-broke.md
git commit -m "$(cat <<'EOF'
Add Hybrid AD Lab Part 1 blog post.

EOF
)"
```

---

### Task 3: Verify Velite / Next build picks up the post

**Files:**
- Verify only (no new files)

- [ ] **Step 1: Run production build**

```bash
npm run build
```

Expected: build succeeds; Velite processes `content/blog/**/*.md` without schema errors.

- [ ] **Step 2: Confirm post metadata in Velite output**

```bash
rg -n 'hybrid-ad-lab-part-1-everything-that-broke' .velite/
```

Expected: matches showing slug `hybrid-ad-lab-part-1-everything-that-broke` and permalink `/blog/hybrid-ad-lab-part-1-everything-that-broke`.

- [ ] **Step 3: Confirm image files exist at public paths**

```bash
test -f public/images/hybrid-ad-lab/devices-hybrid-joined-pending.png \
  && test -f public/images/hybrid-ad-lab/connect-upn-not-added.png \
  && test -f public/images/hybrid-ad-lab/tenant-license.png \
  && echo OK
```

Expected: `OK`

---

## Spec coverage check

| Spec requirement | Task |
|---|---|
| Post file at designed path | Task 2 |
| Frontmatter title/description/pubDate 2026-07-23 | Task 2 |
| No draft | Task 2 (omit field) |
| Body from note, REDACTED kept | Task 2 |
| Three images under `public/images/hybrid-ad-lab/` | Task 1 |
| Image paths rewritten to `/images/hybrid-ad-lab/...` | Task 2 |
| No code/routing changes | All tasks |
| Post buildable / discoverable | Task 3 |
