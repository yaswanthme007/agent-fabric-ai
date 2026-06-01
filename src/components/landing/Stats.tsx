import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface StatItem { label: string; value: string; suffix?: string }

export function Stats() {
  const [stats, setStats] = useState<StatItem[]>([
    { label: "Pipelines Created", value: "—" },
    { label: "Agent Runs", value: "—" },
    { label: "Agents Available", value: "—" },
    { label: "Free Forever", value: "∞" },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [pipRes, logRes, agentRes] = await Promise.all([
          supabase.from("pipelines").select("id", { count: "exact", head: true }),
          supabase.from("logs").select("id", { count: "exact", head: true }),
          supabase.from("agents").select("id", { count: "exact", head: true }),
        ]);
        setStats([
          { label: "Pipelines Created", value: String(pipRes.count ?? 0) },
          { label: "Agent Runs", value: String(logRes.count ?? 0) },
          { label: "Agents Available", value: String(agentRes.count ?? 0) },
          { label: "Free Forever", value: "∞" },
        ]);
      } catch {
        setStats([
          { label: "Pipelines Created", value: "—" },
          { label: "Agent Runs", value: "—" },
          { label: "Agents Available", value: "—" },
          { label: "Free Forever", value: "∞" },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="relative border-y border-border/50 bg-surface/30 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
              whileHover={{ y: -4 }}
              className="group glass rounded-2xl p-6 transition-shadow hover:shadow-[var(--shadow-glow)]"
            >
              {loading ? (
                <div className="h-10 w-24 animate-pulse rounded-lg bg-surface" />
              ) : (
                <div className="font-display text-4xl font-bold text-gradient md:text-5xl">
                  {s.value}
                </div>
              )}
              <div className="mt-2 text-sm uppercase tracking-wider text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
