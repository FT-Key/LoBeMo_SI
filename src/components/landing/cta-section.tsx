import Link from "next/link";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden px-4 py-24 md:px-8 md:py-32">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(160deg, var(--primary-dark) 0%, var(--background) 50%, var(--accent-dark) 100%)",
        }}
      />
      <div className="mx-auto max-w-3xl text-center">
        <h2
          className="mb-6 text-3xl font-bold tracking-tight md:text-4xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Gestioná tu seguridad con{" "}
          <span className="text-primary">LoBeMo</span>
        </h2>
        <p className="mb-10 text-lg text-muted-foreground">
          Accedé al sistema y comenzá a gestionar proyectos, clientes y equipos
          de manera centralizada.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary px-8 text-base font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 hover:bg-primary-hover sm:w-auto"
          >
            Acceder al sistema
          </Link>
          <Link
            href="/register"
            className="inline-flex h-12 w-full items-center justify-center rounded-lg border border-border bg-surface-elevated/50 px-8 text-base font-medium text-foreground backdrop-blur-sm transition-all duration-200 hover:bg-muted sm:w-auto"
          >
            Solicitar acceso
          </Link>
        </div>
      </div>
    </section>
  );
}
