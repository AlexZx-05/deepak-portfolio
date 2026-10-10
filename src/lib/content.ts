import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";

export type HeroContent = {
  eyebrow: string;
  name: string;
  role: string;
  copy: string;
  primaryCta: string;
  image: string;
};

export type ProjectContent = {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  liveUrl: string;
  githubUrl: string;
  featured: boolean;
  order: number;
  visualClass: string;
  why: string;
  problem: string;
  impact: string;
  overview: string;
  solution: string;
  features: string[];
  docsUrl: string;
  visible: boolean;
  githubRepoId: number | null;
  githubFullName?: string;
  stars?: number;
  language?: string;
};

export type SocialContent = {
  github: string;
  linkedin: string;
  whatsapp: string;
  instagram: string;
  email: string;
};

export type SkillContent = {
  id: string;
  name: string;
  level: number;
  order: number;
};

export type AvailabilityContent = {
  text: string;
  status: string;
  visible: boolean;
};

export type TestimonialContent = {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  createdAt: string;
};

export type SiteContent = {
  sections: {
    highlights: boolean;
    services: boolean;
    portfolio: boolean;
    github: boolean;
    about: boolean;
    testimonials: boolean;
    contact: boolean;
  };
  navigation: { home: string; about: string; services: string; portfolio: string; testimonials: string; contact: string; cta: string; ctaHref: string };
  heroImage: string;
  heroCtaHref: string;
  highlights: string[];
  services: {
    eyebrow: string;
    title: string;
    intro: string;
    ctaLabel: string;
    ctaHref: string;
    items: Array<{
      title: string;
      description: string;
      offerings: string[];
      image: string;
      imageAlt: string;
    }>;
  };
  portfolio: { eyebrow: string; title: string; intro: string; allProjectsLabel: string };
  github: { eyebrow: string; title: string; linkLabel: string };
  about: {
    eyebrow: string;
    title: string;
    copy: string;
    ctaLabel: string;
    ctaHref: string;
    steps: Array<{ title: string; description: string; image: string; imageAlt: string }>;
  };
  testimonials: {
    eyebrow: string;
    title: string;
    intro: string;
    demoIntro: string;
    feedbackPrompt: string;
    feedbackButton: string;
    formEyebrow: string;
    formTitle: string;
    formDescription: string;
    demos: Array<{ name: string; role: string; content: string }>;
  };
  contact: { eyebrow: string; title: string; description: string };
  footer: { name: string; subtitle: string; emailLabel: string; githubLabel: string; linkedinLabel: string; instagramLabel: string };
  seo: { title: string; description: string };
  projectsArchive: { eyebrow: string; title: string; intro: string; backLabel: string };
  projectDetail: {
    backLabel: string;
    pinnedLabel: string;
    caseStudyLabel: string;
    liveLabel: string;
    sourceLabel: string;
    docsLabel: string;
    snapshotLabel: string;
    overviewLabel: string;
    overviewTitle: string;
    reasonLabel: string;
    reasonTitle: string;
    challengeLabel: string;
    challengeTitle: string;
    approachLabel: string;
    approachTitle: string;
    capabilitiesLabel: string;
    capabilitiesTitle: string;
    resultLabel: string;
    resultTitle: string;
  };
};

const fallbackHero: HeroContent = {
  eyebrow: "Software engineer · India",
  name: "Deepak Sharma",
  role: "Full-stack Engineer | AI Builder | Problem Solver",
  copy: "I design and ship thoughtful digital products that turn complex workflows into clear, useful experiences.",
  primaryCta: "Explore selected work",
  image: "/assets/images/profile.png"
};

export const defaultSiteContent: SiteContent = {
  sections: { highlights: true, services: true, portfolio: true, github: true, about: true, testimonials: true, contact: true },
  navigation: { home: "Home", about: "How I work", services: "Services", portfolio: "Portfolio", testimonials: "Testimonials", contact: "Contact", cta: "Let's Work Together", ctaHref: "#contact" },
  heroImage: "/assets/images/profile.png",
  heroCtaHref: "#portfolio",
  highlights: ["Product-minded engineering", "Clear, measurable outcomes", "Built for real people"],
  services: {
    eyebrow: "What I Do",
    title: "Services",
    intro: "From your first idea to finding your next customer, I help bring the right digital solutions together for your business.",
    ctaLabel: "Let's talk about your project",
    ctaHref: "#contact",
    items: [
      { title: "Web Dev", description: "I design and build fast, responsive websites and web apps around your business—from a polished landing page to a full-featured online platform.", offerings: ["Business websites", "E-commerce", "Web applications"], image: "/assets/images/services/web-development.png", imageAlt: "Web developer designing a responsive website on a laptop and desktop." },
      { title: "Mobile App Dev", description: "I create intuitive mobile apps for iOS and Android, with a thoughtful user experience, reliable performance, and room to grow.", offerings: ["iOS & Android", "App design", "Cross-platform apps"], image: "/assets/images/services/mobile-development.png", imageAlt: "Mobile app developer building and testing an application on a smartphone." },
      { title: "AI-Powered Apps", description: "I bring practical AI to web and mobile products—from helpful assistants and document search to intelligent features tailored to your users.", offerings: ["Web & mobile AI", "AI assistants", "Custom integrations"], image: "/assets/images/services/ai-applications.png", imageAlt: "AI application developer connecting intelligent tools and product workflows." },
      { title: "Workflow Automation", description: "I connect your tools and automate repetitive work, helping enquiries, information, and day-to-day processes move with less manual effort.", offerings: ["Business workflows", "Tool integrations", "Task automation"], image: "/assets/images/services/workflow-automation.png", imageAlt: "Automated business workflow connecting email, approvals, and connected tools." },
      { title: "Digital Marketing & Ads", description: "I help you reach the right audience with focused digital campaigns, paid advertising, and landing pages designed to turn attention into enquiries.", offerings: ["Campaign planning", "Paid ads", "Conversion tracking"], image: "/assets/images/services/digital-marketing-seo.png", imageAlt: "Digital marketer reviewing paid campaign performance and audience analytics." },
      { title: "SEO & Search Visibility", description: "I improve how people find your business through technical SEO, on-page improvements, and a stronger foundation for long-term search visibility.", offerings: ["Technical SEO", "On-page SEO", "Search visibility"], image: "/assets/images/services/digital-marketing-seo.png", imageAlt: "Search optimization and keyword performance dashboards for improving search visibility." }
    ]
  },
  portfolio: {
    eyebrow: "Pinned work",
    title: "Products with a reason to exist.",
    intro: "These are the projects I want to put forward first. Open any project to explore its full story, documentation, source code, and live result.",
    allProjectsLabel: "View all projects"
  },
  github: { eyebrow: "Live GitHub", title: "Recent Developer Activity", linkLabel: "GitHub" },
  about: {
    eyebrow: "How I work",
    title: "Serious about the details that make software feel effortless.",
    copy: "I'm a software developer and B.Tech Computer Science graduate from IIIT Raichur. I blend product thinking, clean systems, and a bias for shipping—so an idea becomes a useful, maintainable application.",
    ctaLabel: "Discuss an idea",
    ctaHref: "#contact",
    steps: [
      { title: "Discover the real constraint", description: "I understand your goals, users, and constraints—so we focus on what really matters.", image: "/assets/images/work-process/discover-collaboration.png", imageAlt: "Two people discussing an idea while working together at a laptop." },
      { title: "Design the clear path", description: "I plan the solution, create clean designs and architecture, and align on the best approach.", image: "/assets/images/work-process/design-planning.png", imageAlt: "A developer thoughtfully reviewing a project dashboard and task flow." },
      { title: "Build and refine", description: "I develop, test, and iterate with your feedback to ship a polished, maintainable product.", image: "/assets/images/work-process/build-and-refine.png", imageAlt: "A developer building and refining an application with a deployment checklist and launch rocket." }
    ]
  },
  testimonials: {
    eyebrow: "Client feedback",
    title: "Good work is better when it makes a difference.",
    intro: "A few words from people I’ve worked with.",
    demoIntro: "Examples below show how approved feedback will appear. Real submissions are only published after admin approval.",
    feedbackPrompt: "Have we worked together? Your feedback is welcome.",
    feedbackButton: "Give your feedback",
    formEyebrow: "Your feedback",
    formTitle: "Tell me how it went.",
    formDescription: "Your submission will be reviewed by admin before it is shown publicly.",
    demos: [
      { name: "Jordan Lee", role: "Small business owner · Demo", content: "Communication was clear from the start, and I always knew what to expect next. The whole process felt thoughtful and well organized." },
      { name: "Maya Patel", role: "Startup founder · Demo", content: "I felt listened to throughout and appreciated how feedback was handled. It was a smooth, collaborative experience from beginning to end." },
      { name: "Chris Morgan", role: "Independent consultant · Demo", content: "The attention to detail and steady communication made working together easy. I felt confident and supported at every step." }
    ]
  },
  contact: {
    eyebrow: "Let's work together",
    title: "Have a problem worth solving?",
    description: "Tell me what is getting in your users' way. I'll help you turn it into a focused, high-quality digital product."
  },
  footer: { name: "Deepak Sharma", subtitle: "Software engineer · Product builder", emailLabel: "Email", githubLabel: "GitHub", linkedinLabel: "LinkedIn", instagramLabel: "Instagram" },
  seo: {
    title: "Deepak Sharma | Portfolio",
    description: "Deepak Sharma portfolio - software engineer, product builder, and full-stack developer."
  },
  projectsArchive: {
    eyebrow: "Project archive",
    title: "Work built to solve a specific problem.",
    intro: "Explore the thinking, implementation, documentation, source code, and live links behind each project.",
    backLabel: "Back to home"
  },
  projectDetail: {
    backLabel: "All projects",
    pinnedLabel: "Pinned project",
    caseStudyLabel: "Case study",
    liveLabel: "Visit live project",
    sourceLabel: "View source code",
    docsLabel: "Read documentation",
    snapshotLabel: "Project snapshot",
    overviewLabel: "Overview",
    overviewTitle: "What I built",
    reasonLabel: "The reason",
    reasonTitle: "Why this project",
    challengeLabel: "The challenge",
    challengeTitle: "The problem",
    approachLabel: "The approach",
    approachTitle: "The solution",
    capabilitiesLabel: "Capabilities",
    capabilitiesTitle: "Key features",
    resultLabel: "The result",
    resultTitle: "Outcome"
  }
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function stringOr(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function mergeRecord<T extends Record<string, unknown>>(defaults: T, value: unknown): T {
  const source = asRecord(value);
  return Object.fromEntries(Object.entries(defaults).map(([key, fallback]) => [
    key,
    typeof fallback === "string" ? stringOr(source[key], fallback) : source[key] ?? fallback
  ])) as T;
}

export function normalizeSiteContent(value: unknown): SiteContent {
  const source = asRecord(value);
  const sections = asRecord(source.sections);
  const arrayOfStrings = (candidate: unknown, fallback: string[]) =>
    Array.isArray(candidate) ? candidate.map(String) : fallback;
  const normalizeItems = <T extends Record<string, unknown>>(defaults: T[], candidate: unknown): T[] => {
    const items = Array.isArray(candidate) ? candidate : defaults;
    return items.map((item, index) => mergeRecord(defaults[index] || defaults[defaults.length - 1], item));
  };
  const services = asRecord(source.services);
  const about = asRecord(source.about);
  const testimonials = asRecord(source.testimonials);
  const result = {
    sections: Object.fromEntries(
      Object.entries(defaultSiteContent.sections).map(([key, fallback]) => [
        key,
        typeof sections[key] === "boolean" ? sections[key] : fallback
      ])
    ) as SiteContent["sections"],
    navigation: mergeRecord(defaultSiteContent.navigation, source.navigation),
    heroImage: stringOr(source.heroImage, defaultSiteContent.heroImage),
    heroCtaHref: stringOr(source.heroCtaHref, defaultSiteContent.heroCtaHref),
    highlights: arrayOfStrings(source.highlights, defaultSiteContent.highlights),
    services: {
      ...mergeRecord(defaultSiteContent.services, services),
      items: normalizeItems(defaultSiteContent.services.items, services.items)
    },
    portfolio: mergeRecord(defaultSiteContent.portfolio, source.portfolio),
    github: mergeRecord(defaultSiteContent.github, source.github),
    about: {
      ...mergeRecord(defaultSiteContent.about, about),
      steps: normalizeItems(defaultSiteContent.about.steps, about.steps)
    },
    testimonials: {
      ...mergeRecord(defaultSiteContent.testimonials, testimonials),
      demos: normalizeItems(defaultSiteContent.testimonials.demos, testimonials.demos)
    },
    contact: mergeRecord(defaultSiteContent.contact, source.contact),
    footer: mergeRecord(defaultSiteContent.footer, source.footer),
    seo: mergeRecord(defaultSiteContent.seo, source.seo),
    projectsArchive: mergeRecord(defaultSiteContent.projectsArchive, source.projectsArchive),
    projectDetail: mergeRecord(defaultSiteContent.projectDetail, source.projectDetail)
  };
  return result as SiteContent;
}

const fallbackProjects: ProjectContent[] = [
  {
    id: "finance-dashboard",
    title: "Personal Finance Intelligence",
    description: "A calm, actionable dashboard for daily financial decisions.",
    image: "",
    tags: ["Next.js", "Analytics", "UX"],
    liveUrl: "",
    githubUrl: "",
    featured: true,
    visible: true,
    githubRepoId: null,
    order: 1,
    visualClass: "dashboard-preview",
    why: "To make personal finance less intimidating and more actionable.",
    problem: "People saw numbers but lacked a clear view of spending patterns and next actions.",
    impact: "A focused dashboard that surfaces budgets, trends, and decisions at a glance.",
    overview: "A responsive personal-finance workspace that brings balances, budgets, transactions, and spend trends into one useful view.",
    solution: "I designed a hierarchy around decisions: what changed, what needs attention, and what to do next.",
    features: ["Monthly budget tracking", "Spending insights", "Goal progress", "Responsive dashboard"],
    docsUrl: ""
  },
  {
    id: "agency-website",
    title: "Growth Studio Platform",
    description: "A conversion-led web presence for a modern services business.",
    image: "",
    tags: ["Next.js", "Brand", "Performance"],
    liveUrl: "",
    githubUrl: "",
    featured: true,
    visible: true,
    githubRepoId: null,
    order: 2,
    visualClass: "agency-preview",
    why: "To give a service business a sharper way to explain its value.",
    problem: "A generic brochure site did not build trust or guide visitors to contact.",
    impact: "A focused story, clearer service paths, and an intentional conversion journey.",
    overview: "A high-performance marketing platform that presents a studio's offer as a clear narrative rather than a list of pages.",
    solution: "The information architecture pairs strong proof points with focused calls to action at each stage of the journey.",
    features: ["Service storytelling", "Conversion paths", "Case-study system", "Performance-first build"],
    docsUrl: ""
  },
  {
    id: "product-photography",
    title: "Secure Credential Network",
    description: "Verifiable academic records with a human-friendly product layer.",
    image: "",
    tags: ["Solidity", "React", "Web3"],
    liveUrl: "",
    githubUrl: "",
    featured: true,
    visible: true,
    githubRepoId: null,
    order: 3,
    visualClass: "product-preview",
    why: "To make credential verification trusted, fast, and portable.",
    problem: "Manual verification creates delays, fraud risk, and fragmented records.",
    impact: "A transparent verification flow that keeps ownership with the learner.",
    overview: "A decentralized credential verification flow for educational records, built to feel straightforward for institutions and learners.",
    solution: "The application combines an approachable React interface with tamper-evident smart-contract records.",
    features: ["Credential minting", "Public verification", "Wallet integration", "Fraud-resistant records"],
    docsUrl: ""
  },
  {
    id: "social-media-campaign",
    title: "AI Knowledge Assistant",
    description: "A retrieval-powered assistant for faster, grounded answers.",
    image: "",
    tags: ["Python", "LLMs", "FastAPI"],
    liveUrl: "",
    githubUrl: "",
    featured: true,
    visible: true,
    githubRepoId: null,
    order: 4,
    visualClass: "social-preview",
    why: "To help teams find reliable answers without hunting across documents.",
    problem: "Important knowledge was scattered, slow to search, and easy to miss.",
    impact: "A context-aware assistant that shortens research time and improves consistency.",
    overview: "A retrieval-powered assistant that helps teams ask questions of their internal knowledge without losing source context.",
    solution: "The system retrieves relevant material before generating a response, keeping answers focused and grounded.",
    features: ["Document retrieval", "Source-aware responses", "FastAPI backend", "Conversation context"],
    docsUrl: ""
  }
];

const fallbackSocials: SocialContent = {
  github: "https://github.com/AlexZx-05",
  linkedin: "https://www.linkedin.com/in/deepaksha1/",
  whatsapp: "https://wa.me/916203551365",
  instagram: "https://www.instagram.com/pinocchio_zx?igsh=d2tnYW11cmhzcG9w",
  email: "mailto:sharmad7930@gmail.com"
};

const fallbackSkills: SkillContent[] = [
  { id: "ui-ux", name: "UI/UX Design", level: 90, order: 1 },
  { id: "web-design", name: "Web Design", level: 85, order: 2 },
  { id: "content-creation", name: "Content Creation", level: 80, order: 3 },
  { id: "photography", name: "Photography", level: 75, order: 4 },
  { id: "video-editing", name: "Video Editing", level: 70, order: 5 }
];

const fallbackAvailability: AvailabilityContent = {
  text: "Available for work",
  status: "available",
  visible: false
};

function normalizeTags(tags: unknown): string[] {
  if (Array.isArray(tags)) {
    return tags.map(String).filter(Boolean);
  }

  if (typeof tags === "string") {
    return tags.split(",").map((tag) => tag.trim()).filter(Boolean);
  }

  return [];
}

function mapProject(project: Record<string, unknown>, index = 0): ProjectContent {
  const fallback = fallbackProjects[index % fallbackProjects.length];
  return {
    id: String(project._id || project.id || fallback.id),
    title: String(project.title || "Untitled Project"),
    description: String(project.description || ""),
    image: String(project.image || ""),
    tags: normalizeTags(project.tags),
    liveUrl: String(project.liveUrl || ""),
    githubUrl: String(project.githubUrl || ""),
    featured: project.featured !== false,
    visible: project.visible !== false,
    githubRepoId: typeof project.githubRepoId === "number" && Number.isSafeInteger(project.githubRepoId)
      ? project.githubRepoId
      : null,
    githubFullName: String(project.githubFullName || ""),
    stars: Number(project.stars || 0),
    language: String(project.language || ""),
    order: Number(project.order || index + 1),
    visualClass: String(project.visualClass || fallback.visualClass),
    why: String(project.why || ""),
    problem: String(project.problem || ""),
    impact: String(project.impact || ""),
    overview: String(project.overview || project.description || ""),
    solution: String(project.solution || project.impact || ""),
    features: normalizeTags(project.features),
    docsUrl: String(project.docsUrl || "")
  };
}

export async function getPortfolioContent() {
  try {
    const db = await getDb();
    const [hero, projects, skills, availability, socials, testimonials, siteContent] = await Promise.all([
      db.collection("hero").findOne({ key: "main" }),
      db.collection("projects").find({}).sort({ order: 1, createdAt: -1 }).toArray(),
      db.collection("skills").find({}).sort({ order: 1, createdAt: -1 }).toArray(),
      db.collection("settings").findOne({ key: "availability" }),
      db.collection("settings").findOne({ key: "socials" }),
      db.collection("testimonials").find({ status: "approved" }).sort({ createdAt: -1 }).limit(6).toArray(),
      db.collection("settings").findOne({ key: "siteContent" })
    ]);

    return {
      hero: hero
        ? {
            eyebrow: String(hero.eyebrow || fallbackHero.eyebrow),
            name: String(hero.name || fallbackHero.name),
            role: String(hero.role || fallbackHero.role),
            copy: String(hero.copy || fallbackHero.copy),
            primaryCta: String(hero.primaryCta || fallbackHero.primaryCta),
            image: String(hero.image || fallbackHero.image)
          }
        : fallbackHero,
      projects: projects
        .map((project, index) => mapProject(project, index))
        .filter((project) => project.visible && project.githubRepoId !== null),
      skills: skills.length
        ? skills.map((skill, index) => ({
            id: skill._id.toString(),
            name: String(skill.name || "Skill"),
            level: Number(skill.level || 0),
            order: Number(skill.order || index + 1)
          }))
        : fallbackSkills,
      availability: availability
        ? {
            text: String(availability.text || fallbackAvailability.text),
            status: String(availability.status || fallbackAvailability.status),
            visible: availability.visible !== false
          }
        : fallbackAvailability,
      socials: socials
        ? {
            github: String(socials.github || fallbackSocials.github),
            linkedin: String(socials.linkedin || fallbackSocials.linkedin),
            whatsapp: String(socials.whatsapp || fallbackSocials.whatsapp),
            instagram: String(socials.instagram || fallbackSocials.instagram),
            email: String(socials.email || fallbackSocials.email)
          }
        : fallbackSocials,
      testimonials: testimonials.map((testimonial) => ({
        id: testimonial._id.toString(),
        name: String(testimonial.name || ""),
        role: String(testimonial.role || ""),
        content: String(testimonial.content || ""),
        rating: Math.min(5, Math.max(1, Number(testimonial.rating) || 5)),
        createdAt: testimonial.createdAt instanceof Date ? testimonial.createdAt.toISOString() : String(testimonial.createdAt || "")
      })),
      siteContent: normalizeSiteContent(siteContent?.content)
    };
  } catch {
    return {
      hero: fallbackHero,
      projects: [],
      skills: fallbackSkills,
      availability: fallbackAvailability,
      socials: fallbackSocials,
      testimonials: [],
      siteContent: defaultSiteContent
    };
  }
}

export async function getPortfolioProject(id: string): Promise<ProjectContent | null> {
  if (!ObjectId.isValid(id)) return null;

  try {
    const db = await getDb();
    const project = await db.collection("projects").findOne({ _id: new ObjectId(id) });
    return project && project.visible !== false
      && typeof project.githubRepoId === "number"
      && Number.isSafeInteger(project.githubRepoId)
      ? mapProject(project)
      : null;
  } catch {
    return null;
  }
}
