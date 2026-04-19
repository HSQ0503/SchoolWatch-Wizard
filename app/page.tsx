import Faq from "@/components/landing/Faq";
import FinalCta from "@/components/landing/FinalCta";
import Footer from "@/components/landing/Footer";
import HowItWorks from "@/components/landing/HowItWorks";
import PaperNoise from "@/components/landing/PaperNoise";
import PullQuote from "@/components/landing/PullQuote";
import Reveal from "@/components/landing/Reveal";
import ScrollProgress from "@/components/landing/ScrollProgress";
import Showcase from "@/components/landing/Showcase";
import SignalsRow from "@/components/landing/SignalsRow";
import ZineHero from "@/components/landing/ZineHero";
import ZineNav from "@/components/landing/ZineNav";

export default function Home() {
  return (
    <main className="theme-zine theme-zine-landing relative">
      <PaperNoise />
      <ScrollProgress />
      <ZineNav />
      <ZineHero />
      <SignalsRow />
      <Reveal>
        <Showcase />
      </Reveal>
      <Reveal>
        <HowItWorks />
      </Reveal>
      <Reveal>
        <PullQuote />
      </Reveal>
      <Reveal>
        <Faq />
      </Reveal>
      <Reveal>
        <FinalCta />
      </Reveal>
      <Footer />
    </main>
  );
}
