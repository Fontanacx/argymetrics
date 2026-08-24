"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "../ThemeToggle";
import BrandLogo from "./BrandLogo";

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
    { href: "/#comparador", label: "Comparador" },
    { href: "/#acciones", label: "Acciones" },
    { href: "/insights", label: "Resumen" },
    { href: "/conversor", label: "Conversor" },
    { href: "/legal", label: "Legal" },
  ];

  return (
    <nav
      className="sticky top-0 z-40 border-b backdrop-blur-xl transition-colors"
      style={{
        borderColor: "var(--border-primary)",
        background: "color-mix(in srgb, var(--bg-secondary) 80%, transparent)",
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Branding */}
        <Link
          href="/"
          className="brand-nav-link group flex items-center"
          aria-label="ArgyMetrics, inicio"
        >
          <span className="brand-logo-surface hidden h-10 w-[156px] items-center px-2.5 sm:flex">
            <BrandLogo
              variant="horizontal"
              priority
              className="h-auto w-full object-contain transition-transform duration-200 group-hover:scale-[1.02]"
              sizes="156px"
            />
          </span>
          <span className="brand-logo-surface flex h-10 w-10 items-center justify-center p-1.5 sm:hidden">
            <BrandLogo
              variant="mark"
              priority
              className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
              sizes="40px"
            />
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-colors hover:text-[var(--color-accent)]"
              style={{ color: "var(--text-muted)" }}
            >
              {link.label}
            </Link>
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
            style={{ color: "var(--text-primary)", background: isMenuOpen ? "var(--bg-card-hover)" : "transparent" }}
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
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="text-sm font-medium py-2 px-2 rounded-md transition-colors hover:bg-[var(--bg-card-hover)]"
              style={{ color: "var(--text-primary)" }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
