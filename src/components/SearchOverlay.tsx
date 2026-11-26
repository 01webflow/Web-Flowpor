import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowUpRight,
  BookOpen,
  Briefcase,
  HelpCircle,
  Layers,
  Search,
  X,
} from 'lucide-react';
import {
  FAQS,
  JOURNAL_POSTS,
  PROJECTS,
  SERVICES,
  type JournalPost,
  type ProjectItem,
} from '../data/studioData';

type SearchCategory = 'All' | 'Projects' | 'Services' | 'Journal' | 'FAQ';

interface SearchEntry {
  id: string;
  category: Exclude<SearchCategory, 'All'>;
  title: string;
  subtitle: string;
  searchText: string;
  actionType: 'project' | 'journal' | 'anchor';
  project?: ProjectItem;
  journal?: JournalPost;
  anchorHref?: string;
}

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (project: ProjectItem) => void;
  onSelectJournal: (post: JournalPost) => void;
}

export default function SearchOverlay({
  isOpen,
  onClose,
  onSelectProject,
  onSelectJournal,
}: SearchOverlayProps) {
  const prefersReducedMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<SearchCategory>('All');
  const [highlightIndex, setHighlightIndex] = useState(0);

  const allEntries: SearchEntry[] = useMemo(() => {
    const projectEntries: SearchEntry[] = PROJECTS.map((p) => ({
      id: `proj-${p.id}`,
      category: 'Projects',
      title: p.title,
      subtitle: `${p.category} · ${p.tools}`,
      searchText: `${p.title} ${p.category} ${p.description} ${p.tools} ${p.status} ${p.highlights.join(' ')}`.toLowerCase(),
      actionType: 'project',
      project: p,
    }));

    const serviceEntries: SearchEntry[] = SERVICES.map((s) => ({
      id: `srv-${s.index}`,
      category: 'Services',
      title: `${s.index}. ${s.title}`,
      subtitle: s.capabilities.slice(0, 3).join(' · '),
      searchText: `${s.title} ${s.summary} ${s.capabilities.join(' ')}`.toLowerCase(),
      actionType: 'anchor',
      anchorHref: '#services',
    }));

    const journalEntries: SearchEntry[] = JOURNAL_POSTS.map((j) => ({
      id: `jrn-${j.id}`,
      category: 'Journal',
      title: j.title,
      subtitle: `${j.category} · ${j.readTime} · ${j.date}`,
      searchText: `${j.title} ${j.category} ${j.excerpt} ${j.tags.join(' ')} ${j.sections.map((s) => `${s.heading} ${s.body}`).join(' ')}`.toLowerCase(),
      actionType: 'journal',
      journal: j,
    }));

    const faqEntries: SearchEntry[] = FAQS.map((f) => ({
      id: `faq-${f.id}`,
      category: 'FAQ',
      title: f.question,
      subtitle: `${f.category} · Studio FAQ`,
      searchText: `${f.question} ${f.answer} ${f.category}`.toLowerCase(),
      actionType: 'anchor',
      anchorHref: '#faq',
    }));

    return [...projectEntries, ...serviceEntries, ...journalEntries, ...faqEntries];
  }, []);

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    return allEntries.filter((entry) => {
      if (category !== 'All' && entry.category !== category) return false;
      if (!trimmed) return true;
      return entry.searchText.includes(trimmed);
    });
  }, [allEntries, category, query]);

  useEffect(() => {
    setHighlightIndex(0);
  }, [query, category, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 30);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  const executeEntry = (entry: SearchEntry) => {
    onClose();
    if (entry.actionType === 'project' && entry.project) {
      onSelectProject(entry.project);
    } else if (entry.actionType === 'journal' && entry.journal) {
      onSelectJournal(entry.journal);
    } else if (entry.anchorHref) {
      const target = document.querySelector(entry.anchorHref);
      target?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === 'ArrowDown' && results.length > 0) {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp' && results.length > 0) {
      e.preventDefault();
      setHighlightIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && results[highlightIndex]) {
      e.preventDefault();
      executeEntry(results[highlightIndex]);
    }
  };

  const CategoryIcon = ({ cat }: { cat: SearchEntry['category'] }) => {
    switch (cat) {
      case 'Projects':
        return <Layers className="w-4 h-4 text-[#397BFF]" />;
      case 'Services':
        return <Briefcase className="w-4 h-4 text-[#8555FF]" />;
      case 'Journal':
        return <BookOpen className="w-4 h-4 text-[#397BFF]" />;
      case 'FAQ':
        return <HelpCircle className="w-4 h-4 text-[#8555FF]" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="fixed inset-0 z-[70] flex items-start justify-center pt-16 sm:pt-24 px-4 pb-6 bg-slate-950/70 dark:bg-[#080B1A]/85 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Search WebFlow Creative Studio"
          onClick={onClose}
          onKeyDown={handleKeyDown}
        >
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-white/15 bg-white/95 dark:bg-[#10152B]/95 backdrop-blur-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Header */}
            <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-slate-200 dark:border-white/10">
              <Search className="w-5 h-5 text-[#397BFF] shrink-0" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects, services, journal notes, or FAQs..."
                aria-label="Search portfolio content"
                className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-[#F5F7FF] placeholder:text-slate-400 dark:placeholder:text-[#A2A9C3]/65 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="text-xs font-medium text-slate-500 dark:text-[#A2A9C3] hover:text-slate-900 dark:hover:text-[#F5F7FF] px-2 py-1"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close search overlay"
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 dark:border-white/12 text-slate-600 dark:text-[#A2A9C3] hover:text-slate-900 dark:hover:text-[#F5F7FF] transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Category Filter Tabs */}
            <div className="px-4 sm:px-5 py-2.5 border-b border-slate-200 dark:border-white/10 flex flex-wrap items-center gap-1.5 bg-slate-50/80 dark:bg-[#080B1A]/60">
              {(['All', 'Projects', 'Services', 'Journal', 'FAQ'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setCategory(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    category === tab
                      ? 'bg-[#397BFF] text-white'
                      : 'text-slate-600 dark:text-[#A2A9C3] hover:text-slate-900 dark:hover:text-[#F5F7FF] hover:bg-slate-200/60 dark:hover:bg-white/5'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Results List */}
            <div className="max-h-[58vh] overflow-y-auto divide-y divide-slate-200/70 dark:divide-white/8">
              {results.length > 0 ? (
                results.map((entry, idx) => {
                  const isHighlighted = idx === highlightIndex;
                  return (
                    <button
                      key={entry.id}
                      type="button"
                      onMouseEnter={() => setHighlightIndex(idx)}
                      onClick={() => executeEntry(entry)}
                      className={`w-full px-4 sm:px-5 py-3.5 flex items-center justify-between gap-4 text-left transition-colors ${
                        isHighlighted
                          ? 'bg-[#397BFF]/10 dark:bg-[#397BFF]/15'
                          : 'hover:bg-slate-100/70 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#080B1A] flex items-center justify-center shrink-0 mt-0.5">
                          <CategoryIcon cat={entry.category} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A2A9C3] mb-0.5">
                            <span className="font-medium text-[#397BFF]">{entry.category}</span>
                            <span aria-hidden="true">·</span>
                            <span className="truncate">{entry.subtitle}</span>
                          </div>
                          <p className="font-display text-sm sm:text-base font-semibold text-slate-900 dark:text-[#F5F7FF] truncate">
                            {entry.title}
                          </p>
                        </div>
                      </div>

                      <ArrowUpRight className="w-4 h-4 text-slate-400 dark:text-[#A2A9C3] shrink-0" />
                    </button>
                  );
                })
              ) : (
                <div className="px-6 py-12 text-center space-y-3">
                  <p className="font-display text-base font-semibold text-slate-900 dark:text-[#F5F7FF]">
                    No matching results for &ldquo;{query}&rdquo;
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-[#A2A9C3]">
                    Try searching for &ldquo;Naya Botanics&rdquo;, &ldquo;ThinkPad&rdquo;, &ldquo;WordPress&rdquo;, &ldquo;Pricing&rdquo;, or &ldquo;Storyboarding&rdquo;.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setCategory('All');
                    }}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-slate-300 dark:border-white/15 text-xs font-medium text-slate-800 dark:text-[#F5F7FF] hover:border-[#397BFF] transition-colors"
                  >
                    Reset Search
                  </button>
                </div>
              )}
            </div>

            {/* Footer Keyboard Hint */}
            <div className="px-4 sm:px-5 py-2.5 border-t border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#080B1A]/60 flex items-center justify-between text-xs text-slate-500 dark:text-[#A2A9C3]">
              <span>
                {results.length} {results.length === 1 ? 'result' : 'results'}
              </span>
              <span className="hidden sm:inline font-mono-tabular">
                ↑↓ Navigate · Enter Open · Esc Close
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
