import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="relative overflow-hidden py-32">
      <div className="absolute inset-0 bg-[var(--gradient-mesh)] opacity-10 blur-3xl" />
      {/* Floating shapes */}
      {[
        { left: "10%", top: "15%", size: "h-10 w-10", round: false },
        { left: "28%", top: "40%", size: "h-14 w-14", round: true },
        { left: "46%", top: "20%", size: "h-8 w-8", round: false },
        { left: "64%", top: "55%", size: "h-16 w-16", round: true },
        { left: "82%", top: "30%", size: "h-12 w-12", round: false },
      ].map((s, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute"
          style={{ left: s.left, top: s.top }}
          animate={{ rotate: 360, y: [0, -20, 0] }}
          transition={{ rotate: { duration: 20 + i * 4, repeat: Infinity, ease: "linear" }, y: { duration: 6 + i, repeat: Infinity, ease: "easeInOut" } }}
        >
          <div className={`${s.size} border border-primary/30 ${s.round ? "rounded-full" : "rotate-45"} bg-surface/40`} />
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.7 }}
        className="relative mx-auto max-w-3xl px-6 text-center"
      >
        <h2 className="font-display text-5xl font-bold tracking-tight sm:text-6xl">
          Ready to build your <span className="text-gradient">first pipeline?</span>
        </h2>
        <p className="mt-6 text-lg text-muted-foreground">
          Start orchestrating in under a minute. No credit card. Just intent.
        </p>
        <div className="mt-10 flex justify-center">
          <Link
            to="/app"
            className="group relative inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-medium text-primary-foreground shadow-[var(--shadow-glow)] [animation:pulse-ring_2.5s_ease-out_infinite] hover:scale-[1.04]"
          >
            Start Free
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
