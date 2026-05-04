import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "snapnative — Vibe code React Native & web apps with AI" },
      {
        name: "description",
        content:
          "Open-source AI playground that builds Expo / React Native and web apps from a single prompt. Powered by Gemini, Monaco, and Expo Snack.",
      },
      { property: "og:title", content: "snapnative — AI vibe coding for native apps" },
      { property: "og:description", content: "Prompt → React Native app. Live preview on web and device." },
    ],
  }),
  component: Landing,
});

const features = [
  {
    title: "Prompt to Native",
    desc: "Describe your screen. Get production-ready Expo + React Native code in seconds.",
    glow: "glow-lime",
    icon: "⚡",
  },
  {
    title: "Live on device",
    desc: "Preview in the browser, or scan a QR with Expo Go to run on your real phone.",
    glow: "glow-cyan",
    icon: "📱",
  },
  {
    title: "Edit in Monaco",
    desc: "Tweak the generated code in a real VS Code editor. Iterate with the AI side-by-side.",
    glow: "glow-magenta",
    icon: "✦",
  },
  {
    title: "Bring your own key",
    desc: "Use Gemini's free tier with your own key. Your code never leaves your browser.",
    glow: "glow-lime",
    icon: "🔑",
  },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div
          className="absolute inset-0"
          style={{ backgroundImage: "var(--gradient-hero)" }}
        />
        <div className="relative mx-auto max-w-6xl px-6 pt-24 pb-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Open-source · powered by Gemini & Expo
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl lg:text-8xl"
          >
            Vibe code your
            <br />
            <span className="text-gradient">mobile app</span> in seconds
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            Type an idea. Get a working React Native + Expo app — editable in Monaco,
            previewable on web and your real phone. 100% open-source.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              to="/playground"
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition hover:scale-[1.03] glow-lime"
            >
              Start building free
              <span className="transition group-hover:translate-x-1">→</span>
            </Link>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-8 py-4 text-base font-semibold text-foreground backdrop-blur transition hover:bg-card"
            >
              See how it works
            </a>
          </motion.div>

          {/* Demo prompt mock */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative mx-auto mt-20 max-w-3xl"
          >
            <div className="neon-border rounded-2xl bg-card/80 p-4 text-left backdrop-blur shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <span className="h-3 w-3 rounded-full bg-destructive/70" />
                <span className="h-3 w-3 rounded-full bg-[var(--neon-lime)]/70" />
                <span className="h-3 w-3 rounded-full bg-[var(--neon-cyan)]/70" />
                <span className="ml-3 font-mono text-xs text-muted-foreground">
                  prompt → app
                </span>
              </div>
              <div className="px-2 py-6 font-mono text-sm md:text-base">
                <span className="text-[var(--neon-cyan)]">›</span>{" "}
                <span className="text-foreground">build me a </span>
                <span className="text-[var(--neon-lime)]">meditation timer</span>
                <span className="text-foreground"> with ambient gradient backgrounds and haptic feedback</span>
                <span className="ml-1 inline-block h-4 w-2 -mb-0.5 animate-pulse bg-primary" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <h2 className="font-display text-4xl font-bold md:text-5xl">
              Everything you need to <span className="text-gradient">ship</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              No more boilerplate. No more setup. Just describe and deploy.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group relative rounded-2xl border border-border bg-card/60 p-6 backdrop-blur transition hover:bg-card"
              >
                <div
                  className={`mb-4 grid h-12 w-12 place-items-center rounded-xl bg-background text-2xl ${f.glow} transition group-hover:scale-110`}
                >
                  {f.icon}
                </div>
                <h3 className="font-display text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="relative py-28">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-16 text-center">
            <h2 className="font-display text-4xl font-bold md:text-5xl">
              From <span className="text-gradient">idea</span> to app — fast
            </h2>
          </div>

          <div className="grid gap-12 md:grid-cols-3">
            {[
              { n: "01", t: "Describe it", d: "Type one sentence. The AI writes complete Expo code." },
              { n: "02", t: "Tweak it", d: "Edit in Monaco with full TypeScript intelligence." },
              { n: "03", t: "Preview it", d: "Run on web instantly, or scan QR for a real device." },
            ].map((s) => (
              <div key={s.n} className="relative">
                <div className="font-mono text-6xl font-bold text-gradient">{s.n}</div>
                <h3 className="mt-4 font-display text-xl font-bold">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <Link
              to="/playground"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-semibold text-primary-foreground transition hover:scale-[1.03] glow-lime"
            >
              Open the studio →
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-10 text-center text-sm text-muted-foreground">
        Open source · built with Lovable · powered by Gemini & Expo
      </footer>
    </div>
  );
}
