
import {
  GraduationCap,
  Globe,
  Heart,
  Monitor,
  Award,
  Blocks,
  Users,
  BarChart3,
  Brain,
  Download,
} from "lucide-react";

const highlights = [
  {
    icon: GraduationCap,
    title: "B.A. Elementary Education",
    description: "Lewis University — 3.72 GPA, Dean's List",
  },
  {
    icon: Globe,
    title: "Bilingual Educator",
    description: "Fluent in English & Arabic",
  },
  {
    icon: Monitor,
    title: "Tech-Integrated Teaching",
    description: "SMART Board, i-Ready, Nearpod, Google Workspace",
  },
  {
    icon: Heart,
    title: "Inclusive Classrooms",
    description: "Differentiated instruction for IEP, 504 & ELL students",
  },
  {
    icon: Award,
    title: "Triple Endorsement",
    description: "Elementary Ed, ESL, Learning Behavior Specialist I",
  },
];

const teachingApproach = [
  {
    icon: Blocks,
    title: "CRA Progression",
    description:
      "Concrete manipulatives first, then representational models, then abstract formulas — grounded in Bruner's research.",
  },
  {
    icon: Users,
    title: "Gradual Release",
    description:
      "I Do, We Do, You Do Together, You Do Alone — building confidence at every step before moving to independence.",
  },
  {
    icon: BarChart3,
    title: "Data-Driven Decisions",
    description:
      "Exit tickets, quizzes, and observation checklists inform next-day instruction. Multiple data points, not just one test.",
  },
  {
    icon: Brain,
    title: "Differentiation in Action",
    description:
      "Manipulatives and flexible grouping for ADHD learners, visual models and explicit vocabulary for ELL students, extension activities for advanced students.",
  },
];

const timeline = [
  {
    year: "2026",
    role: "Student Teacher, 3rd Grade Math",
    place: "Stone Elementary School",
    current: true,
  },
  {
    year: "2025",
    role: "Field Experience, 3rd Grade",
    place: "Furqaan Academy",
  },
  {
    year: "2023",
    role: "Field Experience, 3rd Grade Literacy",
    place: "River View Elementary",
  },
  {
    year: "2020–21",
    role: "Educational Instructor",
    place: "Kumon North America",
  },
  {
    year: "2017–20",
    role: "Early Childhood Educator",
    place: "Guiding Hands Academy",
  },
];

export default function About() {
  return (
    <section id="about" className="bg-beige py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="mb-2 text-center font-[family-name:var(--font-caveat)] text-2xl text-terracotta">
          Get to know me
        </p>
        <h2 className="mb-12 text-center font-[family-name:var(--font-varela-round)] text-3xl text-text sm:text-4xl">
          About Me
        </h2>

        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          {/* Left: Photo + Story */}
          <div className="flex-1">
            <div className="clay-card mb-8 overflow-hidden">
              <img
                src="/images/hamdan_hala_profile_image.jpg"
                alt="Hala Hamdan in a classroom setting"
                className="h-auto w-full object-cover"
              />
            </div>

            <div className="clay-card p-6">
              <p className="mb-4 text-lg leading-relaxed text-text-muted">
                Born and raised in <strong className="text-text">Jerusalem</strong>,
                I moved to the United States in 2016. Navigating a new language
                and education system firsthand shaped my deep commitment to
                supporting diverse learners.
              </p>
              <p className="text-lg leading-relaxed text-text-muted">
                My teaching philosophy centers on meeting every student where
                they are — using{" "}
                <strong className="text-text">hands-on manipulatives</strong>,{" "}
                <strong className="text-text">visual models</strong>, and{" "}
                <strong className="text-text">gradual release</strong>{" "}
                (I Do, We Do, You Do) to move students from concrete
                understanding to independent mastery.
              </p>
            </div>

            {/* Resume download */}
            <a
              href="/Hamdan_Hala_Resume.docx"
              download
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              <Download size={18} />
              Download Resume
            </a>
          </div>

          {/* Right: Highlights + Timeline */}
          <div className="flex-1">
            {/* Highlights grid */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="clay-card flex items-start gap-3 p-4"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-[family-name:var(--font-varela-round)] text-sm font-bold text-text">
                      {item.title}
                    </h3>
                    <p className="text-sm text-text-muted">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="clay-card p-6">
              <h3 className="mb-4 font-[family-name:var(--font-varela-round)] text-lg text-text">
                Teaching Journey
              </h3>
              <div className="space-y-4">
                {timeline.map((item) => (
                  <div key={item.role} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          item.current ? "bg-accent" : "bg-primary/40"
                        }`}
                      />
                      <div className="w-0.5 flex-1 bg-beige" />
                    </div>
                    <div className="pb-4">
                      <p className="text-xs font-semibold text-primary">
                        {item.year}
                        {item.current && (
                          <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent-dark">
                            Current
                          </span>
                        )}
                      </p>
                      <p className="font-semibold text-text">{item.role}</p>
                      <p className="text-sm text-text-muted">{item.place}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Teaching Approach — from TWS */}
        <div className="mt-16">
          <p className="mb-2 text-center font-[family-name:var(--font-caveat)] text-2xl text-terracotta">
            From my Teacher Work Sample
          </p>
          <h3 className="mb-8 text-center font-[family-name:var(--font-varela-round)] text-2xl text-text sm:text-3xl">
            My Teaching Approach
          </h3>

          <div className="grid gap-6 sm:grid-cols-2">
            {teachingApproach.map((item) => (
              <div
                key={item.title}
                className="clay-card flex items-start gap-4 p-6"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-terracotta/10">
                  <item.icon size={24} className="text-terracotta" />
                </div>
                <div>
                  <h4 className="mb-1 font-[family-name:var(--font-varela-round)] text-lg text-text">
                    {item.title}
                  </h4>
                  <p className="text-sm leading-relaxed text-text-muted">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* TWS Quote */}
          <blockquote className="mx-auto mt-8 max-w-3xl rounded-xl border-l-4 border-terracotta bg-warm-white p-6">
            <p className="text-lg leading-relaxed text-text-muted italic">
              &ldquo;Using Bruner&rsquo;s CRA model, students first explored multiplication
              through physical counters and arrays, then transitioned to drawing
              area models, and finally applied the standard algorithm — each
              stage building on the last so no student was left behind.&rdquo;
            </p>
            <footer className="mt-3 text-sm font-semibold text-terracotta">
              — Hala Hamdan, Teacher Work Sample
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
