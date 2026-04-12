import Image from "next/image";
import TapedScreenshot from "./TapedScreenshot";
import MarginNote from "./MarginNote";

// Source: homepage-zine.html — section.showcase
export default function Showcase() {
  return (
    <section id="showcase" aria-label="LakerWatch showcase" className="relative px-8 py-28">
      <div className="mx-auto max-w-[1120px]">
        <p
          className="text-[11px] uppercase text-[color:var(--color-ink-faded)] mb-4.5"
          style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.2em" }}
        >
          exhibit a · live at windermere prep
        </p>
        <h2
          className="text-[color:var(--color-ink)] font-[900] leading-[0.95] tracking-[-0.03em]"
          style={{
            fontFamily: "var(--font-archivo)",
            fontSize: "clamp(40px, 6vw, 72px)",
            maxWidth: "18ch",
          }}
        >
          A real one,{" "}
          <span
            className="italic font-normal"
            style={{
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.01em",
            }}
          >
            already
          </span>{" "}
          running.
        </h2>

        <div className="mt-16 grid items-start gap-10 md:grid-cols-[1.5fr_1fr]">
          <TapedScreenshot
            rotation={-1.5}
            tapes={[
              { position: "top-left", color: "yellow" },
              { position: "top-right", color: "red" },
            ]}
          >
            <div className="relative aspect-[16/10] w-full">
              <Image
                src="/screenshots/lakerwatch-dashboard.png"
                alt="LakerWatch dashboard at Windermere Prep showing the countdown ring, current period, and upcoming events."
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, 660px"
                priority
              />
            </div>
          </TapedScreenshot>

          <div className="pt-5">
            <MarginNote n={1} title="The countdown ring.">
              Every kid at WPS glances at this between classes. That&apos;s the feature.
            </MarginNote>
            <MarginNote n={2} title={'"It\'s Friday / 3rd Period."'}>
              Knows the day. Knows the period. Handles weird schedules (half-days, pep rallies, &quot;Monday is a Wednesday&quot;).
            </MarginNote>
            <MarginNote n={3} title="Your school's colors.">
              Eight zones, dark mode included. Not a palette — your actual logo-matched brand.
            </MarginNote>
            <a
              href="https://lakerwatch.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block border-b-2 border-dashed border-[color:var(--color-marker)] pb-0.5 text-[color:var(--color-marker)] no-underline"
              style={{ fontFamily: "var(--font-caveat)", fontWeight: 700, fontSize: 22 }}
            >
              see lakerwatch.com →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
