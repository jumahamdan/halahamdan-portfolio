import { Mail, Linkedin, MapPin, GraduationCap } from "lucide-react";

export default function Contact() {
  return (
    <section id="contact" className="bg-beige py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="mb-2 text-center font-[family-name:var(--font-caveat)] text-2xl text-terracotta">
          Let&apos;s connect
        </p>
        <h2 className="mb-4 text-center font-[family-name:var(--font-varela-round)] text-3xl text-text sm:text-4xl">
          Get In Touch
        </h2>
        <p className="mx-auto mb-12 max-w-xl text-center text-lg text-text-muted">
          I&apos;m actively seeking elementary teaching positions in the
          Chicagoland area. I&apos;d love to hear from you!
        </p>

        <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
          <a
            href="mailto:hamdanhala93@gmail.com"
            className="clay-card flex cursor-pointer items-center gap-4 p-6 transition-colors hover:border-primary"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Mail size={24} className="text-primary" />
            </div>
            <div>
              <h3 className="font-[family-name:var(--font-varela-round)] text-sm font-bold text-text">
                Email
              </h3>
              <p className="text-sm text-text-muted">hamdanhala93@gmail.com</p>
            </div>
          </a>

          <a
            href="https://linkedin.com/in/halahamdan"
            target="_blank"
            rel="noopener noreferrer"
            className="clay-card flex cursor-pointer items-center gap-4 p-6 transition-colors hover:border-primary"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Linkedin size={24} className="text-primary" />
            </div>
            <div>
              <h3 className="font-[family-name:var(--font-varela-round)] text-sm font-bold text-text">
                LinkedIn
              </h3>
              <p className="text-sm text-text-muted">linkedin.com/in/halahamdan</p>
            </div>
          </a>

          <div className="clay-card flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-terracotta/10">
              <MapPin size={24} className="text-terracotta" />
            </div>
            <div>
              <h3 className="font-[family-name:var(--font-varela-round)] text-sm font-bold text-text">
                Location
              </h3>
              <p className="text-sm text-text-muted">
                Darien, IL — Chicagoland area
              </p>
            </div>
          </div>

          <div className="clay-card flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-accent/10">
              <GraduationCap size={24} className="text-accent" />
            </div>
            <div>
              <h3 className="font-[family-name:var(--font-varela-round)] text-sm font-bold text-text">
                Graduating
              </h3>
              <p className="text-sm text-text-muted">
                May 2026 — Lewis University
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
