import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Search, Play, X, Loader2, Send, Copy, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AGENTS, type Agent, type AgentType } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";
import { runAgent } from "@/lib/groq";
import { toast } from "sonner";

export const Route = createFileRoute("/app/agents")({
  head: () => ({ meta: [{ title: "NEXUS · Agents" }] }),
  component: AgentsPage,
});

const TAGS: ("All" | AgentType)[] = ["All", "NLP", "Vision", "Data", "Automation"];

const COLORS: Record<string, { border: string; text: string; bg: string; gradient: string }> = {
  primary: { border: "border-primary/40", text: "text-primary", bg: "bg-primary/10", gradient: "from-primary to-accent" },
  secondary: { border: "border-secondary/40", text: "text-secondary", bg: "bg-secondary/10", gradient: "from-secondary to-primary" },
  accent: { border: "border-accent/40", text: "text-accent", bg: "bg-accent/10", gradient: "from-accent to-primary" },
  warning: { border: "border-warning/40", text: "text-warning", bg: "bg-warning/10", gradient: "from-warning to-danger" },
};

const COLOR_KEYS: Agent["color"][] = ["primary", "secondary", "accent", "warning"];

const QUICK_TASKS: Record<string, string[]> = {
  NLP: [
    "Summarize this text: [paste any article or paragraph here]",
    "Extract all action items from: [paste meeting notes here]",
    "Classify the sentiment of: [paste a customer review here]",
  ],
  Data: [
    "Analyze this data and find patterns: [paste CSV rows or numbers here]",
    "Extract structured information from: [paste unstructured text here]",
    "Compare these values and give insights: [paste data here]",
  ],
  Automation: [
    "Create a step-by-step automation plan to: [describe your workflow]",
    "Break down this process into executable steps: [describe the process]",
    "What tools and APIs would I need to automate: [describe the task]",
  ],
  Vision: [
    "Describe what you would detect in an image of: [describe the scene]",
    "What data would you extract from a receipt showing: [describe the receipt]",
    "Analyze this UI screenshot description: [describe the interface]",
  ],
};

function AgentsPage() {
  const [tag, setTag] = useState<typeof TAGS[number]>("All");
  const [query, setQuery] = useState("");
  const [agents, setAgents] = useState<Agent[]>(AGENTS);
  const [running, setRunning] = useState<Agent | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from("agents").select("*").order("created_at", { ascending: true });
        if (error) throw error;
        if (data && data.length) {
          setAgents(data.map((a: any, i: number) => ({
            id: String(a.id),
            name: a.name ?? `Agent-${i}`,
            type: (a.type ?? "NLP") as AgentType,
            description: a.description ?? "AI agent on the NEXUS network.",
            successRate: a.success_rate ?? 95,
            avgRuntime: a.avg_runtime ?? "1.2s",
            lastRun: a.last_run ?? "—",
            color: (a.color as Agent["color"]) ?? COLOR_KEYS[i % COLOR_KEYS.length],
          })));
        }
      } catch { /* silent fallback */ }
    })();
  }, []);

  const filtered = agents.filter((a) => (tag === "All" || a.type === tag) && a.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-input/40 px-3 py-2 focus-within:border-primary focus-within:shadow-[var(--shadow-glow)]">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search agents…" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        </div>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((t) => (
            <button
              key={t}
              onClick={() => setTag(t)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${tag === t ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((a, i) => {
          const c = COLORS[a.color] ?? COLORS.primary;
          return (
            <motion.div
              key={a.id}
              layout
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -6 }}
              className="group glass relative overflow-hidden rounded-2xl p-5 transition-shadow hover:shadow-[var(--shadow-glow)]"
            >
              <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full ${c.bg} blur-2xl transition-opacity group-hover:opacity-80`} />
              <div className="relative flex items-center justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${c.border} bg-surface font-display text-lg font-bold ${c.text}`}>
                  {a.name[0]}
                </div>
                <span className={`rounded-full border ${c.border} ${c.bg} px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${c.text}`}>{a.type}</span>
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{a.name}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{a.description}</p>

              <div className="mt-4 space-y-2">
                <div>
                  <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
                    <span>SUCCESS</span><span className="text-foreground">{a.successRate}%</span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-input">
                    <div className={`h-full bg-gradient-to-r ${c.gradient}`} style={{ width: `${a.successRate}%` }} />
                  </div>
                </div>
                <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
                  <span>AVG RUNTIME</span><span className="text-foreground">{a.avgRuntime}</span>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 py-2 text-sm font-medium text-primary transition hover:bg-primary hover:text-primary-foreground">
                  <Plus className="h-4 w-4" /> Add
                </button>
                <button
                  onClick={() => setRunning(a)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 py-2 text-sm font-medium text-accent transition hover:bg-accent hover:text-accent-foreground"
                >
                  <Play className="h-4 w-4" /> Run
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {running && <RunModal agent={running} onClose={() => setRunning(null)} />}
      </AnimatePresence>
    </div>
  );
}

function RunModal({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  const [task, setTask] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const typingRef = useRef<number | null>(null);
  const c = COLORS[agent.color] ?? COLORS.primary;
  const quickTasks = QUICK_TASKS[agent.type] ?? QUICK_TASKS.NLP;

  useEffect(() => () => { if (typingRef.current) window.clearInterval(typingRef.current); }, []);

  const execute = async () => {
    if (!task.trim() || loading) return;
    setLoading(true);
    setOutput("");
    setCopied(false);
    try {
      const response = await runAgent(agent.name, agent.type, task);
      let i = 0;
      if (typingRef.current) window.clearInterval(typingRef.current);
      typingRef.current = window.setInterval(() => {
        i++;
        setOutput(response.slice(0, i));
        if (i >= response.length && typingRef.current) {
          window.clearInterval(typingRef.current);
          typingRef.current = null;
        }
      }, 12);
      toast.success(`${agent.name} executed`);
      try {
        await supabase.from("logs").insert({
          level: "INFO",
          message: response.slice(0, 100),
          agent_name: agent.name,
        });
      } catch {}
    } catch (e: any) {
      toast.error("Agent execution failed");
      setOutput(`[ERROR] ${e?.message ?? "Request failed"}`);
    } finally {
      setLoading(false);
    }
  };

  const copyOutput = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="glass relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-5">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${c.border} bg-surface font-display font-bold ${c.text}`}>
              {agent.name[0]}
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold">{agent.name}</h3>
              <p className={`font-mono text-[10px] uppercase tracking-wider ${c.text}`}>{agent.type} agent · {agent.description}</p>
            </div>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-surface hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Tasks */}
        <div className="border-b border-border px-5 py-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Quick Tasks</p>
          <div className="flex flex-wrap gap-2">
            {quickTasks.map((qt, i) => (
              <button
                key={i}
                onClick={() => setTask(qt)}
                className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-muted-foreground transition hover:border-primary hover:text-primary"
              >
                {qt.length > 45 ? qt.slice(0, 45) + "…" : qt}
              </button>
            ))}
          </div>
        </div>

        {/* Task input */}
        <div className="space-y-3 p-5">
          <textarea
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Describe what you want this agent to do, or click a Quick Task above..."
            rows={3}
            className="w-full resize-none rounded-lg border border-border bg-input/40 px-3 py-2 text-sm outline-none focus:border-primary focus:shadow-[var(--shadow-glow)]"
          />
          <button
            onClick={execute}
            disabled={loading || !task.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {loading ? "Executing..." : "Execute"}
          </button>
        </div>

        {/* Output terminal */}
        <div className="relative flex-1 overflow-auto border-t border-border bg-black/60 p-4 font-mono text-xs text-[color:var(--color-primary)]">
          {output ? (
            <>
              <pre className="whitespace-pre-wrap break-words">{output}<span className="animate-pulse">▌</span></pre>
              <button
                onClick={copyOutput}
                className="absolute right-3 top-3 flex items-center gap-1.5 rounded-md border border-border bg-surface/80 px-2 py-1 text-[10px] text-muted-foreground transition hover:border-primary hover:text-primary"
              >
                {copied ? <Check className="h-3 w-3 text-accent" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </>
          ) : (
            <div className="text-muted-foreground">$ awaiting task...</div>
          )}
        </div>

        <div className="border-t border-border p-4">
          <button onClick={onClose} className="w-full rounded-md border border-border py-2 text-xs text-muted-foreground hover:text-foreground">
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
