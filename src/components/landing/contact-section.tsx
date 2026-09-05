"use client"

import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ScrollReveal } from "@/lib/use-scroll-reveal"
import { Send, Phone, Mail, MapPin, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { MapLeaflet } from "./map-leaflet"
import { createContactoSchema, SERVICIOS_CONTACTO_LABELS } from "@/shared/validation/contacto"
import type { CreateContactoFormData } from "@/shared/validation/contacto"

const CONTACT_INFO = [
  {
    icon: Phone,
    label: "Teléfono",
    value: "+54 9 381 123-4567",
    href: "tel:+5493811234567",
  },
  {
    icon: Mail,
    label: "Email",
    value: "info@lobemo.com",
    href: "mailto:info@lobemo.com",
  },
  {
    icon: MapPin,
    label: "Dirección",
    value: "Rivadavia 1050, San Miguel de Tucumán",
    href: null,
  },
]

function ArgentinaClock() {
  const [time, setTime] = useState("")

  useEffect(() => {
    const update = () => {
      setTime(
        new Intl.DateTimeFormat("es-AR", {
          timeZone: "America/Argentina/Tucuman",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(new Date())
      )
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
      <span className="font-semibold">Argentina</span>
      <span className="font-mono text-base font-bold text-foreground tabular-nums">
        {time}
      </span>
      <span className="text-xs">ART (UTC-3)</span>
    </div>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1.5 text-xs text-danger">{message}</p>
}

export function ContactSection() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const mountedRef = useRef(false)

  useEffect(() => { mountedRef.current = true }, [])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateContactoFormData>({
    resolver: zodResolver(createContactoSchema),
    defaultValues: {
      nombre: "",
      email: "",
      telefono: "",
      servicio: "",
      mensaje: "",
    },
  })

  async function onSubmit(data: CreateContactoFormData) {
    setStatus("idle")
    setErrorMsg("")

    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (res.ok) {
        setStatus("success")
        reset()
      } else {
        setStatus("error")
        setErrorMsg(result.error || "Error al enviar el mensaje")
      }
    } catch {
      setStatus("error")
      setErrorMsg("Error de conexión. Intentá nuevamente.")
    }
  }

  const inputClass = "w-full rounded-xl border bg-background/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
  const inputNormal = `${inputClass} border-border`
  const inputError = `${inputClass} border-danger`

  return (
    <section id="contacto" className="relative overflow-hidden px-4 py-24 md:px-8 md:py-32">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/3 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Contacto
            </div>
            <h2
              className="mb-6 text-5xl font-black tracking-tighter md:text-6xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="text-foreground">Gestioná tu seguridad con</span>{" "}
              <span className="text-primary">LoBeMo</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              ¿Necesitás proteger tu infraestructura? Contactanos para una consulta sin compromiso. Te respondemos en menos de 24 horas.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Formulario */}
          <ScrollReveal>
            <div className="rounded-2xl border border-border/40 bg-surface/60 p-6 backdrop-blur-sm md:p-8">
              <h3 className="mb-6 text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                Envianos tu consulta
              </h3>

              {status === "success" && (
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-success/20 bg-success/10 p-4 text-success">
                  <CheckCircle className="size-5 shrink-0" />
                  <span className="text-sm font-medium">¡Mensaje enviado! Te responderemos pronto.</span>
                </div>
              )}

              {status === "error" && (
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-danger/20 bg-danger/10 p-4 text-danger">
                  <AlertCircle className="size-5 shrink-0" />
                  <span className="text-sm font-medium">{errorMsg}</span>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  if (!mountedRef.current) {
                    e.preventDefault()
                    return
                  }
                  void handleSubmit(onSubmit)(e)
                }}
                className="space-y-5"
                noValidate
              >
                {/* Nombre */}
                <div>
                  <label htmlFor="nombre" className="mb-1.5 block text-sm font-medium text-foreground">
                    Nombre completo <span className="text-danger">*</span>
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    {...register("nombre")}
                    className={errors.nombre ? inputError : inputNormal}
                    placeholder="Tu nombre"
                  />
                  <FieldError message={errors.nombre?.message} />
                </div>

                {/* Email + Teléfono */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      {...register("email")}
                      className={errors.email ? inputError : inputNormal}
                      placeholder="tu@email.com"
                    />
                    <FieldError message={errors.email?.message} />
                  </div>
                  <div>
                    <label htmlFor="telefono" className="mb-1.5 block text-sm font-medium text-foreground">
                      Teléfono
                    </label>
                    <input
                      id="telefono"
                      type="tel"
                      {...register("telefono")}
                      className={errors.telefono ? inputError : inputNormal}
                      placeholder="+54 9 381 ..."
                    />
                    <FieldError message={errors.telefono?.message} />
                  </div>
                </div>

                {/* Servicio */}
                <div>
                  <label htmlFor="servicio" className="mb-1.5 block text-sm font-medium text-foreground">
                    Servicio de interés
                  </label>
                  <select
                    id="servicio"
                    {...register("servicio")}
                    className={errors.servicio ? inputError : inputNormal}
                  >
                    <option value="">Seleccioná un servicio</option>
                    {Object.entries(SERVICIOS_CONTACTO_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <FieldError message={errors.servicio?.message} />
                </div>

                {/* Mensaje */}
                <div>
                  <label htmlFor="mensaje" className="mb-1.5 block text-sm font-medium text-foreground">
                    Mensaje <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="mensaje"
                    rows={4}
                    {...register("mensaje")}
                    className={errors.mensaje ? `${inputError} resize-none` : `${inputNormal} resize-none`}
                    placeholder="Contanos sobre tu empresa y qué necesitás..."
                  />
                  <FieldError message={errors.mensaje?.message} />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary-hover hover:shadow-2xl hover:shadow-primary/30 disabled:opacity-50 sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      Enviar mensaje
                    </>
                  )}
                </button>
              </form>
            </div>
          </ScrollReveal>

          {/* Info de contacto + Mapa */}
          <ScrollReveal delay={100}>
            <div className="flex flex-col gap-6">
              {/* Info cards */}
              <div className="grid gap-4 sm:grid-cols-2">
                {CONTACT_INFO.map((item) => (
                  <div
                    key={item.label}
                    className="group rounded-2xl border border-border/40 bg-surface/60 p-5 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
                  >
                    <div className="mb-3 inline-flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-all group-hover:scale-110">
                      <item.icon className="size-5" />
                    </div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {item.label}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-sm font-medium text-foreground transition-colors hover:text-primary"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-foreground">{item.value}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Mapa */}
              <div className="overflow-hidden rounded-2xl border border-border/40 bg-surface/60 backdrop-blur-sm">
                <div className="p-4">
                  <h4 className="mb-2 text-sm font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                    Nuestra ubicación
                  </h4>
                  <p className="text-xs text-muted-foreground">Rivadavia 1050, San Miguel de Tucumán</p>
                </div>
                <MapLeaflet
                  lat={-26.8229}
                  lng={-65.2126}
                  zoom={16}
                  height="256px"
                />
              </div>

              {/* Reloj Argentina */}
              <div className="flex items-center justify-center rounded-2xl border border-border/40 bg-surface/60 p-5 backdrop-blur-sm">
                <ArgentinaClock />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
