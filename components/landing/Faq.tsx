import Reveal from "./Reveal";
import SectionDivider from "./SectionDivider";

type FaqItem = {
  q: string;
  a: string;
};

const ITEMS: FaqItem[] = [
  {
    q: "Is this actually free?",
    a: "Yes. Hosting is free. A custom domain like yourschool.com is optional — everything else is free.",
  },
  {
    q: "Do I need my principal's approval?",
    a: "No. You get a real URL like yourschool.vercel.app. Share it with friends. Show your principal when it's already working.",
  },
  {
    q: "My school has weird lunch waves, rotating days, or block schedules. Will it work?",
    a: "Yes. Lunch waves, rotating days, block schedules, after-school periods, per-wave overrides — all handled.",
  },
  {
    q: "Can I change things later?",
    a: "Yes. An email link lets you edit anything — events, colors, the whole schedule.",
  },
  {
    q: "What if someone at my school already tried this?",
    a: "They used a worse option. Build yours anyway — whichever one gets used wins.",
  },
];

export default function Faq() {
  return (
    <section
      aria-label="Frequently asked questions"
      className="relative px-6 py-28"
    >
      <SectionDivider />
      <Reveal>
        <div className="mx-auto max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--color-label)]">
            Questions you&apos;re about to ask
          </p>
          <h2
            className="mt-4 text-4xl font-medium leading-[1.05] tracking-[-0.03em] text-white md:text-5xl font-[family-name:var(--font-display)]"
            style={{ fontVariationSettings: '"opsz" 72' }}
          >
            Answered.
          </h2>

          <dl className="mt-14 divide-y divide-[color:var(--color-border-hairline)] border-y border-[color:var(--color-border-hairline)]">
            {ITEMS.map((item) => (
              <div key={item.q} className="grid gap-2 py-6 sm:grid-cols-[1fr_1.4fr] sm:gap-10">
                <dt className="text-base font-semibold text-white">{item.q}</dt>
                <dd className="text-sm leading-relaxed text-[color:var(--color-body)]">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Reveal>
    </section>
  );
}
