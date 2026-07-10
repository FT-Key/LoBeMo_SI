"use client";

import { useEffect, useState } from "react";
import { ScrollReveal } from "@/lib/use-scroll-reveal";
import Link from "next/link";

function ArgentinaClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      setTime(
        new Intl.DateTimeFormat("es-AR", {
          timeZone: "America/Argentina/Tucuman",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(new Date())
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <span className="h-2 w-2 rounded-full bg-accent" />
      <span className="font-semibold">Argentina</span>
      <span className="font-mono text-base font-bold text-foreground tabular-nums">
        {time}
      </span>
      <span className="text-xs">ART (UTC-3)</span>
    </div>
  );
}

interface CtaSectionProps {
  hasSuperAdmin: boolean;
}

export function CtaSection({ hasSuperAdmin }: CtaSectionProps) {
  return (
    <section className="relative overflow-hidden px-4 py-24 md:px-8 md:py-32">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <ScrollReveal>
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Próximo paso
          </div>

          <h2
            className="mb-8 text-5xl font-black leading-tight tracking-tighter md:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span className="text-foreground">Gestioná tu seguridad con</span>
            <br />
            <span className="text-primary">LoBeMo</span>
          </h2>

          <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Accedé al sistema y comenzá a gestionar proyectos, clientes y equipos
            <span className="mt-2 block font-semibold text-foreground">
              de manera centralizada y segura.
            </span>
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex h-13 w-full items-center justify-center rounded-xl bg-primary px-8 text-base font-bold text-primary-foreground transition-all hover:bg-primary-hover hover:shadow-2xl hover:shadow-primary/50 sm:w-auto"
            >
              Acceder al sistema
              <span className="ml-2">→</span>
            </Link>

            {!hasSuperAdmin && (
              <Link
                href="/register"
                className="inline-flex h-13 w-full items-center justify-center rounded-xl border-2 border-primary/40 px-8 text-base font-bold text-foreground backdrop-blur-sm transition-all hover:border-primary/60 hover:bg-primary/5 sm:w-auto"
              >
                Solicitar acceso
                <span className="ml-2">→</span>
              </Link>
            )}
          </div>

          <div className="mt-16 flex items-center justify-center gap-3">
            <div className="h-px max-w-xs flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <ArgentinaClock />
            <div className="h-px max-w-xs flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
