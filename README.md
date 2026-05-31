# NEXUS — AI Agent Orchestration Workspace

> Build, deploy and monitor AI agent pipelines visually. The operating system for autonomous workflows.

agent-fabric-ai.vercel.app

## What is NEXUS?

NEXUS is a full-stack AI agent workspace where you can visually design multi-agent pipelines, run real AI agents powered by Llama 3, monitor live logs, and save everything to a cloud database — all for free.

Built as an open-source showcase of what modern AI tooling looks like when you combine the best free-tier services available in 2026.

## Why we built this

Most AI agent platforms are either too expensive, too complex, or closed source. NEXUS is our answer — a beautiful, functional, fully open workspace that anyone can clone, run, and extend. We wanted to prove you can build production-quality AI tooling without spending a single rupee.

## Live Demo

🚀 agent-fabric-ai.vercel.app

## Features

- 🧠 **Visual Pipeline Builder** — drag and drop AI agent nodes onto a React Flow canvas, connect them into workflows, and save pipelines to the cloud
- ⚡ **Real AI Agents** — run agents powered by Llama 3 70B via Groq's free API with typewriter-style terminal output
- 📊 **Live Dashboard** — real-time metrics, pipeline activity charts, agent status breakdown, and a live activity feed
- 🗄️ **Cloud Database** — all pipelines, agents, and logs stored in Supabase PostgreSQL
- 📋 **Logs & Monitor** — color-coded live log terminal with INFO / WARN / ERROR / DEBUG filtering
- 🎨 **Stunning UI** — space-age futuristic design with Framer Motion animations, scroll reveals, and micro-interactions
- 📱 **Fully Responsive** — desktop, tablet, and mobile layouts

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend Framework | React 19 + TypeScript | Type-safe, modern React |
| Routing | TanStack Router | File-based routing with full type safety |
| Styling | Tailwind CSS v4 | Utility-first, fast iteration |
| Animations | Framer Motion | Production-grade motion library |
| UI Components | shadcn/ui + Radix UI | Accessible, headless components |
| Pipeline Canvas | React Flow | Node-based graph editor |
| Charts | Recharts | Composable chart library |
| Icons | Lucide React | Clean, consistent icon set |
| AI Model | Llama 3 70B via Groq | Free, blazing fast inference |
| Database | Supabase (PostgreSQL) | Free tier, instant APIs, real-time |
| Build Tool | Vite 7 | Lightning fast HMR and builds |
| Package Manager | Bun | Faster than npm/yarn |
| Deployment | Vercel | Free hosting with auto-deploy from GitHub |

## Project Structure## Database Schema

Three tables in Supabase PostgreSQL:

**pipelines** — stores visual pipeline definitions
- id, name, status, nodes (JSON), edges (JSON), created_at

**agents** — the agent roster
- id, name, type, description, success_rate, last_run, created_at

**logs** — execution logs from agent runs
- id, level, message, agent_name, pipeline_id, created_at

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- A free [Supabase](https://supabase.com) account
- A free [Groq](https://console.groq.com) API key

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/nexus-agent-workspace.git
cd nexus-agent-workspace

# Install dependencies
bun install
# or: npm install

# Set up environment variables
cp .env.example .env
# Fill in your keys in .env

# Run the dev server
bun dev
# or: npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to see NEXUS running locally.

### Supabase Setup

Run this SQL in your Supabase SQL Editor to create the required tables:

```sql
create table pipelines (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  status text default 'idle',
  nodes jsonb default '[]',
  edges jsonb default '[]',
  created_at timestamp default now()
);

create table agents (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  type text,
  description text,
  success_rate integer default 95,
  last_run text,
  created_at timestamp default now()
);

create table logs (
  id uuid default gen_random_uuid() primary key,
  level text default 'INFO',
  message text,
  agent_name text,
  pipeline_id uuid references pipelines(id),
  created_at timestamp default now()
);

alter table pipelines enable row level security;
alter table agents enable row level security;
alter table logs enable row level security;

create policy "public read pipelines" on pipelines for select using (true);
create policy "public insert pipelines" on pipelines for insert with check (true);
create policy "public update pipelines" on pipelines for update using (true);
create policy "public read agents" on agents for select using (true);
create policy "public read logs" on logs for select using (true);
create policy "public insert logs" on logs for insert with check (true);
```

## Deploying to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repo
3. Add these environment variables in Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GROQ_API_KEY`
4. Click Deploy — done!

Every push to `main` auto-redeploys.

## Contributing

PRs are welcome! If you find a bug or want to add a feature:

1. Fork the repo
2. Create a branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push and open a PR

## License

MIT — free to use, fork, and build on.

---

Built with ❤️ using entirely free tools. Proof that great software doesn't have to cost anything.---
