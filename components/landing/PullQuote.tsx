import Reveal from "./Reveal";

export default function PullQuote() {
  return (
    <section aria-label="Identity quote" className="relative px-6 py-40">
      <Reveal>
        <div className="mx-auto max-w-3xl text-center">
        <span aria-hidden="true" className="mx-auto block h-px w-16 bg-[color:var(--color-accent)]" />
        <p className="mt-10 text-3xl font-bold leading-[1.15] tracking-[-0.02em] text-white sm:text-4xl md:text-[2.75rem]">
          Every school has one or two kids who build things.
          <br className="hidden sm:block" />{" "}
          <span className="text-[color:var(--color-body)]">
            This is how you become one of them.
          </span>
        </p>
        <span aria-hidden="true" className="mx-auto mt-10 block h-px w-16 bg-[color:var(--color-accent)]" />
        </div>
      </Reveal>
    </section>
  );
}
