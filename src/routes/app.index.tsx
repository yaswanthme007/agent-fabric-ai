import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Workflow, Bot, CheckCircle2, AlertTriangle, Play, Pause, RefreshCw, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
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

interface Pipeline { id: string; name: string; status: string; lastRun: string; duration: string; }
interface LogEntry { id: string; time: string; level: string; pipeline: string; message: string; }
interface DayStat { day: string; runs: number; errors: number; }

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

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function Dashboard() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [agentCount, setAgentCount] = useState(0);
  const [activity, setActivity] = useState<DayStat[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        // Pipelines
        const { data: pipeData } = await supabase.from("pipelines").select("*").order("created_at", { ascending: false });
        const mapped: Pipeline[] = (pipeData ?? []).map((p: any) => ({
          id: String(p.id),
          name: p.name ?? "Untitled",
          status: normalizeStatus(p.status),
          lastRun: timeAgo(p.updated_at ?? p.created_at),
          duration: p.duration ?? "—",
        }));
        if (!cancelled) setPipelines(mapped);

        // Agent count
        const { count: ac } = await supabase.from("agents").select("id", { count: "exact", head: true });
        if (!cancelled) setAgentCount(ac ?? 0);

        // Status breakdown from agents
        const runningCount = mapped.filter(p => p.status === "Running").length;
        const idleCount = mapped.filter(p => p.status === "Idle").length;
        const errorCount = mapped.filter(p => p.status === "Error").length;
        if (!cancelled) setStatusBreakdown([
          { name: "Running", value: runningCount },
          { name: "Idle", value: idleCount },
          { name: "Error", value: errorCount },
        ]);

        // Activity chart — last 7 days from logs
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        const { data: logData } = await supabase.from("logs").select("created_at, level").gte("created_at", sevenDaysAgo.toISOString());
        
        const dayMap: Record<string, { runs: number; errors: number }> = {};
        for (let i = 6; i >= 0; i--) {
          const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
          const key = DAY_NAMES[d.getDay()];
          dayMap[key] = { runs: 0, errors: 0 };
        }
        (logData ?? []).forEach((l: any) => {
          const d = new Date(l.created_at);
          const key = DAY_NAMES[d.getDay()];
          if (dayMap[key]) {
            dayMap[key].runs++;
            if (l.level === "ERROR") dayMap[key].errors++;
          }
        });
        if (!cancelled) setActivity(Object.entries(dayMap).map(([day, v]) => ({ day, ...v })));

      } catch {}
      finally { if (!cancelled) setLoading(false); }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadLogs = async () => {
      try {
        const { data } = await supabase.from("logs").select("*").order("created_at", { ascending: false }).limit(20);
        if (!cancelled && data) {
          setLogs(data.map((l: any) => ({
            id: String(l.id),
            time: new Date(l.created_at).toTimeString().slice(0, 8),
            level: l.level ?? "INFO",
            pipeline: l.agent_name ?? "system",
            message: l.message ?? "",
          })));
        }
      } catch {}
    };
    loadLogs();
    const id = setInterval(loadLogs, 5000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const runsToday = logs.filter(l => {
    try { return new Date(l.time) >= today; } catch { return true; }
  }).length;

  const activeCount = pipelines.filter((p) => p.status === "Running").length;
  const errorCount = pipelines.filter((p) => p.status === "Error").length;
  const hasActivity = activity.some(d => d.runs > 0);

  const metrics = [
    { icon: Workflow, label: "Active Pipelines", value: activeCount, color: "text-primary", border: "border-primary/30", bg: "bg-primary/10" },
    { icon: Bot, label: "Total Agents", value: agentCount, color: "text-secondary", border: "border-secondary/30", bg: "bg-secondary/10" },
    { icon: CheckCircle2, label: "Agent Runs Today", value: logs.length, color: "text-accent", border: "border-accent/30", bg: "bg-accent/10" },
    { icon: AlertTriangle, label: "Errors", value: errorCount, color: "text-danger", border: "border-danger/30", bg: "bg-danger/10" },
  ];

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, i) => <MetricCard key={m.label} m={m} i={i} loading={loading} />)}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Activity chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-2xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold">Pipeline Activity</h3>
              <p className="text-xs text-muted-foreground">Last 7 days · agent runs</p>
            </div>
          </div>
          <div className="relative mt-4 h-64">
            {!hasActivity ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                <Activity className="h-8 w-8 opacity-30" />
                <p className="text-sm">No pipeline runs yet.</p>
                <p className="text-xs opacity-70">Run an agent to see activity here.</p>
              </div>
            ) : (
              <ResponsiveContainer>
                <AreaChart data={activity}>
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
            )}
          </div>
        </motion.div>

        {/* Status donut */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass rounded-2xl p-5">
          <h3 className="font-display text-lg font-semibold">Pipeline Status</h3>
          <p className="text-xs text-muted-foreground">Live breakdown</p>
          {statusBreakdown.every(s => s.value === 0) ? (
            <div className="flex h-48 items-center justify-center text-xs text-muted-foreground">No pipelines yet</div>
          ) : (
            <div className="h-48">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={statusBreakdown} dataKey="value" innerRadius={45} outerRadius={75} paddingAngle={4}>
                    {["var(--color-primary)", "var(--color-muted-foreground)", "var(--color-danger)"].map((c, i) => <Cell key={i} fill={c} stroke="transparent" />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="space-y-2">
            {statusBreakdown.map((s, i) => {
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
        {/* Pipelines table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass overflow-hidden rounded-2xl lg:col-span-2">
          <div className="border-b border-border p-5">
            <h3 className="font-display text-lg font-semibold">Recent Pipelines</h3>
          </div>
          {pipelines.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 p-10 text-center text-muted-foreground">
              <Workflow className="h-10 w-10 opacity-30" />
              <p className="text-sm">No pipelines saved yet.</p>
              <Link to="/app/builder" className="text-xs text-primary hover:underline">Go to Builder →</Link>
            </div>
          ) : (
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
          )}
        </motion.div>

        {/* Live activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="glass overflow-hidden rounded-2xl">
          <div className="border-b border-border p-5 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Live Activity</h3>
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-accent"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />live</span>
          </div>
          <div className="max-h-[420px] space-y-0.5 overflow-auto p-2 font-mono text-xs">
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground">
                <Activity className="h-8 w-8 opacity-30" />
                <p className="text-xs">No activity yet. Run an agent to see logs here.</p>
              </div>
            ) : (
              logs.map((l, i) => (
                <motion.div
                  key={l.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i, 10) * 0.03 }}
                  className="flex gap-2 rounded px-2 py-1.5 hover:bg-surface/50"
                >
                  <span className="text-muted-foreground shrink-0">{l.time}</span>
                  <LogLevelBadge level={l.level} />
                  <span className="truncate text-foreground/80">{l.message}</span>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function MetricCard({ m, i, loading }: { m: any; i: number; loading: boolean }) {
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
      {loading ? (
        <div className="mt-4 h-9 w-16 animate-pulse rounded-lg bg-surface" />
      ) : (
        <div className="mt-4 font-display text-3xl font-bold">{v.toLocaleString()}</div>
      )}
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
