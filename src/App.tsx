import { Suspense, lazy, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowDown,
  ArrowUpRight,
  Film,
  Globe,
  Layers,
  Sparkles,
  Check,
} from 'lucide-react';
import Navbar from './components/Navbar';
import ScrollProgressBar from './components/ScrollProgressBar';
import StudioPreloader from './components/StudioPreloader';
import ErrorBoundary from './components/ErrorBoundary';
import SectionSkeleton, { HeroSceneSkeleton } from './components/SectionSkeleton';

const StudioScene3D = lazy(() => import('./components/StudioScene3D'));
const ProjectModal = lazy(() => import('./components/ProjectModal'));
const TestimonialsCarousel = lazy(() => import('./components/TestimonialsCarousel'));
const JournalSection = lazy(() => import('./components/JournalSection'));
const FaqSection = lazy(() => import('./components/FaqSection'));
const ContactSection = lazy(() => import('./components/ContactSection'));
const NewsletterSection = lazy(() => import('./components/NewsletterSection'));
const SearchOverlay = lazy(() => import('./components/SearchOverlay'));
import {
  SERVICES,
  PROJECTS,
  WEBSITE_TOOLS,
  CREATIVE_SKILLS,
  PROCESS_STAGES,
  WHY_WORK_WITH_ME,
  STUDIO_CONTACT,
  type JournalPost,
  type ProjectItem,
} from './data/studioData';

type ProjectFilter = 'all' | 'web' | 'identity' | 'video';
type ThemeMode = 'dark' | 'light';

function ServiceIcon({ name }: { name: 'globe' | 'layers' | 'film' | 'sparkles' }) {
  switch (name) {
    case 'globe':
      return <Globe className="w-5 h-5" />;
    case 'layers':
      return <Layers className="w-5 h-5" />;
    case 'film':
      return <Film className="w-5 h-5" />;
    case 'sparkles':
      return <Sparkles className="w-5 h-5" />;
  }
}

export default function App() {
  const prefersReducedMotion = useReducedMotion();
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'dark';
    try {
      const stored = window.localStorage.getItem('wf-theme');
      return stored === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });
  const [cursorBloom, setCursorBloom] = useState({ x: 50, y: 20 });
  const [filter, setFilter] = useState<ProjectFilter>('all');
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);
  const [activeJournalPost, setActiveJournalPost] = useState<JournalPost | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [appReady, setAppReady] = useState(() => Boolean(prefersReducedMotion));

  useEffect(() => {
    if (appReady) return;
    let cancelled = false;
    let rafId = 0;

    const markReady = () => {
      if (!cancelled) setAppReady(true);
    };

    const maxWaitTimer = window.setTimeout(markReady, 420);

    const onFrame = () => {
      if (document.fonts && typeof document.fonts.ready?.then === 'function') {
        document.fonts.ready.then(() => {
          window.setTimeout(markReady, 180);
        });
      } else {
        window.setTimeout(markReady, 240);
      }
    };

    rafId = window.requestAnimationFrame(onFrame);

    return () => {
      cancelled = true;
      window.clearTimeout(maxWaitTimer);
      window.cancelAnimationFrame(rafId);
    };
  }, [appReady]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.body.style.backgroundColor = isDark ? '#080B1A' : '#F5F7FF';
    document.body.style.color = isDark ? '#F5F7FF' : '#0f172a';
    try {
      window.localStorage.setItem('wf-theme', theme);
    } catch {
      // Ignore storage write errors in restricted browsing contexts
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', isDark ? '#080B1A' : '#F5F7FF');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    if (prefersReducedMotion) return;

    let rafId = 0;
    const onPointerMove = (e: PointerEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        setCursorBloom({ x, y });
      });
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, [prefersReducedMotion]);

  const filteredProjects =
    filter === 'all' ? PROJECTS : PROJECTS.filter((p) => p.filterGroup === filter);

  const revealProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.18 },
        transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
      };

  return (
    <div className="min-h-screen bg-[#F5F7FF] dark:bg-[#080B1A] text-slate-900 dark:text-[#F5F7FF] relative overflow-x-hidden transition-colors duration-300">
      {/* Subtle Cursor-Following Ambient Bloom Behind Content */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background:
            theme === 'dark'
              ? `radial-gradient(640px circle at ${cursorBloom.x}% ${cursorBloom.y}%, rgba(57, 123, 255, 0.11), rgba(133, 85, 255, 0.06) 40%, transparent 72%)`
              : `radial-gradient(640px circle at ${cursorBloom.x}% ${cursorBloom.y}%, rgba(57, 123, 255, 0.09), rgba(133, 85, 255, 0.05) 40%, transparent 72%)`,
        }}
      />

      <StudioPreloader ready={appReady} reducedMotion={Boolean(prefersReducedMotion)} />
      <ScrollProgressBar />
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenSearch={() => setSearchOpen(true)}
      />

      <main className="relative z-10">
        {/* =====================================================
            HERO SECTION (Interactive 3D Studio Monolith + Copy)
           ===================================================== */}
        <section
          id="hero"
          className="relative min-h-[100svh] flex items-center pt-20 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
        >
          {/* Full-Bleed Three.js 3D Backdrop */}
          <ErrorBoundary variant="hero">
            <Suspense fallback={<HeroSceneSkeleton />}>
              <StudioScene3D theme={theme} />
            </Suspense>
          </ErrorBoundary>

          {/* Readability gradient scrim on left side so hero typography stays >= 4.5:1 */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-[#EEF3FF]/92 via-[#EEF3FF]/65 dark:from-[#080B1A]/92 dark:via-[#080B1A]/68 to-transparent transition-colors duration-300"
          />

          <div className="relative z-20 mx-auto max-w-[1200px] w-full pointer-events-none">
            <div className="max-w-2xl space-y-6 pointer-events-auto">
              <div className="flex flex-wrap items-center gap-2.5 text-xs tracking-[0.14em] uppercase text-slate-600 dark:text-[#A2A9C3]">
                <span className="text-[#397BFF] font-medium">AI Website Designer</span>
                <span aria-hidden="true">·</span>
                <span>Digital Creative</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.06] text-slate-900 dark:text-[#F5F7FF] text-balance">
                Ideas Into Digital Experiences.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-[#A2A9C3] leading-relaxed max-w-xl">
                I design modern websites, distinctive brand identities, and AI-powered creative content that help ideas stand out in the digital world.
              </p>

              <p className="text-sm text-slate-700 dark:text-[#F5F7FF]/85">
                Based in Ghana. Available Worldwide.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#work"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#397BFF] hover:bg-[#2B66E0] text-sm font-semibold text-white transition-colors whitespace-nowrap min-h-[44px]"
                >
                  <span>Explore My Work</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>

                <a
                  href="#contact"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-slate-300 dark:border-white/20 bg-white/85 dark:bg-[#10152B]/80 hover:border-[#8555FF] text-sm font-semibold text-slate-900 dark:text-[#F5F7FF] transition-colors whitespace-nowrap min-h-[44px]"
                >
                  Let&apos;s Work Together
                </a>
              </div>
            </div>
          </div>

          {/* Subtle Scroll Indicator */}
          <a
            href="#about"
            aria-label="Scroll to About section"
            className="hidden sm:inline-flex items-center gap-2 absolute bottom-7 left-1/2 -translate-x-1/2 z-20 text-xs tracking-wider text-slate-600 dark:text-[#A2A9C3] hover:text-slate-900 dark:hover:text-[#F5F7FF] transition-colors"
          >
            <span>Scroll to explore</span>
            <ArrowDown className="w-3.5 h-3.5" />
          </a>
        </section>

        <div className="hairline-rule" />

        {/* =====================================================
            ABOUT SECTION
           ===================================================== */}
        <section id="about" className="py-24 sm:py-28 px-4 sm:px-6 lg:px-8">
          <motion.div {...revealProps} className="mx-auto max-w-[1200px]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
              <div className="lg:col-span-5 space-y-4">
                <p className="font-mono-tabular text-xs tracking-wider text-[#397BFF]">
                  01 · Studio Positioning
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-[#F5F7FF] text-balance">
                  Creativity Meets Technology.
                </h2>
              </div>

              <div className="lg:col-span-7 space-y-6 text-base sm:text-lg leading-relaxed text-slate-600 dark:text-[#A2A9C3]">
                <p className="text-slate-900 dark:text-[#F5F7FF]">
                  I&apos;m an emerging AI Website Designer and Digital Creative focused on transforming ideas into engaging digital experiences.
                </p>
                <p>
                  I explore modern website-building technologies, visual design, branding, and AI-powered creative tools to produce websites and digital content that combine functionality with strong visual storytelling.
                </p>
                <p>
                  My approach is built around continuous learning, experimentation, thoughtful design, and delivering work that solves real communication and business problems.
                </p>

                <div className="pt-6 border-t border-slate-200 dark:border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-[#A2A9C3] mb-1">Studio Base</p>
                    <p className="font-medium text-slate-900 dark:text-[#F5F7FF]">Ghana</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-[#A2A9C3] mb-1">Collaboration</p>
                    <p className="font-medium text-slate-900 dark:text-[#F5F7FF]">Worldwide / Remote</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-[#A2A9C3] mb-1">Core Focus</p>
                    <p className="font-medium text-slate-900 dark:text-[#F5F7FF]">
                      Web, Brand &amp; AI Media
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <div className="hairline-rule" />

        {/* =====================================================
            SERVICES SECTION (4 Premium Service Cards)
           ===================================================== */}
        <section id="services" className="py-24 sm:py-28 px-4 sm:px-6 lg:px-8">
          <motion.div {...revealProps} className="mx-auto max-w-[1200px] space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <p className="font-mono-tabular text-xs tracking-wider text-[#397BFF]">
                  02 · Capabilities
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-[#F5F7FF]">
                  Creative Services Built for Modern Brands
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-600 dark:text-[#A2A9C3] max-w-md">
                Four focused disciplines combining AI-accelerated execution with intentional visual direction.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SERVICES.map((service) => (
                <article
                  key={service.index}
                  className="studio-panel rounded-2xl p-7 sm:p-8 flex flex-col justify-between gap-6 group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono-tabular text-sm text-[#397BFF]">
                        Service {service.index}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-[#397BFF]/12 border border-[#397BFF]/25 flex items-center justify-center text-[#397BFF] group-hover:bg-[#397BFF]/20 transition-colors">
                        <ServiceIcon name={service.iconName} />
                      </div>
                    </div>

                    <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F5F7FF]">
                      {service.index}. {service.title}
                    </h3>

                    <p className="text-sm sm:text-base text-slate-600 dark:text-[#A2A9C3] leading-relaxed">
                      {service.summary}
                    </p>
                  </div>

                  <ul className="pt-5 border-t border-slate-200 dark:border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 text-sm text-slate-800 dark:text-[#F5F7FF]/90">
                    {service.capabilities.map((cap) => (
                      <li key={cap} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#8555FF] shrink-0" />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </motion.div>
        </section>

        <div className="hairline-rule" />

        {/* =====================================================
            SELECTED PROJECTS / PORTFOLIO GALLERY
           ===================================================== */}
        <section id="work" className="py-24 sm:py-28 px-4 sm:px-6 lg:px-8">
          <motion.div {...revealProps} className="mx-auto max-w-[1200px] space-y-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <p className="font-mono-tabular text-xs tracking-wider text-[#397BFF]">
                  03 · Selected Projects
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-[#F5F7FF]">
                  Concept Studies &amp; Interactive Builds
                </h2>
                <p className="text-sm sm:text-base text-slate-600 dark:text-[#A2A9C3]">
                  Each showcase below is labeled transparently as a concept project, work in development, or live web interface.
                </p>
              </div>

              {/* Interactive Filter Tabs */}
              <div
                role="tablist"
                aria-label="Filter projects by discipline"
                className="inline-flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white/80 dark:bg-[#10152B] border border-slate-200 dark:border-white/10 self-start"
              >
                {(
                  [
                    { id: 'all', label: 'All Work' },
                    { id: 'web', label: 'Web Design' },
                    { id: 'identity', label: 'Brand Identity' },
                    { id: 'video', label: 'AI UGC & Video' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={filter === tab.id}
                    onClick={() => setFilter(tab.id)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      filter === tab.id
                        ? 'bg-[#397BFF] text-white'
                        : 'text-slate-600 dark:text-[#A2A9C3] hover:text-slate-900 dark:hover:text-[#F5F7FF]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredProjects.map((project) => (
                <article
                  key={project.id}
                  className="studio-panel rounded-2xl overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Locked 4:3 Image Container with Zero-Broken-Image Fallback */}
                    <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-[#080B1A] relative border-b border-slate-200 dark:border-white/10">
                      {!failedImages[project.id] ? (
                        <img
                          src={project.image}
                          alt={project.imageAlt}
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setFailedImages((prev) => ({ ...prev, [project.id]: true }))
                          }
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#10152B] dark:to-[#080B1A] text-center">
                          <Layers className="w-8 h-8 text-[#397BFF] mb-2" />
                          <p className="font-display text-lg font-semibold text-slate-900 dark:text-[#F5F7FF]">
                            {project.title}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-[#A2A9C3]">
                            {project.category}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="p-6 sm:p-7 space-y-3">
                      {/* Clean unboxed metadata row */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-[#A2A9C3]">
                        <span className="font-mono-tabular text-[#397BFF]">{project.index}</span>
                        <span aria-hidden="true">·</span>
                        <span>{project.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-900 dark:text-[#F5F7FF]">{project.status}</span>
                      </div>

                      <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-[#F5F7FF]">
                        {project.title}
                      </h3>

                      <p className="text-sm sm:text-base text-slate-600 dark:text-[#A2A9C3] leading-relaxed">
                        {project.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 sm:px-7 pb-6 sm:pb-7 pt-3 border-t border-slate-200/80 dark:border-white/8 flex flex-wrap items-center justify-between gap-4">
                    <span className="text-xs text-slate-500 dark:text-[#A2A9C3]">
                      {project.tools}
                    </span>

                    <div className="flex items-center gap-3">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-[#A2A9C3] hover:text-slate-900 dark:hover:text-[#F5F7FF] transition-colors whitespace-nowrap"
                        >
                          <span>Live Site</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setActiveProject(project)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#397BFF]/15 hover:bg-[#397BFF] border border-[#397BFF]/35 text-xs font-semibold text-slate-900 dark:text-[#F5F7FF] hover:text-white transition-colors whitespace-nowrap min-h-[40px]"
                      >
                        <span>View Project</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </motion.div>
        </section>

        <div className="hairline-rule" />

        {/* =====================================================
            TOOLS & CREATIVE SKILLS
           ===================================================== */}
        <section id="stack" className="py-24 sm:py-28 px-4 sm:px-6 lg:px-8">
          <motion.div {...revealProps} className="mx-auto max-w-[1200px] space-y-12">
            <div className="space-y-3 max-w-2xl">
              <p className="font-mono-tabular text-xs tracking-wider text-[#397BFF]">
                04 · Tools &amp; Craft
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-[#F5F7FF]">
                Studio Technology Stack &amp; Creative Disciplines
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Website Tools */}
              <div className="lg:col-span-5 studio-panel rounded-2xl p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="font-display text-xl font-bold text-slate-900 dark:text-[#F5F7FF]">
                    Website Builders &amp; Platforms
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-[#A2A9C3] mt-1">
                    Core environments used to prototype, build, and ship digital experiences.
                  </p>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-white/10">
                  {WEBSITE_TOOLS.map((tool, i) => (
                    <div key={tool.name} className="py-4 first:pt-0 last:pb-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-display text-base font-semibold text-slate-900 dark:text-[#F5F7FF]">
                          {tool.name}
                        </span>
                        <span className="font-mono-tabular text-xs text-[#397BFF]">
                          0{i + 1}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-[#A2A9C3]">{tool.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Creative Skills */}
              <div className="lg:col-span-7 studio-panel rounded-2xl p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="font-display text-xl font-bold text-slate-900 dark:text-[#F5F7FF]">
                    Creative &amp; Visual Capabilities
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-[#A2A9C3] mt-1">
                    Foundational design principles guiding layout, brand cohesion, and storytelling.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 gap-x-8 gap-y-4">
                  {CREATIVE_SKILLS.map((skill, idx) => (
                    <div
                      key={skill}
                      className="flex items-center justify-between py-2.5 border-b border-slate-200 dark:border-white/10"
                    >
                      <span className="text-sm sm:text-base font-medium text-slate-900 dark:text-[#F5F7FF]">
                        {skill}
                      </span>
                      <span className="font-mono-tabular text-xs text-slate-500 dark:text-[#A2A9C3]">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <div className="hairline-rule" />

        {/* =====================================================
            4-STAGE CREATIVE PROCESS TIMELINE
           ===================================================== */}
        <section id="process" className="py-24 sm:py-28 px-4 sm:px-6 lg:px-8">
          <motion.div {...revealProps} className="mx-auto max-w-[1200px] space-y-14">
            <div className="space-y-3 max-w-2xl">
              <p className="font-mono-tabular text-xs tracking-wider text-[#397BFF]">
                05 · Creative Process
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-[#F5F7FF]">
                From Initial Idea to Polished Deliverable
              </h2>
            </div>

            <div className="relative">
              {/* Connecting beam on desktop */}
              <div
                aria-hidden="true"
                className="hidden lg:block absolute top-6 left-6 right-6 h-px bg-gradient-to-r from-[#397BFF] via-[#8555FF] to-[#397BFF]/40"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {PROCESS_STAGES.map((stage) => (
                  <div
                    key={stage.step}
                    className="studio-panel rounded-2xl p-6 space-y-4 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono-tabular text-sm font-medium text-slate-900 dark:text-[#F5F7FF] px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#080B1A] border border-[#397BFF]/40">
                        {stage.step}
                      </span>
                      <span className="text-xs text-[#8555FF] font-medium">Stage</span>
                    </div>

                    <h3 className="font-display text-xl font-bold text-slate-900 dark:text-[#F5F7FF]">
                      {stage.step} — {stage.title}
                    </h3>

                    <p className="text-sm text-slate-600 dark:text-[#A2A9C3] leading-relaxed">
                      {stage.description}
                    </p>

                    <p className="pt-3 border-t border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-[#F5F7FF]/85">
                      Output: {stage.deliverable}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        <div className="hairline-rule" />

        {/* =====================================================
            WHY WORK WITH ME
           ===================================================== */}
        <section id="approach" className="py-24 sm:py-28 px-4 sm:px-6 lg:px-8">
          <motion.div {...revealProps} className="mx-auto max-w-[1200px] space-y-12">
            <div className="space-y-3 max-w-2xl">
              <p className="font-mono-tabular text-xs tracking-wider text-[#397BFF]">
                06 · Working Principles
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-[#F5F7FF]">
                Why Work With Me
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {WHY_WORK_WITH_ME.map((item, idx) => (
                <div key={item.title} className="studio-panel rounded-2xl p-6 space-y-3">
                  <span className="font-mono-tabular text-xs text-[#397BFF]">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-[#F5F7FF]">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-[#A2A9C3] leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <div className="hairline-rule" />

        {/* =====================================================
            CLIENT TESTIMONIALS CAROUSEL
           ===================================================== */}
        <Suspense fallback={<SectionSkeleton />}>
          <TestimonialsCarousel />
        </Suspense>

        <div className="hairline-rule" />

        {/* =====================================================
            STUDIO JOURNAL / BLOG NOTES
           ===================================================== */}
        <Suspense fallback={<SectionSkeleton />}>
          <JournalSection
            selectedPost={activeJournalPost}
            onSelectPost={setActiveJournalPost}
          />
        </Suspense>

        <div className="hairline-rule" />

        {/* =====================================================
            FAQ SECTION
           ===================================================== */}
        <Suspense fallback={<SectionSkeleton />}>
          <FaqSection />
        </Suspense>

        <div className="hairline-rule" />

        {/* =====================================================
            CONTACT SECTION
           ===================================================== */}
        <Suspense fallback={<SectionSkeleton />}>
          <ContactSection />
        </Suspense>

        <div className="hairline-rule" />

        {/* =====================================================
            NEWSLETTER SUBSCRIPTION SECTION
           ===================================================== */}
        <Suspense fallback={<SectionSkeleton compact />}>
          <NewsletterSection />
        </Suspense>
      </main>

      {/* =====================================================
          FOOTER
         ===================================================== */}
      <footer className="border-t border-slate-200 dark:border-white/10 bg-[#EDF1FF] dark:bg-[#080B1A] py-14 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
        <div className="mx-auto max-w-[1200px] space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-5 space-y-3">
              <a
                href="#hero"
                className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-[#F5F7FF]"
              >
                WebFlow Creative Studio
              </a>
              <p className="text-sm text-slate-600 dark:text-[#A2A9C3] leading-relaxed max-w-sm">
                AI Website Designer &amp; Digital Creative based in Ghana, collaborating worldwide on modern websites, brand identities, and AI-powered visual content.
              </p>
            </div>

            <div className="md:col-span-3 space-y-3">
              <p className="text-xs font-medium tracking-wider uppercase text-slate-500 dark:text-[#A2A9C3]">
                Navigation
              </p>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#services"
                    className="text-slate-700 dark:text-[#F5F7FF]/85 hover:text-[#397BFF] transition-colors"
                  >
                    Services
                  </a>
                </li>
                <li>
                  <a
                    href="#work"
                    className="text-slate-700 dark:text-[#F5F7FF]/85 hover:text-[#397BFF] transition-colors"
                  >
                    Portfolio
                  </a>
                </li>
                <li>
                  <a
                    href="#process"
                    className="text-slate-700 dark:text-[#F5F7FF]/85 hover:text-[#397BFF] transition-colors"
                  >
                    Process
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="text-slate-700 dark:text-[#F5F7FF]/85 hover:text-[#397BFF] transition-colors"
                  >
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-slate-700 dark:text-[#F5F7FF]/85 hover:text-[#397BFF] transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div className="md:col-span-4 space-y-3">
              <p className="text-xs font-medium tracking-wider uppercase text-slate-500 dark:text-[#A2A9C3]">
                Direct Channels
              </p>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href={`mailto:${STUDIO_CONTACT.email}`}
                    className="text-slate-700 dark:text-[#F5F7FF]/85 hover:text-[#397BFF] transition-colors"
                  >
                    {STUDIO_CONTACT.email}
                  </a>
                </li>
                <li>
                  <a
                    href={STUDIO_CONTACT.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono-tabular text-slate-700 dark:text-[#F5F7FF]/85 hover:text-[#397BFF] transition-colors"
                  >
                    WhatsApp: {STUDIO_CONTACT.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a
                    href={STUDIO_CONTACT.chopNChillUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-slate-700 dark:text-[#F5F7FF]/85 hover:text-[#397BFF] transition-colors"
                  >
                    <span>Chop &apos;n&apos; Chill Showcase</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-[#A2A9C3]">
            <p>&copy; 2026 WebFlow Creative Studio. All rights reserved.</p>
            <p>Based in Ghana · Worldwide / Remote</p>
          </div>
        </div>
      </footer>

      {/* Project Lightbox Modal */}
      <Suspense fallback={null}>
        {activeProject && (
          <ProjectModal project={activeProject} onClose={() => setActiveProject(null)} />
        )}
      </Suspense>

      {/* Global Search Overlay */}
      <Suspense fallback={null}>
        {searchOpen && (
          <SearchOverlay
            isOpen={searchOpen}
            onClose={() => setSearchOpen(false)}
            onSelectProject={(project) => setActiveProject(project)}
            onSelectJournal={(post) => setActiveJournalPost(post)}
          />
        )}
      </Suspense>
    </div>
  );
}
