"use client";

import { useCallback } from "react";
import { TypewriterTerminal } from "./TypewriterTerminal";

const d = (arrow: string, indent: string, name: string, size: string) =>
  `<span class="indent">${indent}</span><span class="arrow">${arrow} </span><span class="dir">${name}</span>  <span class="size">${size}</span>`;

const f = (indent: string, name: string, size: string) =>
  `<span class="indent">${indent}</span><span class="file">  ${name}</span>  <span class="size">${size}</span>`;

const LINES = [
  d("▼", "", "Export_Complete_202601011200-aedbaed183721/", ""),
  d("▶", "  ", "Export_Complete_202601021430-f3c7e2a904b81/", ""),
  d("▶", "  ", "Export_Complete_202601031015-9d1a5f73e2c44/", ""),
  d("▶", "  ", "Export_Complete_202601041800-b2e8d4a821f96/", ""),
  d("▶", "  ", "Export_Complete_202601051330-c4f0a1d2e7b53/", ""),
  "",
  d("▼", "  ", "Export_Complete_202601011200-aedbaed183721/", ""),
  d("▶", "    ", "app.simplepractice.com/", "5.2 GiB"),
  "",
  d("▼", "    ", "app.simplepractice.com/", "5.2 GiB"),
  d("▶", "      ", "Administrative/", "5.4 MiB"),
  d("▶", "      ", "Billing Documents/", "4.1 GiB"),
  d("▶", "      ", "Medical Records/", "222.2 MiB"),
  d("▶", "      ", "Secure messages/", "4.9 KiB"),
  d("▶", "      ", "Stored documents/", "839.3 MiB"),
  d("▶", "      ", "Contacts/", "118.8 KiB"),
  d("▶", "      ", "Psychotherapy Notes/", "34.6 KiB"),
  "",
  d("▼", "      ", "Medical Records/", "222.2 MiB"),
  d("▶", "        ", "intake_forms/", "12.4 MiB"),
  d("▶", "        ", "progress_notes/", "198.7 MiB"),
  d("▶", "        ", "treatment_plans/", "8.3 MiB"),
  d("▶", "        ", "diagnoses/", "2.8 MiB"),
  "",
  d("▼", "        ", "progress_notes/", "198.7 MiB"),
  f("          ", "note_2024-03-15.pdf", "842 KiB"),
  f("          ", "note_2024-03-08.pdf", "756 KiB"),
  f("          ", "note_2024-02-29.pdf", "901 KiB"),
  f("          ", "note_2024-02-22.pdf", "688 KiB"),
  f("          ", "note_2024-02-15.pdf", "743 KiB"),
  f("          ", "note_2024-02-08.pdf", "812 KiB"),
  f("          ", "note_2024-02-01.pdf", "694 KiB"),
  "",
  d("▼", "      ", "Billing Documents/", "4.1 GiB"),
  d("▶", "        ", "invoices_2024/", "312.4 MiB"),
  d("▶", "        ", "insurance_claims/", "2.9 GiB"),
  d("▶", "        ", "EOB_records/", "487.2 MiB"),
  d("▶", "        ", "superbills/", "118.6 MiB"),
  "",
  d("▼", "        ", "insurance_claims/", "2.9 GiB"),
  f("          ", "claim_BC_2024-02.pdf", "4.1 MiB"),
  f("          ", "claim_BC_2024-01.pdf", "3.8 MiB"),
  f("          ", "claim_UHC_2024-02.pdf", "5.2 MiB"),
  f("          ", "claim_UHC_2024-01.pdf", "4.9 MiB"),
  f("          ", "claim_AET_2024-02.pdf", "3.4 MiB"),
];

export function FileTreeAnimation() {
  const delayFor = useCallback((index: number) => (index <= 6 ? 160 : index <= 18 ? 100 : 75), []);
  return <TypewriterTerminal lines={LINES} variant="filetree" delayFor={delayFor} restartDelay={5000} />;
}
