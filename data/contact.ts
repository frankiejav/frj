export interface ContactItem {
  label: string;
  href?: string;
  value?: string;
  placeholder?: string;
  external?: boolean;
}

export const contacts: ContactItem[] = [];
