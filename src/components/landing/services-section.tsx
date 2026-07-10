import { ScrollReveal } from "@/lib/use-scroll-reveal";
import {
  Shield,
  Globe,
  Server,
  FileSearch,
  Users,
  GraduationCap,
} from "lucide-react";

const services = [
  {
    icon: Shield,
    title: "Auditoría de Seguridad",
    description:
      "Evaluación exhaustiva de infraestructura, aplicaciones y procesos para identificar vulnerabilidades.",
    accent: "primary",
  },
  {
    icon: Globe,
    title: "Pentesting Web",
    description:
      "Simulación de ataques controlados sobre aplicaciones web para detectar fallos de seguridad explotables.",
    accent: "accent",
  },
  {
    icon: Server,
    title: "Hardening de Sistemas",
    description:
      "Fortalecimiento de servidores, redes y endpoints siguiendo estándares CIS.",
    accent: "primary",
  },
  {
    icon: FileSearch,
    title: "Análisis Forense",
    description:
      "Investigación digital post-incidente para determinar el origen y alcance de brechas.",
    accent: "accent",
  },
  {
    icon: Users,
    title: "Capacitaciones",
    description:
      "Formación en conciencia de seguridad para equipos técnicos y no técnicos.",
    accent: "primary",
  },
  {
    icon: GraduationCap,
    title: "Consultoría Estratégica",
    description:
      "Asesoramiento en normativas, cumplimiento legal y hojas de ruta de seguridad.",
    accent: "accent",
  },
];

const isAccent = (a: string) => a === "accent";

export function ServicesSection() {
  return (
    <section className="relative overflow-hidden px-4 py-24 md:px-8 md:py-32">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/4 top-1/3 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 h-72 w-72 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="mb-20 text-center">
            <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Servicios
            </div>
            <h2
              className="mb-6 text-5xl font-black tracking-tighter md:text-6xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="text-foreground">Servicios de</span>{" "}
              <span className="text-primary">Ciberseguridad</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Soluciones integrales diseñadas para proteger tu infraestructura digital.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, idx) => (
            <ScrollReveal key={service.title} delay={idx * 100}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-border/40 bg-surface/60 backdrop-blur-sm transition-all duration-500 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10">
                <div className="relative z-10 flex h-full flex-col p-8">
                  <div
                    className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl border transition-all group-hover:scale-110 group-hover:rotate-6 ${
                      isAccent(service.accent)
                        ? "border-accent/30 bg-gradient-to-br from-accent/20 to-accent/5 text-accent"
                        : "border-primary/30 bg-gradient-to-br from-primary/20 to-primary/5 text-primary"
                    }`}
                  >
                    <service.icon className="h-7 w-7" />
                  </div>

                  <h3
                    className="mb-3 text-2xl font-bold text-foreground transition-colors group-hover:text-primary"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {service.title}
                  </h3>
                  <p className="flex-1 leading-relaxed text-muted-foreground transition-colors group-hover:text-foreground/80">
                    {service.description}
                  </p>

                  <div
                    className={`mt-6 h-1 w-12 rounded-full bg-gradient-to-r transition-all duration-500 group-hover:w-24 ${
                      isAccent(service.accent)
                        ? "from-accent to-transparent"
                        : "from-primary to-transparent"
                    }`}
                  />
                </div>

                <div
                  className={`absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20 ${
                    isAccent(service.accent) ? "bg-accent" : "bg-primary"
                  }`}
                />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
