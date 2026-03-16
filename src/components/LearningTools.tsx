import { Calculator, BookOpen, Plus, Divide, Clock, DollarSign } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Tool {
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  href: string;
  active: boolean;
  badges?: number;
}

const tools: Tool[] = [
  {
    name: "Multiplication Practice",
    description:
      "Master facts 0–12 with an interactive table, quizzes, and speed challenges. Spaced repetition and 18 badges track progress.",
    icon: Calculator,
    color: "text-tool-purple",
    bgColor: "bg-tool-purple/10",
    href: "/tools/multiplication",
    active: true,
    badges: 18,
  },
  {
    name: "Sight Words Flash Cards",
    description:
      "220 Dolch/Fry words across Pre-K to 3rd grade. Flashcards, quizzes, and spelling mode with audio pronunciation.",
    icon: BookOpen,
    color: "text-tool-green",
    bgColor: "bg-tool-green/10",
    href: "/tools/sight-words",
    active: true,
    badges: 17,
  },
  {
    name: "Addition & Subtraction",
    description:
      "Practice addition and subtraction facts with visual number lines and interactive exercises.",
    icon: Plus,
    color: "text-accent",
    bgColor: "bg-accent/10",
    href: "#",
    active: false,
  },
  {
    name: "Division Practice",
    description:
      "Build division fluency with visual grouping, fact families, and timed challenges.",
    icon: Divide,
    color: "text-primary",
    bgColor: "bg-primary/10",
    href: "#",
    active: false,
  },
  {
    name: "Telling Time",
    description:
      "Learn to read analog and digital clocks with interactive practice and real-world scenarios.",
    icon: Clock,
    color: "text-terracotta",
    bgColor: "bg-terracotta/10",
    href: "#",
    active: false,
  },
  {
    name: "Money Math",
    description:
      "Count coins, make change, and solve real-world money problems with visual currency.",
    icon: DollarSign,
    color: "text-tool-green",
    bgColor: "bg-tool-green/10",
    href: "#",
    active: false,
  },
];

export default function LearningTools() {
  return (
    <section id="tools" className="bg-cream py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="mb-2 text-center font-[family-name:var(--font-caveat)] text-2xl text-terracotta">
          Interactive & fun
        </p>
        <h2 className="mb-4 text-center font-[family-name:var(--font-varela-round)] text-3xl text-text sm:text-4xl">
          Learning Tools
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-text-muted">
          Free, interactive tools designed for elementary students. All progress
          is saved locally on your device — no accounts needed.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <div key={tool.name} className="relative">
              {tool.active ? (
                <a href={tool.href} className="block cursor-pointer">
                  <ToolCard tool={tool} />
                </a>
              ) : (
                <ToolCard tool={tool} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <div
      className={`clay-card flex h-full flex-col p-6 ${
        tool.active ? "" : "opacity-60"
      }`}
    >
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${tool.bgColor}`}
        >
          <tool.icon size={24} className={tool.color} />
        </div>
        {tool.active ? (
          tool.badges && (
            <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent-dark">
              {tool.badges} badges
            </span>
          )
        ) : (
          <span className="rounded-full bg-beige px-2.5 py-1 text-xs font-semibold text-text-muted">
            Coming Soon
          </span>
        )}
      </div>
      <h3 className="mb-2 font-[family-name:var(--font-varela-round)] text-lg text-text">
        {tool.name}
      </h3>
      <p className="flex-1 text-sm leading-relaxed text-text-muted">
        {tool.description}
      </p>
      {tool.active && (
        <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary">
          Start practicing
          <span aria-hidden="true">&rarr;</span>
        </div>
      )}
    </div>
  );
}
