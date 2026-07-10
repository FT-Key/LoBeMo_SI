"use client";

import Link from "next/link";
import Image from "next/image";

interface HeroSectionProps {
  hasSuperAdmin: boolean;
}

export function HeroSection({ hasSuperAdmin }: HeroSectionProps) {
  return (
    <header className="relative flex min-h-screen flex-col overflow-x-hidden">
      {/* Hero background */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/hero-bg.png')" }} />
      {/* Overlays on top of hero-bg, behind content */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/10 to-background/100 pointer-events-none" style={{ zIndex: 1 }} />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/20 pointer-events-none" style={{ zIndex: 1 }} />
      <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" style={{ zIndex: 1 }} />

      {/* Nav */}
      <nav className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
        <div className="flex w-full max-w-6xl items-center justify-between rounded-full border border-border/40 bg-background/60 px-4 py-2.5 backdrop-blur-xl transition-all duration-500 sm:px-5">
          <div className="flex items-center shrink-0">
            <Image
              src="/lobemo-logo.png"
              alt="LoBeMo"
              width={120}
              height={30}
              className="h-7 w-auto sm:h-8"
              priority
            />
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/login"
              className="inline-flex h-8 sm:h-9 items-center justify-center rounded-full bg-primary px-3 sm:px-5 text-xs sm:text-sm font-bold text-primary-foreground transition-all hover:bg-primary-hover"
            >
              Iniciar sesión
            </Link>
            {!hasSuperAdmin && (
              <Link
                href="/register"
                className="inline-flex h-8 sm:h-9 items-center justify-center rounded-full border border-primary/40 px-3 sm:px-5 text-xs sm:text-sm font-semibold text-foreground transition-all hover:border-primary/60 hover:bg-primary/5"
              >
                Primer inicio
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero content — left aligned */}
      <div className="relative z-10 flex flex-1 items-center px-4 pt-24 sm:px-8 md:px-12 lg:px-20">
        <div className="w-full max-w-xl md:ml-[8%] lg:ml-[12%]">
          {/* Decorative accent line */}
          <div className="mb-6 flex items-center gap-4 sm:mb-8">
            <div className="h-px w-12 bg-primary/60 sm:w-16" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-xs">
              LoBeMo Seguridad
            </span>
          </div>

          {/* Massive heading with blend effect */}
          <div className="relative">
            <h1
              className="text-[clamp(2.7rem,11vw,8.5rem)] font-black leading-[0.9] tracking-tighter"
              style={{ fontFamily: "var(--font-display)", WebkitTextStroke: "1.5px rgba(0, 212, 255, 0.35)" }}
            >
              <span className="block text-foreground/90">Gestión de</span>
              <span
                className="block text-transparent pointer-events-none break-words"
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

          <p className="mb-8 mt-6 max-w-lg text-sm leading-relaxed text-muted-foreground sm:mb-10 sm:mt-8 sm:text-base md:text-lg">
            Centralizá la administración y seguimiento de servicios de ciberseguridad.
            Clientes, proyectos, tareas y más — todo en un solo lugar.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/login"
              className="inline-flex h-12 sm:h-13 items-center justify-center rounded-xl bg-primary px-6 sm:px-8 text-sm sm:text-base font-bold text-primary-foreground transition-all hover:bg-primary-hover hover:shadow-2xl hover:shadow-primary/30"
            >
              Comenzar ahora
              <span className="ml-2">→</span>
            </Link>
            {!hasSuperAdmin && (
              <Link
                href="/register"
                className="inline-flex h-12 sm:h-13 items-center justify-center rounded-xl border-2 border-primary/40 px-6 sm:px-8 text-sm sm:text-base font-bold text-foreground backdrop-blur-sm transition-all hover:border-primary/60 hover:bg-primary/5"
              >
                Primer inicio — Registrar
                <span className="ml-2">→</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Scroll</span>
          <div className="flex h-8 w-5 items-center justify-center rounded-full border-2 border-primary/40 p-1.5">
            <div className="h-1.5 w-1 animate-bounce rounded-full bg-primary" />
          </div>
        </div>
      </div>
    </header>
  );
}
