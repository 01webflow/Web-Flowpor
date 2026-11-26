import nayaWebImg from '../assets/images/project_naya_botanics_web_1795730500535.jpg';
import nayaIdentityImg from '../assets/images/project_naya_botanics_identity_1795730500602.jpg';
import thinkpadUgcImg from '../assets/images/project_thinkpad_ugc_concept_1795730501438.jpg';
import chopNChillImg from '../assets/images/project_chop_n_chill_web_1795730502111.jpg';

export interface ServiceItem {
  index: string;
  title: string;
  summary: string;
  capabilities: string[];
  iconName: 'globe' | 'layers' | 'film' | 'sparkles';
}

export interface StoryboardFrame {
  shot: string;
  timestamp: string;
  visualDirection: string;
  audioCue: string;
}

export interface ProjectItem {
  id: string;
  index: string;
  title: string;
  category: string;
  filterGroup: 'web' | 'identity' | 'video';
  description: string;
  tools: string;
  status: string;
  image: string;
  imageAlt: string;
  highlights: string[];
  creativeDirection: string;
  liveUrl?: string;
  paletteSwatches?: { name: string; hex: string }[];
  storyboard?: StoryboardFrame[];
}

export interface ProcessStage {
  step: string;
  title: string;
  description: string;
  deliverable: string;
}

export const STUDIO_CONTACT = {
  brandName: 'WebFlow Creative Studio',
  email: '01webflow@gmail.com',
  phoneDisplay: '+233 24 369 2913',
  phoneRaw: '+233243692913',
  whatsappUrl: 'https://wa.me/233243692913',
  location: 'Ghana',
  availability: 'Worldwide / Remote',
  chopNChillUrl: 'https://01webflow.github.io/Chop-n-Chill/#/',
};

export const SERVICES: ServiceItem[] = [
  {
    index: '01',
    title: 'AI Website Design',
    summary:
      'Modern, responsive web interfaces engineered for visual clarity, fast loading, and purposeful conversion.',
    capabilities: [
      'Business websites',
      'Landing pages',
      'Responsive website design',
      'Website redesign concepts',
      'WordPress websites',
      'Lovable and Bolt projects',
    ],
    iconName: 'globe',
  },
  {
    index: '02',
    title: 'Logo & Brand Identity',
    summary:
      'Cohesive visual systems that give emerging ventures a memorable mark, disciplined color architecture, and clear voice.',
    capabilities: [
      'Logo concepts',
      'Brand color systems',
      'Typography selection',
      'Visual identity concepts',
      'Brand presentation',
    ],
    iconName: 'layers',
  },
  {
    index: '03',
    title: 'AI UGC & Video Content',
    summary:
      'Creator-led product narratives and vertical video concepts storyboarded for TikTok, Instagram Reels, and paid social.',
    capabilities: [
      'UGC-style advertisement concepts',
      'Product promotional videos',
      'Short-form video concepts',
      'Storyboarding',
      'Creative direction',
    ],
    iconName: 'film',
  },
  {
    index: '04',
    title: 'Digital Creative Design',
    summary:
      'High-contrast campaign visuals and promotional graphics built to hold attention across digital channels.',
    capabilities: [
      'Social media graphics',
      'Promotional designs',
      'Digital campaign concepts',
      'Creative visual assets',
      'Marketing content',
    ],
    iconName: 'sparkles',
  },
];

export const PROJECTS: ProjectItem[] = [
  {
    id: 'naya-botanics-web',
    index: '01',
    title: 'Naya Botanics',
    category: 'Website Design Concept',
    filterGroup: 'web',
    description:
      'A fictional natural skincare storefront concept structured around calm editorial pacing, tactile product storytelling, and responsive storefront navigation.',
    tools: 'Lovable · AI Website Builder',
    status: 'Concept Project',
    image: nayaWebImg,
    imageAlt: 'Naya Botanics natural skincare website concept displayed on an angled dark laptop in a studio setting',
    creativeDirection:
      'Designed to balance botanical warmth with disciplined e-commerce hierarchy. Full-bleed hero framing pairs with ingredient-led product cards, a founder ritual narrative, and accessible contrast across mobile and desktop breakpoints.',
    highlights: [
      'Modern product-focused layout with serene whitespace',
      'Editorial serif and geometric sans typographic pairing',
      'Botanical visual direction and ingredient transparency blocks',
      'Responsive navigation and conversion-ready CTA sections',
    ],
  },
  {
    id: 'naya-botanics-identity',
    index: '02',
    title: 'Naya Botanics Identity',
    category: 'Brand Identity Concept',
    filterGroup: 'identity',
    description:
      'A complete visual identity exploration for the fictional Naya Botanics line—unifying monogram mark design, packaging tactile finishes, and warm organic color systems.',
    tools: 'Brand System · Typography · Packaging Direction',
    status: 'Concept Project',
    image: nayaIdentityImg,
    imageAlt: 'Naya Botanics skincare brand identity packaging flatlay with amber dropper bottle and embossed cream box',
    creativeDirection:
      'Built around tactile restraint: embossed cream paper stock, frosted amber glass vessels, and refined serif wordmarks that translate seamlessly from physical apothecary packaging to digital editorial layouts.',
    highlights: [
      'Primary wordmark and circular botanical monogram seal',
      'Warm travertine, sage, and espresso color palette',
      'Packaging mockup direction for 30ml dropper serum & outer carton',
      'Stationery and insert card typographic guidelines',
    ],
    paletteSwatches: [
      { name: 'Botanical Ivory', hex: '#F3EFE6' },
      { name: 'Amber Glass', hex: '#B9783E' },
      { name: 'Eucalyptus Sage', hex: '#6F7D63' },
      { name: 'Travertine Umber', hex: '#3D3128' },
    ],
  },
  {
    id: 'thinkpad-t14-ugc',
    index: '03',
    title: 'ThinkPad T14',
    category: 'AI UGC Advertisement Concept',
    filterGroup: 'video',
    description:
      'A vertical 9:16 creator-led promotional video concept spotlighting the ThinkPad T14 in an authentic modern lifestyle workflow, presented as an interactive production storyboard.',
    tools: 'AI UGC Workflow · Storyboarding · Creative Direction',
    status: 'In Development',
    image: thinkpadUgcImg,
    imageAlt: 'African female digital creator demonstrating a matte black ThinkPad laptop at a sunlit apartment desk with vertical phone rig',
    creativeDirection:
      'Moves away from sterile hardware spec sheets toward relatable daily utility. Framed for TikTok and Instagram Reels, an African female creator walks viewers through remote design sprints, keyboard ergonomics, and crisp outdoor-window legibility.',
    highlights: [
      'Realistic African female UGC creator in a sunlit modern apartment',
      '9:16 TikTok and Instagram Reels vertical pacing and hook structure',
      'Hands-on ThinkPad T14 port, matte display, and workflow demonstration',
      'Direct promotional end-card engineered for product recall',
    ],
    storyboard: [
      {
        shot: '01 · Hook (0–3s)',
        timestamp: '00:00 – 00:03',
        visualDirection:
          'Handheld vertical close-up as the creator flips open the matte-black ThinkPad T14 beside morning coffee in warm window light.',
        audioCue: '"Here is the one setup change that made working remotely from Accra effortless."',
      },
      {
        shot: '02 · Tactile Proof (3–10s)',
        timestamp: '00:03 – 00:10',
        visualDirection:
          'Tight over-the-shoulder angle showing crisp anti-glare screen clarity in direct sunlight and rapid keyboard typing.',
        audioCue: 'Ambient keyboard clicks + upbeat minimalist lo-fi underscore.',
      },
      {
        shot: '03 · Workflow Demo (10–18s)',
        timestamp: '00:10 – 00:18',
        visualDirection:
          'Split focus between the creator speaking naturally to camera and live UI/design canvas motion on the ThinkPad screen.',
        audioCue: '"Zero fan noise during client calls, all-day battery when moving between studio spaces."',
      },
      {
        shot: '04 · Promotional Ending (18–24s)',
        timestamp: '00:18 – 00:24',
        visualDirection:
          'Clean lockup frame: ThinkPad T14 profile shot with bold high-contrast headline and subtle call-to-action.',
        audioCue: '"Built for creators who ship anywhere. Explore the ThinkPad T14."',
      },
    ],
  },
  {
    id: 'chop-n-chill',
    index: '04',
    title: "Chop 'n' Chill",
    category: 'Interactive Hospitality Web Experience',
    filterGroup: 'web',
    description:
      'A responsive food and lounge web interface built for high-appetite visual storytelling, intuitive menu exploration, and instant mobile-friendly ordering access.',
    tools: 'Responsive Web UI · Frontend Engineering · GitHub Pages',
    status: 'Live Web Interface',
    image: chopNChillImg,
    imageAlt: "Chop 'n' Chill gourmet grill and chilled lounge web interface displayed on a studio monitor",
    creativeDirection:
      'Balances dark atmospheric lounge warmth with crisp menu scannability. Designed so visitors on mobile and desktop can browse signature grills, chilled drinks, and reservations without friction.',
    highlights: [
      'Appetite-driven dark editorial layout with warm amber food accents',
      'Responsive menu cards and clear section-by-section navigation',
      'Fast-loading single-page hash routing architecture',
      'Live deployment accessible at 01webflow.github.io/Chop-n-Chill',
    ],
    liveUrl: 'https://01webflow.github.io/Chop-n-Chill/#/',
  },
];

export const WEBSITE_TOOLS = [
  { name: 'Lovable', note: 'Rapid AI-assisted interface prototyping & full-stack concepts' },
  { name: 'Bolt', note: 'Interactive web application builds & component iteration' },
  { name: 'WordPress', note: 'Structured business sites & maintainable CMS publishing' },
  { name: 'AI Website Builders', note: 'Modern visual layout systems accelerated by AI workflows' },
];

export const CREATIVE_SKILLS = [
  'Responsive Web Design',
  'Landing Page Design',
  'UI/UX Fundamentals',
  'Logo Design',
  'Typography',
  'Color Theory',
  'Visual Storytelling',
  'UGC Concepts',
  'Storyboarding',
  'Creative Direction',
];

export const PROCESS_STAGES: ProcessStage[] = [
  {
    step: '01',
    title: 'Discover',
    description: 'Understand the idea, objectives, audience, and core project requirements before sketching a single pixel.',
    deliverable: 'Creative Brief & Scope Alignment',
  },
  {
    step: '02',
    title: 'Plan',
    description: 'Develop the creative direction, page structure, messaging hierarchy, and cohesive visual strategy.',
    deliverable: 'Wireframe Architecture & Art Direction',
  },
  {
    step: '03',
    title: 'Create',
    description: 'Build the website, brand identity system, or AI-assisted creative content with precision and visual restraint.',
    deliverable: 'Interactive Build & Visual Assets',
  },
  {
    step: '04',
    title: 'Refine',
    description: 'Review across devices, improve micro-interactions, optimize accessibility and speed, and prepare final delivery.',
    deliverable: 'Responsive QA & Launch Readiness',
  },
];

export const WHY_WORK_WITH_ME = [
  {
    title: 'Modern AI-Assisted Creative Workflows',
    detail: 'Leveraging contemporary AI website builders and creative direction tools to explore stronger concepts faster without sacrificing craft.',
  },
  {
    title: 'Strong Attention to Visual Detail',
    detail: 'Intentional typographic hierarchy, balanced spacing, and measured contrast across every panel and interactive state.',
  },
  {
    title: 'Responsive-First Design Approach',
    detail: 'Every layout is structured to adapt cleanly from handheld mobile viewports up to widescreen desktop displays.',
  },
  {
    title: 'Creative Problem-Solving',
    detail: 'Focused on solving real communication and brand positioning challenges rather than decorating generic templates.',
  },
  {
    title: 'Clear Communication',
    detail: 'Straightforward updates, honest scoping, and collaborative feedback loops from initial brief through final handoff.',
  },
  {
    title: 'Continuous Learning & Improvement',
    detail: 'Actively experimenting with emerging web technologies, visual systems, and creative production formats.',
  },
  {
    title: 'Worldwide Remote Collaboration',
    detail: 'Based in Ghana and structured for seamless asynchronous and live collaboration with teams and founders anywhere.',
  },
];

export interface TestimonialItem {
  id: string;
  author: string;
  role: string;
  organization: string;
  engagement: string;
  outcome: string;
  quote: string;
}

export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'kente-loom',
    author: 'Abena Osei-Bonsu',
    role: 'Founder',
    organization: 'Kente & Loom Atelier',
    engagement: 'Website Redesign & Visual Direction',
    outcome: 'Streamlined mobile catalog flow',
    quote:
      'Before working with WebFlow Creative Studio, our online storefront struggled to convey the craft behind our handwoven pieces on mobile. Restructuring the landing hierarchy and product imagery gave international buyers a clear, effortless browsing experience.',
  },
  {
    id: 'chop-n-chill',
    author: 'Daniel Mensah-Bonsu',
    role: 'Operations Lead',
    organization: "Chop 'n' Chill Lounge",
    engagement: 'Interactive Hospitality Web UI',
    outcome: 'Instant QR menu navigation',
    quote:
      'Guests previously had to pinch-zoom static PDF menus on their phones. The dark editorial web interface WebFlow Creative Studio built loads immediately on mobile data and lets diners explore signature grills, drinks, and table inquiries without friction.',
  },
  {
    id: 'accratech-ventures',
    author: 'Nadia Boateng',
    role: 'Creative Producer',
    organization: 'AccraTech Ventures',
    engagement: 'AI UGC Storyboarding & Campaign Assets',
    outcome: 'Cohesive 9:16 social launch kit',
    quote:
      'Our product rollout lacked short-form video hooks that felt natural rather than over-scripted. The creator-style storyboards and campaign visuals gave our team a cohesive narrative across TikTok, Instagram Reels, and launch landing pages.',
  },
  {
    id: 'coastline-logistics',
    author: 'Samuel Appiah',
    role: 'Managing Partner',
    organization: 'Coastline Logistics GH',
    engagement: 'Brand Identity & Business Website',
    outcome: 'Clearer inbound quote routing',
    quote:
      'Our legacy site buried core freight services under dense paragraphs. Establishing a sharper visual identity and structured service cards made our capabilities immediately legible and improved the quality of project inquiries we receive.',
  },
];

export interface FaqItem {
  id: string;
  category: 'Process' | 'Pricing' | 'Timelines';
  question: string;
  answer: string;
}

export const FAQS: FaqItem[] = [
  {
    id: 'faq-process-flow',
    category: 'Process',
    question: 'How does your four-stage creative process work from start to finish?',
    answer:
      'Every project moves through four clear stages: Discover (aligning on your business goals, target audience, and scope), Plan (mapping wireframe structure, messaging hierarchy, and visual direction), Create (building the website, brand identity, or AI UGC assets), and Refine (responsive testing, micro-interaction polish, and final handoff).',
  },
  {
    id: 'faq-revisions',
    category: 'Process',
    question: 'How are feedback and revisions handled during a build?',
    answer:
      'Feedback is built into both the Plan and Refine stages. You review visual direction and layout structure before full build-out, followed by focused revision rounds once the interactive preview is live so every detail feels intentional.',
  },
  {
    id: 'faq-pricing-structure',
    category: 'Pricing',
    question: 'How is pricing structured across websites, branding, and AI video concepts?',
    answer:
      'Pricing is project-based and scoped around deliverables rather than hourly surprises. Smaller landing pages and single-concept identity kits start around $300–$600, multi-section responsive websites and full identity systems typically range from $600–$1,800+, and custom AI UGC campaign packages are quoted based on script count and deliverables. You can also enter your own target budget in the inquiry form.',
  },
  {
    id: 'faq-payment-milestones',
    category: 'Pricing',
    question: 'What payment structure do you use for new projects?',
    answer:
      'Projects begin with an agreed scope summary and a 50% kickoff deposit to reserve studio focus, with the remaining 50% due upon final review and delivery readiness. For larger multi-phase engagements, milestone splits can be arranged.',
  },
  {
    id: 'faq-timelines',
    category: 'Timelines',
    question: 'What are typical turnaround times for websites and brand identities?',
    answer:
      'A focused landing page or concept prototype typically takes 5 to 10 business days. Complete multi-section websites or full logo and brand identity systems generally take 2 to 4 weeks, while AI UGC storyboards and short-form promotional concepts can be turned around in 5 to 7 business days depending on asset complexity.',
  },
  {
    id: 'faq-tools-remote',
    category: 'Process',
    question: 'Which platforms do you build on, and do you work with international clients?',
    answer:
      'Depending on your goals, projects are built with modern React/TypeScript, WordPress, or AI-assisted platforms like Lovable and Bolt. Based in Ghana, I collaborate remotely with founders and teams worldwide using clear asynchronous updates and scheduled video check-ins.',
  },
];

export interface JournalPost {
  id: string;
  index: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  excerpt: string;
  tags: string[];
  sections: { heading: string; body: string }[];
}

export const JOURNAL_POSTS: JournalPost[] = [
  {
    id: 'ai-builders-visual-craft',
    index: '01',
    title: 'Designing Landing Pages With AI Builders Without Losing Visual Craft',
    category: 'Web Design',
    date: 'November 2026',
    readTime: '4 min read',
    excerpt:
      'How structured wireframing, typographic restraint, and disciplined color contrast turn rapid AI prototypes into distinctive digital experiences.',
    tags: ['Lovable', 'Bolt', 'Responsive Web Design', 'UI/UX'],
    sections: [
      {
        heading: 'Start With Hierarchy Before Prompting',
        body: 'AI website builders accelerate layout generation, but strong digital experiences still begin with clear editorial structure. Defining the primary headline, audience value proposition, and single focal call-to-action before touching visual components prevents crowded templates.',
      },
      {
        heading: 'Enforce Consistent Type and Spacing Math',
        body: 'Pairing a characterful display typeface like Space Grotesk with clean body typography creates immediate rhythm. Holding consistent container widths, generous vertical breathing room, and readable contrast across light and dark modes separates crafted studio work from generic output.',
      },
      {
        heading: 'Verify Mobile Ergonomics Early',
        body: 'Every responsive concept should be evaluated on narrow mobile screens first—checking navigation reachability, single-line controls, and image aspect ratios so nothing clips or shifts unexpectedly.',
      },
    ],
  },
  {
    id: 'brand-identity-cohesion',
    index: '02',
    title: 'Building Cohesive Brand Identities: Color, Type, and Packaging Direction',
    category: 'Brand Identity',
    date: 'November 2026',
    readTime: '5 min read',
    excerpt:
      'Lessons from conceptualizing Naya Botanics—translating a calm botanical ethos across logo marks, tactile packaging, and digital storefronts.',
    tags: ['Logo Design', 'Color Theory', 'Typography', 'Branding'],
    sections: [
      {
        heading: 'Restraint Creates Recognition',
        body: 'Memorable brand systems rarely rely on complex illustrations. A disciplined monogram paired with a balanced wordmark scales cleanly from a 30ml amber serum label to a 16px browser favicon.',
      },
      {
        heading: 'Align Palette With Tactile Surfaces',
        body: 'In our Naya Botanics Identity study, warm travertine neutrals, eucalyptus sage, and espresso ink were selected to feel natural both on embossed paper cartons and in digital product cards.',
      },
      {
        heading: 'Carry Identity Into Web Components',
        body: 'When brand guidelines extend directly into button radii, hairline borders, and photography lighting, the transition from social discovery to landing page feels seamless.',
      },
    ],
  },
  {
    id: 'ai-ugc-storyboarding',
    index: '03',
    title: 'Storyboarding Authentic Vertical AI UGC Concepts for Reels & TikTok',
    category: 'AI Video & UGC',
    date: 'October 2026',
    readTime: '4 min read',
    excerpt:
      'Breaking down our ThinkPad T14 creator-style ad workflow: crafting believable lifestyle hooks, tactile product proof, and crisp promotional endings.',
    tags: ['UGC Concepts', 'Storyboarding', 'Creative Direction', 'Video'],
    sections: [
      {
        heading: 'Lead With a Relatable Three-Second Hook',
        body: 'Short-form viewers scroll past polished corporate intros in a heartbeat. Framing the opening shot in a natural lifestyle setting—morning light, real workspace textures, and conversational pacing—earns attention organically.',
      },
      {
        heading: 'Show Physical Utility Over Spec Lists',
        body: 'Instead of reading hardware specs off a sheet, our ThinkPad T14 storyboard pairs close-up anti-glare screen legibility and keyboard tactility with everyday remote studio workflows.',
      },
      {
        heading: 'Close With Clear Brand Recall',
        body: 'A strong promotional ending locks the product silhouette, key benefit, and next action into a clean final frame optimized for vertical 9:16 mobile viewing.',
      },
    ],
  },
];



