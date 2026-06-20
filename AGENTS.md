# Reglas del equipo multi-agente

## Flujo de trabajo para historias de usuario (Quality Gate Loop)

Cuando recibas una solicitud de implementacion, sigue este proceso.
El flujo es un LOOP entre implementacion y quality gates hasta que todo pase.

### Fase 0: SETUP (pre-requisitos)

1. Si el usuario tiene una idea vaga o no existe .opencode/workflow/REQUIREMENTS.md:
   a. Indica al usuario que puede cambiar al agente @systems-analyst
      (presionando Tab) para definir los requisitos primero
   b. Una vez que exista .opencode/workflow/REQUIREMENTS.md, lo usaras como entrada
2. Si no existe .opencode/workflow/DESIGN_SYSTEM.md:
   a. Indica al usuario que puede cambiar al agente @design-strategist
      (presionando Tab) para definir la vision de diseno primero
3. Si ya existe .opencode/workflow/REQUIREMENTS.md, leelo para entender el contexto
4. Lee .opencode/workflow/STATE.md (solo el indice, no los historiales previos)
5. Busca la US en .opencode/workflow/REQUIREMENTS.md y obten el Trello cardId
6. **@pm-agent**: Leer card de Trello (descripcion + acceptance criteria)
7. **@pm-agent**: Mover card a "In Progress"
8. **@state-manager**: Crear `.opencode/workflow/history/US-XXX.md` con card info y actualizar STATE

### Fase 1: PLAN (si afecta a multiples archivos)

1. Si el cambio es trivial (1-2 archivos), puedes saltar esta fase
2. Escribe el plan en `.opencode/workflow/history/US-XXX.md` seccion ## Plan
3. Define: archivos a crear/modificar, componentes, API routes, tipos
4. Si el plan es complejo, delega a @architect via Task tool
5. **@state-manager**: Actualizar STATE (Phase: P1 - Plan)
6. NO implementes sin plan si afecta a multiples archivos

### Fase 2: IMPLEMENT

1. Lee el plan de `.opencode/workflow/history/US-XXX.md` si existe
2. Carga skills relevantes (`skill({ name: "..." })`) segun el stack del proyecto y lo que toque la tarea. Los skills disponibles estan en `.opencode/skills/`. Ejemplos:
   - `design-principles` — siempre (SOLID, KISS, DRY, YAGNI)
   - Skills de UI, DB, API, auth, validacion, etc. — segun corresponda al stack del proyecto
3. Para implementacion directa: hazlo tu mismo
4. Para implementacion compleja: delega a @builder via Task tool
5. Ejecuta `npm run build` para verificar compilacion
6. **@state-manager**: Actualizar STATE (Phase: P2 - Implement)

### Fase 3: QUALITY GATES (LOOP)

Ejecuta los gates EN PARALELO via Task tool cuando sea posible.

Carga los gates que apliquen a la US:

**Gate 3.1 Code Review (@reviewer)**
- Revisa calidad, bugs, buenas practicas, seguridad
- Reporta issues bloqueantes y no bloqueantes
- Verifica que se sigan las convenciones del proyecto

**Gate 3.2 Tests (@tester)**
- Ejecuta tests relevantes (no toda la suite si no es necesario)
- Si fallan: diagnostica MISSING_BEHAVIOR vs TEST_BROKEN
- Reporta resultados detallados

**Gate 3.3 Lint + Typecheck (@linter)**
- Ejecuta las herramientas de linting y typecheck del proyecto
- Aplica auto-fix si es posible
- Reporta errores restantes

**Gate 3.4 Design Review (@designer)** (solo si la US toca UI)
- Verifica fidelidad visual contra .opencode/workflow/DESIGN_SYSTEM.md
- Revisa colores, tipografia, espaciado, tokens
- Reporta issues de diseno

**Al terminar los gates:**
1. **@state-manager**: Recopilar resultados en `.opencode/workflow/history/US-XXX.md`
2. Evaluar resultados:
   - Si TODOS los gates pasaron → continuar a Fase 4
   - Si ALGUN gate fallo → **volver a Fase 2** (corregir + rebuild)
   - El bucle se repite hasta que todos los gates pasen

### Fase 4: FINALIZE

1. **@state-manager**: Escribir resumen final en `.opencode/workflow/history/US-XXX.md` con:
   - Archivos creados/modificados
   - Decisiones tecnicas clave
   - Resultados de todos los gates
2. **@state-manager**: Actualizar STATE (marcar US en History, limpiar Current)

### Fase 5: GIT + PR

1. **@git-assistant**: Crear branch con nombre descriptivo (`feat/` o `fix/`)
2. **@git-assistant**: Commit con conventional commits (`feat|fix|chore|refactor`)
3. **@git-assistant**: Push y crear Pull Request
4. Si el usuario autorizo merge explicitamente → mergear
5. **@state-manager**: Actualizar STATE con branch y PR link

### Fase 6: TRELLO DONE

1. **@pm-agent**: Mover card a "Done"
2. **@state-manager**: Marcar US como ✅ Done en STATE

---

## Como delegar a subagentes

Usa el Task tool, NO @mention:

```
Task({
  description: "Implementar componente X",
  prompt: "Instrucciones detalladas para el subagente...",
  subagent_type: "builder"
})
```

### Tipos de subagente disponibles

| Agente | Para que |
|--------|----------|
| `architect` | Planificar arquitectura, escribir plan en .opencode/workflow/history/ |
| `builder` | Implementar codigo siguiendo el plan |
| `reviewer` | Code review de PRs o cambios |
| `tester` | Ejecutar tests y diagnosticar fallos |
| `linter` | Linting, typecheck y formato del proyecto |
| `git-assistant` | Git: branches, commits, PRs |
| `pm-agent` | Operaciones PM: leer/mover/comentar cards (Trello, Taiga, etc.) |
| `designer` | Design review: verificar fidelidad visual contra .opencode/workflow/DESIGN_SYSTEM.md |
| `state-manager` | Mantener .opencode/workflow/STATE.md y .opencode/workflow/history/ |
| `git-specialist` | Git/GitHub experto — solo Git, NO explora codigo |

### Agentes de dialogo (mode: all)

| Agente | Para que |
|--------|----------|
| `systems-analyst` | Analizar requisitos de negocio, escribir .opencode/workflow/REQUIREMENTS.md |
| `design-strategist` | Definir vision de diseno, escribir .opencode/workflow/DESIGN_SYSTEM.md |

### Como cargar una skill

Las skills proveen conocimiento contextual para tareas especificas:

```
skill({ name: "hexagonal-architecture" })
```

Se pueden cargar multiples skills al inicio de una tarea.

## Tareas paralelas vs secuenciales

- **Paralelo**: tareas independientes (ej: gates en Fase 3, crear 2 componentes no relacionados)
  → Pon todos los Task en un solo mensaje

- **Secuencial**: tareas que dependen una de otra (ej: implementar, luego gates)
  → Task en mensajes separados, esperando resultado de cada uno

## Convenciones del proyecto

Define aqui las convenciones de tu stack tecnologico (framework, librerias, testing, arquitectura, etc.)
Ejemplo: "Next.js App Router + Tailwind + shadcn/ui + TypeScript estricto + Vitest + Playwright"

## Reglas generales

- NO modifiques codigo sin entenderlo primero
- El flujo es un LOOP: si los quality gates fallan, vuelve a implementar
- Cada subagente escribe SOLO en los archivos que tiene permitido
- .opencode/workflow/STATE.md debe mantenerse LIVIANO (< 50 lineas)
- Los detalles de cada US van en .opencode/workflow/history/US-XXX.md
- No leas historiales previos completos a menos que sean necesarios
- Define claramente "Definition of Done" antes de marcar como completado
