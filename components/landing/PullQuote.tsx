import Highlight from "./Highlight";

// Source: homepage-zine.html — section.pq
export default function PullQuote() {
  return (
    <section aria-label="Identity quote" className="relative px-8 py-40 text-center">
      <div className="mx-auto max-w-[768px]">
        <span aria-hidden="true" className="mx-auto mb-12 block h-1 w-[60px] bg-[color:var(--color-marker)]" />
        <blockquote
          className="text-[color:var(--color-ink)] font-normal tracking-[-0.02em]"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(32px, 4.5vw, 52px)",
            lineHeight: 1.15,
            fontVariationSettings: '"opsz" 144',
          }}
        >
          Every school has <Highlight>one or two kids who build things.</Highlight>
          <span className="mt-2.5 block text-[color:var(--color-ink-faded)]">
            This is how you become one of them.
          </span>
        </blockquote>
        <cite
          className="mt-8 block not-italic text-[color:var(--color-ink-soft)]"
          style={{ fontFamily: "var(--font-caveat)", fontWeight: 700, fontSize: 22 }}
        >
          — the manifesto, basically
        </cite>
        <span aria-hidden="true" className="mx-auto mt-12 block h-1 w-[60px] bg-[color:var(--color-marker)]" />
      </div>
    </section>
  );
}
