"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

interface HeroSectionProps {
  hasSuperAdmin: boolean;
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2, delayChildren: 0.3 } },
};

export function HeroSection({ hasSuperAdmin }: HeroSectionProps) {
  return (
    <header className="relative flex min-h-screen flex-col">
      {/* Hero background */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/hero-bg.png')" }} />
      {/* Overlays on top of hero-bg, behind content */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/10 to-background/100 pointer-events-none" style={{ zIndex: 1 }} />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/20 pointer-events-none" style={{ zIndex: 1 }} />
      <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" style={{ zIndex: 1 }} />

      {/* Nav */}
      <nav className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
        <div className="flex w-full max-w-6xl items-center justify-between rounded-full border border-border/40 bg-background/60 px-5 py-2.5 backdrop-blur-xl transition-all duration-500">
          <div className="flex items-center">
            <Image
              src="/lobemo-logo.png"
              alt="LoBeMo"
              width={140}
              height={36}
              className="h-8 w-auto"
              priority
            />
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary-hover"
            >
              Iniciar sesión
            </Link>
            {!hasSuperAdmin && (
              <Link
                href="/register"
                className="inline-flex h-9 items-center justify-center rounded-full border border-primary/40 px-5 text-sm font-semibold text-foreground transition-all hover:border-primary/60 hover:bg-primary/5"
              >
                Primer inicio
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero content — left aligned, 1/3 offset */}
      <motion.div
        className="relative z-10 flex flex-1 items-center px-4 pt-24 md:px-12 lg:px-20"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        <motion.div className="max-w-xl md:ml-[8%] lg:ml-[12%]" variants={fadeUp}>
          {/* Decorative accent line */}
          <div className="mb-8 flex items-center gap-4">
            <div className="h-px w-16 bg-primary/60" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              LoBeMo Seguridad
            </span>
          </div>

          {/* Massive heading with blend effect */}
          <div className="relative">
            <h1
              className="text-[clamp(3.5rem,12vw,8.5rem)] font-black leading-[0.9] tracking-tighter"
              style={{ fontFamily: "var(--font-display)", WebkitTextStroke: "1.5px rgba(0, 212, 255, 0.35)" }}
            >
              <span className="block text-foreground/90">Gestión de</span>
              <span
                className="block w-max text-transparent pointer-events-none"
                style={{
                  backgroundImage: "url('/multiply-effect-image.webp')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                }}
              >
                Ciberseguridad
              </span>
              <span className="block text-foreground/90">Centralizada</span>
            </h1>
          </div>

          <p className="mb-10 mt-8 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
            Centralizá la administración y seguimiento de servicios de ciberseguridad.
            Clientes, proyectos, tareas y más — todo en un solo lugar.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex h-13 items-center justify-center rounded-xl bg-primary px-8 text-base font-bold text-primary-foreground transition-all hover:bg-primary-hover hover:shadow-2xl hover:shadow-primary/30"
            >
              Comenzar ahora
              <span className="ml-2">→</span>
            </Link>
            {!hasSuperAdmin && (
              <Link
                href="/register"
                className="inline-flex h-13 items-center justify-center rounded-xl border-2 border-primary/40 px-8 text-base font-bold text-foreground backdrop-blur-sm transition-all hover:border-primary/60 hover:bg-primary/5"
              >
                Primer inicio — Registrar
                <span className="ml-2">→</span>
              </Link>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Scroll</span>
          <div className="flex h-8 w-5 items-center justify-center rounded-full border-2 border-primary/40 p-1.5">
            <div className="h-1.5 w-1 animate-bounce rounded-full bg-primary" />
          </div>
        </div>
      </motion.div>
    </header>
  );
}
