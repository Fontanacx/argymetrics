"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import ThemeToggle from "../ThemeToggle";

/**
 * Sticky navbar with frosted glass effect, branding, theme toggle,
 * and responsive anchor navigation.
 */
export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "/#divisas", label: "Divisas" },
    { href: "/#billeteras", label: "Billeteras" },
    { href: "/#indicadores", label: "Indicadores" },
    { href: "/#acciones", label: "Acciones" },
    { href: "/insights", label: "Resumen" },
    { href: "/conversor", label: "Conversor" },
  ];

  return (
    <nav
      className="sticky top-0 z-40 border-b backdrop-blur-xl transition-colors"
      style={{
        borderColor: "var(--border-primary)",
        background: "color-mix(in srgb, var(--bg-secondary) 80%, transparent)",
      }}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Branding */}
        <a href="/" className="group flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold transition-transform group-hover:scale-105"
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

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-5">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-colors hover:text-[var(--color-accent)]"
              style={{ color: "var(--text-muted)" }}
            >
              {link.label}
            </a>
          ))}
          <div className="pl-2 border-l" style={{ borderColor: "var(--border-subtle)" }}>
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Nav Toggle */}
        <div className="flex md:hidden items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 rounded-md transition-colors"
            style={{ color: "var(--text-primary)", background: isMenuOpen ? "var(--bg-modifier-hover)" : "transparent" }}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div 
          className="md:hidden border-t px-4 py-3 flex flex-col gap-3 absolute w-full left-0 origin-top animate-in slide-in-from-top-2"
          style={{ 
            borderColor: "var(--border-subtle)", 
            background: "var(--bg-primary)",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
          }}
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="text-sm font-medium py-2 px-2 rounded-md transition-colors hover:bg-[var(--bg-modifier-hover)]"
              style={{ color: "var(--text-primary)" }}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
