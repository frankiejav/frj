"use client";

import { useCallback } from "react";
import { TypewriterTerminal } from "./TypewriterTerminal";

const LINES = [
  '<span class="prompt">~/obscura</span> <span class="command">python downloader.py</span>',
  "",
  '<span class="success">Connected to Telegram</span>',
  "",
  '<span class="info">Available Channels (63 total)</span>',
  '<span class="dim">  8  ALIEN [Base]           Channel</span>',
  '<span class="dim"> 14  DAISY CLOUD [NEW]      Channel</span>',
  '<span class="dim"> 22  High Tier Stock        Channel</span>',
  '<span class="dim"> 29  Low Tier Stock         Channel</span>',
  '<span class="dim"> 48  the wave               Channel</span>',
  '<span class="dim"> 54  Trident Cloud          Channel</span>',
  '<span class="dim"> 61  TEMPEST CLOUD          Channel</span>',
  "",
  '<span class="muted">Enter selection:</span> <span class="command">8,14</span>',
  '<span class="info">Selected 2 channels</span>',
  "",
  '<span class="muted">Processing:</span> <span class="highlight">DAISY CLOUD [NEW]</span>',
  '<span class="dim">Fetching messages...</span> <span class="success">Found 463 files</span>',
  "",
  '<span class="muted">Processing:</span> <span class="highlight">ALIEN [Base]</span>',
  '<span class="dim">Fetching messages...</span> <span class="success">Found 81 files</span>',
  "",
  '<span class="dim">Checking:</span> <span class="muted">@DAISYCLOUD_26_JAN.rar (3.5 GB)</span> <span class="success">passed</span>',
  '<span class="dim">Checking:</span> <span class="muted">@TXT_ALIENS - 1464.txt (4.0 GB)</span> <span class="success">passed</span>',
  '<span class="dim">Checking:</span> <span class="muted">@DAISYCLOUD_25_JAN.rar (3.6 GB)</span> <span class="success">passed</span>',
  '<span class="dim">Checking:</span> <span class="muted">@TXT_ALIENS - 1465.txt (3.8 GB)</span> <span class="success">passed</span>',
  "",
  '<span class="info">Valid files to download:</span> <span class="success">544</span>',
  "",
  '<span class="muted">Batch 1/46</span>',
  '<span class="info">Progress (12/544)</span> <span class="dim">[##--------]</span> <span class="muted">2%</span>',
  '<span class="dim">Downloading:</span> <span class="highlight">@DAISYCLOUD_26_JAN.rar</span>',
  '<span class="dim">Downloading:</span> <span class="highlight">@TXT_ALIENS - 1464.txt</span>',
  '<span class="dim">Downloading:</span> <span class="highlight">@DAISYCLOUD_25_JAN.rar</span>',
  '<span class="dim">Queued:</span> <span class="muted">@TXT_ALIENS - 1465.txt</span>',
  '<span class="dim">Queued:</span> <span class="muted">@DAISYCLOUD_24_JAN.rar</span>',
];

export function TerminalAnimation() {
  const delayFor = useCallback((index: number) => (index < 5 ? 150 : 80), []);
  return <TypewriterTerminal lines={LINES} variant="terminal" delayFor={delayFor} restartDelay={4000} />;
}
