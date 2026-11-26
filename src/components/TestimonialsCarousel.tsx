import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronLeft, ChevronRight, Pause, Play, Quote } from 'lucide-react';
import { TESTIMONIALS } from '../data/studioData';

export default function TestimonialsCarousel() {
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isPaused, setIsPaused] = useState(false);

  const total = TESTIMONIALS.length;

  const goTo = useCallback(
    (nextIndex: number, dir: 1 | -1) => {
      setDirection(dir);
      setActiveIndex(((nextIndex % total) + total) % total);
    },
    [total]
  );

  const handleNext = useCallback(() => {
    goTo(activeIndex + 1, 1);
  }, [activeIndex, goTo]);

  const handlePrev = useCallback(() => {
    goTo(activeIndex - 1, -1);
  }, [activeIndex, goTo]);

  useEffect(() => {
    if (prefersReducedMotion || isPaused) return;
    const timer = window.setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev + 1) % total);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [prefersReducedMotion, isPaused, total]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    }
  };

  const current = TESTIMONIALS[activeIndex];

  return (
    <section
      id="testimonials"
      aria-label="Client Testimonials"
      className="py-24 sm:py-28 px-4 sm:px-6 lg:px-8 relative"
    >
      <div className="mx-auto max-w-[1200px] space-y-12">
        {/* Section Heading & Controls Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <p className="font-mono-tabular text-xs tracking-wider text-[#397BFF]">
              07 · Client Feedback
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-[#F5F7FF] text-balance">
              Perspectives From Recent Collaborations
            </h2>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setIsPaused((prev) => !prev)}
              aria-label={isPaused ? 'Resume testimonial rotation' : 'Pause testimonial rotation'}
              className="inline-flex items-center justify-center w-11 h-11 rounded-xl border border-slate-200 dark:border-white/12 bg-white/80 dark:bg-[#10152B]/80 text-slate-600 dark:text-[#A2A9C3] hover:text-slate-900 dark:hover:text-[#F5F7FF] hover:border-[#397BFF]/50 transition-colors"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous testimonial"
              className="inline-flex items-center justify-center w-11 h-11 rounded-xl border border-slate-200 dark:border-white/12 bg-white/80 dark:bg-[#10152B]/80 text-slate-900 dark:text-[#F5F7FF] hover:border-[#397BFF]/60 hover:bg-[#397BFF]/15 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next testimonial"
              className="inline-flex items-center justify-center w-11 h-11 rounded-xl border border-slate-200 dark:border-white/12 bg-white/80 dark:bg-[#10152B]/80 text-slate-900 dark:text-[#F5F7FF] hover:border-[#397BFF]/60 hover:bg-[#397BFF]/15 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Glassmorphism Carousel Frame */}
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Client feedback carousel"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="studio-panel relative rounded-2xl overflow-hidden focus-visible:outline-2 focus-visible:outline-[#397BFF]"
        >
          <div
            aria-hidden="true"
            className="h-px w-full bg-gradient-to-r from-transparent via-[#397BFF]/65 to-[#8555FF]/65"
          />

          <div className="p-7 sm:p-10 lg:p-12 min-h-[300px] sm:min-h-[280px] flex flex-col justify-between gap-8">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current.id}
                custom={direction}
                initial={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, x: direction * 24 }
                }
                animate={{ opacity: 1, x: 0 }}
                exit={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, x: direction * -24 }
                }
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                aria-live="polite"
                className="space-y-8"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#397BFF]/20 to-[#8555FF]/20 border border-[#397BFF]/30 flex items-center justify-center text-[#397BFF]">
                    <Quote className="w-5 h-5" />
                  </div>

                  <span className="font-mono-tabular text-xs text-slate-500 dark:text-[#A2A9C3]">
                    {String(activeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                  </span>
                </div>

                <blockquote className="font-display text-xl sm:text-2xl lg:text-[1.65rem] font-medium leading-[1.45] text-slate-900 dark:text-[#F5F7FF] max-w-4xl">
                  &ldquo;{current.quote}&rdquo;
                </blockquote>

                <div className="pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-display text-base font-bold text-slate-900 dark:text-[#F5F7FF]">
                      {current.author}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-[#A2A9C3] mt-0.5">
                      <span>{current.role}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-900 dark:text-[#F5F7FF]/90">
                        {current.organization}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-[#A2A9C3]">
                    <span className="text-[#397BFF] font-medium">{current.engagement}</span>
                    <span aria-hidden="true">·</span>
                    <span>{current.outcome}</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Interactive Slide Selector Bar */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          role="tablist"
          aria-label="Select testimonial"
        >
          {TESTIMONIALS.map((item, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => goTo(idx, idx >= activeIndex ? 1 : -1)}
                className={`text-left p-3.5 rounded-xl border transition-all duration-200 ${
                  isActive
                    ? 'bg-white dark:bg-[#10152B] border-[#397BFF]/60 shadow-[0_8px_24px_-12px_rgba(57,123,255,0.45)]'
                    : 'bg-white/60 dark:bg-[#080B1A]/60 border-slate-200 dark:border-white/8 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span
                    className={`font-mono-tabular text-xs ${
                      isActive ? 'text-[#397BFF]' : 'text-slate-500 dark:text-[#A2A9C3]'
                    }`}
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`h-1 w-8 rounded-full transition-colors ${
                      isActive
                        ? 'bg-gradient-to-r from-[#397BFF] to-[#8555FF]'
                        : 'bg-slate-200 dark:bg-white/10'
                    }`}
                  />
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-[#F5F7FF] truncate">
                  {item.author}
                </p>
                <p className="text-xs text-slate-600 dark:text-[#A2A9C3] truncate">
                  {item.organization}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
