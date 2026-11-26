interface SectionSkeletonProps {
  compact?: boolean;
}

export function HeroSceneSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 bg-[#EEF3FF] dark:bg-[#080B1A]"
      style={{
        backgroundImage:
          'radial-gradient(circle at 72% 45%, rgba(57, 123, 255, 0.2), rgba(133, 85, 255, 0.1) 34%, transparent 66%)',
      }}
    />
  );
}

export default function SectionSkeleton({ compact = false }: SectionSkeletonProps) {
  return (
    <section
      aria-hidden="true"
      className={`${compact ? 'py-16 sm:py-20' : 'py-24 sm:py-28'} px-4 sm:px-6 lg:px-8`}
    >
      <div className="mx-auto max-w-[1200px] space-y-10">
        <div className="space-y-3 max-w-xl">
          <div className="h-3.5 w-32 rounded bg-[#397BFF]/20 animate-pulse" />
          <div className="h-9 w-3/4 rounded-lg bg-slate-200/80 dark:bg-[#10152B] animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-52 rounded-2xl border border-slate-200/80 dark:border-white/8 bg-slate-100/70 dark:bg-[#10152B]/60 animate-pulse" />
          <div className="h-52 rounded-2xl border border-slate-200/80 dark:border-white/8 bg-slate-100/70 dark:bg-[#10152B]/60 animate-pulse" />
        </div>
      </div>
    </section>
  );
}
