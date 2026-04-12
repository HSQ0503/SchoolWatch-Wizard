import Image from "next/image";
import Reveal from "./Reveal";

type Step = {
  n: string;
  src: string;
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    n: "01",
    src: "/screenshots/wizard/01-school.png",
    title: "Name your school.",
    body: "Mascot, colors, academic year. The basics.",
  },
  {
    n: "02",
    src: "/screenshots/wizard/02-colors.png",
    title: "Pick your palette.",
    body: "Two seed colors, eight zones, dark mode included.",
  },
  {
    n: "03",
    src: "/screenshots/wizard/03-schedule.png",
    title: "Add your schedule.",
    body: "Simple, block, or rotating. Lunch waves handled.",
  },
  {
    n: "04",
    src: "/screenshots/wizard/04-deploy.png",
    title: "Deploy.",
    body: "We send you a live URL. Share it with your friends.",
  },
];

export default function WizardPreview() {
  return (
    <section aria-label="How it works" className="relative px-6 py-28">
      <Reveal>
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--color-label)]">
          How it works
        </p>
        <h2 className="mt-4 max-w-[22ch] text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-white md:text-5xl">
          Four screens. No code. No catch.
        </h2>

        <ol className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="rounded-xl border border-[color:var(--color-border-hairline)] bg-[color:var(--color-surface)] p-6"
            >
              <p className="font-mono text-sm font-semibold text-[color:var(--color-accent)]">
                {s.n}
              </p>
              <div className="relative mt-4 aspect-[4/3] w-full overflow-hidden rounded-md border border-[color:var(--color-border-hairline)] bg-black/40">
                <Image
                  src={s.src}
                  alt={`SchoolWatch wizard step ${s.n}: ${s.title}`}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
              <p className="mt-5 text-base font-semibold text-white">
                {s.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-body)]">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
      </Reveal>
    </section>
  );
}
