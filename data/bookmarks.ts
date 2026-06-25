export interface Bookmark {
  title: string;
  href: string;
  note?: string;
}

export interface BookmarkGroup {
  category: string;
  description?: string;
  items: Bookmark[];
}

export const bookmarks: BookmarkGroup[] = [
  {
    category: "Tools I run",
    description: "The software that shows up in almost everything I do.",
    items: [
      { title: "Proton", href: "https://proton.me", note: "Mail, VPN, the whole suite" },
      { title: "Mullvad VPN", href: "https://mullvad.net", note: "No-account, privacy-first VPN" },
      { title: "KeePassXC", href: "https://keepassxc.org", note: "Local password manager" },
      { title: "Tailscale", href: "https://tailscale.com", note: "Mesh VPN for my machines" },
      { title: "Obsidian", href: "https://obsidian.md", note: "Notes and research graph" },
      { title: "LocalSend", href: "https://localsend.org", note: "AirDrop, but cross-platform" },
    ],
  },
  {
    category: "Reading",
    description: "Sites and feeds worth checking regularly.",
    items: [
      { title: "Krebs on Security", href: "https://krebsonsecurity.com" },
      { title: "The DFIR Report", href: "https://thedfirreport.com" },
      { title: "tl;dr sec", href: "https://tldrsec.com" },
    ],
  },
  {
    category: "Reference",
    description: "Things I keep coming back to.",
    items: [
      { title: "MITRE ATT&CK", href: "https://attack.mitre.org" },
      { title: "MDN Web Docs", href: "https://developer.mozilla.org" },
      { title: "CyberChef", href: "https://gchq.github.io/CyberChef/" },
    ],
  },
];
