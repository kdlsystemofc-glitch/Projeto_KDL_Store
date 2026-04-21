import Navbar from '@/components/Navbar';
import HeroScrollytelling from '@/components/HeroScrollytelling';
import ProblemsSection from '@/components/ProblemsSection';
import FeaturesSection from '@/components/FeaturesSection';
import ForWhomSection from '@/components/ForWhomSection';
import PricingSection from '@/components/PricingSection';
import FAQSection from '@/components/FAQSection';
import Footer from '@/components/Footer';
import ParallaxBannerSection from '@/components/ParallaxBannerSection';

export default function Home() {
  return (
    <main style={{ background: '#fff' }}>
      <Navbar />

      {/* Hero — mantido no dark mode */}
      <HeroScrollytelling />

      {/* Conteúdo light mode — estilo Ascone */}
      <ProblemsSection />
      <ParallaxBannerSection />
      <FeaturesSection />
      <ForWhomSection />
      <PricingSection />
      <FAQSection />
      <Footer />
    </main>
  );
}
