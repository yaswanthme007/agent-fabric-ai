import { Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play, Hexagon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { StarField } from "./StarField";

const PHRASES = ["Orchestrate Intelligence", "Compose Autonomous Agents", "Ship Pipelines, Not Prompts"];

function useTypewriter(words: string[], speed = 70, pause = 1800) {
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [del, setDel] = useState(false);
  useEffect(() => {
    const word = words[i % words.length];
    const t = setTimeout(() => {
      if (!del && text === word) { setTimeout(() => setDel(true), pause); return; }
      if (del && text === "") { setDel(false); setI((v) => v + 1); return; }
      setText(del ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1));
    }, del ? 35 : speed);
    return () => clearTimeout(t);
  }, [text, del, i, words, speed, pause]);
  return text;
}

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const typed = useTypewriter(PHRASES);

  return (
    <section ref={ref} className="relative isolate min-h-screen overflow-hidden">
      <StarField />
      <motion.div style={{ y, opacity, scale }} className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-mono uppercase tracking-widest text-primary"
        >
          <Hexagon className="h-3 w-3 animate-pulse" /> v2.0 · agent runtime online
        </motion.div>

        <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl md:text-8xl">
          <span className="block text-foreground/90">NEXUS</span>
          <span className="mt-2 block min-h-[1.1em] text-gradient [animation:glitch_5s_steps(1)_infinite]">
            {typed}<span className="ml-1 inline-block h-[0.9em] w-[3px] -translate-y-1 animate-pulse bg-primary align-middle" />
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="mt-8 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl"
        >
          Build, deploy and monitor AI agent pipelines visually. Drag, connect, ship — the new operating system for autonomous workflows.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to="/app"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition hover:scale-[1.03]"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            Launch Workspace
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface/40 px-6 py-3 font-medium text-foreground backdrop-blur transition hover:border-primary/40 hover:bg-surface/70">
            <Play className="h-4 w-4 fill-current" /> Watch Demo
          </button>
        </motion.div>

        {/* Floating pipeline preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.9 }}
          className="relative mt-16 w-full max-w-4xl"
        >
          <PipelinePreviewSvg />
        </motion.div>
      </motion.div>
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-32 bg-gradient-to-b from-transparent to-background" />
    </section>
  );
}

function PipelinePreviewSvg() {
  const nodes = [
    { x: 60, label: "Input", color: "var(--color-primary)" },
    { x: 260, label: "Scrape", color: "var(--color-secondary)" },
    { x: 460, label: "Summarize", color: "var(--color-primary)" },
    { x: 660, label: "Notify", color: "var(--color-accent)" },
  ];
  return (
    <div className="glass relative overflow-hidden rounded-2xl p-6">
      <div className="dots-bg absolute inset-0 opacity-50" />
      <svg viewBox="0 0 760 160" className="relative w-full">
        <defs>
          <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.2" />
            <stop offset="50%" stopColor="var(--color-primary)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        {nodes.slice(0, -1).map((n, i) => (
          <path key={i} d={`M ${n.x + 40} 80 C ${n.x + 120} 80, ${nodes[i + 1].x - 80} 80, ${nodes[i + 1].x} 80`}
            stroke="url(#line)" strokeWidth="2" fill="none" strokeDasharray="6 6"
            className="[animation:flow_2s_linear_infinite]" />
        ))}
        {nodes.map((n, i) => (
          <g key={n.label} style={{ animation: `pulse-ring 2.2s ease-out infinite ${i * 0.3}s` }}>
            <circle cx={n.x} cy={80} r="28" fill="var(--color-surface)" stroke={n.color} strokeWidth="2" />
            <circle cx={n.x} cy={80} r="6" fill={n.color} />
            <text x={n.x} y={130} textAnchor="middle" fontSize="12" fill="var(--color-muted-foreground)" fontFamily="JetBrains Mono">{n.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
