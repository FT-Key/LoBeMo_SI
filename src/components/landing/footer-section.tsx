import { Shield } from "lucide-react";
import Link from "next/link";

export function FooterSection() {
  return (
    <footer className="border-t border-border/50 px-4 py-12 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <span
                className="text-base font-bold"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                LoBeMo
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Seguridad Informática con enfoque regional. Protegemos tu
              infraestructura digital en el NOA.
            </p>
          </div>

          <div>
            <h4
              className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Accesos
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/login"
                  className="transition-colors hover:text-primary"
                >
                  Iniciar sesión
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="transition-colors hover:text-primary"
                >
                  Registro
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4
              className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Contacto
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Tucumán, Argentina</li>
              <li>NOA — Región Noroeste</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border/30 pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} LoBeMo Seguridad Informática. Todos
          los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
