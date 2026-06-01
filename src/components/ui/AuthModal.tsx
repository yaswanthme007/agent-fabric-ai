import { motion, AnimatePresence } from "framer-motion";
import { Hexagon, Eye, EyeOff, Loader2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useModals } from "@/lib/ModalContext";
import { useNavigate } from "@tanstack/react-router";

const SITE_URL = import.meta.env.VITE_SITE_URL ?? window.location.origin;

// Google "G" logo SVG
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export function AuthModal() {
  const { authModalOpen, setAuthModalOpen, authModalMode } = useModals();
  const navigate = useNavigate();
  
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      const { error: e } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${SITE_URL}/app`,
        },
      });
      if (e) throw e;
      setAuthModalOpen(false);
    } catch (e: any) {
      setError(e?.message ?? "Google sign-in failed. Please try again.");
      setGoogleLoading(false);
    }
  };

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
            <div className="mb-6 flex flex-col items-center gap-3">
              <div className="relative flex h-12 w-12 items-center justify-center">
                <Hexagon className="h-12 w-12 text-primary" strokeWidth={1} />
                <div className="absolute h-3 w-3 rounded-full bg-primary shadow-[0_0_12px_var(--color-primary)] animate-pulse" />
              </div>
              <h2 className="font-display text-2xl font-bold tracking-wider text-foreground">
                {tab === "signin" ? "Welcome Back" : "Join NEXUS"}
              </h2>
              <p className="text-sm text-muted-foreground">Your AI Agent Workspace</p>
            </div>

            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-surface/60 px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface hover:border-primary/50 disabled:opacity-50 mb-5"
            >
              {googleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              {googleLoading ? "Redirecting to Google..." : "Continue with Google"}
            </button>

            {/* Divider */}
            <div className="relative mb-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">or continue with email</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Tab switcher */}
            <div className="relative mb-5 flex rounded-lg border border-border bg-surface/50 p-1">
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
                disabled={loading || googleLoading}
                className="flex w-full mt-2 items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? "Please wait..." : tab === "signin" ? "Sign In" : "Create Account"}
              </button>
            </div>
            
            <p className="mt-5 text-center text-xs text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
