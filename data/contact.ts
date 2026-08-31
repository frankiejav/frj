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
  }
];
