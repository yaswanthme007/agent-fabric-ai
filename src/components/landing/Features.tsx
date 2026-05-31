import { motion } from "framer-motion";
import { Workflow, Activity, Layers, GitBranch, Webhook, Users } from "lucide-react";
import { SectionHeader } from "./HowItWorks";

const FEATURES = [
  { icon: Workflow, title: "Visual Pipeline Builder", desc: "Compose multi-agent flows on a zoomable canvas with smart auto-routing." },
  { icon: Activity, title: "Real-time Agent Logs", desc: "Live tail every agent's stdout, traces, and tool calls with millisecond precision." },
  { icon: Layers, title: "Multi-model Support", desc: "Mix GPT, Claude, Gemini and open weights inside a single pipeline." },
  { icon: GitBranch, title: "Version Control", desc: "Branch, diff, and roll back pipelines. Every change is a commit." },
  { icon: Webhook, title: "Webhook Triggers", desc: "Fire pipelines from any HTTP event, cron, queue, or upstream agent." },
  { icon: Users, title: "Team Collaboration", desc: "Realtime cursors, comments, and per-role permissions." },
];

export function Features() {
  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader eyebrow="Platform" title="Everything you need to run agents at scale" subtitle="Production-grade tooling, indie-grade simplicity." />
        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }} transition={{ delay: (i % 3) * 0.08, duration: 0.5 }}
              whileHover={{ y: -6 }}
              className="group glass relative overflow-hidden rounded-2xl p-6 transition-all hover:border-primary/40 hover:shadow-[var(--shadow-glow)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-secondary/0 opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary transition-transform group-hover:rotate-6">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
