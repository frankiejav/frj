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
    href: "mailto:f@frjgarcia.com",
    value: "f@frjgarcia.com",
  },
  {
    label: "Signal:",
    href: "https://signal.me/#eu/mM7laZYAJKnoXLDts5ATiZCnk9ViSXy_iMLo2UCdbFDE-mHuj-RFWa1OiUgkPljC",
    value: "signal.me/…",
    external: true,
  },
  {
    label: "PGP:",
    placeholder: `-----BEGIN PGP PUBLIC KEY BLOCK-----

mDMEaj1uMRYJKwYBBAHaRw8BAQdA74LzNK+TMS8kzCcbSQaXh7ihFRs0HIhg3w17
UfmVh7+0FWZyaiA8ZkBmcmpnYXJjaWEuY29tPoiWBBMWCgA+FiEEQ/ugwiXuKjQy
0hTgrl4m/D1VqHEFAmo9bjECGwMFCQWk3F8FCwkIBwIGFQoJCAsCBBYCAwECHgEC
F4AACgkQrl4m/D1VqHFHTgEAw+XYtMS16PhXYypiYDSMC6f6aSJfcmSUWRPxx7YD
69IA/3MDL6MM2gBg9w0YGMxVlqEpeWQep2nK0g0Ydn5t6jgHuDgEaj1uMRIKKwYB
BAGXVQEFAQEHQKBm6Mg0sRVojZgjCWAXdRA+7Lm5hUiLcGPNQ0kCllwaAwEIB4h+
BBgWCgAmFiEEQ/ugwiXuKjQy0hTgrl4m/D1VqHEFAmo9bjECGwwFCQWk3F8ACgkQ
rl4m/D1VqHE46gD+LGrNwFCZWXxZhDunnxAdRdUNUA7fuS76krl5LAx18JQA/11R
fyaddmz0+pKQixHfGgPq4XS+Z2tQ0Uz6+eGxwdIM
=7VbC
-----END PGP PUBLIC KEY BLOCK-----`,
    preformatted: true,
  },
];
