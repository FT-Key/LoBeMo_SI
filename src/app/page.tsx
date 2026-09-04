import { GeometricBackground } from "@/components/landing/geometric-background"
import { HeroSection } from "@/components/landing/hero-section"
import { Marquee } from "@/components/landing/marquee"
import { ServicesSection } from "@/components/landing/services-section"
import { StatsSection } from "@/components/landing/stats-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { CtaSection } from "@/components/landing/cta-section"
import { ContactSection } from "@/components/landing/contact-section"
import { FooterSection } from "@/components/landing/footer-section"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <GeometricBackground />
      <HeroSection />
      <Marquee />
      <ServicesSection />
      <StatsSection />
      <FeaturesSection />
      <CtaSection />
      <ContactSection />
      <FooterSection />
    </div>
  )
}
