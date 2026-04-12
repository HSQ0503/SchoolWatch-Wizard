import Image from "next/image";
import TapedScreenshot from "./TapedScreenshot";
import HandwrittenArrow from "./HandwrittenArrow";

// Source: homepage-zine.html — section.how
type Step = {
  n: string;
  title: string;
  body: string;
  src: string;
  annotation?: { label: string; arrow: "down-left" | "down-right" | "up-left" | "up-right" | "none"; rotate: number; className: string };
  rotation: number;
};

const STEPS: Step[] = [
  {
    n: "01",
    title: "Name your school.",
    body: "Mascot, city, academic year. The basics. Optional: drag in a logo.",
    src: "/screenshots/wizard/01-school.png",
    annotation: { label: "takes ~30s ↘", arrow: "none", rotate: -4, className: "absolute top-10 right-[40%]" },
    rotation: -1.5,
  },
  {
    n: "02",
    title: "Pick your palette.",
    body: "Two seed colors → eight zones. Click any zone on the live mockup to fine-tune. Dark mode auto-generates.",
    src: "/screenshots/wizard/02-colors.png",
    rotation: 1.5,
  },
  {
    n: "03",
    title: "Add your schedule.",
    body: "Regular days, block days, rotating days. Lunch waves handled. Friday half-day before finals? Yep.",
    src: "/screenshots/wizard/03-schedule.png",
    annotation: { label: "← weird schedules welcome", arrow: "none", rotate: 3, className: "absolute top-20 right-[35%]" },
    rotation: -1,
  },
  {
    n: "04",
    title: "Deploy.",
    body: "We send you a live URL and an email link to edit later. Done.",
    src: "/screenshots/wizard/04-deploy.png",
    rotation: 1,
  },
];

export default function HowItWorks() {
  return (
    <section id="how" aria-label="How it works" className="relative border-t border-dashed border-[color:var(--color-hairline)] px-8 py-28">
      <div className="mx-auto max-w-[1120px]">
        <p
          className="mb-4.5 text-[11px] uppercase text-[color:var(--color-ink-faded)]"
          style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.2em" }}
        >
          how it works
        </p>
        <h2
          className="text-[color:var(--color-ink)] font-[900] leading-[0.92] tracking-[-0.04em]"
          style={{
            fontFamily: "var(--font-archivo)",
            fontSize: "clamp(48px, 7vw, 88px)",
            maxWidth: "16ch",
          }}
        >
          Four screens.{" "}
          <span
            className="italic font-normal"
            style={{ fontFamily: "var(--font-display)" }}
          >
            No code.
          </span>{" "}
          No catch.
        </h2>
        <p
          className="mt-4.5 text-lg text-[color:var(--color-ink-soft)]"
          style={{ fontFamily: "var(--font-display)", maxWidth: "50ch" }}
        >
          A wizard asks you questions about your school. When you finish, it spins up a GitHub repo, builds a website, pushes it to Vercel, and texts you the URL.
        </p>

        <ol className="mt-20 grid gap-20">
          {STEPS.map((s) => (
            <li key={s.n} className="relative grid items-start gap-10 md:grid-cols-[140px_1fr_420px]">
              {/* Huge numeral */}
              <div
                aria-hidden="true"
                className="relative leading-[0.8] text-[color:var(--highlight)]"
                style={{
                  fontFamily: "var(--font-archivo)",
                  fontSize: 140,
                  WebkitTextStroke: "2px var(--ink)",
                }}
              >
                {s.n}
                <span
                  aria-hidden="true"
                  className="absolute bottom-2 left-2.5 right-2.5 h-[3px] -rotate-2 rounded-sm bg-[color:var(--color-marker)]"
                />
              </div>

              {/* Copy */}
              <div className="relative">
                <h3
                  className="text-[color:var(--color-ink)]"
                  style={{
                    fontFamily: "var(--font-archivo)",
                    fontSize: 30,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                  }}
                >
                  {s.title}
                </h3>
                <p
                  className="mt-3 text-[color:var(--color-ink-soft)]"
                  style={{ fontFamily: "var(--font-display)", fontSize: 17 }}
                >
                  {s.body}
                </p>
                {s.annotation && (
                  <HandwrittenArrow
                    label={s.annotation.label}
                    arrow="none"
                    rotate={s.annotation.rotate}
                    className={s.annotation.className}
                  />
                )}
              </div>

              {/* Thumbnail */}
              <TapedScreenshot rotation={s.rotation} tapes={[{ position: "top-left", color: "yellow" }]}>
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src={s.src}
                    alt={`SchoolWatch wizard step ${s.n}: ${s.title}`}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 100vw, 420px"
                  />
                </div>
              </TapedScreenshot>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
