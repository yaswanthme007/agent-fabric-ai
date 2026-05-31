import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Workflow, Bot, CheckCircle2, AlertTriangle, Play, Pause, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
import { PIPELINES, ACTIVITY_SERIES, STATUS_BREAKDOWN, LOGS, type LogEntry, type Pipeline } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "NEXUS · Dashboard" }] }),
  component: Dashboard,
});

function useCountUp(target: number, duration = 1500) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) { setVal(0); return; }
    const steps = 40;
    const stepTime = duration / steps;
    let i = 0;
    setVal(0);
    const id = setInterval(() => {
      i++;
      setVal(Math.floor((target * i) / steps));
      if (i >= steps) { setVal(target); clearInterval(id); }
    }, stepTime);
    return () => clearInterval(id);
  }, [target, duration]);
  return val;
}

function normalizeStatus(s: string | undefined | null): string {
  if (!s) return "Idle";
  const v = s.toString().toLowerCase();
  if (v === "running") return "Running";
  if (v === "paused") return "Paused";
  if (v === "error" || v === "failed") return "Error";
  return "Idle";
}

function timeAgo(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - d);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function Dashboard() {
  const [pipelines, setPipelines] = useState<Pipeline[]>(PIPELINES);
  const [logs, setLogs] = useState<LogEntry[]>(LOGS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.from("pipelines").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        if (!cancelled && data && data.length) {
          setPipelines(data.map((p: any) => ({
            id: String(p.id),
            name: p.name ?? "Untitled",
            status: normalizeStatus(p.status) as Pipeline["status"],
            lastRun: timeAgo(p.last_run ?? p.updated_at ?? p.created_at),
            duration: p.duration ?? "—",
          })));
        }
      } catch (e) {
        // silent fallback
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data, error } = await supabase.from("logs").select("*").order("created_at", { ascending: false }).limit(20);
        if (error) throw error;
        if (!cancelled && data && data.length) {
          setLogs(data.map((l: any) => ({
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

  const activeCount = pipelines.filter((p) => p.status === "Running").length;
  const errorCount = pipelines.filter((p) => p.status === "Error").length;

  const metrics = [
    { icon: Workflow, label: "Active Pipelines", value: activeCount, color: "text-primary", border: "border-primary/30", bg: "bg-primary/10" },
    { icon: Bot, label: "Agents Running", value: 23, color: "text-secondary", border: "border-secondary/30", bg: "bg-secondary/10" },
    { icon: CheckCircle2, label: "Tasks Today", value: 1482, color: "text-accent", border: "border-accent/30", bg: "bg-accent/10" },
    { icon: AlertTriangle, label: "Errors", value: errorCount, color: "text-danger", border: "border-danger/30", bg: "bg-danger/10" },
  ];

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <MetricCard key={m.label} m={m} i={i} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-2xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold">Pipeline Activity</h3>
              <p className="text-xs text-muted-foreground">Last 7 days · runs vs errors</p>
            </div>
            <span className="font-mono text-xs text-accent">+18.4%</span>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <AreaChart data={ACTIVITY_SERIES}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="runs" stroke="var(--color-primary)" strokeWidth={2} fill="url(#g1)" />
                <Area type="monotone" dataKey="errors" stroke="var(--color-danger)" strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass rounded-2xl p-5">
          <h3 className="font-display text-lg font-semibold">Agent Status</h3>
          <p className="text-xs text-muted-foreground">Live breakdown</p>
          <div className="h-48">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={STATUS_BREAKDOWN} dataKey="value" innerRadius={45} outerRadius={75} paddingAngle={4}>
                  {["var(--color-primary)", "var(--color-muted-foreground)", "var(--color-danger)"].map((c, i) => <Cell key={i} fill={c} stroke="transparent" />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {STATUS_BREAKDOWN.map((s, i) => {
              const dot = ["bg-primary", "bg-muted-foreground", "bg-danger"][i];
              return (
                <div key={s.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground"><span className={`h-2 w-2 rounded-full ${dot}`} />{s.name}</span>
                  <span className="font-mono">{s.value}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass overflow-hidden rounded-2xl lg:col-span-2">
          <div className="border-b border-border p-5">
            <h3 className="font-display text-lg font-semibold">Recent Pipelines</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-surface/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Last Run</th>
                <th className="px-5 py-3">Duration</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pipelines.map((p) => (
                <tr key={p.id} className="border-t border-border/60 transition-colors hover:bg-surface/40">
                  <td className="px-5 py-3 font-medium">{p.name}</td>
                  <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{p.lastRun}</td>
                  <td className="px-5 py-3 font-mono text-xs">{p.duration}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1.5 text-muted-foreground">
                      <button className="grid h-7 w-7 place-items-center rounded hover:bg-surface hover:text-foreground"><Play className="h-3.5 w-3.5" /></button>
                      <button className="grid h-7 w-7 place-items-center rounded hover:bg-surface hover:text-foreground"><Pause className="h-3.5 w-3.5" /></button>
                      <button className="grid h-7 w-7 place-items-center rounded hover:bg-surface hover:text-foreground"><RefreshCw className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="glass overflow-hidden rounded-2xl">
          <div className="border-b border-border p-5">
            <h3 className="font-display text-lg font-semibold">Live Activity</h3>
          </div>
          <div className="max-h-[420px] space-y-0.5 overflow-auto p-2 font-mono text-xs">
            {logs.map((l, i) => (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i, 10) * 0.03 }}
                className="flex gap-2 rounded px-2 py-1.5 hover:bg-surface/50"
              >
                <span className="text-muted-foreground">{l.time}</span>
                <LogLevelBadge level={l.level} />
                <span className="truncate text-foreground/80">{l.message}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function MetricCard({ m, i }: { m: any; i: number }) {
  const v = useCountUp(m.value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }}
      className="glass relative overflow-hidden rounded-2xl p-5 transition-shadow hover:shadow-[var(--shadow-glow)]"
    >
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${m.bg} blur-2xl`} />
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${m.border} ${m.bg} ${m.color}`}>
        <m.icon className="h-5 w-5" />
      </div>
      <div className="mt-4 font-display text-3xl font-bold">{v.toLocaleString()}</div>
      <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{m.label}</div>
    </motion.div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Running: "border-accent/40 bg-accent/10 text-accent",
    Paused: "border-warning/40 bg-warning/10 text-warning",
    Error: "border-danger/40 bg-danger/10 text-danger",
    Idle: "border-border bg-surface text-muted-foreground",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${map[status] ?? map.Idle}`}>
      {status === "Running" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />}
      {status}
    </span>
  );
}

export function LogLevelBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    INFO: "text-primary",
    WARN: "text-warning",
    ERROR: "text-danger",
    DEBUG: "text-muted-foreground",
  };
  return <span className={`w-12 shrink-0 font-bold ${map[level] ?? "text-muted-foreground"}`}>{level}</span>;
}
