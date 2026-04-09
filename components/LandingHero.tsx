import Link from "next/link";

export default function LandingHero() {
  return (
    <div className="flex flex-col items-center px-4 py-24 text-center">
      <h1 className="max-w-3xl text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
        Your school&apos;s schedule,
        <br />
        <span className="text-gray-400">one click away</span>
      </h1>
      <p className="mt-6 max-w-xl text-lg text-gray-500">
        SchoolWatch gives your school a live bell schedule countdown, events calendar,
        and productivity tools. Set it up in 5 minutes — no coding required.
      </p>
      <div className="mt-10 flex gap-4">
        <Link
          href="/setup"
          className="rounded-xl bg-black px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-gray-800"
        >
          Create Your Dashboard
        </Link>
        <a
          href="https://lakerwatch.com"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-gray-300 px-8 py-3.5 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          See an Example
        </a>
      </div>
    </div>
  );
}
