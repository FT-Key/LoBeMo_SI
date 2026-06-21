import { ShieldCheck, Gauge, Lock } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Expertos Locales",
    description:
      "Conocemos el ecosistema digital del NOA. Brindamos soluciones adaptadas a las necesidades reales de empresas tucumanas y regionales.",
    accent: "primary",
  },
  {
    icon: Gauge,
    title: "Gestión Eficiente",
    description:
      "Seguimiento de proyectos en 7 estados, asignación inteligente de recursos y dashboard ejecutivo para tomar decisiones informadas.",
    accent: "accent",
  },
  {
    icon: Lock,
    title: "Confidencialidad Total",
    description:
      "Todos los datos de clientes y proyectos se manejan con estrictos protocolos de seguridad. Confidencialidad garantizada por contrato.",
    accent: "primary",
  },
];

export function FeaturesSection() {
  return (
    <section className="px-4 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2
            className="mb-4 text-3xl font-bold tracking-tight md:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            ¿Por qué{" "}
            <span className="text-primary">LoBeMo</span>?
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Nos diferenciamos por nuestro enfoque regional, experiencia técnica
            y compromiso con la excelencia.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-xl border border-border/50 bg-surface-elevated/80 p-8 backdrop-blur-md transition-all duration-200 hover:border-primary/30"
            >
              <div
                className={`mb-5 flex h-14 w-14 items-center justify-center rounded-xl ${
                  feature.accent === "primary"
                    ? "bg-primary/10 text-primary"
                    : "bg-accent/10 text-accent"
                }`}
              >
                <feature.icon className="h-7 w-7" />
              </div>
              <h3
                className="mb-3 text-xl font-semibold"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {feature.title}
              </h3>
              <p className="leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
              <div
                className={`absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-20 ${
                  feature.accent === "primary" ? "bg-primary" : "bg-accent"
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
