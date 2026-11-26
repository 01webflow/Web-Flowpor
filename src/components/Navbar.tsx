import { useState, useEffect } from 'react';
import { Menu, Moon, Search, Sun, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Work', href: '#work' },
  { label: 'Journal', href: '#journal' },
  { label: 'FAQ', href: '#faq' },
];

interface NavbarProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenSearch: () => void;
}

export default function Navbar({ theme, onToggleTheme, onOpenSearch }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-200 ${
        scrolled
          ? 'bg-white/92 dark:bg-[#080B1A]/95 border-b border-slate-200/80 dark:border-white/10 backdrop-blur-md'
          : 'bg-white/75 dark:bg-[#080B1A]/75 border-b border-slate-200/50 dark:border-white/5 backdrop-blur-sm'
      }`}
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#hero"
          className="font-display text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-[#F5F7FF] hover:text-[#397BFF] transition-colors whitespace-nowrap shrink-0"
        >
          WebFlow Creative Studio
        </a>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav aria-label="Primary Navigation" className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 dark:text-[#A2A9C3] hover:text-slate-900 dark:hover:text-[#F5F7FF] transition-colors relative py-1 whitespace-nowrap shrink-0 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-px after:bg-[#397BFF] hover:after:w-full after:transition-all after:duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Search trigger + Theme toggle + Primary CTA + Mobile menu trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search portfolio (Ctrl+K)"
            title="Search portfolio (Ctrl+K)"
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 dark:border-white/15 bg-slate-100/80 dark:bg-[#10152B] text-slate-700 dark:text-[#A2A9C3] hover:text-slate-900 dark:hover:text-[#F5F7FF] hover:border-[#397BFF]/60 transition-colors shrink-0"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 dark:border-white/15 bg-slate-100/80 dark:bg-[#10152B] text-slate-700 dark:text-[#F5F7FF] hover:border-[#397BFF]/60 transition-colors shrink-0"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#397BFF]" />
            ) : (
              <Moon className="w-4 h-4 text-[#8555FF]" />
            )}
          </button>

          <a
            href="#contact"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#397BFF] hover:bg-[#2B66E0] rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
          >
            Start a Project
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation-drawer"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-slate-200 dark:border-white/15 bg-slate-100/80 dark:bg-[#10152B] text-slate-900 dark:text-[#F5F7FF] hover:border-[#397BFF]/60 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      {mobileOpen && (
        <nav
          id="mobile-navigation-drawer"
          aria-label="Mobile Navigation"
          className="md:hidden bg-white dark:bg-[#080B1A] border-t border-slate-200 dark:border-white/10 px-4 py-4 space-y-1"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center min-h-[44px] px-3 rounded-lg text-base font-medium text-slate-900 dark:text-[#F5F7FF] hover:bg-slate-100 dark:hover:bg-[#10152B] transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setMobileOpen(false)}
            className="flex items-center min-h-[44px] px-3 rounded-lg text-base font-medium text-slate-900 dark:text-[#F5F7FF] hover:bg-slate-100 dark:hover:bg-[#10152B] transition-colors"
          >
            Contact
          </a>
          <div className="pt-2">
            <a
              href="#contact"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center min-h-[44px] w-full px-4 py-2.5 rounded-lg bg-[#397BFF] hover:bg-[#2B66E0] text-sm font-medium text-white transition-colors"
            >
              Start a Project
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
