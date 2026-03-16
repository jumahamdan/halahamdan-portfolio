import Image from "next/image";
import { BookOpen, ArrowDown } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden bg-cream pt-16"
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute top-20 -left-32 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-terracotta/8 blur-3xl" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 md:flex-row md:gap-16">
          {/* Text content */}
          <div className="flex-1 text-center md:text-left">
            <p className="mb-3 font-[family-name:var(--font-caveat)] text-2xl text-terracotta">
              Welcome to my classroom
            </p>
            <h1 className="mb-4 font-[family-name:var(--font-varela-round)] text-4xl leading-tight text-text sm:text-5xl lg:text-6xl">
              Hi, I&apos;m{" "}
              <span className="text-primary">Hala Hamdan</span>
            </h1>
            <p className="mb-2 text-xl font-semibold text-text sm:text-2xl">
              Elementary Education Teacher
            </p>
            <p className="mb-8 max-w-lg text-lg leading-relaxed text-text-muted">
              Passionate about creating engaging, inclusive learning experiences
              for young minds. Currently student teaching 3rd grade mathematics
              at Stone Elementary School.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center md:justify-start">
              <a
                href="#tools"
                className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-6 text-base font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/30"
              >
                <BookOpen size={20} />
                Explore Learning Tools
              </a>
              <a
                href="#about"
                className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-beige-deep bg-warm-white px-6 text-base font-semibold text-text transition-all hover:border-primary hover:text-primary"
              >
                Learn About Me
              </a>
            </div>
          </div>

          {/* Photo */}
          <div className="relative flex-shrink-0">
            <div className="relative h-72 w-72 overflow-hidden rounded-2xl border-4 border-warm-white shadow-xl sm:h-80 sm:w-80 lg:h-96 lg:w-96">
              <Image
                src="/images/hamdan_hala_headshot_image.JPG"
                alt="Hala Hamdan, Elementary Education Teacher"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 640px) 288px, (max-width: 1024px) 320px, 384px"
              />
            </div>
            {/* Decorative accent */}
            <div className="absolute -right-3 -bottom-3 -z-10 h-full w-full rounded-2xl bg-primary/15" />
            <div className="absolute -right-6 -bottom-6 -z-20 h-full w-full rounded-2xl bg-terracotta/10" />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="mt-12 flex justify-center">
          <a
            href="#word-of-day"
            className="animate-bounce text-text-light transition-colors hover:text-primary"
            aria-label="Scroll to next section"
          >
            <ArrowDown size={24} />
          </a>
        </div>
      </div>
    </section>
  );
}
