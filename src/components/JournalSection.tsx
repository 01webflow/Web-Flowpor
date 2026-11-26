import { useEffect } from 'react';
import { ArrowUpRight, BookOpen, X } from 'lucide-react';
import { JOURNAL_POSTS, type JournalPost } from '../data/studioData';

interface JournalSectionProps {
  selectedPost: JournalPost | null;
  onSelectPost: (post: JournalPost | null) => void;
}

export default function JournalSection({ selectedPost, onSelectPost }: JournalSectionProps) {
  useEffect(() => {
    if (!selectedPost) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSelectPost(null);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [selectedPost, onSelectPost]);

  return (
    <section id="journal" className="py-24 sm:py-28 px-4 sm:px-6 lg:px-8 relative">
      <div className="mx-auto max-w-[1200px] space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <p className="font-mono-tabular text-xs tracking-wider text-[#397BFF]">
              08 · Studio Journal
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-[#F5F7FF] text-balance">
              Notes on Design, AI Workflows &amp; Creative Direction
            </h2>
          </div>
          <p className="text-sm sm:text-base text-slate-600 dark:text-[#A2A9C3] max-w-md">
            Practical studio essays exploring how visual craft and modern AI tools work together.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {JOURNAL_POSTS.map((post) => (
            <article
              key={post.id}
              className="studio-panel rounded-2xl p-6 sm:p-7 flex flex-col justify-between gap-6 group"
            >
              <div className="space-y-3.5">
                {/* Unboxed metadata row */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-[#A2A9C3]">
                  <span className="font-mono-tabular text-[#397BFF]">{post.index}</span>
                  <span aria-hidden="true">·</span>
                  <span>{post.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{post.readTime}</span>
                </div>

                <h3 className="font-display text-xl font-bold leading-snug text-slate-900 dark:text-[#F5F7FF] group-hover:text-[#397BFF] transition-colors">
                  {post.title}
                </h3>

                <p className="text-sm text-slate-600 dark:text-[#A2A9C3] leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-4">
                <span className="text-xs text-slate-500 dark:text-[#A2A9C3]">{post.date}</span>
                <button
                  type="button"
                  onClick={() => onSelectPost(post)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#397BFF] hover:text-[#8555FF] transition-colors whitespace-nowrap min-h-[36px]"
                >
                  <span>Read Note</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Journal Article Reader Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 dark:bg-[#080B1A]/90 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="journal-modal-title"
          onClick={() => onSelectPost(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-white/12 bg-white dark:bg-[#10152B] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 px-6 py-5 bg-white/95 dark:bg-[#10152B]/95 border-b border-slate-200 dark:border-white/10">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-[#A2A9C3] mb-1.5">
                  <span className="font-mono-tabular text-[#397BFF]">{selectedPost.index}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedPost.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedPost.date}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedPost.readTime}</span>
                </div>
                <h3
                  id="journal-modal-title"
                  className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F5F7FF]"
                >
                  {selectedPost.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => onSelectPost(null)}
                aria-label="Close journal article"
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 dark:border-white/15 bg-slate-100 dark:bg-[#080B1A] text-slate-900 dark:text-[#F5F7FF] hover:border-[#397BFF] transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <p className="text-base leading-relaxed text-slate-700 dark:text-[#F5F7FF]/90 font-medium">
                {selectedPost.excerpt}
              </p>

              <div className="space-y-6 pt-2 border-t border-slate-200 dark:border-white/10">
                {selectedPost.sections.map((sec) => (
                  <div key={sec.heading} className="space-y-2">
                    <h4 className="font-display text-lg font-bold text-slate-900 dark:text-[#F5F7FF]">
                      {sec.heading}
                    </h4>
                    <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-[#A2A9C3]">
                      {sec.body}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-5 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#A2A9C3]">
                  <BookOpen className="w-4 h-4 text-[#397BFF]" />
                  <span>{selectedPost.tags.join(' · ')}</span>
                </div>
                <a
                  href="#contact"
                  onClick={() => onSelectPost(null)}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#397BFF] hover:bg-[#2B66E0] text-xs font-semibold text-white transition-colors whitespace-nowrap"
                >
                  Discuss This Topic
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
