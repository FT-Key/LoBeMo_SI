"use client"

import { useState } from "react"
import { LoginModal } from "@/components/modals/login-modal"
import { PortalLoginModal } from "@/components/modals/portal-login-modal"
import { HeroSection } from "./hero-section"
import { FooterSection } from "./footer-section"

export function LandingPageWrapper() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [portalOpen, setPortalOpen] = useState(false)

  return (
    <>
      <HeroSection
        onOpenLogin={() => setLoginOpen(true)}
        onOpenPortal={() => setPortalOpen(true)}
      />
      <FooterSection
        onOpenLogin={() => setLoginOpen(true)}
        onOpenPortal={() => setPortalOpen(true)}
      />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      <PortalLoginModal open={portalOpen} onClose={() => setPortalOpen(false)} />
    </>
  )
}
