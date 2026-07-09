import { prisma } from "@/lib/prisma"
import { GeometricBackground } from "@/components/landing/geometric-background"
import { HeroSection } from "@/components/landing/hero-section"
import { ServicesSection } from "@/components/landing/services-section"
import { StatsSection } from "@/components/landing/stats-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { CtaSection } from "@/components/landing/cta-section"
import { FooterSection } from "@/components/landing/footer-section"

export const dynamic = "force-dynamic"

export default async function Home() {
  const hasSuperAdmin = await prisma.empleado.findFirst({
    where: { rol: "GERENTE_GENERAL" },
  })

  return (
    <div className="flex min-h-screen flex-col">
      <GeometricBackground />
      <HeroSection hasSuperAdmin={!!hasSuperAdmin} />
      <ServicesSection />
      <StatsSection />
      <FeaturesSection />
      <CtaSection />
      <FooterSection />
    </div>
  )
}
