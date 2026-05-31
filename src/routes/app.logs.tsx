import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { LOGS, PIPELINES, type LogEntry } from "@/lib/mock-data";
import { LogLevelBadge } from "./app.index";
import { Filter, Terminal } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/app/logs")({
  head: () => ({ meta: [{ title: "NEXUS · Logs" }] }),
  component: LogsPage,
});

const FILTERS = ["ALL", "INFO", "WARN", "ERROR"] as const;

function LogsPage() {
  const [selectedPipeline, setSelectedPipeline] = useState<string>(PIPELINES[0].name);
  const [stream, setStream] = useState<LogEntry[]>(LOGS);
  const [filter, setFilter] = useState<typeof FILTERS[number]>("ALL");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data, error } = await supabase.from("logs").select("*").order("created_at", { ascending: false }).limit(100);
        if (error) throw error;
        if (!cancelled && data && data.length) {
          setStream(data.map((l: any) => ({
            id: String(l.id),
            time: l.created_at ? new Date(l.created_at).toTimeString().slice(0, 8) : "--:--:--",
            level: (l.level ?? "INFO") as LogEntry["level"],
            pipeline: l.agent_name ?? l.pipeline ?? "system",
            message: l.message ?? "",
          })));
        }
      } catch {}
    };
    load();
    const id = setInterval(load, 5000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const visible = stream.filter((l) => filter === "ALL" || l.level === filter);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="grid grid-cols-3 gap-4 border-b border-border p-6">
        <Stat label="Total Logs Today" value="48,221" />
        <Stat label="Error Rate" value="0.42%" accent="danger" />
        <Stat label="Avg Response Time" value="412ms" accent="accent" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 shrink-0 overflow-auto border-r border-border bg-surface/30 p-3">
          <h3 className="mb-2 px-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Pipelines</h3>
          {PIPELINES.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPipeline(p.name)}
              className={`mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${selectedPipeline === p.name ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-surface hover:text-foreground"}`}
            >
              <span className="truncate">{p.name}</span>
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${p.status === "Running" ? "bg-accent animate-pulse" : p.status === "Error" ? "bg-danger" : "bg-muted-foreground"}`} />
            </button>
          ))}
        </aside>

        <div className="flex flex-1 flex-col">
          <div className="flex items-center gap-3 border-b border-border bg-surface/30 px-5 py-3">
            <Terminal className="h-4 w-4 text-primary" />
            <span className="font-mono text-xs text-muted-foreground">{selectedPipeline} · live tail</span>
            <span className="ml-2 flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" /> streaming
            </span>
            <div className="ml-auto flex items-center gap-1">
              <Filter className="mr-1 h-3 w-3 text-muted-foreground" />
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition ${filter === f ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-background/40 p-3 font-mono text-xs">
            <AnimatePresence initial={false}>
              {visible.map((l) => (
                <motion.div
                  key={l.id}
                  layout
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex gap-3 rounded px-3 py-1.5 hover:bg-surface/50"
                >
                  <span className="text-muted-foreground">{l.time}</span>
                  <LogLevelBadge level={l.level} />
                  <span className="text-muted-foreground/70">[{l.pipeline}]</span>
                  <span className="text-foreground/90">{l.message}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent = "primary" }: { label: string; value: string; accent?: "primary" | "danger" | "accent" }) {
  const color = { primary: "text-primary", danger: "text-danger", accent: "text-accent" }[accent];
  return (
    <div className="glass rounded-xl p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
