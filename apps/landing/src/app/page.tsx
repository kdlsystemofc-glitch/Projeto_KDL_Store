import Navbar from '@/components/Navbar';
import HeroScrollAnimation from '@/components/HeroScrollAnimation';
import ProblemsSection from '@/components/ProblemsSection';
import FeaturesSection from '@/components/FeaturesSection';
import ForWhomSection from '@/components/ForWhomSection';
import PricingSection from '@/components/PricingSection';
import FAQSection from '@/components/FAQSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main style={{ background: 'var(--kdl-bg)' }}>
      <Navbar />

      {/* Hero com scroll animation */}
      <HeroScrollAnimation />

      {/* Seções de conteúdo */}
      <ProblemsSection />
      <FeaturesSection />
      <ForWhomSection />
      <PricingSection />
      <FAQSection />
      <Footer />
    </main>
  );
}
