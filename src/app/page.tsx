import { Navbar } from '@/components/navbar';
import { HeroSection } from '@/components/hero-section';
import { FeaturesSection } from '@/components/features-section';
import { CTASection } from '@/components/cta-section';
import { FooterSection } from '@/components/footer-section';

export default function Home() {
  return (
    <div className='min-h-screen bg-background flex flex-col'>
      <Navbar />
      <main className='grow relative'>
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <FooterSection />
    </div>
  );
}
