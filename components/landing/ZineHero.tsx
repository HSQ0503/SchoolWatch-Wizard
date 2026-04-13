"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "motion/react";
import Highlight from "./Highlight";
import HandwrittenArrow from "./HandwrittenArrow";
import Polaroid from "./Polaroid";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// Source: homepage-zine.html — section.hero + .hero-photos + .signals
export default function ZineHero() {
  const reduce = useReducedMotion();
  return (
    <section aria-label="Hero" className="relative px-8 pb-24 pt-20 sm:pt-28 overflow-hidden">
      <motion.div
        initial={reduce ? false : "hidden"}
        animate="visible"
        variants={container}
        className="relative max-w-[1120px] mx-auto lg:min-h-[500px]"
      >
        <div className="relative z-10 lg:max-w-[640px]">
          <motion.p
            variants={item}
            className="text-[11px] uppercase text-[color:var(--color-ink-faded)] mb-6"
            style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.22em" }}
          >
            a free tool · by students · for students
          </motion.p>

          <motion.h1
            variants={item}
            className="text-[color:var(--color-ink)] font-[900] leading-[0.92] tracking-[-0.04em]"
            style={{
              fontFamily: "var(--font-archivo)",
              fontSize: "clamp(48px, 7.4vw, 96px)",
              maxWidth: "13ch",
            }}
          >
            Make your school&apos;s <Highlight>schedule site</Highlight>{" "}
            <span
              className="italic font-normal"
              style={{
                fontFamily: "var(--font-display)",
                fontVariationSettings: '"opsz" 144',
                letterSpacing: "-0.02em",
              }}
            >
              not suck.
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-8 text-lg leading-[1.55] text-[color:var(--color-ink-soft)]"
            style={{ fontFamily: "var(--font-display)", maxWidth: "42ch" }}
          >
            Pick colors. Set the bells. Hit deploy. You get a real live URL you can text to your friends — in about five minutes. No principal approval required.
          </motion.p>

          <motion.div variants={item} className="mt-10 flex flex-wrap items-center gap-8">
            <Link
              href="/setup"
              className="group inline-flex items-center gap-2.5 border-2 border-[color:var(--color-ink)] bg-[color:var(--color-ink)] px-7 py-4 text-[color:var(--color-paper)] shadow-[6px_6px_0_var(--highlight)] transition-[transform,box-shadow] duration-150 ease-out will-change-transform hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0_var(--highlight)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-[0_0_0_var(--highlight)] active:duration-75"
              style={{
                fontFamily: "var(--font-archivo)",
                fontSize: 16,
              }}
            >
              Start Yours
              <span className="text-[22px] leading-[0] transition-transform duration-150 ease-out group-hover:translate-x-1 group-active:translate-x-1.5">
                →
              </span>
            </Link>
            <a
              href="https://lakerwatch.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 text-[13px] uppercase underline underline-offset-4 decoration-[1.5px] text-[color:var(--color-ink)] transition-colors duration-150 hover:text-[color:var(--color-marker)] hover:decoration-[color:var(--color-marker)] hover:[text-decoration-style:wavy]"
              style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.14em" }}
            >
              See LakerWatch
              <span className="inline-block transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                ↗
              </span>
            </a>
          </motion.div>
        </div>

        {/* Photo collage — stacks below text on mobile, floats right inside hero on lg+ */}
        <motion.div
          variants={item}
          className="relative mt-16 h-[660px] w-full sm:h-[660px] lg:mt-0 lg:absolute lg:right-[-80px] lg:top-4 lg:h-[420px] lg:w-[530px]"
        >
          <Polaroid
            tape
            rotation={-5}
            caption="the live one at WPS"
            className="absolute left-[4%] top-0 w-[260px] h-[195px] sm:w-[280px] sm:h-[205px] lg:left-0 lg:w-[240px] lg:h-[180px] z-[3]"
          >
            <div className="flex h-full w-full flex-col p-3.5 text-white" style={{ background: "linear-gradient(135deg,#1a2a4a,#2a3a6a)" }}>
              <div className="text-[10px] uppercase tracking-[0.15em] opacity-70">Now</div>
              <div className="mt-5 text-[42px] font-[900] tracking-[-0.03em]" style={{ fontFamily: "var(--font-archivo)" }}>3rd</div>
              <div className="text-[10px] uppercase tracking-[0.15em] opacity-60">period · 23:41 left</div>
            </div>
          </Polaroid>
          <Polaroid
            rotation={6}
            className="absolute right-[4%] top-[245px] w-[220px] h-[170px] sm:w-[240px] sm:h-[180px] lg:left-0 lg:right-auto lg:top-[225px] lg:w-[230px] lg:h-[170px] z-[2]"
          >
            <div className="flex h-full w-full flex-col justify-end p-3.5 text-white" style={{ background: "#8b2635" }}>
              <div className="text-[24px] leading-none" style={{ fontFamily: "var(--font-archivo)" }}>IT&apos;S FRIDAY.</div>
              <div className="mt-1.5 text-[11px] opacity-85">regular day · lunch wave B</div>
            </div>
          </Polaroid>
          <Polaroid
            rotation={-2}
            className="absolute left-[24%] top-[475px] w-[220px] h-[165px] sm:w-[235px] sm:h-[175px] lg:left-[280px] lg:top-[-40px] lg:w-[240px] lg:h-[180px] z-[4]"
          >
            <div className="h-full w-full p-3.5 text-[color:var(--color-ink)]" style={{ background: "var(--paper)" }}>
              <div className="text-[10px] uppercase tracking-[0.15em] opacity-50">This week</div>
              <div className="mt-2 grid grid-cols-5 gap-0.5">
                {["M","T","W","T","F"].map((d, i) => (
                  <div
                    key={i}
                    className={`h-[18px] rounded-[2px] text-center text-[9px] leading-[18px] ${
                      i === 4 ? "bg-[color:var(--color-ink)] text-[color:var(--highlight)] font-[900]" : "bg-black/5 text-[color:var(--color-ink-faded)]"
                    }`}
                  >
                    {d}
                  </div>
                ))}
              </div>
              <div className="mt-2.5 text-[10px]" style={{ fontFamily: "var(--font-mono)" }}>
                <div className="flex justify-between border-b border-dashed border-black/10 py-0.5">1st · english<span>8:00</span></div>
                <div className="flex justify-between border-b border-dashed border-black/10 py-0.5">2nd · physics<span>8:55</span></div>
                <div className="flex justify-between border-b border-dashed border-black/10 py-0.5">3rd · history<span>9:50</span></div>
              </div>
            </div>
          </Polaroid>
        </motion.div>

        {/* Hand-drawn "free & open source" annotation */}
        <HandwrittenArrow
          label="free & open source"
          arrow="down-left"
          rotate={4}
          className="absolute right-[6%] top-5 lg:right-[460px] lg:top-2 z-20"
        />
      </motion.div>
      {/* Hidden ref for next Image so build picks it up even though we use bg */}
      <div className="hidden">
        <Image src="/screenshots/lakerwatch-dashboard.png" alt="" width={1} height={1} />
      </div>
    </section>
  );
}
