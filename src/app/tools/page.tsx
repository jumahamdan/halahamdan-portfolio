import { ArrowLeft, Calculator, BookOpen, Plus, Divide, Clock, DollarSign } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Tool {
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  href: string;
  active: boolean;
}

const tools: Tool[] = [
  {
    name: "Multiplication Practice",
    description: "Master multiplication facts 0-12 with interactive tables, quizzes, and speed challenges.",
    icon: Calculator,
    color: "text-tool-purple",
    bgColor: "bg-tool-purple/10",
    href: "/tools/multiplication",
    active: true,
  },
  {
    name: "Sight Words Flash Cards",
    description: "220 Dolch/Fry sight words across Pre-K to 3rd grade with flashcards, quizzes, and spelling.",
    icon: BookOpen,
    color: "text-tool-green",
    bgColor: "bg-tool-green/10",
    href: "/tools/sight-words",
    active: true,
  },
  {
    name: "Addition & Subtraction",
    description: "Practice addition and subtraction facts with visual number lines and interactive exercises.",
    icon: Plus,
    color: "text-accent",
    bgColor: "bg-accent/10",
    href: "#",
    active: false,
  },
  {
    name: "Division Practice",
    description: "Build division fluency with visual grouping, fact families, and timed challenges.",
    icon: Divide,
    color: "text-primary",
    bgColor: "bg-primary/10",
    href: "#",
    active: false,
  },
  {
    name: "Telling Time",
    description: "Learn to read analog and digital clocks with interactive practice.",
    icon: Clock,
    color: "text-terracotta",
    bgColor: "bg-terracotta/10",
    href: "#",
    active: false,
  },
  {
    name: "Money Math",
    description: "Count coins, make change, and solve real-world money problems.",
    icon: DollarSign,
    color: "text-tool-green",
    bgColor: "bg-tool-green/10",
    href: "#",
    active: false,
  },
];

export default function ToolsPage() {
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
              Interactive & fun
            </p>
            <h1 className="mb-4 font-[family-name:var(--font-varela-round)] text-3xl text-text sm:text-4xl">
              Learning Tools
            </h1>
            <p className="mx-auto max-w-xl text-lg text-text-muted">
              Free, interactive tools designed for elementary students. All
              progress is saved locally — no accounts needed.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => {
              const Card = (
                <div
                  className={`clay-card flex h-full flex-col p-6 ${
                    tool.active ? "" : "opacity-60"
                  }`}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-xl ${tool.bgColor}`}
                    >
                      <tool.icon size={28} className={tool.color} />
                    </div>
                    {!tool.active && (
                      <span className="rounded-full bg-beige px-2.5 py-1 text-xs font-semibold text-text-muted">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <h2 className="mb-2 font-[family-name:var(--font-varela-round)] text-xl text-text">
                    {tool.name}
                  </h2>
                  <p className="flex-1 text-sm leading-relaxed text-text-muted">
                    {tool.description}
                  </p>
                  {tool.active && (
                    <div className="mt-4 text-sm font-semibold text-primary">
                      Start practicing &rarr;
                    </div>
                  )}
                </div>
              );

              return tool.active ? (
                <a key={tool.name} href={tool.href} className="block cursor-pointer">
                  {Card}
                </a>
              ) : (
                <div key={tool.name}>{Card}</div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
