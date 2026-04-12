"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import Arrow from "./Arrow";
import Reveal from "./Reveal";
import SectionDivider from "./SectionDivider";

export default function FinalCta() {
  const shouldReduce = useReducedMotion();

  return (
    <section
      aria-label="Get started"
      className="relative flex min-h-[65vh] items-center justify-center px-6 py-40"
      style={{
        background:
          "linear-gradient(180deg, #0a0a0a 0%, #0b0b0e 50%, #0a0a0a 100%)",
      }}
    >
      <SectionDivider />
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <h2
            className="text-4xl font-medium leading-[1.05] tracking-[-0.03em] text-white md:text-6xl font-[family-name:var(--font-display)]"
            style={{ fontVariationSettings: '"opsz" 144' }}
          >
            You&apos;re still reading.
            <br />
            <span className="text-[color:var(--color-body)]">Go build it.</span>
          </h2>
          <div className="relative mt-12 inline-block">
            {/* Ambient pulsing glow behind the button */}
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 h-14 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color:var(--color-accent)] opacity-20 blur-2xl"
              animate={shouldReduce ? undefined : { opacity: [0.2, 0.35, 0.2] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <Link
              href="/setup"
              className="group relative inline-flex items-center gap-2 rounded-lg bg-[color:var(--color-accent)] px-8 py-4 text-base font-semibold text-black transition-[filter] duration-150 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--color-accent)] focus-visible:outline-offset-2"
            >
              Start Yours <Arrow />
            </Link>
          </div>
          <p className="mt-6 text-sm text-[color:var(--color-body)]">
            Five minutes. No signup. Live when you&apos;re done.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
