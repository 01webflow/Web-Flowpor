import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { FAQS, type FaqItem } from '../data/studioData';

type FaqFilter = 'All' | FaqItem['category'];

export default function FaqSection() {
  const prefersReducedMotion = useReducedMotion();
  const [filter, setFilter] = useState<FaqFilter>('All');
  const [openId, setOpenId] = useState<string>(FAQS[0].id);

  const visibleFaqs =
    filter === 'All' ? FAQS : FAQS.filter((item) => item.category === filter);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? '' : id));
  };

  return (
    <section id="faq" className="py-24 sm:py-28 px-4 sm:px-6 lg:px-8 relative">
      <div className="mx-auto max-w-[1200px] space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <p className="font-mono-tabular text-xs tracking-wider text-[#397BFF]">
              09 · Frequently Asked Questions
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-[#F5F7FF] text-balance">
              Clarity on Process, Pricing &amp; Timelines
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-[#A2A9C3]">
              Straightforward answers on how studio engagements are structured, scoped, and delivered.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Filter FAQ topics"
            className="inline-flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white/80 dark:bg-[#10152B] border border-slate-200 dark:border-white/10 self-start"
          >
            {(['All', 'Process', 'Pricing', 'Timelines'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={filter === tab}
                onClick={() => {
                  setFilter(tab);
                  const firstMatch =
                    tab === 'All' ? FAQS[0] : FAQS.find((item) => item.category === tab);
                  if (firstMatch) setOpenId(firstMatch.id);
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  filter === tab
                    ? 'bg-[#397BFF] text-white'
                    : 'text-slate-600 dark:text-[#A2A9C3] hover:text-slate-900 dark:hover:text-[#F5F7FF]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {visibleFaqs.map((item, idx) => {
            const isOpen = openId === item.id;
            const panelId = `faq-panel-${item.id}`;
            const buttonId = `faq-trigger-${item.id}`;

            return (
              <div
                key={item.id}
                className={`studio-panel rounded-2xl overflow-hidden transition-colors ${
                  isOpen ? 'border-[#397BFF]/50' : ''
                }`}
              >
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleItem(item.id)}
                    className="w-full px-6 sm:px-7 py-5 sm:py-6 flex items-center justify-between gap-4 text-left min-h-[60px]"
                  >
                    <div className="space-y-1 pr-2">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A2A9C3]">
                        <span className="font-mono-tabular text-[#397BFF]">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{item.category}</span>
                      </div>
                      <span className="block font-display text-base sm:text-lg font-semibold text-slate-900 dark:text-[#F5F7FF]">
                        {item.question}
                      </span>
                    </div>

                    <span
                      className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 transition-transform duration-200 ${
                        isOpen
                          ? 'rotate-180 bg-[#397BFF]/15 border-[#397BFF]/45 text-[#397BFF]'
                          : 'border-slate-200 dark:border-white/12 text-slate-500 dark:text-[#A2A9C3]'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
                      animate={
                        prefersReducedMotion ? { opacity: 1 } : { opacity: 1, height: 'auto' }
                      }
                      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 sm:px-7 pb-6 pt-1 border-t border-slate-200/80 dark:border-white/10">
                        <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-[#A2A9C3] max-w-4xl pt-3">
                          {item.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
