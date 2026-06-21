import Link from "next/link";
import { Shield } from "lucide-react";

interface HeroSectionProps {
  hasSuperAdmin: boolean;
}

export function HeroSection({ hasSuperAdmin }: HeroSectionProps) {
  return (
    <header className="relative flex min-h-screen flex-col">
      <nav className="flex items-center justify-between px-4 py-4 md:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <span
            className="text-lg font-bold tracking-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            LoBeMo
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-all duration-200 hover:bg-primary-hover"
          >
            Iniciar sesión
          </Link>
          {!hasSuperAdmin && (
            <Link
              href="/register"
              className="inline-flex h-10 items-center justify-center rounded-md border border-accent/50 px-5 text-sm font-medium text-accent transition-all duration-200 hover:bg-accent/10"
            >
              Primer inicio
            </Link>
          )}
        </div>
      </nav>

      <div className="flex flex-1 items-center justify-center px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Seguridad Informática en Tucumán, NOA
          </div>
          <h1
            className="mb-6 text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Gestión de Proyectos de{" "}
            <span className="text-primary">Ciberseguridad</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Centralizá la administración y seguimiento de servicios de
            ciberseguridad: clientes, proyectos, tareas y más. Todo en un solo
            lugar.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary px-8 text-base font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 hover:bg-primary-hover sm:w-auto"
            >
              Comenzar ahora
            </Link>
            {!hasSuperAdmin && (
              <Link
                href="/register"
                className="inline-flex h-12 w-full items-center justify-center rounded-lg border border-border bg-surface-elevated/50 px-8 text-base font-medium text-foreground backdrop-blur-sm transition-all duration-200 hover:bg-muted sm:w-auto"
              >
                Primer inicio — Registrar
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="h-8 w-5 rounded-full border border-border p-1">
          <div className="mx-auto h-2 w-1 rounded-full bg-muted-foreground" />
        </div>
      </div>
    </header>
  );
}
