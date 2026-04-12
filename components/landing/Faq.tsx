import Highlight from "./Highlight";

// Source: homepage-zine.html — section.faq
const ITEMS: { q: string; a: React.ReactNode }[] = [
  {
    q: "Is this actually free?",
    a: (
      <>
        <Highlight>Yes.</Highlight> Hosting is free (Vercel&apos;s generous free tier). A custom domain like yourschool.com is optional. Everything else is free forever.
      </>
    ),
  },
  {
    q: "Do I need my principal's approval?",
    a: (
      <>
        No. You get a real URL like <Highlight>yourschool.vercel.app</Highlight>. Share it with friends. Show your principal once it&apos;s already working and they love it.
      </>
    ),
  },
  {
    q: "My school has weird lunch waves and rotating days.",
    a: "Rotating days, block schedules, lunch waves, per-wave bell overrides, after-school periods — all handled. If it's weirder than that, email me, I'll add it.",
  },
  {
    q: "Can I change things later?",
    a: "An email link lets you edit anything — events, colors, the whole schedule. Takes effect on redeploy (about 30 seconds).",
  },
  {
    q: "Someone at my school already tried this.",
    a: "They used a worse option. Build yours anyway — whichever one gets used wins.",
  },
];

export default function Faq() {
  return (
    <section id="faq" aria-label="Frequently asked questions" className="relative border-t border-dashed border-[color:var(--color-hairline)] px-8 py-28">
      <div className="mx-auto max-w-[900px]">
        <p
          className="text-[11px] uppercase text-[color:var(--color-ink-faded)] mb-4.5"
          style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.2em" }}
        >
          questions you&apos;re about to ask
        </p>
        <h2
          className="text-[color:var(--color-ink)] font-[900] leading-[0.9] tracking-[-0.04em]"
          style={{ fontFamily: "var(--font-archivo)", fontSize: "clamp(48px, 7vw, 88px)" }}
        >
          Answered.{" "}
          <span className="italic font-normal" style={{ fontFamily: "var(--font-display)" }}>
            Next.
          </span>
        </h2>

        <ol className="mt-14 list-none">
          {ITEMS.map((it, i) => (
            <li
              key={it.q}
              className="grid grid-cols-[60px_1fr] gap-6 border-b border-[color:var(--color-hairline)] py-8"
            >
              <div
                className="text-[color:var(--color-marker)] leading-none"
                style={{ fontFamily: "var(--font-archivo)", fontSize: 38 }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <div>
                <h4
                  className="text-[color:var(--color-ink)]"
                  style={{
                    fontFamily: "var(--font-archivo)",
                    fontSize: 22,
                    letterSpacing: "-0.01em",
                    lineHeight: 1.2,
                  }}
                >
                  {it.q}
                </h4>
                <p
                  className="mt-2.5 text-[color:var(--color-ink-soft)]"
                  style={{ fontFamily: "var(--font-display)", fontSize: 17, lineHeight: 1.5 }}
                >
                  {it.a}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
