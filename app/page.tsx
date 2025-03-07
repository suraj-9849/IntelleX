import SiteHeader from '@/components/site-header';
import { HeroSection } from '@/components/hero-section';
import SiteFooter from '@/components/site-footer';
import { CallToAction } from '@/components/call-to-action';
import { Features } from '@/components/features';

export default function Home() {
  return (
    <>
      <HeroSection />
      <Features />
      <CallToAction />
      <SiteFooter />
    </>
  );
}
