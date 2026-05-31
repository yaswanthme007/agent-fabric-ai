import { motion } from "framer-motion";
import { ArrowRight, Database, Bot, FileText, Mail, CheckCircle2 } from "lucide-react";
import { SectionHeader } from "./HowItWorks";

const NODES = [
  { icon: Database, label: "Input", sub: "trigger.webhook", border: "border-primary/30", iconBg: "bg-primary/15", iconText: "text-primary" },
  { icon: Bot, label: "Web Scraper", sub: "agent.hermes", border: "border-secondary/40", iconBg: "bg-secondary/15", iconText: "text-secondary" },
  { icon: FileText, label: "Summarizer", sub: "agent.atlas", border: "border-primary/30", iconBg: "bg-primary/15", iconText: "text-primary" },
  { icon: Mail, label: "Email Agent", sub: "agent.notify", border: "border-secondary/40", iconBg: "bg-secondary/15", iconText: "text-secondary" },
  { icon: CheckCircle2, label: "Output", sub: "sink.log", border: "border-accent/30", iconBg: "bg-accent/15", iconText: "text-accent" },
];

export function PipelineDemo() {
  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader eyebrow="Canvas" title="A pipeline that thinks for itself" subtitle="A peek at the visual builder running a live workflow." />
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7 }}
          className="glass relative mt-12 overflow-hidden rounded-3xl p-6 md:p-10"
        >
          <div className="dots-bg absolute inset-0 opacity-40" />
          <div className="relative flex items-center justify-between border-b border-border/50 pb-4">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-danger/80" />
              <div className="h-2.5 w-2.5 rounded-full bg-warning/80" />
              <div className="h-2.5 w-2.5 rounded-full bg-accent/80" />
              <span className="ml-3 font-mono text-xs text-muted-foreground">pipeline · daily_report_v3.flow</span>
            </div>
            <span className="flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-accent">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" /> running
            </span>
          </div>

          <div className="relative mt-12 flex flex-wrap items-center justify-center gap-3 md:flex-nowrap md:gap-0">
            {NODES.map((n, i) => (
              <div key={n.label} className="flex items-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.6 }} whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }} transition={{ delay: 0.15 * i, type: "spring", stiffness: 150 }}
                  className={`glass relative flex w-36 flex-col items-center gap-2 rounded-xl p-4 ${n.border}`}
                  style={{ animation: `pulse-ring 2.6s ease-out infinite ${i * 0.4}s` }}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${n.iconBg} ${n.iconText}`}>
                    <n.icon className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold">{n.label}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{n.sub}</div>
                  </div>
                </motion.div>
                {i < NODES.length - 1 && (
                  <div className="relative mx-1 hidden h-px w-12 md:block">
                    <svg className="absolute inset-0 h-2 w-full -translate-y-1/2" viewBox="0 0 48 4" preserveAspectRatio="none">
                      <line x1="0" y1="2" x2="48" y2="2" stroke="var(--color-primary)" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="4 4" className="[animation:flow_1.5s_linear_infinite]" />
                    </svg>
                    <ArrowRight className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 text-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="relative mt-10 grid grid-cols-3 gap-3 border-t border-border/50 pt-6 font-mono text-xs">
            <div className="text-muted-foreground">latency · <span className="text-foreground">412ms</span></div>
            <div className="text-muted-foreground">tokens · <span className="text-foreground">12,431</span></div>
            <div className="text-muted-foreground text-right">cost · <span className="text-accent">$0.0021</span></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
