"use client";

import Image from "next/image";

export function FooterSection({ onOpenLogin, onOpenPortal }: { onOpenLogin: () => void; onOpenPortal: () => void }) {
  return (
    <footer className="relative overflow-hidden border-t border-border/30">
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-surface/50 to-background" />

      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
        <div className="mb-12 grid gap-12 md:grid-cols-4">
          <div>
            <div className="mb-6">
              <Image
                src="/lobemo-extended.png"
                alt="LoBeMo"
                width={140}
                height={36}
                className="h-9 w-auto"
                style={{ width: "auto", height: "auto" }}
              />
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Seguridad Informática con enfoque regional. Protegemos tu infraestructura digital en el NOA.
            </p>
          </div>

          <div>
            <h4
              className="mb-6 text-sm font-bold uppercase tracking-wider text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Contacto
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="font-medium">+54 9 381 123-4567</li>
              <li className="font-medium">info@lobemo.com</li>
              <li className="font-medium">Rivadavia 1050, Tucumán</li>
              <li className="font-medium">Lun - Vie: 9:00 - 18:00 ART</li>
            </ul>
          </div>

          <div>
            <h4
              className="mb-6 text-sm font-bold uppercase tracking-wider text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Acceso
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <button
                  onClick={onOpenPortal}
                  className="font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  Clientes (Seguimiento)
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenLogin}
                  className="font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  Empleados
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4
              className="mb-6 text-sm font-bold uppercase tracking-wider text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Servicios
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="font-medium">Auditoría de Seguridad</li>
              <li className="font-medium">Pentesting Web</li>
              <li className="font-medium">Hardening de Sistemas</li>
            </ul>
          </div>
        </div>

        <div className="mb-8 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

        <div className="flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()}{" "}
            <span className="font-semibold text-foreground">LoBeMo</span> Seguridad Informática.
            <br className="sm:hidden" />
            <span className="hidden sm:inline"> Todos los derechos reservados.</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-accent" />
              Sistema en línea
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
