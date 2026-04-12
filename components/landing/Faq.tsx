type FaqItem = {
  q: string;
  a: string;
};

const ITEMS: FaqItem[] = [
  {
    q: "Is this actually free?",
    a: "Yes. Hosting is free on Vercel. The only paid thing is if you want a custom domain like yourschool.com — that's optional and you buy it yourself.",
  },
  {
    q: "Do I need my principal's approval?",
    a: "No. You get a real URL like yourschool.vercel.app, send it to your friends, and it spreads on its own. You can show your principal later if you want.",
  },
  {
    q: "My school has weird lunch waves, rotating days, or block schedules. Will it work?",
    a: "Yes. The wizard handles all three, plus after-school periods and day-type overrides per wave.",
  },
  {
    q: "Can I change things later?",
    a: "Yes. You'll get an email link that lets you edit anything — add events, change colors, update the schedule.",
  },
  {
    q: "What if someone at my school already tried this?",
    a: "They probably used a worse option. You can still build yours and share it — whichever one gets used wins.",
  },
];

export default function Faq() {
  return (
    <section className="relative px-6 py-28">
      <div className="mx-auto max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--color-label)]">
          Questions you&apos;re about to ask
        </p>
        <h2 className="mt-4 text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-white md:text-5xl">
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
    </section>
  );
}
