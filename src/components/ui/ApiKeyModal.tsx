import { motion, AnimatePresence } from "framer-motion";
import { Key, Eye, EyeOff, CheckCircle, Trash2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useModals } from "@/lib/ModalContext";
import { toast } from "sonner";

export function ApiKeyModal() {
  const { apiKeyModalOpen, setApiKeyModalOpen } = useModals();
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    if (apiKeyModalOpen) {
      const stored = localStorage.getItem("nexus_groq_key");
      if (stored) { 
        setKey(stored); 
        setKeySaved(true); 
      } else {
        setKey("");
        setKeySaved(false);
      }
    }
  }, [apiKeyModalOpen]);

  const saveKey = () => {
    if (!key.trim().startsWith("gsk_")) {
      toast.error("Invalid key — Groq keys start with gsk_");
      return;
    }
    localStorage.setItem("nexus_groq_key", key.trim());
    setKeySaved(true);
    toast.success("API key saved to your browser");
    setTimeout(() => setApiKeyModalOpen(false), 1000);
  };

  const removeKey = () => {
    localStorage.removeItem("nexus_groq_key");
    setKey("");
    setKeySaved(false);
    toast.info("API key removed");
  };

  return (
    <AnimatePresence>
      {apiKeyModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setApiKeyModalOpen(false)}
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
              onClick={() => setApiKeyModalOpen(false)} 
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="mb-6 flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/30 text-primary">
                <Key className="h-6 w-6" />
              </div>
              <h2 className="font-display text-xl font-bold tracking-wide text-foreground">
                Groq API Key
              </h2>
              <p className="text-sm text-muted-foreground">
                Enter your own Groq API key to remove rate limits. It stays in your browser.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showKey ? "text" : "password"}
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") saveKey(); }}
                    placeholder="gsk_..."
                    className="w-full rounded-lg border border-border bg-input/40 px-3 py-2 pr-10 font-mono text-sm outline-none transition focus:border-primary focus:shadow-[var(--shadow-glow)]"
                  />
                  <button onClick={() => setShowKey((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <button onClick={saveKey} className="rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90">
                  Save
                </button>
                {keySaved && (
                  <button onClick={removeKey} className="rounded-lg border border-border px-3 text-muted-foreground transition hover:border-danger hover:text-danger">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="rounded-lg border border-border bg-surface/40 p-4 text-sm text-muted-foreground space-y-2">
                <p>1. Go to <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="text-primary hover:underline">console.groq.com</a></p>
                <p>2. Create a free account</p>
                <p>3. Go to <strong>API Keys</strong> &gt; <strong>Create API Key</strong></p>
                <p>4. Paste it here</p>
              </div>

              {keySaved ? (
                <p className="flex items-center justify-center gap-2 text-xs text-accent mt-4">
                  <CheckCircle className="h-3.5 w-3.5" /> Key is active on this device
                </p>
              ) : (
                <p className="flex items-center justify-center gap-2 text-xs text-amber-400 mt-4">
                  ⚠ No key set — using shared demo key
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
