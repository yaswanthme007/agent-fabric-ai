import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import type { LogEntry } from "@/lib/mock-data";
import { LogLevelBadge } from "./app.index";
import { Filter, Terminal, Activity } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/app/logs")({
  head: () => ({ meta: [{ title: "NEXUS · Logs" }] }),
  component: LogsPage,
});

const FILTERS = ["ALL", "INFO", "WARN", "ERROR", "DEBUG"] as const;

function LogsPage() {
  const [stream, setStream] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<typeof FILTERS[number]>("ALL");
  const [loading, setLoading] = useState(true);
  const [totalToday, setTotalToday] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);
        if (error) throw error;
        if (!cancelled) {
          const mapped: LogEntry[] = (data ?? []).map((l: any) => ({
            id: String(l.id),
            time: l.created_at ? new Date(l.created_at).toTimeString().slice(0, 8) : "--:--:--",
            level: (l.level ?? "INFO") as LogEntry["level"],
            pipeline: l.agent_name ?? l.pipeline ?? "system",
            message: l.message ?? "",
          }));
          setStream(mapped);
          // stats
          const today = new Date(); today.setHours(0, 0, 0, 0);
          const todayLogs = mapped.filter(l => {
            const d = data?.find((r: any) => String(r.id) === l.id);
            return d ? new Date(d.created_at) >= today : true;
          });
          setTotalToday(todayLogs.length);
          setErrorCount(mapped.filter(l => l.level === "ERROR").length);
        }
      } catch {}
      finally { if (!cancelled) setLoading(false); }
    };
    load();
    const id = setInterval(load, 5000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const visible = stream.filter((l) => filter === "ALL" || l.level === filter);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Stats header */}
      <div className="grid grid-cols-3 gap-4 border-b border-border p-6">
        <StatCard label="Logs Today" value={loading ? "—" : String(totalToday)} />
        <StatCard label="Errors" value={loading ? "—" : String(errorCount)} accent="danger" />
        <StatCard label="Auto-refresh" value="5s" accent="accent" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Terminal area */}
        <div className="flex flex-1 flex-col">
          <div className="flex items-center gap-3 border-b border-border bg-surface/30 px-5 py-3">
            <Terminal className="h-4 w-4 text-primary" />
            <span className="font-mono text-xs text-muted-foreground">nexus · live log stream</span>
            <span className="ml-2 flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" /> live
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
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground p-4">
                <Activity className="h-4 w-4 animate-pulse" /> Loading logs...
              </div>
            ) : visible.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-muted-foreground">
                <Terminal className="h-10 w-10 opacity-30" />
                <p className="text-sm">No logs yet.</p>
                <p className="text-xs opacity-70">Run an agent from the{" "}
                  <Link to="/app/agents" className="text-primary hover:underline">Agents Library</Link>{" "}
                  to see real execution logs here.
                </p>
              </div>
            ) : (
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
                    <span className="text-muted-foreground shrink-0">{l.time}</span>
                    <LogLevelBadge level={l.level} />
                    <span className="text-muted-foreground/70 shrink-0">[{l.pipeline}]</span>
                    <span className="text-foreground/90 break-all">{l.message}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent = "primary" }: { label: string; value: string; accent?: "primary" | "danger" | "accent" }) {
  const color = { primary: "text-primary", danger: "text-danger", accent: "text-accent" }[accent];
  return (
    <div className="glass rounded-xl p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
