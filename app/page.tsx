import Faq from "@/components/landing/Faq";
import FinalCta from "@/components/landing/FinalCta";
import Footer from "@/components/landing/Footer";
import HowItWorks from "@/components/landing/HowItWorks";
import PaperNoise from "@/components/landing/PaperNoise";
import PullQuote from "@/components/landing/PullQuote";
import Showcase from "@/components/landing/Showcase";
import SignalsRow from "@/components/landing/SignalsRow";
import ZineHero from "@/components/landing/ZineHero";
import ZineNav from "@/components/landing/ZineNav";

export default function Home() {
  return (
    <main className="theme-zine relative">
      <PaperNoise />
      <ZineNav />
      <ZineHero />
      <SignalsRow />
      <Showcase />
      <HowItWorks />
      <PullQuote />
      <Faq />
      <FinalCta />
      <Footer />
    </main>
  );
}
