import Hero from "@/components/landing/Hero";
import LakerWatchShowcase from "@/components/landing/LakerWatchShowcase";
import Noise from "@/components/landing/Noise";

export default function Home() {
  return (
    <main className="relative">
      <Noise />
      <Hero />
      <LakerWatchShowcase />
    </main>
  );
}
