"use client";

import { useEffect, useRef } from "react";
import styles from "./animations.module.css";

export function WebSocketSkimAnimation() {
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

    const cssVar = (v: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(v).trim();

    let C = { accent: "", primary: "", secondary: "", muted: "", border: "" };
    const refreshColors = () => {
      C = {
        accent: cssVar("--accent") || "#5a5854",
        primary: cssVar("--text-primary") || "#1f1e1d",
        secondary: cssVar("--text-secondary") || "#454442",
        muted: cssVar("--text-muted") || "#8c8a86",
        border: cssVar("--border-color") || "#d9d7d3",
      };
    };
    refreshColors();

    const MONO = "'SF Mono','Fira Code',Consolas,monospace";
    const FS = 9;
    const LH = 13;

    const FIELDS = [
      { name: "cardNumber", value: "4532 0151 3987 6543", delay: 72 },
      { name: "expiryDate", value: "12/26", delay: 115 },
      { name: "cvv", value: "331", delay: 145 },
      { name: "fullName", value: "Noe Hernandez", delay: 88 },
    ];

    const OP_EVENTS = [
      { type: "changleField", lines: ['{"cardNumber":', ' "4532 0151 3987 6543"}'] },
      { type: "changleField", lines: ['{"expiryDate": "12/26"}'] },
      { type: "changleField", lines: ['{"cvv": "331"}'] },
      { type: "changleField", lines: ['{"fullName":', ' "Noe Hernandez"}'] },
      { type: "submitData", lines: ['{"event":"submitData",', ' "data": { fullName,', " cardNumber, cvv... }}"] },
    ];

    const CIPHERS = [
      "Ki8xTs3MnPp9kLm2R",
      "Jx7Nq4HtRr3Kb8Wf",
      "Pp9kLm2RKi8xTs3Mn",
      "Rr3Kb8WfJx7Nq4Ht",
      "Lm2Ki8RxTs3MnPp9k",
      "Ht7xN4qJfWb8rKr3R",
    ];

    type Phase = "typing" | "pause" | "submit" | "done";
    type OpEvent = { type: string; lines: string[] };
    type WsFrame = { text: string };

    let fieldIdx = 0;
    let charIdx = 0;
    let charTimer = 0;
    let cursorOn = true;
    let cursorTimer = 0;
    let phaseTimer = 0;
    let phase: Phase = "typing";
    let cipherIdx = 0;
    let raf = 0;

    let completedFields: { name: string; value: string }[] = [];
    let currentTyped = "";
    let wsFrames: WsFrame[] = [];
    let opLog: OpEvent[] = [];

    const spawnWsFrame = () => {
      wsFrames.push({ text: `42["message","${CIPHERS[cipherIdx++ % CIPHERS.length]}"]` });
      if (wsFrames.length > 5) wsFrames.shift();
    };

    const spawnOpEvent = (idx: number) => {
      if (idx < OP_EVENTS.length) {
        opLog.push({ ...OP_EVENTS[idx] });
        if (opLog.length > 7) opLog.shift();
      }
    };

    const update = (dt: number) => {
      cursorTimer += dt;
      if (cursorTimer > 480) {
        cursorOn = !cursorOn;
        cursorTimer = 0;
      }

      if (phase === "typing") {
        charTimer += dt;
        const field = FIELDS[fieldIdx];
        if (!field) return;
        if (charTimer >= field.delay) {
          charTimer = 0;
          if (charIdx < field.value.length) {
            charIdx++;
            currentTyped = field.value.slice(0, charIdx);
            if (charIdx % 4 === 0 || charIdx === field.value.length) spawnWsFrame();
          } else {
            completedFields.push({ name: field.name, value: field.value });
            spawnWsFrame();
            spawnOpEvent(fieldIdx);
            charIdx = 0;
            currentTyped = "";
            fieldIdx++;
            if (fieldIdx >= FIELDS.length) {
              phase = "submit";
              phaseTimer = 0;
            } else {
              phase = "pause";
              phaseTimer = 0;
            }
          }
        }
      } else if (phase === "pause") {
        phaseTimer += dt;
        if (phaseTimer > 420) {
          phase = "typing";
          phaseTimer = 0;
          charTimer = 0;
        }
      } else if (phase === "submit") {
        phaseTimer += dt;
        if (phaseTimer > 700) {
          spawnWsFrame();
          spawnOpEvent(FIELDS.length);
          phase = "done";
          phaseTimer = 0;
        }
      } else if (phase === "done") {
        phaseTimer += dt;
        if (phaseTimer > 3200) {
          fieldIdx = 0;
          charIdx = 0;
          charTimer = 0;
          currentTyped = "";
          completedFields = [];
          wsFrames = [];
          opLog = [];
          phase = "typing";
          phaseTimer = 0;
          refreshColors();
        }
      }
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const col = W / 3;
      const lx = 6;
      const mx = col + 5;
      const rx = col * 2 + 5;
      const headerY = 16;
      const bodyY = headerY + LH + 4;

      ctx.font = `bold ${FS}px ${MONO}`;
      ctx.textAlign = "left";
      ctx.fillStyle = C.muted;
      ctx.fillText("VICTIM", lx, headerY);
      ctx.fillText("WS FRAME", mx, headerY);
      ctx.fillStyle = C.accent;
      ctx.fillText("OPERATOR", rx, headerY);

      ctx.strokeStyle = C.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(col, headerY + 3);
      ctx.lineTo(col, H - 6);
      ctx.moveTo(col * 2, headerY + 3);
      ctx.lineTo(col * 2, H - 6);
      ctx.stroke();

      ctx.font = `${FS}px ${MONO}`;

      let vy = bodyY;
      for (const fld of completedFields) {
        if (vy + LH > H - 6) break;
        ctx.fillStyle = C.muted;
        ctx.fillText(fld.name + ":", lx, vy);
        vy += LH * 0.9;
        ctx.fillStyle = C.secondary;
        const v = fld.value.length > 15 ? fld.value.slice(0, 13) + ".." : fld.value;
        ctx.fillText(v, lx, vy);
        vy += LH * 1.25;
      }
      if ((phase === "typing" || phase === "pause") && vy + LH < H - 6) {
        const field = FIELDS[fieldIdx];
        if (field) {
          ctx.fillStyle = C.primary;
          ctx.fillText(field.name + ":", lx, vy);
          vy += LH;
          ctx.fillText(currentTyped + (cursorOn ? "▌" : " "), lx, vy);
        }
      } else if ((phase === "submit" || phase === "done") && vy + LH < H - 6) {
        ctx.fillStyle = C.muted;
        ctx.fillText("[submit →]", lx, vy);
      }

      let wy = bodyY;
      const maxCW = Math.floor((col - 12) / (FS * 0.62));
      for (let i = 0; i < wsFrames.length; i++) {
        if (wy + LH > H - 14) break;
        const age = wsFrames.length - 1 - i;
        ctx.globalAlpha = Math.max(0.22, 1 - age * 0.2);
        ctx.fillStyle = C.muted;
        const txt = wsFrames[i].text;
        ctx.fillText(txt.slice(0, maxCW), mx, wy);
        if (txt.length > maxCW && wy + LH * 0.9 + LH < H - 14) {
          wy += LH * 0.9;
          ctx.fillText(txt.slice(maxCW, maxCW * 2), mx, wy);
        }
        wy += LH * 1.3;
      }
      ctx.globalAlpha = 1;

      ctx.font = `7px ${MONO}`;
      ctx.fillStyle = C.muted;
      ctx.textAlign = "center";
      ctx.fillText("AES-CBC", col * 1.5, H - 6);
      ctx.textAlign = "left";
      ctx.font = `${FS}px ${MONO}`;

      let oy = bodyY;
      for (let i = 0; i < opLog.length; i++) {
        if (oy + LH > H - 6) break;
        const age = opLog.length - 1 - i;
        ctx.globalAlpha = Math.max(0.28, 1 - age * 0.18);
        const ev = opLog[i];
        ctx.fillStyle = ev.type === "submitData" ? C.accent : C.secondary;
        ctx.fillText(ev.type, rx, oy);
        oy += LH * 0.9;
        ctx.fillStyle = C.muted;
        for (const line of ev.lines) {
          if (oy + LH > H - 6) break;
          ctx.fillText(line, rx, oy);
          oy += LH * 0.85;
        }
        oy += LH * 0.55;
      }
      ctx.globalAlpha = 1;
    };

    let lastTs: number | null = null;

    const frame = (ts: number) => {
      if (!lastTs) lastTs = ts;
      const dt = Math.min(ts - lastTs, 80);
      lastTs = ts;
      update(dt);
      draw();
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
