"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "motion/react";
import Arrow from "./Arrow";

const container: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function Hero() {
  const shouldReduce = useReducedMotion();

  return (
    <section
      aria-label="Hero"
      className="relative overflow-hidden px-6 pb-24 pt-20 sm:pt-28"
    >
      {/* Breathing radial glow behind headline. rgba(255,99,99,…) matches --color-accent. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-24 h-[520px] w-[820px] -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(255,99,99,0.18), transparent 70%)" }}
        animate={
          shouldReduce
            ? undefined
            : { opacity: [0.75, 1, 0.75] }
        }
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[1.1fr_1fr] md:gap-16"
        initial={shouldReduce ? false : "hidden"}
        animate="visible"
        variants={container}
      >
        {/* Left: copy + CTAs */}
        <div className="relative">
          <motion.p
            variants={item}
            className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--color-label)]"
          >
            SchoolWatch
          </motion.p>
          <motion.h1
            variants={item}
            className="mt-5 max-w-[14ch] text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:text-6xl md:text-[4.25rem] font-[family-name:var(--font-display)]"
            style={{ fontVariationSettings: '"opsz" 144' }}
          >
            Build the schedule app your school never made.
          </motion.h1>
          <motion.p
            variants={item}
            className="mt-6 max-w-md text-base leading-relaxed text-[color:var(--color-body)]"
          >
            Pick colors. Set the schedule. Hit deploy. Five minutes, no code, free.
          </motion.p>

          <motion.div variants={item} className="mt-10 flex flex-wrap items-center gap-5">
            <Link
              href="/setup"
              className="group inline-flex items-center gap-2 rounded-lg bg-[color:var(--color-accent)] px-6 py-3 text-sm font-semibold text-black transition-[filter] duration-150 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--color-accent)] focus-visible:outline-offset-2"
            >
              Start Yours <Arrow />
            </Link>
            <a
              href="https://lakerwatch.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--color-accent)] focus-visible:outline-offset-2"
            >
              See LakerWatch <Arrow />
            </a>
          </motion.div>

          <motion.ul variants={item} className="mt-8 flex flex-wrap gap-2">
            {["Free", "5 minutes", "No code"].map((label) => (
              <li
                key={label}
                className="rounded-full border border-[color:var(--color-border-hairline)] px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-[color:var(--color-label)]"
              >
                {label}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Right: screenshot window */}
        <motion.div variants={item} className="relative">
          <div
            className="relative aspect-[4/3] w-full rotate-[2deg] rounded-xl border border-[color:var(--color-border-hairline)] bg-[color:var(--color-surface)] shadow-2xl"
            style={{ boxShadow: "0 40px 120px -20px rgba(255,99,99,0.15)" }}
          >
            <div
              aria-hidden="true"
              className="flex items-center gap-1.5 border-b border-[color:var(--color-border-hairline)] px-3 py-2.5"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="ml-3 font-mono text-[10px] text-white/30">
                lakerwatch.com
              </span>
            </div>
            <div className="relative h-[calc(100%-2.25rem)] w-full overflow-hidden">
              <Image
                src="/screenshots/lakerwatch-dashboard.png"
                alt="LakerWatch dashboard at Windermere Prep, showing a live countdown ring, the current period, and the school calendar."
                fill
                className="object-cover object-top"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
