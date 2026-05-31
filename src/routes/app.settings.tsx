import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Settings as SettingsIcon } from "lucide-react";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "NEXUS · Settings" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass mx-auto max-w-2xl rounded-2xl p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
          <SettingsIcon className="h-6 w-6" />
        </div>
        <h2 className="mt-4 font-display text-2xl font-semibold">Settings</h2>
        <p className="mt-2 text-sm text-muted-foreground">Configure your workspace, integrations and API keys here.</p>
      </motion.div>
    </div>
  );
}
