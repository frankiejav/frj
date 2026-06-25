export interface ContactItem {
  label: string;
  href?: string;
  value?: string;
  placeholder?: string;
  external?: boolean;
  preformatted?: boolean;
}

export const contacts: ContactItem[] = [
  {
    label: "Email:",
    href: "mailto:contact@frjgarcia.com",
    value: "contact@frjgarcia.com",
  },
  {
    label: "Signal:",
    href: "https://signal.me/#eu/QFeFrAtN6OODyzu5JjkVkqJ6IwSXTz7Wxg6ZvBBgYXRJpd_43ulJqZjsPm0STwAc",
    value: "signal.me/…",
    external: true,
  },
  {
    label: "PGP:",
    placeholder: `-----BEGIN PGP PUBLIC KEY BLOCK-----

mDMEajy7xhYJKwYBBAHaRw8BAQdA5sBr8KkeqRZ+b6y/nD1xsd9wgXVi43oh9g2e
rK3mE6a0A2ZyaoiWBBMWCgA+FiEE7tHQNrIJeWfyHhsgLltlHc46uwgFAmo8u8YC
GwMFCQWljsoFCwkIBwIGFQoJCAsCBBYCAwECHgECF4AACgkQLltlHc46uwjehAEA
4zKO/VMMhG7qnnT7CT0o18U7mgh913T+TDrzXnq3CjoBALXHLBXYqt3fHa9yhVzP
fV2OxV8AUALMdV/3xLTS4HgBuDgEajy7xhIKKwYBBAGXVQEFAQEHQEWZq1sWNNiG
xRPd7LrdOQcLFc3jyXfb0BKSYMNsCMIcAwEIB4h+BBgWCgAmFiEE7tHQNrIJeWfy
HhsgLltlHc46uwgFAmo8u8YCGwwFCQWljsoACgkQLltlHc46uwgWKwD/YohkEmbJ
tsbZ1xqZCRwjuIQnSRC3RVCCFGWz8Kpb16ABAIMj4NOpwVD0dYl3wqxVTF87aifU
JAICeZXdTgQFWskK
=aUr6
-----END PGP PUBLIC KEY BLOCK-----`,
    preformatted: true,
  },
];
