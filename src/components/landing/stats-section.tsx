"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ScrollReveal } from "@/lib/use-scroll-reveal";

const stats = [
  {
    value: "11",
    label: "Profesionales",
    suffix: "+",
    detail: "Expertos en ciberseguridad, pentesting y desarrollo seguro.",
    fullDescription: "Nuestro equipo multidisciplinario combina experiencia en auditoría de seguridad, pruebas de penetración, desarrollo seguro y consultoría estratégica. Cada profesional cuenta con certificaciones internacionales.",
    icon: (
      <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    value: "7",
    label: "Estados de proyecto",
    suffix: "",
    detail: "Desde cotización hasta finalizado. Trazabilidad completa.",
    fullDescription: "Cada proyecto sigue un flujo estructurado: Relevamiento, Propuesta, Aprobado, En Ejecución, En Revisión, Entregado y Cerrado. Trazabilidad total en cada etapa con seguimiento en tiempo real.",
    icon: (
      <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
      </svg>
    ),
  },
  {
    value: "100",
    label: "Confidencialidad",
    suffix: "%",
    detail: "Datos protegidos bajo estrictos protocolos de seguridad.",
    fullDescription: "Implementamos protocolos de seguridad de nivel empresarial: encriptación de datos en tránsito y en reposo, acceso basado en roles, auditoría continua y cumplimiento con estándares internacionales ISO 27001.",
    icon: (
      <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    value: "1",
    label: "Cobertura regional",
    suffix: " — NOA",
    detail: "Presencia en Tucumán y todo el Noroeste Argentino.",
    fullDescription: "Con base en San Miguel de Tucumán, brindamos servicios de ciberseguridad a empresas de todo el Noroeste Argentino. Presencia regional con capacidad de响应 remota a nivel nacional.",
    icon: (
      <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
  },
];

function AnimatedNumber({ value, suffix }: { value: string; suffix: string }) {
  const [displayValue, setDisplayValue] = useState("0");
  const elementRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const numValue = parseInt(value);
          const duration = 2000;
          const steps = 60;
          const increment = numValue / steps;
          const startTime = Date.now();

          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(increment * steps * progress);
            setDisplayValue(String(current));

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setDisplayValue(value);
            }
          };

          requestAnimationFrame(animate);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.5 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={elementRef}>
      {displayValue}
      {suffix}
    </div>
  );
}

export function StatsSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleMouseEnter = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  return (
    <section className="relative overflow-hidden px-4 py-24 md:px-8 md:py-32">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-surface/50" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Estadísticas
            </div>
            <h2
              className="text-5xl font-black tracking-tighter md:text-6xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="text-foreground">Números que</span>{" "}
              <span className="text-primary">hablan</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Resultados que respaldan nuestra experiencia en ciberseguridad regional.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Panel izquierdo: Cards de stats */}
          <ScrollReveal>
            <div className="flex flex-col gap-4">
              {stats.map((stat, idx) => (
                <div
                  key={stat.label}
                  onMouseEnter={() => handleMouseEnter(idx)}
                  className={`group relative flex items-center gap-5 rounded-2xl border p-5 transition-all duration-300 cursor-pointer ${
                    activeIndex === idx
                      ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary/10"
                      : "border-border/30 bg-surface/40 hover:border-primary/30 hover:bg-surface/60"
                  }`}
                >
                  {/* Icono */}
                  <div
                    className={`flex size-12 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${
                      activeIndex === idx
                        ? "border-primary/30 bg-primary/15 text-primary scale-110"
                        : "border-border/40 bg-surface/60 text-muted-foreground group-hover:border-primary/20 group-hover:text-primary"
                    }`}
                  >
                    {stat.icon}
                  </div>

                  {/* Número + Label */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1">
                      <span
                        className={`text-3xl font-black tabular-nums transition-colors duration-300 ${
                          activeIndex === idx ? "text-primary" : "text-foreground"
                        }`}
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-muted-foreground">{stat.label}</p>
                  </div>

                  {/* Flecha indicadora */}
                  <div
                    className={`size-8 shrink-0 rounded-full flex items-center justify-center transition-all duration-300 ${
                      activeIndex === idx
                        ? "bg-primary text-primary-foreground rotate-0"
                        : "bg-surface-elevated text-muted-foreground -rotate-90"
                    }`}
                  >
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Panel derecho: Info detallada */}
          <ScrollReveal delay={100}>
            <div className="relative flex h-full min-h-[400px] items-center justify-center rounded-2xl border border-border/30 bg-surface/40 p-8 backdrop-blur-sm lg:min-h-0">
              {/* Fondo decorativo */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent" />

              <div className="relative z-10 text-center">
                {/* Número grande animado */}
                <div
                  className="mb-4 text-7xl font-black text-primary tabular-nums md:text-8xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  <AnimatedNumber value={stats[activeIndex].value} suffix={stats[activeIndex].suffix} />
                </div>

                {/* Label */}
                <h3
                  className="mb-3 text-xl font-bold text-foreground"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {stats[activeIndex].label}
                </h3>

                {/* Descripción completa */}
                <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
                  {stats[activeIndex].fullDescription}
                </p>

                {/* Indicadores de paginación */}
                <div className="mt-8 flex items-center justify-center gap-2">
                  {stats.map((_, idx) => (
                    <button
                      key={idx}
                      onMouseEnter={() => handleMouseEnter(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        activeIndex === idx ? "w-8 bg-primary" : "w-1.5 bg-border hover:bg-muted-foreground"
                      }`}
                      aria-label={`Ver estadística ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
