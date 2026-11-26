import { useEffect } from 'react';
import { X, ArrowUpRight, Layers, Film } from 'lucide-react';
import type { ProjectItem } from '../data/studioData';

interface ProjectModalProps {
  project: ProjectItem | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  useEffect(() => {
    if (!project) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 dark:bg-[#080B1A]/90 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-white/12 bg-white dark:bg-[#10152B] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 px-6 py-5 bg-white/95 dark:bg-[#10152B]/95 border-b border-slate-200 dark:border-white/10">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-[#A2A9C3] mb-1.5">
              <span className="font-mono-tabular text-[#397BFF]">{project.index}</span>
              <span aria-hidden="true">·</span>
              <span>{project.category}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-900 dark:text-[#F5F7FF]">{project.status}</span>
            </div>
            <h3
              id="project-modal-title"
              className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#F5F7FF]"
            >
              {project.title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close project details"
            className="inline-flex items-center justify-center w-11 h-11 rounded-lg border border-slate-200 dark:border-white/15 bg-slate-100 dark:bg-[#080B1A] text-slate-900 dark:text-[#F5F7FF] hover:border-[#397BFF] transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Aspect-Locked High-Res Preview */}
          <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#080B1A]">
            <img
              src={project.image}
              alt={project.imageAlt}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Overview & Creative Direction */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <h4 className="font-display text-lg font-semibold text-slate-900 dark:text-[#F5F7FF]">
                Creative Direction
              </h4>
              <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-[#A2A9C3]">
                {project.creativeDirection}
              </p>

              <div className="pt-2">
                <h5 className="text-xs font-medium tracking-wide text-slate-900 dark:text-[#F5F7FF] mb-3">
                  Key Focus Areas
                </h5>
                <ul className="space-y-2">
                  {project.highlights.map((item) => (
                    <li
                      key={item}
                      className="text-sm text-slate-600 dark:text-[#A2A9C3] flex items-start gap-2.5"
                    >
                      <span
                        className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#397BFF] shrink-0"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-5 border-t md:border-t-0 md:border-l border-slate-200 dark:border-white/10 pt-5 md:pt-0 md:pl-6">
              <div>
                <p className="text-xs text-slate-500 dark:text-[#A2A9C3] mb-1">Project Status</p>
                <p className="text-sm font-medium text-slate-900 dark:text-[#F5F7FF]">
                  {project.status}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-[#A2A9C3] mb-1">Tools &amp; Stack</p>
                <p className="text-sm font-medium text-slate-900 dark:text-[#F5F7FF]">
                  {project.tools}
                </p>
              </div>

              {project.liveUrl && (
                <div className="pt-2">
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-[#397BFF] hover:bg-[#2B66E0] text-sm font-medium text-white transition-colors whitespace-nowrap"
                  >
                    <span>Open Live Interface</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              )}

              <div className="pt-1">
                <a
                  href="#contact"
                  onClick={onClose}
                  className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-white/15 hover:border-[#397BFF]/60 text-sm font-medium text-slate-900 dark:text-[#F5F7FF] transition-colors whitespace-nowrap"
                >
                  Discuss a Similar Concept
                </a>
              </div>
            </div>
          </div>

          {/* Optional Brand Color System Swatches (Naya Botanics Identity) */}
          {project.paletteSwatches && (
            <div className="pt-6 border-t border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4 text-[#8555FF]" />
                <h4 className="font-display text-base font-semibold text-slate-900 dark:text-[#F5F7FF]">
                  Brand Color Direction
                </h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {project.paletteSwatches.map((swatch) => (
                  <div
                    key={swatch.hex}
                    className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#080B1A] p-3 space-y-2.5"
                  >
                    <div
                      className="h-12 w-full rounded-lg border border-slate-200 dark:border-white/10"
                      style={{ backgroundColor: swatch.hex }}
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-[#F5F7FF]">
                        {swatch.name}
                      </p>
                      <p className="font-mono-tabular text-xs text-slate-500 dark:text-[#A2A9C3]">
                        {swatch.hex}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optional AI UGC Storyboard Breakdown (ThinkPad T14) */}
          {project.storyboard && (
            <div className="pt-6 border-t border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-[#397BFF]" />
                  <h4 className="font-display text-base font-semibold text-slate-900 dark:text-[#F5F7FF]">
                    9:16 Reels / TikTok Production Storyboard
                  </h4>
                </div>
                <span className="text-xs text-slate-500 dark:text-[#A2A9C3]">
                  Concept Preview · In Development
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.storyboard.map((frame) => (
                  <div
                    key={frame.shot}
                    className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#080B1A] p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#397BFF]">{frame.shot}</span>
                      <span className="font-mono-tabular text-slate-500 dark:text-[#A2A9C3]">
                        {frame.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-slate-900 dark:text-[#F5F7FF] leading-relaxed">
                      {frame.visualDirection}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-[#A2A9C3] italic">
                      Audio: {frame.audioCue}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
