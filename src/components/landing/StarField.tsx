import { useEffect, useRef } from "react";

/** Animated starfield with drifting glow orbs. Lightweight canvas. */
export function StarField({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = (canvas.width = canvas.offsetWidth * devicePixelRatio);
    let h = (canvas.height = canvas.offsetHeight * devicePixelRatio);

    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.2,
      a: Math.random() * 0.8 + 0.2,
      s: Math.random() * 0.05 + 0.01,
      twinkle: Math.random() * Math.PI * 2,
    }));

    const onResize = () => {
      w = canvas.width = canvas.offsetWidth * devicePixelRatio;
      h = canvas.height = canvas.offsetHeight * devicePixelRatio;
    };
    window.addEventListener("resize", onResize);

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.y += s.s * devicePixelRatio;
        s.twinkle += 0.03;
        if (s.y > h) s.y = 0;
        const alpha = s.a * (0.6 + Math.sin(s.twinkle) * 0.4);
        ctx.beginPath();
        ctx.fillStyle = `rgba(200,235,255,${alpha})`;
        ctx.arc(s.x, s.y, s.r * devicePixelRatio, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <canvas ref={ref} className="absolute inset-0 h-full w-full" />
      {/* Drifting orbs */}
      <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-primary/20 blur-3xl [animation:float_12s_ease-in-out_infinite]" />
      <div className="absolute right-0 top-1/2 h-[28rem] w-[28rem] rounded-full bg-secondary/25 blur-3xl [animation:float_14s_ease-in-out_infinite_-3s]" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-accent/15 blur-3xl [animation:float_18s_ease-in-out_infinite_-6s]" />
    </div>
  );
}
