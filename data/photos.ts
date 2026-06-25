export interface Photo {
  src: string;
  alt: string;
  caption?: string;
  location?: string;
  date?: string;
  width: number;
  height: number;
}

/**
 * Sample placeholder gallery. Drop real photos into /public/photos and replace
 * these entries. Keep width/height accurate so next/image can reserve layout.
 */
export const photos: Photo[] = [
  {
    src: "/images/privatealps.png",
    alt: "Placeholder landscape",
    caption: "Placeholder - swap with a real photo",
    location: "Somewhere",
    date: "2026-06-01",
    width: 1200,
    height: 800,
  },
  {
    src: "/images/thinkpad.png",
    alt: "ThinkPad on a desk",
    caption: "The machine everything runs on",
    date: "2026-05-12",
    width: 1200,
    height: 900,
  },
  {
    src: "/images/localsend.png",
    alt: "Placeholder still life",
    caption: "Placeholder - swap with a real photo",
    date: "2026-04-20",
    width: 1000,
    height: 1000,
  },
];
