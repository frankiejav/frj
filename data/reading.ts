export interface Book {
  title: string;
  author: string;
  status: "reading" | "finished" | "queued";
  note?: string;
}

export const reading: Book[] = [
  { title: "The Cuckoo's Egg", author: "Cliff Stoll", status: "finished", note: "The original threat hunt." },
  { title: "Sandworm", author: "Andy Greenberg", status: "reading" },
  { title: "Practical Malware Analysis", author: "Sikorski & Honig", status: "reading", note: "Reference and workbook." },
  { title: "Project Hail Mary", author: "Andy Weir", status: "queued", note: "For the non-work nights." },
];
