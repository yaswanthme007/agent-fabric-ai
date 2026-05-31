import { createFileRoute } from "@tanstack/react-router";
import ReactFlow, { Background, Controls, MiniMap, addEdge, useNodesState, useEdgesState, type Connection, type Node, type Edge, BackgroundVariant } from "reactflow";
import "reactflow/dist/style.css";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Database, Bot, Shuffle, GitBranch, Send, Play, Save, Trash2, ZoomIn, ZoomOut, LayoutGrid, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/app/builder")({
  head: () => ({ meta: [{ title: "NEXUS · Pipeline Builder" }] }),
  component: Builder,
});

const PALETTE = [
  { type: "input", label: "Input", icon: Database, accent: "primary" },
  { type: "agent", label: "AI Agent", icon: Bot, accent: "secondary" },
  { type: "transform", label: "Transform", icon: Shuffle, accent: "primary" },
  { type: "condition", label: "Condition", icon: GitBranch, accent: "warning" },
  { type: "output", label: "Output", icon: Send, accent: "accent" },
] as const;

const STYLES: Record<string, { ring: string; bg: string; text: string }> = {
  input: { ring: "ring-primary/40", bg: "bg-primary/10", text: "text-primary" },
  agent: { ring: "ring-secondary/40", bg: "bg-secondary/10", text: "text-secondary" },
  transform: { ring: "ring-primary/40", bg: "bg-primary/10", text: "text-primary" },
  condition: { ring: "ring-warning/40", bg: "bg-warning/10", text: "text-warning" },
  output: { ring: "ring-accent/40", bg: "bg-accent/10", text: "text-accent" },
};

const INITIAL_NODES: Node[] = [
  { id: "1", type: "default", position: { x: 60, y: 140 }, data: { label: "Webhook Trigger", kind: "input" } },
  { id: "2", type: "default", position: { x: 320, y: 140 }, data: { label: "Atlas · Summarizer", kind: "agent" } },
  { id: "3", type: "default", position: { x: 580, y: 60 }, data: { label: "Filter > 0.8", kind: "condition" } },
  { id: "4", type: "default", position: { x: 580, y: 240 }, data: { label: "Transform JSON", kind: "transform" } },
  { id: "5", type: "default", position: { x: 840, y: 140 }, data: { label: "Send Email", kind: "output" } },
].map((n) => ({ ...n, data: n.data, style: nodeStyle((n.data as any).kind) }));

function nodeStyle(kind: string): React.CSSProperties {
  const colors: Record<string, string> = {
    input: "rgb(0 212 255)", agent: "rgb(124 58 237)", transform: "rgb(0 212 255)", condition: "rgb(245 158 11)", output: "rgb(0 255 136)",
  };
  return {
    background: "rgba(10, 15, 26, 0.85)",
    border: `1px solid ${colors[kind]}55`,
    boxShadow: `0 0 0 1px ${colors[kind]}22, 0 0 30px -10px ${colors[kind]}77`,
    color: "rgb(232 244 255)",
    borderRadius: 12,
    padding: "12px 16px",
    fontFamily: "Inter, sans-serif",
    fontSize: 13,
    fontWeight: 500,
    minWidth: 180,
    backdropFilter: "blur(10px)",
  };
}

const INITIAL_EDGES: Edge[] = [
  { id: "e1", source: "1", target: "2", animated: true, style: { stroke: "rgb(0 212 255)", strokeWidth: 2 } },
  { id: "e2", source: "2", target: "3", animated: true, style: { stroke: "rgb(124 58 237)", strokeWidth: 2 } },
  { id: "e3", source: "2", target: "4", animated: true, style: { stroke: "rgb(124 58 237)", strokeWidth: 2 } },
  { id: "e4", source: "3", target: "5", animated: true, style: { stroke: "rgb(245 158 11)", strokeWidth: 2 } },
  { id: "e5", source: "4", target: "5", animated: true, style: { stroke: "rgb(0 212 255)", strokeWidth: 2 } },
];

interface SavedPipeline { id: string; name: string; nodes: Node[]; edges: Edge[]; }

function Builder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [selected, setSelected] = useState<Node | null>(null);
  const [running, setRunning] = useState(true);
  const [saved, setSaved] = useState<SavedPipeline[]>([]);
  const [showSave, setShowSave] = useState(false);
  const [pipelineName, setPipelineName] = useState("");

  const loadList = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("pipelines").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      if (data) {
        setSaved(data.map((p: any) => ({
          id: String(p.id),
          name: p.name ?? "Untitled",
          nodes: Array.isArray(p.nodes) ? p.nodes : [],
          edges: Array.isArray(p.edges) ? p.edges : [],
        })));
      }
    } catch {}
  }, []);

  useEffect(() => { loadList(); }, [loadList]);

  const onConnect = useCallback((c: Connection) => setEdges((eds) => addEdge({ ...c, animated: true, style: { stroke: "rgb(0 212 255)", strokeWidth: 2 } }, eds)), [setEdges]);

  const addNode = (kind: string, label: string) => {
    const id = `${Date.now()}`;
    setNodes((nds) => [...nds, { id, type: "default", position: { x: 280 + Math.random() * 300, y: 100 + Math.random() * 200 }, data: { label, kind }, style: nodeStyle(kind) }]);
  };

  const handleLoad = (id: string) => {
    const p = saved.find((s) => s.id === id);
    if (!p) return;
    const restoredNodes = p.nodes.map((n: any) => ({ ...n, style: nodeStyle((n.data as any)?.kind ?? "agent") }));
    setNodes(restoredNodes);
    setEdges(p.edges);
    toast.info(`Loaded "${p.name}"`);
  };

  const handleSave = async () => {
    const name = pipelineName.trim();
    if (!name) { toast.error("Pipeline name required"); return; }
    try {
      const { error } = await supabase.from("pipelines").insert({
        name,
        status: "idle",
        nodes: nodes as any,
        edges: edges as any,
      });
      if (error) throw error;
      toast.success("Pipeline saved successfully!");
      setShowSave(false);
      setPipelineName("");
      loadList();
    } catch (e: any) {
      toast.error(`Save failed: ${e?.message ?? "unknown"}`);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <aside className="w-56 shrink-0 border-r border-border bg-surface/40 p-4">
        <h3 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Node Library</h3>
        <div className="space-y-2">
          {PALETTE.map((p) => {
            const s = STYLES[p.type];
            return (
              <motion.button
                key={p.type}
                whileHover={{ x: 4 }} whileTap={{ scale: 0.97 }}
                onClick={() => addNode(p.type, p.label + " Node")}
                className="flex w-full items-center gap-3 rounded-lg border border-border bg-surface p-2.5 text-left text-sm transition hover:border-primary/40 hover:shadow-[var(--shadow-glow)]"
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-md ${s.bg} ${s.text}`}>
                  <p.icon className="h-4 w-4" />
                </div>
                <span>{p.label}</span>
              </motion.button>
            );
          })}
        </div>
      </aside>

      <div className="relative flex-1">
        <div className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-border bg-surface/80 p-1.5 shadow-lg backdrop-blur">
          <button onClick={() => setRunning((v) => !v)} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${running ? "bg-accent text-accent-foreground shadow-[var(--shadow-glow-mint)]" : "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"}`}>
            <Play className="h-3.5 w-3.5 fill-current" /> {running ? "Running" : "Run"}
          </button>
          <Divider />
          <select
            onChange={(e) => { if (e.target.value) handleLoad(e.target.value); }}
            defaultValue=""
            className="rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-muted-foreground outline-none hover:text-foreground"
          >
            <option value="">Load Pipeline…</option>
            {saved.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button
            onClick={() => setShowSave(true)}
            title="Save Pipeline"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground transition hover:bg-surface hover:text-foreground"
          >
            <Save className="h-3.5 w-3.5" /> Save
          </button>
          <ToolBtn icon={Trash2} label="Clear" onClick={() => { setNodes([]); setEdges([]); }} />
          <Divider />
          <ToolBtn icon={ZoomIn} label="Zoom in" />
          <ToolBtn icon={ZoomOut} label="Zoom out" />
          <ToolBtn icon={LayoutGrid} label="Auto layout" />
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, n) => setSelected(n)}
          onPaneClick={() => setSelected(null)}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="rgba(0,212,255,0.15)" />
          <Controls className="!border-border !bg-surface/80 !shadow-lg" />
          <MiniMap nodeColor="rgb(0 212 255)" maskColor="rgba(2, 4, 8, 0.7)" className="!border !border-border !bg-surface" />
        </ReactFlow>

        {selected && (
          <motion.aside
            initial={{ x: 400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 400 }}
            transition={{ type: "spring", stiffness: 220, damping: 25 }}
            className="absolute right-4 top-20 z-10 w-80 rounded-2xl border border-border bg-surface/90 p-5 shadow-xl backdrop-blur"
          >
            <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Properties · #{selected.id}</div>
            <h3 className="font-display text-lg font-semibold">{(selected.data as any).label}</h3>
            <div className="mt-4 space-y-3 text-sm">
              <Field label="Name" value={(selected.data as any).label} />
              <Field label="Kind" value={(selected.data as any).kind} />
              <Field label="Timeout" value="30s" />
              <Field label="Retries" value="3" />
            </div>
            <button onClick={() => setSelected(null)} className="mt-4 w-full rounded-md border border-border py-2 text-xs text-muted-foreground hover:text-foreground">Close</button>
          </motion.aside>
        )}

        <AnimatePresence>
          {showSave && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSave(false)}
              className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="glass w-full max-w-md rounded-2xl border border-border p-5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold">Save Pipeline</h3>
                  <button onClick={() => setShowSave(false)} className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-surface hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Give your pipeline a name to save it to the workspace.</p>
                <input
                  autoFocus
                  value={pipelineName}
                  onChange={(e) => setPipelineName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
                  placeholder="e.g. Lead Enrichment Flow"
                  className="mt-4 w-full rounded-md border border-border bg-input/40 px-3 py-2 text-sm outline-none focus:border-primary focus:shadow-[var(--shadow-glow)]"
                />
                <div className="mt-4 flex gap-2">
                  <button onClick={() => setShowSave(false)} className="flex-1 rounded-md border border-border py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
                  <button onClick={handleSave} className="flex-1 rounded-md bg-primary py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">Save</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Divider() { return <div className="mx-1 h-6 w-px bg-border" />; }
function ToolBtn({ icon: Icon, label, onClick }: { icon: any; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} title={label} className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-surface hover:text-foreground">
      <Icon className="h-4 w-4" />
    </button>
  );
}
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <input defaultValue={value} className="w-full rounded-md border border-border bg-input/40 px-3 py-1.5 text-sm outline-none focus:border-primary focus:shadow-[var(--shadow-glow)]" />
    </div>
  );
}
