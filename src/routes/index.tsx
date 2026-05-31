import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/landing/Hero";
import { Stats } from "@/components/landing/Stats";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { AgentShowcase } from "@/components/landing/AgentShowcase";
import { PipelineDemo } from "@/components/landing/PipelineDemo";
import { CTASection } from "@/components/landing/CTASection";
import { LandingNav, LandingFooter } from "@/components/landing/LandingNav";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NEXUS — Orchestrate Intelligence" },
      { name: "description", content: "Build, deploy and monitor AI agent pipelines visually. The operating system for autonomous workflows." },
      { property: "og:title", content: "NEXUS — Orchestrate Intelligence" },
      { property: "og:description", content: "Build, deploy and monitor AI agent pipelines visually." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="relative bg-background text-foreground">
      <LandingNav />
      <Hero />
      <Stats />
      <section id="pipeline"><HowItWorks /></section>
      <section id="features"><Features /></section>
      <section id="agents"><AgentShowcase /></section>
      <PipelineDemo />
      <CTASection />
      <LandingFooter />
    </main>
  );
}
