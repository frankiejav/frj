export interface ContactItem {
  label: string;
  href?: string;
  value?: string;
  placeholder?: string;
  external?: boolean;
}

export const contacts: ContactItem[] = [
  {
    label: "Email:",
    href: "mailto:contact@frjgarcia.com",
    value: "contact@frjgarcia.com",
  },
  {
    label: "Signal:",
    href: "https://signal.me/#eu/mM7laZYAJKnoXLDts5ATiZCnk9ViSXy_iMLo2UCdbFDE-mHuj-RFWa1OiUgkPljC",
    value: "signal.me/#eu…",
    external: true,
  },
  {
    label: "Telegram:",
    href: "https://t.me/fffrankie",
    value: "t.me/fff…",
    external: true,
  },
];
