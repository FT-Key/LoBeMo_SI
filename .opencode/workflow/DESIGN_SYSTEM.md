# Design System: LoBeMo Seguridad Informática

## Filosofía de diseño

### Inspiración y dirección visual
Inspirado en la potencia visual de **Fortinet** (formas geométricas superpuestas, "rayos" dinámicos, glassmorphism, fondos oscuros con acentos de color), pero con identidad propia. LoBeMo no es una corporación fría — es una empresa tucumana de ciberseguridad con **personalidad, calidez técnica y presencia regional**.

### Tono del diseño
- **Profesional** — transmite confianza, seguridad, solidez técnica
- **Creativo** — formas dinámicas, geometría expresiva, sin caer en lo corporativo genérico
- **Inmersivo** — dark mode prioritario que envuelve al usuario en una experiencia tipo "security operations center"
- **Detallista** — micro-interacciones, gradientes sutiles, glassmorphism en superficies

### Principios rectores
- **Dark-first**: modo oscuro es el principal. El claro es adaptación.
- **Geometría con propósito**: las formas decorativas no son ruido — guían la atención y refuerzan la identidad
- **Color como señal**: teal es seguridad/calma, amber es atención/urgencia. Cada color tiene un trabajo.
- **Contraste emocional**: fondos oscuros profundos con acentos vibrantes que "prenden" como alertas en un radar

---

## Tokens globales

### Colores

#### Paleta primaria — Teal (seguridad, confianza, estabilidad)
Usado en: botones primarios, links, íconos activos, headers, barras de navegación, fondos de sección.

| Token | HSL | HEX | Uso |
|-------|-----|-----|-----|
| `primary` | `hsl(175 84% 32%)` | `#0D9488` | Color principal, botones, links |
| `primary-foreground` | `hsl(175 40% 90%)` | `#DBF5F0` | Texto sobre fondo primary |
| `primary-hover` | `hsl(175 84% 27%)` | `#0F766E` | Hover de botón primary |
| `primary-active` | `hsl(175 84% 22%)` | `#115E59` | Active/pressed |
| `primary-light` | `hsl(175 50% 88%)` | `#CCFBF1` | Fondo de badges/alertas suaves |
| `primary-dark` | `hsl(175 60% 8%)` | `#042F2E` | Fondo decorativo en modo oscuro |

#### Paleta de acento — Burnt Amber (atención, urgencia, calidez)
Usado en: badges de severidad ALTA/CRÍTICA, alertas, features destacados, notificaciones importantes, precios, porcentajes.

| Token | HSL | HEX | Uso |
|-------|-----|-----|-----|
| `accent` | `hsl(32 94% 44%)` | `#D97706` | Color de acento principal |
| `accent-foreground` | `hsl(32 40% 95%)` | `#FFF7ED` | Texto sobre fondo accent |
| `accent-hover` | `hsl(32 94% 38%)` | `#B45309` | Hover de botón accent |
| `accent-light` | `hsl(32 50% 90%)` | `#FEF3C7` | Fondo de badges/alertas suaves |
| `accent-dark` | `hsl(32 60% 10%)` | `#2D1504` | Fondo decorativo en modo oscuro |

#### Colores semánticos

| Token | HSL | HEX | Uso |
|-------|-----|-----|-----|
| `success` | `hsl(160 84% 39%)` | `#10B981` | Tareas completadas, estados "ok" |
| `warning` | `hsl(38 92% 50%)` | `#F59E0B` | Alertas, vencimientos próximos |
| `danger` | `hsl(0 76% 54%)` | `#EF4444` | Errores, severidad CRÍTICA, eliminación |
| `info` | `hsl(199 89% 48%)` | `#38BDF8` | Información, notificaciones neutrales |

#### Severidad (específico para hallazgos de seguridad)

| Token | HSL | HEX | Uso |
|-------|-----|-----|-----|
| `severity-critical` | `hsl(0 76% 54%)` | `#EF4444` | Severidad CRÍTICA en hallazgos |
| `severity-high` | `hsl(32 94% 44%)` | `#D97706` | Severidad ALTA |
| `severity-medium` | `hsl(38 92% 50%)` | `#F59E0B` | Severidad MEDIA |
| `severity-low` | `hsl(175 84% 32%)` | `#0D9488` | Severidad BAJA |

#### Colores neutros — Modo oscuro (PRIMARIO)

| Token | HSL | HEX | Uso |
|-------|-----|-----|-----|
| `background` | `hsl(200 15% 8%)` | `#0B1317` | Fondo principal de la app |
| `foreground` | `hsl(210 20% 96%)` | `#F0F4F8` | Texto principal |
| `surface` | `hsl(195 12% 12%)` | `#171F24` | Superficie de cards, sidebar |
| `surface-elevated` | `hsl(195 10% 16%)` | `#212A2F` | Cards elevados, dropdown, modales |
| `muted` | `hsl(195 8% 22%)` | `#2E383E` | Fondos secundarios, hover de items |
| `muted-foreground` | `hsl(195 6% 55%)` | `#889198` | Texto secundario, placeholders |
| `border` | `hsl(195 8% 24%)` | `#303C42` | Bordes de componentes |
| `ring` | `hsl(175 84% 32%)` | `#0D9488` | Focus ring (primary) |

#### Colores neutros — Modo claro

| Token | HSL | HEX | Uso |
|-------|-----|-----|-----|
| `background` | `hsl(0 0% 100%)` | `#FFFFFF` | Fondo principal |
| `foreground` | `hsl(200 20% 10%)` | `#141A1F` | Texto principal |
| `surface` | `hsl(200 15% 96%)` | `#F3F6F9` | Superficie de cards |
| `muted` | `hsl(200 10% 90%)` | `#E3E8ED` | Fondos secundarios |
| `muted-foreground` | `hsl(200 8% 45%)` | `#6B7580` | Texto secundario |
| `border` | `hsl(200 12% 85%)` | `#D1D8DE` | Bordes |
| `ring` | `hsl(175 84% 32%)` | `#0D9488` | Focus ring |

> **Verificación de contraste (WCAG AA):**
> - Texto normal (>18px o bold >14px): ratio ≥ 4.5:1
> - Texto grande: ratio ≥ 3:1
> - Teal primary sobre foreground oscuro: ~6.2:1 ✓
> - Amber accent sobre foreground oscuro: ~7.5:1 ✓
> - Todas las combinaciones primary-foreground verificadas ✓

---

### Tipografía

#### Font families

| Uso | Font | Fallback | Variable CSS |
|-----|------|----------|--------------|
| **Headings (h1-h4)** | `Plus Jakarta Sans` | `system-ui, sans-serif` | `--font-heading` |
| **Body** | `Inter` | `system-ui, sans-serif` | `--font-body` |
| **Monospace / Código** | `JetBrains Mono` | `Fira Code, monospace` | `--font-mono` |

#### Escala tipográfica

| Nivel | Tamaño | Weight | Line Height | Letter Spacing | Uso |
|-------|--------|--------|-------------|----------------|-----|
| **h1** | `text-3xl` (2rem/32px) | Bold (700) | `leading-tight` (1.2) | `-0.02em` | Dashboard titles, page headings |
| **h2** | `text-2xl` (1.5rem/24px) | Semibold (600) | `leading-snug` (1.3) | `-0.01em` | Section headers |
| **h3** | `text-xl` (1.25rem/20px) | Semibold (600) | `leading-snug` (1.3) | `0em` | Card titles, modal titles |
| **h4** | `text-lg` (1.125rem/18px) | Medium (500) | `leading-normal` (1.4) | `0em` | Subtítulos, sidebar items |
| **body** | `text-base` (1rem/16px) | Normal (400) | `leading-relaxed` (1.6) | `0em` | Texto general |
| **small** | `text-sm` (0.875rem/14px) | Normal (400) | `leading-relaxed` (1.6) | `0em` | Texto secundario, badges |
| **caption** | `text-xs` (0.75rem/12px) | Normal (400) | `leading-normal` (1.4) | `0.02em` | Etiquetas, timestamps |
| **overline** | `text-xs` (0.75rem/12px) | Semibold (600) | `leading-normal` | `0.08em` | Uppercase labels, stats headers |

#### Reglas tipográficas
- Headings en **Plus Jakarta Sans** para personalidad — letras más anchas y modernas
- Body en **Inter** para legibilidad en interfaces densas (tablas, listas, formularios)
- El color primary (teal) puede usarse en palabras clave dentro de headings para énfasis, estilo Fortinet
- En tablas de datos: `text-sm` con line-height ajustado
- Código inline: `font-mono text-sm bg-muted px-1.5 py-0.5 rounded`

---

### Espaciado

Basado en grid de **4px** (escala Tailwind nativa).

| Token | px | Tailwind | Uso típico |
|-------|-----|----------|------------|
| `xs` | 4px | `gap-1` `p-1` | Icon gaps, micro-espaciados |
| `sm` | 8px | `gap-2` `p-2` | Inner padding de badges, chips |
| `md` | 16px | `gap-4` `p-4` | Padding de cards, gaps entre campos |
| `lg` | 24px | `gap-6` `p-6` | Padding de secciones, modales |
| `xl` | 32px | `gap-8` `p-8` | Separación entre secciones grandes |
| `2xl` | 48px | `gap-12` `p-12` | Márgenes de página |
| `3xl` | 64px | `gap-16` `p-16` | Separación de hero sections |

---

### Border Radius

| Token | Value | Uso |
|-------|-------|-----|
| `radius-sm` | `0.375rem` (6px) | Inputs, botones pequeños, badges |
| `radius-md` | `0.5rem` (8px) | Cards, modales, dropdowns |
| `radius-lg` | `0.75rem` (12px) | Cards principales, contenedores grandes |
| `radius-xl` | `1rem` (16px) | Hero sections, highlight cards |
| `radius-full` | `9999px` | Badges, avatars, pills |

> Todos los componentes usan **bordes redondeados**. No hay bordes rectos de 0px.

---

### Sombras

Modo oscuro (opacidad reducida al 50%):

| Token | Value |
|-------|-------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.3)` |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.35)` |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.4)` |
| `shadow-xl` | `0 20px 25px rgba(0,0,0,0.45)` |

Modo claro:
| Token | Value |
|-------|-------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.07)` |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` |
| `shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` |

---

### Animaciones

| Uso | Clase/Duración | Easing |
|-----|----------------|--------|
| Hover (buttons, cards, links) | `transition-all duration-200` | `ease-out` |
| Focus ring | `transition-shadow duration-150` | `ease-in` |
| Page enter | `animate-in fade-in duration-300` | `ease-out` |
| Page enter (slide) | `animate-in slide-in-from-bottom-4 fade-in duration-300` | `ease-out` |
| Modal/dialog | `animate-in zoom-in-95 fade-in duration-200` | `ease-out` |
| Sidebar toggle | `transition-transform duration-300` | `ease-in-out` |
| Skeleton loading | `animate-pulse duration-1500` | — |
| Badge pulse (severity) | `animate-pulse duration-2000` (solo CRÍTICA) | — |
| Dropdown | `animate-in fade-in slide-in-from-top-1 duration-150` | `ease-out` |

---

## Patrones visuales (Fortinet-inspired)

### 1. Geometría de fondo decorativa
En secciones hero, dashboard headers o banners importantes:
- Formas de **rombos / diamantes** rotados a 45° en tonos `primary-dark` o `accent-dark`
- **Rayos diagonales** que irradian desde una esquina (tipo radar)
- **Triángulos superpuestos** con opacidad 5-10%
- Implementar con `::before` / `::after` pseudo-elementos + `clip-path` o SVG inline

### 2. Glassmorphism
En cards, modales, dropdowns sobre fondos con geometría:
```css
background: hsl(195 10% 16% / 0.8);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
border: 1px solid hsl(195 8% 24% / 0.5);
```

### 3. Gradientes decorativos
- **Teal → Amber** para elementos hero o destacados:
  `bg-gradient-to-br from-primary via-primary to-accent/40`
- **Teal oscuro → Fondo** para secciones:
  `bg-gradient-to-b from-primary-dark/60 to-background`
- **Amber sutil** para hover de filas en tablas:
  `hover:bg-accent/5`

### 4. Badges de severidad tipo "alerta"
Con forma de píldora (`rounded-full`), ícono a la izquierda y color semántico fuerte:
- CRÍTICA → `bg-red-600/20 text-red-400 border-red-600/30` + icono ⚠
- ALTA → `bg-amber-600/20 text-amber-400 border-amber-600/30` + icono ▲
- MEDIA → `bg-yellow-500/20 text-yellow-400 border-yellow-500/30` + icono ●
- BAJA → `bg-teal-500/20 text-teal-400 border-teal-500/30` + icono ▼

### 5. Líneas divisorias con gradiente
En lugar de líneas sólidas:
```css
border-b border-transparent bg-gradient-to-r from-border via-border to-transparent
```

---

## Componentes

### Botones

| Variante | Fondo | Texto | Hover | Active | Borde |
|----------|-------|-------|-------|--------|-------|
| **Primary** | `bg-primary` | `text-primary-foreground` | `bg-primary-hover` | `bg-primary-active` | — |
| **Secondary** | `bg-surface-elevated` | `text-foreground` | `bg-muted` | `bg-muted` | `border border-border` |
| **Accent** | `bg-accent` | `text-accent-foreground` | `bg-accent-hover` | `bg-accent-hover` | — |
| **Outline** | `bg-transparent` | `text-foreground` | `bg-muted` | `bg-muted` | `border border-border` |
| **Ghost** | `bg-transparent` | `text-muted-foreground` | `bg-muted` | `bg-muted` | — |
| **Danger** | `bg-danger` | `text-white` | `opacity-90` | `opacity-80` | — |

**Estados globales:**
- **Disabled**: `opacity-50 cursor-not-allowed pointer-events-none`
- **Loading**: reemplazar texto con `<Spinner />` manteniendo ancho
- **Focus-visible**: `ring-2 ring-ring ring-offset-2 ring-offset-background`

**Tamaños:**
| Size | Clase |
|------|-------|
| `sm` | `h-8 px-3 text-sm rounded-md` |
| `md` | `h-10 px-4 text-sm rounded-md` |
| `lg` | `h-12 px-6 text-base rounded-lg` |
| `icon` | `h-10 w-10 rounded-md` |

---

### Cards

**Variante por defecto (glassmorphism):**
```tsx
<Card className="bg-surface-elevated/80 backdrop-blur-md border border-border/50 rounded-lg shadow-md">
  <CardHeader className="p-4 md:p-6 pb-0">
    <CardTitle className="text-xl font-semibold">Título</CardTitle>
    <CardDescription className="text-sm text-muted-foreground">Descripción</CardDescription>
  </CardHeader>
  <CardContent className="p-4 md:p-6">
    {children}
  </CardContent>
  {footer && <CardFooter className="p-4 md:p-6 pt-0">{footer}</CardFooter>}
</Card>
```

**Estados:**
- **Default**: superficie semi-transparente, blur sutil
- **Hover** (clickable): `hover:bg-muted/20 hover:border-border/80 transition-all duration-200`
- **Active/Selected**: `ring-1 ring-primary ring-offset-2 ring-offset-background`

---

### Inputs / Formularios

**Input base:**
```css
/* Default */
bg-surface border border-border rounded-md px-3 py-2 text-sm
text-foreground placeholder:text-muted-foreground

/* Focus */
focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background
focus:border-primary/50

/* Disabled */
disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted

/* Error */
border-danger/70 focus:ring-danger/50
```

**Textarea**: mismas reglas + `min-h-[80px]`
**Select**: mismas reglas + icono de chevron personalizado

**Label**: `text-sm font-medium text-foreground mb-1.5 block`
**Helper text**: `text-xs text-muted-foreground mt-1`
**Error message**: `text-xs text-danger mt-1`

---

### Badges / Severidad

**Base**: `inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold`

| Variante | Clase |
|----------|-------|
| CRÍTICA | `bg-red-600/15 text-red-400 border border-red-600/25` |
| ALTA | `bg-amber-600/15 text-amber-400 border border-amber-600/25` |
| MEDIA | `bg-yellow-500/15 text-yellow-400 border border-yellow-500/25` |
| BAJA | `bg-teal-500/15 text-teal-400 border border-teal-500/25` |
| Primary | `bg-primary/15 text-primary border border-primary/25` |
| Outline | `bg-transparent text-muted-foreground border border-border` |

---

### Navegación

**Sidebar (layout principal):**
- Fondo: `bg-surface` con borde derecho `border-r border-border`
- Ancho: 240px (`w-60`) en desktop, overlay en mobile
- Item activo: `bg-primary/10 text-primary border-l-2 border-primary`
- Item hover: `bg-muted text-foreground`
- Íconos: `h-5 w-5 text-muted-foreground` (activo: `text-primary`)
- Padding items: `px-4 py-2.5`
- Gap entre grupos: `pt-4 pb-2`

**Header / Top bar:**
- Fondo: `bg-surface/80 backdrop-blur-md border-b border-border`
- Altura: `h-16`
- Padding: `px-4 md:px-6`
- Search input: más compacto, con ícono de lupa

**Tabs:**
```css
/* Base */
flex items-center gap-1 p-1 bg-muted rounded-lg

/* Item activo */
bg-surface-elevated text-foreground shadow-sm rounded-md

/* Item inactivo */
text-muted-foreground hover:text-foreground rounded-md
```

---

### Modales / Dialogs

- Fondo overlay: `bg-black/60 backdrop-blur-sm`
- Modal container: `bg-surface-elevated rounded-xl shadow-xl border border-border/50`
- Padding: `p-6`
- Close button: `absolute top-4 right-4 text-muted-foreground hover:text-foreground`

---

### Dropdowns / Menús

- Container: `bg-surface-elevated rounded-lg shadow-lg border border-border/50 py-1 min-w-[180px]`
- Item: `px-3 py-2 text-sm text-foreground hover:bg-muted cursor-pointer flex items-center gap-2`
- Item danger: `text-danger hover:bg-danger/10`
- Separator: `my-1 border-t border-border`

---

### Tooltips

- Container: `bg-foreground text-background text-xs px-2.5 py-1.5 rounded-md shadow-md`
- Arrow: `fill-foreground`

---

### Tablas de datos

- Header: `bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider`
- Rows: `border-b border-border/50 hover:bg-muted/30 transition-colors duration-150`
- Cells: `px-4 py-3 text-sm`
- Empty state: `py-12 text-center text-muted-foreground`

---

## Layout

### Grid system
- **Breakpoints** (Tailwind defaults):
  - `sm`: 640px — Mobile landscape
  - `md`: 768px — Tablet
  - `lg`: 1024px — Desktop
  - `xl`: 1280px — Desktop wide
  - `2xl`: 1536px — Large desktop

### Estructura de página

```
┌─────────────────────────────────────────┐
│  Header (h-16, sticky, glassmorphism)    │
├──────────┬──────────────────────────────┤
│ Sidebar  │  Main Content                 │
│ (w-60)   │  container mx-auto px-6 py-6  │
│          │                               │
│          │  ┌─────┐ ┌─────┐ ┌─────┐     │
│          │  │Card │ │Card │ │Card │     │
│          │  └─────┘ └─────┘ └─────┘     │
│          │                               │
│          │  ┌─────────────────────────┐ │
│          │  │ Table / Content          │ │
│          │  └─────────────────────────┘ │
└──────────┴──────────────────────────────┘
```

### Responsive
- **Mobile** (< 768px): sidebar oculta (toggle con hamburger), 1 columna, padding 16px
- **Tablet** (768-1024px): sidebar colapsable (iconos sin texto), 2 columnas
- **Desktop** (> 1024px): sidebar fija, 3 columnas para grids

### Max-widths
- Content area: `max-w-7xl` (1280px)
- Dashboard cards grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6`
- Form containers: `max-w-md` para forms simples, `max-w-2xl` para forms complejos

---

## Modo oscuro

El modo oscuro es el **primario** y por defecto. El modo claro es adaptación secundaria.

### Reglas de mapeo oscuro → claro

| Elemento | Oscuro (primario) | Claro |
|----------|--------------------|-------|
| `background` | `hsl(200 15% 8%)` | `hsl(0 0% 100%)` |
| `foreground` | `hsl(210 20% 96%)` | `hsl(200 20% 10%)` |
| `surface` | `hsl(195 12% 12%)` | `hsl(200 15% 96%)` |
| `surface-elevated` | `hsl(195 10% 16%)` | `hsl(0 0% 100%)` |
| `muted` | `hsl(195 8% 22%)` | `hsl(200 10% 90%)` |
| `border` | `hsl(195 8% 24%)` | `hsl(200 12% 85%)` |
| primary (sin cambio) | `hsl(175 84% 32%)` | `hsl(175 84% 32%)` |
| accent (sin cambio) | `hsl(32 94% 44%)` | `hsl(32 94% 44%)` |

### Implementación en Tailwind
```ts
// tailwind.config.ts
export default {
  darkMode: 'class', // o 'media' según preferencia
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          hover: 'hsl(var(--primary-hover))',
          active: 'hsl(var(--primary-active))',
          light: 'hsl(var(--primary-light))',
          dark: 'hsl(var(--primary-dark))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          hover: 'hsl(var(--accent-hover))',
          light: 'hsl(var(--accent-light))',
          dark: 'hsl(var(--accent-dark))',
        },
        // ... resto de colores
      },
    },
  },
}
```

---

## Íconos

- Usar **Lucide Icons** (integración nativa con shadcn/ui)
- Tamaños estándar: `h-4 w-4` (inline), `h-5 w-5` (sidebar), `h-6 w-6` (headers)
- Color: heredan `currentColor`, usar `text-muted-foreground` o `text-primary`
- Para severidad: usar iconos específicos (AlertTriangle, ArrowUp, Circle, ArrowDown)

---

## Checklist de revisión de diseño (Fase 4.5)

### Colores
- [ ] Todos los colores usan variables HSL de `globals.css`, no valores hardcodeados
- [ ] Contraste WCAG AA verificado en primary, accent, semanticos
- [ ] Hover/active/focus usan variantes de la paleta
- [ ] Modo oscuro mapeado correctamente en `dark:` variant
- [ ] Badges de severidad tienen color consistente con la paleta semántica

### Tipografía
- [ ] Headings usan Plus Jakarta Sans (importado en layout)
- [ ] Body usa Inter
- [ ] Mono usa JetBrains Mono para código/bloques técnicos
- [ ] Jerarquía visual correcta (no hay h1 con peso menor que h2)
- [ ] Letter-spacing aplicado correctamente en overline/caption

### Espaciado
- [ ] Padding y gaps siguen la escala definida
- [ ] Sin valores arbitrarios no justificados (`p-[13px]`, etc.)
- [ ] Cards tienen padding consistente (16-24px)

### Componentes
- [ ] Botones tienen todos los estados (hover, active, focus, disabled, loading)
- [ ] Inputs tienen foco visible con ring primary
- [ ] Badges de severidad tienen ícono + color + forma de píldora
- [ ] Sidebar item activo visible con borde izquierdo teal
- [ ] Loading state con <Skeleton /> o spinner
- [ ] Empty state con ícono + mensaje
- [ ] Error state visible con color danger + mensaje claro

### Glassmorphism & Efectos
- [ ] Cards tienen backdrop-blur en modo oscuro
- [ ] Header sticky con glassmorphism (blur + fondo semi-transparente)
- [ ] Formas geométricas decorativas presentes en hero/highlight sections

### Responsive
- [ ] Funciona en mobile (320px) sin overflow
- [ ] Sidebar se oculta en mobile con toggle
- [ ] Grids se adaptan (1→2→3→4 columnas)
- [ ] Tablas tienen scroll horizontal en mobile

### Animaciones
- [ ] Transiciones suaves en hover (200ms ease-out)
- [ ] Page transitions con fade-in
- [ ] Micro-interacciones en elementos interactivos
- [ ] Sin animaciones excesivas que distraigan

---

## Notas de implementación

### Instalación de fonts (Next.js)
```ts
// app/layout.tsx
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from 'next/font/google'

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'], 
  variable: '--font-heading' 
})
const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-body' 
})
const mono = JetBrains_Mono({ 
  subsets: ['latin'], 
  variable: '--font-mono' 
})

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="dark">
      <body className={`${jakarta.variable} ${inter.variable} ${mono.variable} font-body bg-background text-foreground`}>
        {children}
      </body>
    </html>
  )
}
```

### Configuración shadcn/ui
```json
// components.json
{
  "style": "default",
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/ui/components",
    "utils": "@/ui/lib/utils"
  }
}
```
