"use client";

import { useState } from "react";
import { ArrowLeft, ExternalLink, Bot, Sparkles, BookOpen, Zap, Palette, Monitor, GraduationCap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Resource {
  name: string;
  icon: LucideIcon;
  pricing: string;
  pricingType: "free" | "paid";
  description: string;
  features: string[];
  url: string;
  urlLabel: string;
  category: string;
}

const resources: Resource[] = [
  // AI Lesson Planning
  {
    name: "Chalkie",
    icon: Bot,
    pricing: "Free tier available",
    pricingType: "free",
    description: "AI-powered lesson generator that creates complete lesson plans, slides, and assessments aligned to your curriculum standards.",
    features: ["Standards-aligned lessons (Common Core, TEKS)", "Differentiated activities", "Export to PowerPoint, Google Slides, PDF"],
    url: "https://chalkie.ai",
    urlLabel: "Visit Chalkie",
    category: "ai-planning",
  },
  {
    name: "MagicSchool.ai",
    icon: Sparkles,
    pricing: "Free for teachers",
    pricingType: "free",
    description: "Suite of 60+ AI tools designed specifically for educators, from lesson planning to IEP goals and parent communication.",
    features: ["60+ specialized teacher tools", "IEP goal generator", "Communication templates"],
    url: "https://magicschool.ai",
    urlLabel: "Visit MagicSchool",
    category: "ai-planning",
  },
  {
    name: "Eduaide.AI",
    icon: BookOpen,
    pricing: "Free tier available",
    pricingType: "free",
    description: "Access 110+ educational resource types including lesson plans, worksheets, rubrics, and assessment materials.",
    features: ["110+ resource templates", "Multi-language support", "Export to multiple formats"],
    url: "https://eduaide.ai",
    urlLabel: "Visit Eduaide",
    category: "ai-planning",
  },
  // Grading & Feedback
  {
    name: "Brisk Teaching",
    icon: Zap,
    pricing: "Free Chrome extension",
    pricingType: "free",
    description: "Chrome extension that provides AI-powered feedback on student writing directly in Google Docs and Classroom.",
    features: ["Instant feedback generation", "Google Classroom integration", "Rubric-based assessment"],
    url: "https://briskteaching.com",
    urlLabel: "Get Brisk",
    category: "grading",
  },
  // Design Tools
  {
    name: "Canva for Education",
    icon: Palette,
    pricing: "Free for educators",
    pricingType: "free",
    description: "Create stunning presentations, worksheets, posters, and more with thousands of education-specific templates.",
    features: ["Premium features free for teachers", "Classroom collaboration", "Student accounts available"],
    url: "https://canva.com/education",
    urlLabel: "Visit Canva",
    category: "design",
  },
  {
    name: "Google Classroom",
    icon: Monitor,
    pricing: "Free",
    pricingType: "free",
    description: "Streamline assignments, boost collaboration, and foster communication with Google's classroom management platform.",
    features: ["Assignment management", "Google Workspace integration", "Parent communication"],
    url: "https://classroom.google.com",
    urlLabel: "Visit Google Classroom",
    category: "design",
  },
  // Student Tools
  {
    name: "Khanmigo",
    icon: GraduationCap,
    pricing: "Subscription",
    pricingType: "paid",
    description: "Khan Academy's AI tutor that guides students through problems without giving away answers, promoting genuine learning.",
    features: ["Socratic tutoring approach", "All Khan Academy subjects", "Teacher dashboard"],
    url: "https://khanmigo.ai",
    urlLabel: "Learn about Khanmigo",
    category: "student",
  },
];

const filters = [
  { key: "all", label: "All Tools" },
  { key: "ai-planning", label: "AI Lesson Planning" },
  { key: "grading", label: "Grading & Feedback" },
  { key: "design", label: "Design Tools" },
  { key: "student", label: "Student Tools" },
];

export default function ResourcesPage() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered =
    activeFilter === "all"
      ? resources
      : resources.filter((r) => r.category === activeFilter);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream pt-24 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <a
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft size={16} />
            Back to Home
          </a>

          <div className="mb-10 text-center">
            <p className="mb-2 font-[family-name:var(--font-caveat)] text-2xl text-terracotta">
              Tools I recommend
            </p>
            <h1 className="mb-4 font-[family-name:var(--font-varela-round)] text-3xl text-text sm:text-4xl">
              Teacher Tech Resources
            </h1>
            <p className="mx-auto max-w-xl text-lg text-text-muted">
              A curated collection of educational technology tools to enhance
              teaching and learning. From AI-powered lesson planning to student
              engagement tools.
            </p>
          </div>

          {/* Filter tabs */}
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`cursor-pointer rounded-full border-2 px-4 py-2 text-sm font-medium transition-all ${
                  activeFilter === f.key
                    ? "border-primary bg-primary text-white"
                    : "border-beige-deep bg-warm-white text-text hover:border-primary"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Resource cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((resource) => (
              <article key={resource.name} className="clay-card flex flex-col p-6">
                <div className="mb-3 flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <resource.icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-[family-name:var(--font-varela-round)] text-lg text-text">
                      {resource.name}
                    </h3>
                    <span
                      className={`text-xs font-semibold ${
                        resource.pricingType === "free"
                          ? "text-success"
                          : "text-accent"
                      }`}
                    >
                      {resource.pricing}
                    </span>
                  </div>
                </div>

                <p className="mb-4 flex-1 text-sm leading-relaxed text-text-muted">
                  {resource.description}
                </p>

                <ul className="mb-4 space-y-1">
                  {resource.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-text-muted"
                    >
                      <span className="mt-0.5 text-success">&#10003;</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 self-start rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
                >
                  {resource.urlLabel}
                  <ExternalLink size={14} />
                </a>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
