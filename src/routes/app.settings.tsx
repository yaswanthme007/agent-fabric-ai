import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Eye, EyeOff, Key, Trash2, CheckCircle, User, ExternalLink, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { User as SupaUser } from "@supabase/supabase-js";
import { useModals } from "@/lib/ModalContext";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "NEXUS · Settings" }] }),
  component: SettingsPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 space-y-4">
      <h2 className="font-display text-lg font-semibold border-b border-border pb-3">{title}</h2>
      {children}
    </motion.div>
  );
}

function SettingsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupaUser | null>(null);
  const [keySaved, setKeySaved] = useState(false);
  const { openAuthModal, openApiKeyModal, apiKeyModalOpen } = useModals();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("nexus_groq_key");
    setKeySaved(!!stored);
  }, [apiKeyModalOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  const removeKey = () => {
    localStorage.removeItem("nexus_groq_key");
    setKeySaved(false);
    toast.info("API key removed");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account, API keys, and workspace preferences</p>
      </div>

      {/* Account */}
      <Section title="Account">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary font-display font-bold text-primary-foreground">
            <User className="h-5 w-5" />
          </div>
          <div>
            {user ? (
              <>
                <p className="text-sm font-medium">{user.email}</p>
                <p className="text-xs text-muted-foreground">Signed in · data synced to cloud</p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium">Guest User</p>
                <p className="text-xs text-muted-foreground">Not signed in · data stored locally only</p>
              </>
            )}
          </div>
          {user && (
            <button
              onClick={handleLogout}
              className="ml-auto flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:border-danger hover:text-danger"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          )}
        </div>
        {!user && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
            <p className="mb-2">Sign in to sync your pipelines and agent runs across devices.</p>
            <button onClick={() => openAuthModal("signin")} className="text-primary hover:underline">Sign in or create a free account →</button>
          </div>
        )}
      </Section>

      {/* Groq API Key */}
      <Section title="Groq API Key">
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-primary" />
          <p className="text-xs text-muted-foreground">Stored only in your browser. Never sent to our servers.</p>
          {keySaved && <CheckCircle className="ml-auto h-4 w-4 text-accent" />}
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border bg-surface/40 p-4">
          <div className="space-y-1">
            <h3 className="text-sm font-medium">Personal API Key</h3>
            {keySaved ? (
              <p className="text-xs text-accent">Active — running on your own free Groq account.</p>
            ) : (
              <p className="text-xs text-amber-400">Not set — using shared demo key (rate limits apply).</p>
            )}
          </div>
          <div className="flex gap-2">
            {keySaved && (
              <button onClick={removeKey} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-danger hover:text-danger">
                Remove
              </button>
            )}
            <button onClick={openApiKeyModal} className="rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground transition hover:opacity-90">
              {keySaved ? "Update Key" : "Set API Key"}
            </button>
          </div>
        </div>
      </Section>

      {/* About */}
      <Section title="About NEXUS">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between"><span>Version</span><span className="font-mono text-foreground">2.0.0</span></div>
          <div className="flex justify-between"><span>License</span><span className="font-mono text-foreground">MIT</span></div>
          <div className="flex justify-between items-center">
            <span>GitHub</span>
            <a href="https://github.com/yaswanthme007/agent-fabric-ai" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline font-mono text-xs">
              agent-fabric-ai <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
        <p className="rounded-lg border border-border bg-surface/40 p-3 text-xs text-muted-foreground">
          Built entirely with free tools — Groq (AI), Supabase (database + auth), Vercel (hosting), React + TanStack Router (frontend). Proof that great software doesn't have to cost anything.
        </p>
      </Section>
    </div>
  );
}
