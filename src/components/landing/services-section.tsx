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
      "Evaluación exhaustiva de infraestructura, aplicaciones y procesos para identificar vulnerabilidades y riesgos.",
  },
  {
    icon: Globe,
    title: "Pentesting Web",
    description:
      "Simulación de ataques controlados sobre aplicaciones web y APIs para detectar fallos de seguridad explotables.",
  },
  {
    icon: Server,
    title: "Hardening de Sistemas",
    description:
      "Fortalecimiento de servidores, redes y endpoints siguiendo estándares CIS y buenas prácticas de la industria.",
  },
  {
    icon: FileSearch,
    title: "Análisis Forense",
    description:
      "Investigación digital post-incidente para determinar el origen, alcance y mitigación de brechas de seguridad.",
  },
  {
    icon: Users,
    title: "Capacitaciones",
    description:
      "Formación en conciencia de seguridad para equipos técnicos y no técnicos, adaptada al perfil de cada cliente.",
  },
  {
    icon: GraduationCap,
    title: "Consultoría Estratégica",
    description:
      "Asesoramiento en normativas, cumplimiento legal (LOPDP, ISO 27001) y hojas de ruta de seguridad.",
  },
];

export function ServicesSection() {
  return (
    <section className="px-4 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2
            className="mb-4 text-3xl font-bold tracking-tight md:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Servicios de{" "}
            <span className="text-primary">Ciberseguridad</span>
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Soluciones integrales diseñadas para proteger tu infraestructura
            digital y garantizar la continuidad de tu negocio.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.title}
              className="group rounded-xl border border-border/50 bg-surface-elevated/80 p-6 backdrop-blur-md transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                <service.icon className="h-6 w-6" />
              </div>
              <h3
                className="mb-2 text-lg font-semibold"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {service.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
