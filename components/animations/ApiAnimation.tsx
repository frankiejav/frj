"use client";

import { useCallback } from "react";
import { TypewriterTerminal } from "./TypewriterTerminal";

const LINES = [
  '<span class="prompt">~</span> <span class="command">curl -X GET \\</span>',
  "  <span class=\"url\">'https://api.obscuralabs.io/ransomware/victims/'</span> \\",
  "  <span class=\"header\">-H 'accept: application/json'</span> \\",
  "  <span class=\"header\">-H 'X-API-KEY: sk_live_***************'</span>",
  "",
  '<span class="status">HTTP/1.1 200 OK</span>',
  '<span class="dim">Content-Type: application/json</span>',
  "",
  '<span class="bracket">{</span>',
  '  <span class="key">"client"</span>: <span class="string">"nairobi@obscuralabs.io"</span>,',
  '  <span class="key">"filters"</span>: <span class="bracket">{</span>',
  '    <span class="key">"country"</span>: <span class="string">"US"</span>,',
  '    <span class="key">"year"</span>: <span class="string">"2026"</span>,',
  '    <span class="key">"date"</span>: <span class="string">"discovered"</span>',
  '  <span class="bracket">}</span>,',
  '  <span class="key">"count"</span>: <span class="number">227</span>,',
  '  <span class="key">"victims"</span>: <span class="bracket">[</span>',
  '    <span class="bracket">{</span>',
  '      <span class="key">"discovered"</span>: <span class="string">"2026-01-27 00:19:55"</span>,',
  '      <span class="key">"victim"</span>: <span class="string">"Panera Bread"</span>,',
  '      <span class="key">"group"</span>: <span class="string">"shinyhunters"</span>,',
  '      <span class="key">"country"</span>: <span class="string">"US"</span>,',
  '      <span class="key">"activity"</span>: <span class="string">"Hospitality"</span>,',
  '      <span class="key">"description"</span>: <span class="string">"Records: 14M"</span>',
  '    <span class="bracket">}</span>,',
  '    <span class="bracket">{</span>',
  '      <span class="key">"discovered"</span>: <span class="string">"2026-01-26 23:19:03"</span>,',
  '      <span class="key">"victim"</span>: <span class="string">"freidarothman.com"</span>,',
  '      <span class="key">"group"</span>: <span class="string">"safepay"</span>,',
  '      <span class="key">"country"</span>: <span class="string">"US"</span>,',
  '      <span class="key">"activity"</span>: <span class="string">"Consumer Services"</span>,',
  '      <span class="key">"screenshot"</span>: <span class="string">"https://images..."</span>',
  '    <span class="bracket">}</span>,',
  '    <span class="bracket">{</span>',
  '      <span class="key">"discovered"</span>: <span class="string">"2026-01-26 22:50:37"</span>,',
  '      <span class="key">"victim"</span>: <span class="string">"[REDACTED]"</span>,',
  '      <span class="key">"group"</span>: <span class="string">"devman"</span>,',
  '      <span class="key">"country"</span>: <span class="string">"US"</span>,',
  '      <span class="key">"description"</span>: <span class="string">"BIO lab data"</span>',
  '    <span class="bracket">}</span>,',
  '    <span class="dim">// ... 224 more results</span>',
  '  <span class="bracket">]</span>',
  '<span class="bracket">}</span>',
];

export function ApiAnimation() {
  const delayFor = useCallback((index: number) => (index < 6 ? 200 : 100), []);
  return <TypewriterTerminal lines={LINES} variant="api" delayFor={delayFor} restartDelay={5000} />;
}
