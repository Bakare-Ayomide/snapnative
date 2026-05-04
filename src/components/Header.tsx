import { Link } from "@tanstack/react-router";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 font-display">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground font-bold glow-lime">
            ◆
          </span>
          <span className="text-lg font-bold tracking-tight">
            snap<span className="text-gradient">native</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground transition">Features</a>
          <a href="#how" className="hover:text-foreground transition">How it works</a>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition">GitHub</a>
        </nav>
        <Link
          to="/playground"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:scale-[1.03] glow-lime"
        >
          Open Studio →
        </Link>
      </div>
    </header>
  );
}
