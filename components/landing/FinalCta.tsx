import Link from "next/link";

// Source: homepage-zine.html — section.final (flips to black paper, candy stripe top)
export default function FinalCta() {
  return (
    <section
      aria-label="Get started"
      className="relative mt-10 px-8 py-40 text-center text-[color:var(--color-paper)]"
      style={{ background: "var(--ink)" }}
    >
      {/* Candy-stripe top edge */}
      <span
        aria-hidden="true"
        className="absolute left-0 right-0 top-0 h-3"
        style={{
          background:
            "repeating-linear-gradient(135deg, var(--highlight) 0 20px, transparent 20px 40px), var(--marker)",
        }}
      />
      <div className="mx-auto max-w-[768px]">
        <h2
          className="text-[color:var(--color-paper)] font-[900] leading-[0.92] tracking-[-0.04em]"
          style={{ fontFamily: "var(--font-archivo)", fontSize: "clamp(56px, 9vw, 120px)" }}
        >
          You&apos;re still{" "}
          <span
            className="inline-block bg-[color:var(--highlight)] px-3 text-[color:var(--color-ink)]"
            style={{
              boxDecorationBreak: "clone",
              WebkitBoxDecorationBreak: "clone",
            }}
          >
            reading.
          </span>
        </h2>
        <p
          className="mt-6 text-[color:var(--color-paper)]/80"
          style={{ fontFamily: "var(--font-display)", fontSize: 19 }}
        >
          Go build it. Five minutes. No signup. Live when you&apos;re done.
        </p>

        <Link
          href="/setup"
          className="mt-10 inline-flex items-center gap-3.5 border-[3px] border-[color:var(--color-paper)] bg-[color:var(--highlight)] px-10 py-5 text-[color:var(--color-ink)]"
          style={{
            fontFamily: "var(--font-archivo)",
            fontSize: 20,
            boxShadow: "8px 8px 0 var(--marker)",
          }}
        >
          Start Yours →
        </Link>

        <div
          className="mt-8 inline-block -rotate-2 rounded border-2 border-dashed border-[color:var(--highlight)] px-5 py-2.5 text-[color:var(--highlight)]"
          style={{ fontFamily: "var(--font-caveat)", fontWeight: 700, fontSize: 22 }}
        >
          open source · MIT · made at WPS
        </div>
      </div>
    </section>
  );
}
