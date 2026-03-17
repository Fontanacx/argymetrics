import ThemeToggle from "./ThemeToggle";

/**
 * Sticky navbar with frosted glass effect, branding, and theme toggle.
 * Clean fintech design with subtle border and backdrop blur.
 */
export default function Navbar() {
  return (
    <nav className="sticky top-0 z-40 border-b backdrop-blur-xl"
      style={{
        borderColor: "var(--border-primary)",
        background: "color-mix(in srgb, var(--bg-secondary) 80%, transparent)",
      }}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Branding */}
        <a href="/" className="group flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold"
            style={{
              background: "var(--color-accent)",
              color: "var(--text-inverted)",
            }}
          >
            A
          </div>
          <span
            className="text-base font-semibold tracking-tight transition-colors"
            style={{ color: "var(--text-primary)" }}
          >
            Argy
            <span style={{ color: "var(--color-accent)" }}>Metrics</span>
          </span>
        </a>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <a
            href="/conversor"
            className="text-sm font-medium transition-colors hover:text-[var(--color-accent)]"
            style={{ color: "var(--text-muted)" }}
          >
            Conversor
          </a>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
