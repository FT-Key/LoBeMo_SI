import { GeometricBackground } from "@/components/landing/geometric-background"
import { LandingPageWrapper } from "@/components/landing/landing-page-wrapper"
import { Marquee } from "@/components/landing/marquee"
import { ServicesSection } from "@/components/landing/services-section"
import { StatsSection } from "@/components/landing/stats-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { ContactSection } from "@/components/landing/contact-section"
import { FooterWrapper } from "@/components/landing/footer-wrapper"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <GeometricBackground />
      <LandingPageWrapper />
      <Marquee />
      <ServicesSection />
      <StatsSection />
      <FeaturesSection />
      <ContactSection />
      <FooterWrapper />
    </div>
  )
}
