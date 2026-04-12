import Faq from "@/components/landing/Faq";
import FinalCta from "@/components/landing/FinalCta";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import LakerWatchShowcase from "@/components/landing/LakerWatchShowcase";
import Noise from "@/components/landing/Noise";
import PullQuote from "@/components/landing/PullQuote";
import SignalsRow from "@/components/landing/SignalsRow";
import WizardPreview from "@/components/landing/WizardPreview";

export default function Home() {
  return (
    <main className="relative">
      <Noise />
      <Hero />
      <SignalsRow />
      <LakerWatchShowcase />
      <WizardPreview />
      <PullQuote />
      <Faq />
      <FinalCta />
      <Footer />
    </main>
  );
}
