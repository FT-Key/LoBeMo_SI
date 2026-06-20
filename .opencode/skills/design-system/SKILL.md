---
name: design-system
description: Sistema de diseno: tokens, colores, tipografia, componentes, animaciones, accesibilidad y buenas practicas de UX/UI
license: MIT
---

## Filosofia de diseno

- **Consistencia**: mismos tokens, mismos patrones en toda la app
- **Accesibilidad**: WCAG 2.1 AA minimo (4.5:1 texto normal, 3:1 texto grande)
- **Mobile-first**: disenar desde mobile hacia desktop
- **Progresivo**: complejidad visual creciente (skeleton → contenido real)
- **Atomico**: componer desde atoms hacia organismos (Atomic Design)

## Design Tokens

Los tokens se definen en `tailwind.config.ts` y `globals.css` como CSS custom properties.

### Colores (formato HSL)

```css
/* Paleta base */
--color-primary: 221 83% 53%;
--color-primary-foreground: 210 40% 98%;
--color-secondary: 210 40% 96%;
--color-secondary-foreground: 222 47% 11%;

/* Colores semanticos */
--color-success: 142 76% 36%;
--color-warning: 38 92% 50%;
--color-danger: 0 84% 60%;
--color-info: 199 89% 48%;

/* Neutros */
--color-background: 0 0% 100%;
--color-foreground: 222 47% 11%;
--color-muted: 210 40% 96%;
--color-muted-foreground: 215 16% 47%;
--color-border: 214 32% 91%;
--color-ring: 221 83% 53%;
```

### Modo oscuro

```css
.dark {
  --color-background: 222 47% 11%;
  --color-foreground: 210 40% 98%;
  --color-muted: 217 33% 17%;
  --color-border: 217 33% 25%;
}
```

Reglas para modo oscuro:
- No invertir colores directamente — ajustar saturacion y luminosidad
- Fondos oscuros, texto claro
- Sombras mas sutiles (menos opacas)
- Bordes ligeramente mas brillantes que el fondo

### Tipografia

```css
--font-heading: 'Inter', system-ui, sans-serif;
--font-body: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

Escala:

| Nivel | Size | Weight | Line Height |
|-------|------|--------|-------------|
| h1 | 3xl (2rem) | bold (700) | 1.2 |
| h2 | 2xl (1.5rem) | semibold (600) | 1.25 |
| h3 | xl (1.25rem) | semibold (600) | 1.3 |
| h4 | lg (1.125rem) | medium (500) | 1.35 |
| body | base (1rem) | normal (400) | 1.5 |
| small | sm (0.875rem) | normal (400) | 1.5 |
| caption | xs (0.75rem) | normal (400) | 1.5 |

### Espaciado

Basado en grid de 4px (Tailwind spacing scale):

| Token | px | Tailwind |
|-------|-----|---------|
| xs | 4px | `space-x-1` / `p-1` |
| sm | 8px | `space-x-2` / `p-2` |
| md | 16px | `space-x-4` / `p-4` |
| lg | 24px | `space-x-6` / `p-6` |
| xl | 32px | `space-x-8` / `p-8` |
| 2xl | 48px | `space-x-12` |
| 3xl | 64px | `space-x-16` |

### Border Radius

| Token | Value |
|-------|-------|
| sm | 0.375rem |
| md | 0.5rem |
| lg | 0.75rem |
| xl | 1rem |
| full | 9999px |

### Sombras

```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px rgba(0,0,0,0.07);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
--shadow-xl: 0 20px 25px rgba(0,0,0,0.15);
```

Modo oscuro: reducir opacidad de sombras al 50%.

## Arquitectura de componentes (Atomic Design)

### Atoms (componentes basicos)
- Button, Input, Label, Badge, Avatar, Icon
- Spinner, Skeleton, Separator

### Molecules (combinaciones de atoms)
- FormField (Label + Input + error message)
- Card (CardHeader + CardContent + CardFooter)
- SearchBar (Input + Button + Icon)
- Selector de variantes (Button group + indicador activo)

### Organisms (secciones completas)
- ProductCard (Image + Badge + Title + Price + Button)
- CategoryNav (arbol recursivo de links)
- ProductDetail (Gallery + Info + Variants + Actions)
- Navbar (Logo + NavLinks + Search + Cart + UserMenu)

### Templates (layouts de pagina)
- CatalogLayout (Sidebar + Content area)
- AdminLayout (Sidebar + Header + Content)

## Estados de componentes

Cada componente interactivo debe tener:

| Estado | Descripcion | Ejemplo |
|--------|-------------|---------|
| default | Estado base sin interaccion | Boton azul solido |
| hover | Raton sobre el elemento | Boton mas oscuro 10% |
| active | Click presionado | Boton escala 0.98 |
| focus-visible | Navegacion por teclado | Ring de 2px del color primary |
| disabled | No interactivo | Opacidad 50%, cursor not-allowed |
| loading | Operacion en curso | Spinner + texto "Cargando..." |
| error | Estado de error | Input con borde rojo + mensaje |
| empty | Sin datos | Icono + "No hay elementos" |

## Layout responsive

```css
/* Breakpoints (Tailwind defaults) */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Desktop wide */
2xl: 1536px /* Desktop超大 */
```

Reglas:
- Mobile: 1 columna, padding 16px, sidebar oculta (toggle)
- Tablet: 2 columnas, sidebar colapsable
- Desktop: 3+ columnas, sidebar fija

## Animaciones

| Uso | Clase Tailwind | Duracion |
|-----|---------------|----------|
| Fade in | `animate-in fade-in` | 200ms |
| Slide in from top | `animate-in slide-in-from-top` | 300ms |
| Slide in from left | `animate-in slide-in-from-left` | 300ms |
| Zoom in | `animate-in zoom-in` | 200ms |
| Spin (loading) | `animate-spin` | 1s |
| Pulse (skeleton) | `animate-pulse` | 2s |
| Transition hover | `transition-all duration-200` | 200ms |

Principios:
- Transiciones sutiles (< 300ms) para micro-interacciones
- Animaciones de entrada un poco mas largas (300-500ms)
- No animar elementos que aparecen instantaneamente (modales, alerts)
- Preferir `transition-*` de Tailwind sobre FramerMotion para casos simples
- FramerMotion solo para animaciones complejas (gestos, layout animations, scroll)

## Checklist de revision de diseno (Fase 4.5)

Usar esta lista al revisar fidelidad visual:

### Colores
- [ ] Los colores usan las variables CSS de DESIGN_SYSTEM.md, no valores hardcodeados
- [ ] Contraste de texto normal >= 4.5:1 (WCAG AA)
- [ ] Contraste de texto grande >= 3:1 (WCAG AA)
- [ ] Los estados hover/active/focus usan variantes de la paleta
- [ ] Modo oscuro: colores mapeados correctamente

### Tipografia
- [ ] Jerarquia visual correcta (h1 > h2 > h3)
- [ ] Font family consistente (headings vs body)
- [ ] Line height adecuado para lectura
- [ ] Tamaños responsivos en mobile/desktop

### Espaciado
- [ ] Margenes y paddings siguen la escala de 4px
- [ ] Consistencia vertical (mismos espaciados entre secciones)
- [ ] No hay `m-[valor-arbitrario]` ni `p-[valor-arbitrario]` sin justificacion

### Layout
- [ ] Funciona en mobile (320px) sin overflow horizontal
- [ ] Funciona en tablet (768px)
- [ ] Funciona en desktop (1280px)
- [ ] Sidebar/nav responsive correctamente

### Componentes
- [ ] Estados: hover, focus-visible, active, disabled implementados
- [ ] Loading state con skeleton mientras carga
- [ ] Empty state cuando no hay datos
- [ ] Error state con mensaje claro + accion de retry

### Animaciones
- [ ] Transiciones suaves en hover/focus
- [ ] Page transitions no son abruptas
- [ ] Skeleton loader aparece mientras carga
- [ ] No hay animaciones excesivas o molestas

### Accesibilidad
- [ ] Focus visible visible en todos los elementos interactivos
- [ ] Labels asociados a inputs
- [ ] Alt text en imagenes
- [ ] Roles ARIA en componentes interactivos complejos

## Integracion con Figma MCP

Cuando el Figma MCP oficial esta configurado, los agentes tienen herramientas adicionales.

### Herramientas disponibles

| Tool (Figma oficial) | Agente | Proposito |
|---------------------|--------|-----------|
| `get_design_context` | designer | Leer propiedades de nodos seleccionados (colores, tipografia, layout) |
| `use_figma` (remote) | design-strategist | Crear/modificar variables, componentes, frames en Figma |
| `generate_figma_design` (remote) | design-strategist | Convertir web/HTML a diseno Figma |
| `add_code_connect_map` | designer | Mapear nodos Figma a componentes del codigo |

### Flujo Figma → Codigo (designer)

1. `get_design_context` del nodo Figma seleccionado
2. Extraer: colores (HEX/HSL), tipografia (familia, tamano, peso), espaciado (padding, gap), efectos (sombra, blur)
3. Mapear los valores a CSS variables en `globals.css`
4. Configurar `tailwind.config.ts` con los valores exactos
5. El builder implementa los componentes usando esos tokens

### Flujo Vision → Figma (design-strategist)

1. Conversacion con el usuario define paleta, tipografia, espaciado
2. `use_figma` crea las variables y styles en Figma
3. Crea component sets en Figma para componentes clave
4. DESIGN_SYSTEM.md se mantiene como companion documento de texto

### Notas importantes

- El Figma MCP es **opcional**. Sin el, todo funciona con DESIGN_SYSTEM.md como fuente de verdad
- `use_figma` es solo remote server (no disponible en local/desktop)
- `get_design_context` funciona en ambos modos (remote y desktop)
- El MCP oficial de Figma es gratis durante beta, luego sera pago
