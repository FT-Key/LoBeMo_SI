---
name: tailwind-styles
description: Convenciones de Tailwind CSS, diseno con shadcn/ui, temas, responsive y patrones de componentes
license: MIT
---

## Framework UI

- Usar **shadcn/ui** como libreria de componentes base
- Los componentes se instalan en `src/ui/components/ui/`
- NO modifiques los componentes base de shadcn
- Los componentes de features van en `src/ui/components/features/`

## Convenciones

### Colores
- Usar colores semanticos: `primary`, `secondary`, `destructive`, `muted`, `accent`
- NO colores fijos (`blue-500`, `red-600`) en componentes, solo en tailwind.config.ts
- Modo oscuro con `dark:` variant y CSS variables de shadcn

### Layout
- Mobile-first responsive: `sm:`, `md:`, `lg:`, `xl:`
- `container mx-auto` para ancho maximo centrado
- Grid para layouts de cards: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Flexbox para layouts de una dimension

### Componentes
- Server Components por defecto
- `'use client'` solo cuando haya interactividad (useState, useEffect, eventos)
- Props tipadas con TypeScript estricto, exportadas

### Animaciones
- Transiciones suaves con `transition-all duration-200`
- Animaciones de Tailwind: `animate-in`, `fade-in`, `slide-in` (con shadcn)
- Framer Motion solo si se necesita algo complejo

## Patrones comunes

### Card con shadcn
```tsx
<Card>
  <CardHeader><CardTitle>Titulo</CardTitle><CardDescription>Desc</CardDescription></CardHeader>
  <CardContent>{children}</CardContent>
  <CardFooter><Button>Accion</Button></CardFooter>
</Card>
```

### Formulario con shadcn + react-hook-form + zod
```tsx
<form onSubmit={form.handleSubmit(onSubmit)}>
  <FormField control={form.control} name="email" render={...} />
  <Button type="submit">Enviar</Button>
</form>
```

### Pagina con layout responsive
```tsx
<div className="container mx-auto px-4 py-8">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {items.map(item => <ItemCard key={item.id} item={item} />)}
  </div>
</div>
```

### Loading skeleton
```tsx
<div className="space-y-4">
  {Array.from({ length: 3 }).map((_, i) => (
    <Skeleton key={i} className="h-20 w-full" />
  ))}
</div>
```

### Empty state
```tsx
<div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
  <InboxIcon className="h-12 w-12 mb-4" />
  <p className="text-lg">No hay elementos</p>
</div>
```
