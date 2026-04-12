import Link from "next/link";

export default function FinalCta() {
  return (
    <section className="relative flex min-h-[65vh] items-center justify-center px-6 py-32">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-white md:text-6xl">
          You&apos;re still reading.
          <br />
          <span className="text-[color:var(--color-body)]">Go build it.</span>
        </h2>
        <div className="mt-12">
          <Link
            href="/setup"
            className="inline-block rounded-lg bg-[color:var(--color-accent)] px-8 py-4 text-base font-semibold text-black transition-transform duration-150 hover:scale-[1.02]"
          >
            Start Yours →
          </Link>
        </div>
        <p className="mt-6 text-sm text-[color:var(--color-body)]">
          Takes about 5 minutes. No signup before you start.
        </p>
      </div>
    </section>
  );
}
