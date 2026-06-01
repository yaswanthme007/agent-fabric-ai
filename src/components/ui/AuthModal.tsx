import { motion, AnimatePresence } from "framer-motion";
import { Hexagon, Eye, EyeOff, Loader2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useModals } from "@/lib/ModalContext";
import { useNavigate } from "@tanstack/react-router";

export function AuthModal() {
  const { authModalOpen, setAuthModalOpen, authModalMode } = useModals();
  const navigate = useNavigate();
  
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (authModalOpen) {
      setTab(authModalMode);
      setError("");
      setSuccess("");
      setEmail("");
      setPassword("");
    }
  }, [authModalOpen, authModalMode]);

  useEffect(() => { setError(""); setSuccess(""); }, [tab]);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) { setError("Please enter email and password."); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      if (tab === "signin") {
        const { error: e } = await supabase.auth.signInWithPassword({ email, password });
        if (e) throw e;
        setAuthModalOpen(false);
        navigate({ to: "/app" });
      } else {
        const { error: e } = await supabase.auth.signUp({ email, password });
        if (e) throw e;
        setSuccess("Check your email to confirm your account, then sign in.");
      }
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {authModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAuthModalOpen(false)}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-md overflow-hidden glass rounded-2xl border border-border p-8 shadow-[0_0_60px_-15px_var(--color-primary)]"
          >
            {/* Close Button */}
            <button 
              onClick={() => setAuthModalOpen(false)} 
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Logo */}
            <div className="mb-8 flex flex-col items-center gap-3">
              <div className="relative flex h-14 w-14 items-center justify-center">
                <Hexagon className="h-14 w-14 text-primary" strokeWidth={1} />
                <div className="absolute h-3 w-3 rounded-full bg-primary shadow-[0_0_12px_var(--color-primary)] animate-pulse" />
              </div>
              <h2 className="font-display text-2xl font-bold tracking-wider text-foreground">
                {tab === "signin" ? "Welcome Back" : "Join NEXUS"}
              </h2>
              <p className="text-sm text-muted-foreground">Your AI Agent Workspace</p>
            </div>

            {/* Tab switcher */}
            <div className="relative mb-6 flex rounded-lg border border-border bg-surface/50 p-1">
              {(["signin", "signup"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`relative z-10 flex-1 rounded-md py-2 text-sm font-medium transition-colors ${tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {t === "signin" ? "Sign In" : "Sign Up"}
                  {tab === t && (
                    <motion.div
                      layoutId="auth-tab-bg"
                      className="absolute inset-0 rounded-md bg-primary/10 border border-primary/30"
                      style={{ zIndex: -1 }}
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-border bg-input/40 px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,212,255,0.1)]"
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-border bg-input/40 px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,212,255,0.1)]"
                  />
                  <button
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Error / Success */}
              <AnimatePresence>
                {error && (
                  <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
                    {error}
                  </motion.p>
                )}
                {success && (
                  <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-xs text-accent">
                    {success}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex w-full mt-2 items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? "Please wait..." : tab === "signin" ? "Sign In" : "Create Account"}
              </button>
            </div>
            
            <p className="mt-6 text-center text-xs text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
