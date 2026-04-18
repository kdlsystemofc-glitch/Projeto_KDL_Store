import Navbar from '@/components/Navbar';
import HeroScrollytelling from '@/components/HeroScrollytelling';
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

      {/* Novo Hero Scrollytelling Awwwards-level */}
      <HeroScrollytelling />

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
