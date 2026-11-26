import { useEffect, useState } from 'react';

interface StudioPreloaderProps {
  ready: boolean;
  reducedMotion?: boolean;
}

export default function StudioPreloader({ ready, reducedMotion = false }: StudioPreloaderProps) {
  const [exiting, setExiting] = useState(false);
  const [unmounted, setUnmounted] = useState(false);

  useEffect(() => {
    if (!ready) return;

    if (reducedMotion) {
      setUnmounted(true);
      return;
    }

    setExiting(true);
    const timer = window.setTimeout(() => {
      setUnmounted(true);
    }, 320);

    return () => window.clearTimeout(timer);
  }, [ready, reducedMotion]);

  if (unmounted) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading WebFlow Creative Studio"
      className={`fixed inset-0 z-[70] bg-[#F5F7FF] dark:bg-[#080B1A] transition-opacity duration-300 ${
        exiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top shimmer accent matching ScrollProgressBar */}
      <div className="h-[3px] w-full bg-slate-200/50 dark:bg-white/5 overflow-hidden">
        <div className="h-full w-1/2 bg-gradient-to-r from-[#397BFF] via-[#8555FF] to-[#397BFF] animate-pulse" />
      </div>

      {/* Navbar Skeleton matching h-16 / max-w-[1200px] */}
      <div className="border-b border-slate-200/70 dark:border-white/8">
        <div className="mx-auto max-w-[1200px] h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="h-5 w-44 rounded-md bg-slate-200/80 dark:bg-[#10152B] animate-pulse" />
          <div className="hidden md:flex items-center gap-6">
            <div className="h-3.5 w-14 rounded bg-slate-200/70 dark:bg-[#10152B] animate-pulse" />
            <div className="h-3.5 w-16 rounded bg-slate-200/70 dark:bg-[#10152B] animate-pulse" />
            <div className="h-3.5 w-14 rounded bg-slate-200/70 dark:bg-[#10152B] animate-pulse" />
            <div className="h-3.5 w-12 rounded bg-slate-200/70 dark:bg-[#10152B] animate-pulse" />
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-slate-200/80 dark:bg-[#10152B] animate-pulse" />
            <div className="hidden sm:block h-9 w-28 rounded-lg bg-[#397BFF]/25 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Hero Skeleton matching exact Hero proportions to prevent CLS */}
      <div className="mx-auto max-w-[1200px] min-h-[calc(100svh-4.5rem)] px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 w-full items-center py-12">
          <div className="lg:col-span-7 space-y-6">
            <div className="h-3.5 w-52 rounded bg-[#397BFF]/25 animate-pulse" />
            <div className="space-y-3">
              <div className="h-11 sm:h-14 w-full max-w-lg rounded-xl bg-slate-200/80 dark:bg-[#10152B] animate-pulse" />
              <div className="h-11 sm:h-14 w-4/5 max-w-md rounded-xl bg-slate-200/70 dark:bg-[#10152B] animate-pulse" />
            </div>
            <div className="space-y-2.5 max-w-xl pt-1">
              <div className="h-4 w-full rounded bg-slate-200/60 dark:bg-white/6 animate-pulse" />
              <div className="h-4 w-5/6 rounded bg-slate-200/60 dark:bg-white/6 animate-pulse" />
            </div>
            <div className="h-3.5 w-48 rounded bg-slate-200/60 dark:bg-white/6 animate-pulse" />
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="h-11 w-40 rounded-xl bg-[#397BFF]/30 animate-pulse" />
              <div className="h-11 w-44 rounded-xl bg-slate-200/70 dark:bg-[#10152B] border border-slate-300/60 dark:border-white/10 animate-pulse" />
            </div>
          </div>

          <div className="hidden lg:flex lg:col-span-5 items-center justify-center">
            <div
              className="w-72 h-72 rounded-full border border-[#397BFF]/20 flex items-center justify-center animate-pulse"
              style={{
                background:
                  'radial-gradient(circle, rgba(57, 123, 255, 0.16), rgba(133, 85, 255, 0.08) 55%, transparent 72%)',
              }}
            >
              <div className="w-36 h-36 rounded-2xl rotate-12 border border-[#8555FF]/30 bg-slate-200/40 dark:bg-[#10152B]/70" />
            </div>
          </div>
        </div>
      </div>

      <span className="sr-only">Initializing WebFlow Creative Studio portfolio...</span>
    </div>
  );
}
