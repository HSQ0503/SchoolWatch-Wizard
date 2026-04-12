"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  type Variants,
} from "motion/react";
import SectionDivider from "./SectionDivider";

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

const row: Variants = {
  hidden: { opacity: 0.5 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const numeral: Variants = {
  hidden: { color: "rgba(255,255,255,0.3)" },
  visible: {
    color: "#ffffff",
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

const thumb: Variants = {
  hidden: { opacity: 0.5, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const VIEWPORT = { once: true, amount: 0.55 } as const;

export default function WizardPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 70%", "end 30%"],
  });

  return (
    <section aria-label="How it works" className="relative px-6 py-28">
      <SectionDivider />
      <div className="mx-auto max-w-4xl">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--color-label)]">
          How it works
        </p>
        <h2
          className="mt-4 max-w-[22ch] text-4xl font-medium leading-[1.05] tracking-[-0.03em] text-white md:text-5xl font-[family-name:var(--font-display)]"
          style={{ fontVariationSettings: '"opsz" 72' }}
        >
          Four screens. No code. No catch.
        </h2>

        <div ref={ref} className="relative mt-20">
          {/* Vertical progress track with scroll-tied crimson fill */}
          <div
            aria-hidden="true"
            className="absolute left-4 top-0 h-full w-[2px] bg-[color:var(--color-border-hairline)] sm:left-6"
          >
            <motion.div
              style={{
                scaleY: shouldReduce ? 1 : scrollYProgress,
                transformOrigin: "top",
              }}
              className="h-full w-full bg-[color:var(--color-accent)]"
            />
          </div>

          <ol className="space-y-20">
            {STEPS.map((s) => (
              <li key={s.n}>
                <motion.div
                  initial={shouldReduce ? false : "hidden"}
                  whileInView={shouldReduce ? undefined : "visible"}
                  viewport={VIEWPORT}
                  variants={row}
                  className="grid grid-cols-[auto_1fr] gap-6 pl-12 sm:gap-10 sm:pl-16"
                >
                  <motion.p
                    variants={numeral}
                    className="-ml-12 w-12 text-right font-mono text-3xl font-semibold leading-none text-white sm:-ml-16 sm:w-16 sm:text-4xl font-[family-name:var(--font-display)]"
                    style={{ fontVariationSettings: '"opsz" 72' }}
                  >
                    {s.n}
                  </motion.p>

                  <div>
                    <motion.div
                      variants={thumb}
                      style={{ willChange: "transform" }}
                      className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-[color:var(--color-border-hairline)] bg-black/40"
                    >
                      <Image
                        src={s.src}
                        alt={`SchoolWatch wizard step ${s.n}: ${s.title}`}
                        fill
                        className="object-cover object-top"
                        sizes="(max-width: 640px) 100vw, 640px"
                      />
                    </motion.div>
                    <p className="mt-5 text-xl font-semibold text-white">
                      {s.title}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-body)]">
                      {s.body}
                    </p>
                  </div>
                </motion.div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
