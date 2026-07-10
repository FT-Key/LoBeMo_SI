"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollReveal } from "@/lib/use-scroll-reveal";
import { motion } from "framer-motion";

const stats = [
  {
    value: "11",
    label: "Profesionales",
    suffix: "+",
    detail: "Expertos en ciberseguridad, pentesting y desarrollo seguro.",
  },
  {
    value: "7",
    label: "Estados de proyecto",
    suffix: "",
    detail: "Desde cotización hasta finalizado. Trazabilidad completa.",
  },
  {
    value: "100",
    label: "Confidencialidad",
    suffix: "%",
    detail: "Datos protegidos bajo estrictos protocolos de seguridad.",
  },
  {
    value: "1",
    label: "Cobertura regional",
    suffix: " — NOA",
    detail: "Presencia en Tucumán y todo el Noroeste Argentino.",
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
          let current = 0;
          const startTime = Date.now();

          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            current = Math.floor(increment * steps * progress);
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

        <motion.div
          className="grid grid-cols-2 gap-6 md:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
        >
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
              }}
            >
              <ScrollReveal delay={idx * 100}>
              <div className="group relative flex h-52 flex-col overflow-hidden rounded-2xl border border-border/30 bg-surface/40 backdrop-blur-sm transition-all duration-500 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

                <div className="flex flex-1 flex-col items-center justify-center px-6 transition-all duration-500 group-hover:translate-y-[-8px]">
                  <div
                    className="mb-2 text-5xl font-black text-primary transition-transform duration-500 group-hover:scale-110 md:text-6xl"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground transition-colors group-hover:text-primary">
                    {stat.label}
                  </div>
                </div>

                <div className="px-6 pb-0 transition-all duration-500 max-h-0 group-hover:max-h-16 group-hover:pb-4">
                  <p className="text-xs leading-tight text-muted-foreground/80 text-center">
                    {stat.detail}
                  </p>
                </div>

                <div className="absolute bottom-0 left-1/2 h-1 w-0 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-transparent transition-all duration-500 group-hover:w-16" />
              </div>
            </ScrollReveal>
          </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
