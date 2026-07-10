"use client";

import { motion } from "framer-motion";
import { ScrollReveal } from "@/lib/use-scroll-reveal";
import { ShieldCheck, Gauge, Lock } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Expertos Locales",
    description:
      "Conocemos el ecosistema digital del NOA. Brindamos soluciones adaptadas a las necesidades reales de empresas tucumanas y regionales.",
    highlight: "Equipo con certificaciones internacionales",
    accent: "primary" as const,
  },
  {
    icon: Gauge,
    title: "Gestión Eficiente",
    description:
      "Seguimiento de proyectos en 7 estados, asignación inteligente de recursos y dashboard ejecutivo para tomar decisiones informadas.",
    highlight: "Trazabilidad completa de principio a fin",
    accent: "accent" as const,
  },
  {
    icon: Lock,
    title: "Confidencialidad Total",
    description:
      "Todos los datos de clientes y proyectos se manejan con estrictos protocolos de seguridad. Confidencialidad garantizada por contrato.",
    highlight: "Protegemos tu información como si fuera nuestra",
    accent: "primary" as const,
  },
];

const isPrimary = (a: string) => a === "primary";

export function FeaturesSection() {
  return (
    <section className="relative overflow-hidden px-4 py-24 md:px-8 md:py-32">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/3 top-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="mb-20 text-center">
            <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Por qué LoBeMo
            </div>
            <h2
              className="mb-6 text-5xl font-black tracking-tighter md:text-6xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="text-foreground">¿Por qué</span>{" "}
              <span className="text-primary">LoBeMo</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Nos diferenciamos por nuestro enfoque regional, experiencia técnica y compromiso con la excelencia.
            </p>
          </div>
        </ScrollReveal>

        <motion.div
          className="grid gap-8 md:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
        >
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              className="h-full"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
              }}
            >
              <ScrollReveal delay={idx * 100} className="h-full">
              <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/40 bg-surface/60 backdrop-blur-sm transition-all duration-500 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10">
                <div
                  className={`absolute inset-0 ${
                    isPrimary(feature.accent)
                      ? "bg-gradient-to-br from-primary/5 to-transparent"
                      : "bg-gradient-to-br from-accent/5 to-transparent"
                  } backdrop-blur-md`}
                />

                <div className="relative z-10 flex h-full flex-col p-6 md:p-8">
                  <div
                    className={`mb-4 md:mb-6 inline-flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-xl border transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${
                      isPrimary(feature.accent)
                        ? "border-primary/30 bg-gradient-to-br from-primary/20 to-primary/5 text-primary"
                        : "border-accent/30 bg-gradient-to-br from-accent/20 to-accent/5 text-accent"
                    }`}
                  >
                    <feature.icon className="h-8 w-8" />
                  </div>

                  <h3
                    className="mb-4 text-2xl font-bold text-foreground transition-colors group-hover:text-primary"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {feature.title}
                  </h3>

                  <p className="flex-1 leading-relaxed text-muted-foreground transition-colors group-hover:text-foreground/80">
                    {feature.description}
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-primary">
                    <span
                      className={`inline-block h-1.5 w-1.5 rounded-full ${
                        isPrimary(feature.accent) ? "bg-primary" : "bg-accent"
                      }`}
                    />
                    {feature.highlight}
                  </div>
                </div>

                <div
                  className={`absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20 ${
                    isPrimary(feature.accent) ? "bg-primary" : "bg-accent"
                  }`}
                />

                <div className="pointer-events-none absolute inset-0 rounded-2xl p-px opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${
                      isPrimary(feature.accent)
                        ? "from-primary/50 to-transparent"
                        : "from-accent/50 to-transparent"
                    }`}
                  />
                </div>
              </div>
            </ScrollReveal>
          </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
