"use client";

import Image from "next/image";
import { useEffect, useRef, useCallback } from "react";

export function HeroSection({ onOpenLogin, onOpenPortal }: { onOpenLogin: () => void; onOpenPortal: () => void }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const decorRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const hero = heroRef.current;
      if (!hero) return;

      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      // Background: subtle shift (slow layer)
      if (bgRef.current) {
        bgRef.current.style.transform = `translate(${x * -12}px, ${y * -12}px) scale(1.05)`;
      }

      // Content: slight opposite shift (fast layer)
      if (contentRef.current) {
        contentRef.current.style.transform = `translate(${x * 8}px, ${y * 6}px)`;
      }

      // Decorative elements: medium speed
      if (decorRef.current) {
        decorRef.current.style.transform = `translate(${x * -20}px, ${y * -16}px)`;
      }

      // Scroll indicator: subtle shift
      if (scrollIndicatorRef.current) {
        scrollIndicatorRef.current.style.transform = `translate(calc(-50% + ${x * 10}px), ${y * 8}px)`;
      }
    });
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [handleMouseMove]);

  return (
    <header ref={heroRef} className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Hero background — parallax layer (slow) */}
      <div
        ref={bgRef}
        className="absolute inset-0 will-change-transform"
        style={{
          backgroundImage: "url('/hero-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          transition: "transform 0.15s ease-out",
        }}
      />

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/10 to-background/100 pointer-events-none" style={{ zIndex: 1 }} />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/20 pointer-events-none" style={{ zIndex: 1 }} />

      {/* Decorative parallax layer (medium) */}
      <div
        ref={decorRef}
        className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-primary/5 to-transparent pointer-events-none will-change-transform"
        style={{ zIndex: 1, transition: "transform 0.12s ease-out" }}
      />

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
            <button
              onClick={onOpenPortal}
              className="inline-flex h-8 sm:h-9 items-center justify-center rounded-full px-3 sm:px-4 text-xs sm:text-sm font-semibold text-muted-foreground transition-all hover:text-foreground"
            >
              Seguimiento
            </button>
            <button
              onClick={onOpenLogin}
              className="inline-flex h-8 sm:h-9 items-center justify-center rounded-full px-3 sm:px-4 text-xs sm:text-sm font-semibold text-muted-foreground transition-all hover:text-foreground"
            >
              Acceso empleados
            </button>
          </div>
        </div>
      </nav>

      {/* Hero content — parallax layer (fast) */}
      <div
        ref={contentRef}
        className="relative z-10 flex flex-1 items-center px-4 pt-24 sm:px-8 md:px-12 lg:px-20 will-change-transform"
        style={{ transition: "transform 0.1s ease-out" }}
      >
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
                className="block w-fit text-transparent pointer-events-none"
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
            <a
              href="#contacto"
              className="inline-flex h-12 sm:h-13 items-center justify-center rounded-xl bg-primary px-6 sm:px-8 text-sm sm:text-base font-bold text-primary-foreground transition-all hover:bg-primary-hover hover:shadow-2xl hover:shadow-primary/30"
            >
              Contactanos
              <span className="ml-2">→</span>
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator — parallax layer (subtle) */}
      <div ref={scrollIndicatorRef} className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 will-change-transform" style={{ transition: "transform 0.15s ease-out" }}>
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
