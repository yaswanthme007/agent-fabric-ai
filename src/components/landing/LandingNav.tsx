import { Link } from "@tanstack/react-router";
import { Hexagon } from "lucide-react";
import { useModals } from "@/lib/ModalContext";

export function LandingNav() {
  const { openAuthModal } = useModals();

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="relative flex h-8 w-8 items-center justify-center">
            <Hexagon className="h-8 w-8 text-primary" strokeWidth={1.5} />
            <div className="absolute h-2 w-2 rounded-full bg-primary animate-pulse" />
          </div>
          <span className="font-display text-lg font-bold tracking-wider">NEXUS</span>
        </Link>
        <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#agents" className="hover:text-foreground">Agents</a>
          <a href="#pipeline" className="hover:text-foreground">Pipelines</a>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => openAuthModal("signin")}
            className="rounded-md border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground transition hover:border-primary hover:text-foreground"
          >
            Sign In
          </button>
          <button
            onClick={() => openAuthModal("signup")}
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-border/40 bg-surface/20 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Hexagon className="h-4 w-4 text-primary" />
          <span className="font-mono text-xs">NEXUS · runtime v2.0 · © 2026</span>
        </div>
        <div className="flex gap-6 text-xs text-muted-foreground">
          <a href="https://github.com/yaswanthme007/agent-fabric-ai" target="_blank" rel="noreferrer" className="hover:text-foreground">GitHub</a>
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
        </div>
      </div>
    </footer>
  );
}
