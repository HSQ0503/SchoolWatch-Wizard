const features = [
  {
    title: "Live Countdown Timer",
    description:
      "Students see exactly how much time is left in the current period with a beautiful circular progress ring.",
  },
  {
    title: "Smart Schedule",
    description:
      "Supports simple schedules, block schedules, and rotating days. Automatically detects the right schedule for today.",
  },
  {
    title: "Lunch Waves",
    description:
      "If your school has different lunch times for different grades, students can toggle their wave and see the right schedule.",
  },
  {
    title: "Events Calendar",
    description:
      "Holidays, breaks, early dismissals, and school events — all in one place with a clean calendar view.",
  },
  {
    title: "Productivity Tools",
    description:
      "Pomodoro timer, Wordle, to-do list, and group randomizer to keep students focused.",
  },
  {
    title: "Works Everywhere",
    description:
      "Mobile-friendly, dark mode, fast loading. Students can add it to their home screen like an app.",
  },
];

export default function LandingFeatures() {
  return (
    <section className="px-4 pb-24">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-gray-200 p-6"
            >
              <h3 className="text-base font-bold text-gray-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
