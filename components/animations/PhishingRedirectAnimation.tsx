"use client";

import { useEffect, useRef } from "react";
import styles from "./animations.module.css";

export function PhishingRedirectAnimation() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;

    const resize = () => {
      W = wrap.clientWidth || 400;
      H = wrap.clientHeight || 360;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
    };
    resize();

    const cssVar = (name: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(name).trim();

    let C = { accent: "", primary: "", muted: "", border: "" };
    const refreshColors = () => {
      C = {
        accent: cssVar("--accent") || "#5a5854",
        primary: cssVar("--text-primary") || "#1f1e1d",
        muted: cssVar("--text-muted") || "#8c8a86",
        border: cssVar("--border-color") || "#d9d7d3",
      };
    };
    refreshColors();

    const MONO = "'SF Mono','Fira Code',Consolas,monospace";

    const NODES = [
      { label: "bicesterwebdesign.uk", sub: "Amazon SES · email sender", dst: false },
      { label: "abzaseragam.com", sub: "302 · compromised WP site", dst: false },
      { label: "streetvibeupgrades.com", sub: "302 · relay domain", dst: false },
      { label: "exodus.mica-update.com", sub: "200 OK · phishing kit active", dst: true },
    ];

    const BIP39 = ["abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract", "absurd", "abuse", "access", "accident"];

    let phase = 1;
    let elapsed = 0;
    let lastTs: number | null = null;
    type Particle = { seg: number; t: number };
    let particles: Particle[] = [];
    let wordsFilled = 0;
    let flashTimer = 0;
    let flashIsPresend = false;
    let raf = 0;

    const drawChain = (dt: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const nW = W * 0.84;
      const nH = 30;
      const nX = W * 0.04;
      const top = H * 0.05;
      const seg = (H * 0.86) / 3;
      const ys = NODES.map((_, i) => top + i * seg);
      const mid = nX + nW / 2;

      for (let i = 0; i < 3; i++) {
        const y1 = ys[i] + nH;
        const y2 = ys[i + 1];

        ctx.beginPath();
        ctx.moveTo(mid, y1);
        ctx.lineTo(mid, y2 - 7);
        ctx.strokeStyle = C.border;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.moveTo(mid - 4, y2 - 8);
        ctx.lineTo(mid, y2 - 2);
        ctx.lineTo(mid + 4, y2 - 8);
        ctx.strokeStyle = C.border;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = `8px ${MONO}`;
        ctx.fillStyle = i === 2 ? C.accent : C.muted;
        ctx.textAlign = "left";
        ctx.fillText(i === 2 ? "200 OK" : "302", mid + 8, (y1 + y2) / 2 + 4);
      }

      for (let i = 0; i < NODES.length; i++) {
        const n = NODES[i];
        const y = ys[i];

        ctx.strokeStyle = n.dst ? C.accent : C.border;
        ctx.lineWidth = n.dst ? 1.5 : 1;
        ctx.strokeRect(nX, y, nW, nH);

        ctx.font = `10px ${MONO}`;
        ctx.fillStyle = n.dst ? C.accent : C.primary;
        ctx.textAlign = "left";
        ctx.fillText(n.label, nX + 7, y + 12);

        ctx.font = `8px ${MONO}`;
        ctx.fillStyle = C.muted;
        ctx.fillText(n.sub, nX + 7, y + 25);
      }

      if (particles.length < 5 && Math.random() < 0.04) {
        particles.push({ seg: 0, t: 0 });
      }

      const alive: Particle[] = [];
      for (const p of particles) {
        p.t += dt / 680;
        while (p.t >= 1 && p.seg < 3) {
          p.t -= 1;
          p.seg++;
        }
        if (p.seg >= 3) continue;
        alive.push(p);

        const y1 = ys[p.seg] + nH;
        const y2 = ys[p.seg + 1];
        const py = y1 + (y2 - y1) * p.t;

        ctx.beginPath();
        ctx.arc(mid, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = C.accent;
        ctx.fill();
      }
      particles = alive;
    };

    const hexAlpha = (alpha: number) =>
      Math.round(Math.max(0, Math.min(1, alpha)) * 255)
        .toString(16)
        .padStart(2, "0");

    const drawSeedGrid = (dt: number): boolean => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      flashTimer = Math.max(0, flashTimer - dt);

      if (flashTimer > 0) {
        const a = hexAlpha((flashTimer / 700) * 0.13);
        ctx.fillStyle = flashIsPresend ? `#b03030${a}` : `#306030${a}`;
        ctx.fillRect(0, 0, W, H);
      }

      const cols = 4;
      const rows = 3;
      const margin = W * 0.04;
      const boxW = (W - margin * 2 - (cols - 1) * 6) / cols;
      const boxH = 26;
      const boxGap = 8;
      const startY = H * 0.16;

      ctx.font = `8px ${MONO}`;
      ctx.fillStyle = C.muted;
      ctx.textAlign = "left";
      ctx.fillText("BIP39 SEED PHRASE · 12 WORDS", margin, startY - 10);

      const target = Math.min(12, Math.floor(elapsed / 390));
      if (target > wordsFilled) {
        wordsFilled = target;
        if (wordsFilled === 11) {
          flashTimer = 700;
          flashIsPresend = true;
        }
        if (wordsFilled === 12) {
          flashTimer = 900;
          flashIsPresend = false;
        }
      }

      for (let i = 0; i < 12; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const bx = margin + col * (boxW + 6);
        const by = startY + row * (boxH + boxGap);
        const filled = i < wordsFilled;
        const isHot = i === 10 && flashIsPresend && flashTimer > 0;

        ctx.strokeStyle = isHot ? "#b03030" : filled ? C.accent : C.border;
        ctx.lineWidth = isHot ? 1.5 : 1;
        ctx.strokeRect(bx, by, boxW, boxH);

        if (filled) {
          ctx.font = `9px ${MONO}`;
          ctx.fillStyle = isHot ? "#b03030" : C.primary;
          ctx.textAlign = "center";
          ctx.fillText(BIP39[i], bx + boxW / 2, by + 17);
        }

        ctx.font = `7px ${MONO}`;
        ctx.fillStyle = C.muted;
        ctx.textAlign = "left";
        ctx.fillText(String(i + 1), bx + 2, by + 17);
      }

      const gridBottom = startY + rows * (boxH + boxGap);

      if (flashIsPresend && flashTimer > 0) {
        const a = flashTimer / 700;
        ctx.font = `9px ${MONO}`;
        ctx.fillStyle = `rgba(176,48,48,${a})`;
        ctx.textAlign = "center";
        ctx.fillText("PRESEND → phrase transmitted before submit", W / 2, gridBottom + 22);
      }

      if (wordsFilled >= 12 && !flashIsPresend && flashTimer > 0) {
        const a = flashTimer / 900;
        ctx.font = `9px ${MONO}`;
        ctx.fillStyle = C.accent;
        ctx.textAlign = "center";
        ctx.globalAlpha = a;
        ctx.fillText('{"result":"valid"} ← 200 OK', W / 2, gridBottom + 22);
        ctx.globalAlpha = 1;
      }

      return wordsFilled >= 12 && elapsed > 12 * 390 + 2200;
    };

    const frame = (ts: number) => {
      if (!lastTs) lastTs = ts;
      const dt = Math.min(ts - lastTs, 80);
      lastTs = ts;
      elapsed += dt;

      if (phase === 1) {
        drawChain(dt);
        if (elapsed > 8500) {
          phase = 2;
          elapsed = 0;
          wordsFilled = 0;
          flashTimer = 0;
          particles = [];
        }
      } else {
        const done = drawSeedGrid(dt);
        if (done) {
          phase = 1;
          elapsed = 0;
          particles = [];
          refreshColors();
        }
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    const ro = new ResizeObserver(() => {
      resize();
      refreshColors();
    });
    ro.observe(wrap);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={wrapRef} className={styles.canvasWrap} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
