# opencode-multi-agent-workflow

Template portable del sistema multi-agente con flujo **Quality Gate Loop** para proyectos con OpenCode.

## Que incluye

- `AGENTS.md` — Reglas del flujo multi-agente (P0 a P6 con loop de calidad)
- `opencode.json` — Configuracion con todos los agentes registrados y permisos
- `.opencode/workflow/STATE.md` — Indice liviano del estado del proyecto
- `.opencode/workflow/history/` — Detalle por cada US
- `.opencode/workflow/REQUIREMENTS.md` — Placeholder para requisitos (lo escribe @systems-analyst)
- `.opencode/workflow/DESIGN_SYSTEM.md` — Placeholder para diseno (lo escribe @design-strategist)
- `.opencode/agents/` — Definiciones stack-agnosticas de cada subagente
- `.opencode/skills/` — Skills de ejemplo (cada proyecto agrega los suyos)
- `.opencode/commands/workflow.md` — Comando `/workflow`
- `.opencode/workflow/opencode-multi-agent-reference.md` — Referencia de 5 sistemas multi-agente reales

## Como usarlo

1. Copia este template a la raiz de tu proyecto
2. Agrega skills especificas de tu stack en `.opencode/skills/`
3. Define las convenciones de tu proyecto en `AGENTS.md` seccion ## Convenciones
4. Ejecuta `/workflow <descripcion de la historia>` para iniciar el flujo

## Flujo

```
SETUP → PLAN → IMPLEMENT → QUALITY GATES (loop) → FINALIZE → GIT+PR → DONE
```

Los quality gates (code review, tests, lint, design) se ejecutan en paralelo.
Si alguno falla, se vuelve a Fase 2 (implementar) hasta que todos pasen.

## Agentes disponibles

| Agente | Uso |
|--------|-----|
| `architect` | Planificar arquitectura |
| `builder` | Implementar codigo |
| `reviewer` | Code review |
| `tester` | Ejecutar tests |
| `linter` | Linting y typecheck |
| `git-assistant` | Git, commits, PRs |
| `pm-agent` | Gestion PM (Trello/Taiga/etc.) |
| `designer` | Design review |
| `design-strategist` | Definir .opencode/workflow/DESIGN_SYSTEM.md |
| `systems-analyst` | Escribir .opencode/workflow/REQUIREMENTS.md |
| `state-manager` | Mantener .opencode/workflow/STATE.md |
| `git-specialist` | Git/GitHub experto |
