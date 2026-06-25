export interface SocialLink {
  label: string;
  href: string;
  handle: string;
}

export interface Contact {
  label: string;
  href: string;
  value: string;
  external?: boolean;
}

export const socials: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/", handle: "@nairobi" },
  { label: "Mastodon", href: "https://infosec.exchange/", handle: "@nairobi" },
  { label: "RSS", href: "/rss.xml", handle: "/rss.xml" },
];

export const contacts: Contact[] = [
  {
    label: "Email",
    href: "mailto:nainainairobi@onionmail.org",
    value: "nainainairobi@onionmail.org",
  },
];

export const now = {
  updated: "2026-06-24",
  intro: "A snapshot of what's keeping me busy right now. Inspired by nownownow.com.",
  items: [
    {
      heading: "Studying",
      body: "Finishing my IT degree and going deep on threat intelligence tooling and malware analysis.",
    },
    {
      heading: "Building",
      body: "This site, plus a pipeline for parsing and triaging infostealer logs at scale.",
    },
    {
      heading: "Reading",
      body: "Working through a stack of security papers and the occasional novel to stay sane.",
    },
    {
      heading: "Listening",
      body: "Mostly Frank Ocean, lo-fi, and whatever the scrobbler decides on a given night.",
    },
  ],
};
