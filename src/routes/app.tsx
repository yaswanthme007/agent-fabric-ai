import { Link, Outlet, useRouterState, createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, Workflow, Bot, Activity, Settings, Search, Bell, Hexagon, ChevronLeft, ChevronRight, LogOut, LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export const Route = createFileRoute("/app")({
  head: () => ({ meta: [{ title: "NEXUS · Workspace" }] }),
  component: AppShell,
});

const NAV: { to: "/app" | "/app/builder" | "/app/agents" | "/app/logs" | "/app/settings"; icon: typeof LayoutGrid; label: string; exact?: boolean }[] = [
  { to: "/app", icon: LayoutGrid, label: "Dashboard", exact: true },
  { to: "/app/builder", icon: Workflow, label: "Pipeline Builder" },
  { to: "/app/agents", icon: Bot, label: "Agents Library" },
  { to: "/app/logs", icon: Activity, label: "Logs & Monitor" },
  { to: "/app/settings", icon: Settings, label: "Settings" },
];

function AppShell() {
  const [expanded, setExpanded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const path = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  const avatarText = user?.email ? user.email.slice(0, 2).toUpperCase() : "?";
  const crumbs = NAV.find((n) => (n.exact ? path === n.to : path.startsWith(n.to)))?.label ?? "Dashboard";

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: expanded ? 240 : 64 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="sticky top-0 z-30 flex h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar"
      >
        <div className="flex h-16 items-center justify-center border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2 px-3">
            <Hexagon className="h-6 w-6 text-primary" strokeWidth={1.5} />
            <AnimatePresence>
              {expanded && (
                <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} className="overflow-hidden whitespace-nowrap font-display font-bold tracking-wider">NEXUS</motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        <nav className="flex-1 px-2 py-4">
          {NAV.map((item) => {
            const active = item.exact ? path === item.to : path.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group relative my-1 flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors ${active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"}`}
              >
                {active && (
                  <motion.span layoutId="nav-active" className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r bg-primary shadow-[var(--shadow-glow)]" />
                )}
                <item.icon className="h-5 w-5 shrink-0" />
                <AnimatePresence>
                  {expanded && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">{item.label}</motion.span>
                  )}
                </AnimatePresence>
                {!expanded && (
                  <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs opacity-0 shadow-lg transition-opacity group-hover:opacity-100 md:block">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Auth section */}
        <div className="border-t border-sidebar-border p-2">
          {user ? (
            <div className={`flex items-center gap-2 rounded-lg px-2 py-2 ${expanded ? "justify-between" : "justify-center"}`}>
              <AnimatePresence>
                {expanded && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="truncate text-xs text-muted-foreground max-w-[140px]">
                    {user.email}
                  </motion.span>
                )}
              </AnimatePresence>
              <button onClick={handleLogout} title="Sign out" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition hover:bg-danger/10 hover:text-danger">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link to="/login" className={`flex h-9 items-center justify-center gap-2 rounded-lg border border-border text-xs text-muted-foreground transition hover:border-primary hover:text-primary ${expanded ? "px-3" : ""}`}>
              <LogIn className="h-4 w-4 shrink-0" />
              <AnimatePresence>
                {expanded && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Sign In</motion.span>}
              </AnimatePresence>
            </Link>
          )}
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="m-2 flex h-9 items-center justify-center rounded-lg border border-sidebar-border text-muted-foreground transition hover:text-foreground"
        >
          {expanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </motion.aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-background/70 px-6 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Workspace</span>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium">{crumbs}</span>
          </div>
          <div className="ml-auto flex max-w-md flex-1 items-center gap-2 rounded-lg border border-border bg-input/40 px-3 py-1.5 focus-within:border-primary focus-within:shadow-[var(--shadow-glow)]">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input placeholder="Search agents, pipelines, logs…" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            <kbd className="hidden rounded border border-border px-1.5 font-mono text-[10px] text-muted-foreground md:inline">⌘K</kbd>
          </div>
          <button className="relative grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground transition hover:text-foreground">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger animate-pulse" />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary font-display text-sm font-semibold text-primary-foreground">
            {avatarText}
          </div>
        </header>

        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={path}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
