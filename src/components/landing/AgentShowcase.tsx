import { motion } from "framer-motion";
import { AGENTS } from "@/lib/mock-data";
import { SectionHeader } from "./HowItWorks";

export function AgentShowcase() {
  // duplicate for seamless loop
  const items = [...AGENTS, ...AGENTS];
  return (
    <section className="relative overflow-hidden py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader eyebrow="Agents" title="A growing roster of autonomous workers" />
      </div>
      <div
        className="group relative mt-16"
        style={{ maskImage: "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)" }}
      >
        <motion.div
          className="flex gap-5"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 40, ease: "linear", repeat: Infinity }}
          style={{ width: "max-content" }}
        >
          {items.map((a, i) => (
            <AgentCard key={i} agent={a} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function AgentCard({ agent }: { agent: typeof AGENTS[number] }) {
  const colorClass = { primary: "text-primary border-primary/40", secondary: "text-secondary border-secondary/40", accent: "text-accent border-accent/40", warning: "text-warning border-warning/40" }[agent.color];
  return (
    <motion.div
      whileHover={{ rotateY: 8, rotateX: -4, scale: 1.04 }}
      style={{ transformStyle: "preserve-3d", perspective: 1000 }}
      className="glass relative w-72 shrink-0 overflow-hidden rounded-2xl p-5"
    >
      <div className="absolute inset-0 bg-[var(--gradient-mesh)] opacity-[0.04]" />
      <div className="relative flex items-center justify-between">
        <div className={`flex h-14 w-14 items-center justify-center rounded-xl border bg-surface font-display text-2xl font-bold ${colorClass}`}>
          {agent.name[0]}
        </div>
        <span className={`rounded-full border bg-surface px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${colorClass}`}>{agent.type}</span>
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold">{agent.name}</h3>
      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{agent.description}</p>

      <div className="mt-5">
        <div className="flex justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>Success rate</span><span className="text-foreground">{agent.successRate}%</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-input">
          <div className={`h-full rounded-full bg-gradient-to-r from-primary to-accent`} style={{ width: `${agent.successRate}%` }} />
        </div>
      </div>
      <div className="mt-3 flex justify-between font-mono text-[10px] text-muted-foreground">
        <span>last run</span><span>{agent.lastRun}</span>
      </div>
    </motion.div>
  );
}
