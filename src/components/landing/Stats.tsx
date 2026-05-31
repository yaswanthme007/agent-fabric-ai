import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.floor(v).toLocaleString() + suffix);
  useEffect(() => {
    if (inView) animate(mv, to, { duration: 2, ease: "easeOut" });
  }, [inView, mv, to]);
  return <motion.span ref={ref}>{rounded}</motion.span>;
}

const STATS = [
  { value: 12400, suffix: "+", label: "Agents Deployed" },
  { value: 99.9, suffix: "%", label: "Uptime", decimals: true },
  { value: 3.2, suffix: "s", label: "Avg Execution Time", decimals: true },
  { value: 48, suffix: "", label: "Integrations" },
];

export function Stats() {
  return (
    <section className="relative border-y border-border/50 bg-surface/30 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
              whileHover={{ y: -4 }}
              className="group glass rounded-2xl p-6 transition-shadow hover:shadow-[var(--shadow-glow)]"
            >
              <div className="font-display text-4xl font-bold text-gradient md:text-5xl">
                {s.decimals ? <DecimalCounter to={s.value} suffix={s.suffix} /> : <Counter to={s.value} suffix={s.suffix} />}
              </div>
              <div className="mt-2 text-sm uppercase tracking-wider text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DecimalCounter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => v.toFixed(1) + suffix);
  useEffect(() => { if (inView) animate(mv, to, { duration: 2, ease: "easeOut" }); }, [inView, mv, to]);
  return <motion.span ref={ref}>{rounded}</motion.span>;
}
