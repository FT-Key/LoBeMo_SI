# OpenCode Multi-Agent Workflow Reference

Extracted from 5 real-world production systems. Compiled June 2026.

---

## 1. CodeCrafter's Den — 7-Agent Sequential Pipeline

**URL:** https://codecraftersden.com/opencode-multi-agent-workflow/
**Author:** Saeid
**Pattern:** Sequential pipeline via shared WORKFLOW_STATE.md file

### File Structure
```
your-project/
├─ AGENTS.md                       # Shared constitution (loaded by all agents)
├─ WORKFLOW_STATE.md               # Live handoff document
└─ .opencode/
   └─ agents/
      ├─ planner.md                # Asks clarifying questions, writes plan
      ├─ debater.md                # Reviews plan, binary accept/improve
      ├─ implementor.md            # Only agent that edits code
      ├─ reviewer.md               # Reads code, writes to WORKFLOW_STATE.md
      ├─ tester.md                 # Runs tests, records results
      ├─ linter.md                 # Runs lint, records results
      └─ commit-message.md         # Reads git diff, prints conventional commit
```

### AGENTS.md (The Constitution)
```markdown
# Shared workflow rules

All agents must use WORKFLOW_STATE.md as the shared handoff file.

Before starting:
- Read WORKFLOW_STATE.md

After finishing:
- Update only the sections relevant to your role
- Preserve existing content unless it is outdated or clearly incorrect
- Add a short handoff note for the next agent

Do not use chat history as the only source of truth.
WORKFLOW_STATE.md is the canonical workflow record.

Workflow order:
1. Planner clarifies the request with the user
2. Planner writes clarified scope and acceptance criteria
3. Debater reviews the plan and decides whether a better plan exists
4. Implementor makes the change
5. Reviewer reviews the result
6. Tester runs relevant tests
7. Linter runs the project lint/check script
8. Commit-message prints the final commit message

When working with frameworks, libraries, or APIs:
- Use Context7 before guessing
- Record important findings in WORKFLOW_STATE.md
```

### WORKFLOW_STATE.md Template
```markdown
# Workflow State

## Request
-
## Clarified Scope
-
## Open Questions
-
## Constraints
-
## Acceptance Criteria
-
## Plan
-
## Debate Notes
-
## Files To Change
-
## Implementation Notes
-
## Review Findings
-
## Test Results
-
## Lint Results
-
## Commit Message Draft
-
## Current Status
-
## Next Agent
-
```

### Agent Definitions

#### planner.md
```yaml
---
description: Clarifies the request first, then creates a plan and hands work to the next agent
mode: primary
model: github-copilot/gpt-5.3-codex
temperature: 0.1
max_steps: 8
permission:
  edit:
    "*": deny
    "WORKFLOW_STATE.md": allow
  bash: ask
  webfetch: ask
  task:
    "*": deny
    "debater": allow
    "implementor": allow
    "reviewer": allow
    "tester": allow
    "linter": allow
    "commit-message": allow
---
```

#### debater.md
```yaml
---
description: Reviews the current plan in WORKFLOW_STATE.md and decides whether a better plan exists
mode: subagent
model: github-copilot/gpt-5.3-codex
temperature: 0.3
max_steps: 4
permission:
  edit:
    "*": deny
    "WORKFLOW_STATE.md": allow
---
```

#### implementor.md
```yaml
---
description: Implements the approved plan and records what changed in WORKFLOW_STATE.md
mode: subagent
model: github-copilot/gpt-5.3-codex
temperature: 0.15
max_steps: 12
permission:
  edit: allow
  bash: ask
  webfetch: ask
---
```

#### tester.md
```yaml
---
description: Runs relevant test suite and records results
mode: subagent
model: github-copilot/gpt-5.3-codex
temperature: 0.1
permission:
  edit:
    "*": deny
    "WORKFLOW_STATE.md": allow
  bash:
    "*": deny
    "npm test*": allow
    "pytest*": allow
    "go test*": allow
    "cargo test*": allow
---
```

#### linter.md
```yaml
---
description: Runs project lint/check script and reports findings
mode: subagent
model: github-copilot/gpt-5.3-codex
temperature: 0.1
permission:
  edit:
    "*": deny
    "WORKFLOW_STATE.md": allow
  bash:
    "*": deny
    "python scripts/lint.py*": allow
---
```

#### commit-message.md
```yaml
---
description: Reads the final diff and prints a conventional commit message
mode: subagent
model: github-copilot/gpt-5.3-codex
temperature: 0.2
permission:
  edit:
    "*": deny
    "WORKFLOW_STATE.md": allow
  bash:
    "*": deny
    "git status*": allow
    "git diff*": allow
    "git log*": allow
---
```

### Permission Matrix
| Agent | Edit | Bash |
|--------|------|------|
| Planner | WORKFLOW_STATE.md only | ask |
| Debater | WORKFLOW_STATE.md only | ask |
| Implementor | allow | ask |
| Reviewer | WORKFLOW_STATE.md only | ask |
| Tester | WORKFLOW_STATE.md only | test commands only |
| Linter | WORKFLOW_STATE.md only | lint script only |
| Commit-message | WORKFLOW_STATE.md only | git diff/log/status only |

### Key Design Decisions
- **Shared state file** instead of chat history for handoffs
- **Path-based edit permissions** using `"*": deny` then `"WORKFLOW_STATE.md": allow`
- **Temperature tuned per role**: Planner 0.1, Debater 0.3, Implementor 0.15
- **Debater does binary decision** (better plan exists or not), not generic critique
- **Implementor is the ONLY agent with code edit access**
- Run with: `opencode run --agent planner "Add a settings page..."`

---

## 2. ppries/Linear Issue to PR — 5-Agent TDD Orchestration

**URL:** https://gist.github.com/ppries/f07fd6316bbd45807dd7a1896555b05b
**Pattern:** Fire-and-forget orchestrator → TDD loop → Draft PR

### File Structure
```
~/.config/opencode/
├─ AGENTS.md
├─ docs/
│  └─ multi-agent-workflow.md     # Task splitting spec, decision tables
└─ agents/
   ├─ check.md                    # Design reviewer (8-point framework)
   ├─ simplify.md                 # Complexity reviewer (YAGNI)
   ├─ test.md                     # TDD test author (RED)
   ├─ make.md                     # Task implementor (GREEN)
   └─ pm.md                       # Linear CLI integration

your-project/.opencode/
└─ commands/
   ├─ workflow.md                 # Fire-and-forget orchestrator command
   └─ review.md                   # Standalone review command
```

### AGENTS.md Sections
```markdown
## Git Workflow
I work in feature branches and git worktrees, never directly on main/master.
- Layout: Bare clone + worktrees.
- Worktree dirs: Always replace `/` with `-` (branch `user/foo` → dir `user-foo`).
- Commits: Follow Conventional Commits.

## Multi-Agent Workflow
Use when: 3+ files, API/schema changes, >30 min work, or cross-cutting concerns.
Steps: Setup (@pm + worktree) -> Plan -> @check + @simplify review -> Split for @make
-> @test writes failing tests (RED) -> @make implements (TDD: RED->GREEN)
-> @check + @simplify review.
```

### Agent: @check (Design Reviewer)
```yaml
---
description: Systematic design reviewer — risks, gaps, flaws
mode: subagent
model: openai/gpt-5.3-codex
temperature: 0.4
tools:
  write: false
  edit: false
  bash: false
---
```

Uses an **8-point review framework**: Assumptions, Failure Modes, Edge Cases & API Friction, Compatibility, Security & Data, Operational Readiness, Scale & Performance, Testability.

**Severity calibration (critical innovation):**
| Severity | Meaning | Evidence Required |
|----------|---------|-------------------|
| BLOCK | Will cause outage/data loss/breach | Concrete failure path |
| HIGH | Likely significant problems | Clear mechanism |
| MEDIUM | Could cause edge-case problems | Plausible scenario |
| LOW | Code smell, style, minor | Observation only |

BLOCK requires a demonstrable failure path — not speculation. Without evidence, cap at MEDIUM.

### Agent: @simplify (Complexity Reviewer)
```yaml
---
description: Spots overengineering and unnecessary complexity
mode: subagent
model: openai/gpt-5.3-codex
temperature: 0.4
tools:
  write: false
  edit: false
  bash: false
---
```

Core question: *"What if we deleted this? Justify its existence in one sentence."*

Precedence rule: `@check` safety findings are hard constraints. Protected patterns (retries, circuit breakers, auth) never flagged unless clearly unused.

### Agent: @test (TDD Test Author)
```yaml
---
description: Writes meaningful failing tests from task specs using TDD
mode: subagent
model: anthropic/claude-sonnet-4-6-1m
temperature: 0.2
tools:
  write: true
  edit: true
  bash: true
permission:
  bash:
    "*": deny
    "uv run pytest *": allow
    "uv run ruff check *": allow
    "ls *": allow
    "rg *": allow
    "git diff --name-only*": allow
    # Everything else denied (git *, pip *, uv add*, ssh *, etc.)
---
```

**File constraint:** Only `**/test_*.py`, `**/*_test.py`, `**/conftest.py` (new only), `**/test_data/**`, `**/test_fixtures/**`. Cannot modify production code.

**Failure classification (critical innovation):**
| Code | Meaning | Valid RED? |
|------|---------|-----------|
| MISSING_BEHAVIOR | Function/class doesn't exist yet | Yes |
| ASSERTION_MISMATCH | Code exists but wrong behavior | Yes |
| TEST_BROKEN | Test itself has errors | No — fix first |
| ENV_BROKEN | Environment issue | No — BLOCKED |

### Agent: @make (Task Implementor)
```yaml
---
description: Implements discrete coding tasks from specs
mode: subagent
model: anthropic/claude-sonnet-4-6-1m
temperature: 0.2
tools:
  write: true
  edit: true
  bash: true
permission:
  bash:
    "*": deny
    "uv run *": allow
    "ls *": allow
    "wc *": allow
    "which *": allow
    "diff *": allow
    "rg *": allow
    # Explicit denials
    "uv run bash*": deny
    "uv run curl*": deny
    "uv run git*": deny
    "uv run ssh*": deny
    "uv run rm *": deny
    "uv run mv *": deny
    "uv run cp *": deny
    "git *": deny
    "pip *": deny
    "uv add*": deny
    "curl *": deny
    "ssh *": deny
---
```

**TDD Mode entry validation:** Run pre-written tests, confirm RED, check failure codes match handoff. If tests PASS before implementation → STOP (anomaly). If wrong failure code → STOP. Escalates test quality concerns to `@check` → `@test` (not self-fixing).

**File constraint:** Only files listed in "Files to Modify". No renames, no deletions. Max 2-3 fix attempts.

### Agent: @pm (Project Management - Linear)
```yaml
---
description: Project management agent with Linear CLI
mode: subagent
model: anthropic/claude-haiku-4-5
tools:
  write: false
  edit: false
  bash: true
permission:
  bash:
    "*": deny
    "linear *": allow
    "linear issue delete*": deny
---
```

### /workflow Command (Orchestrator)
```yaml
---
description: "Fire-and-forget multi-agent workflow: plan, test, implement, PR"
agent: build
---
```

**10 phases:** Setup → Issue Context → Worktree → Plan → Review Plan (max 3 cycles, convergence detection) → Split into Tasks → Write Tests (file gate enforced) → Implement (TDD) → Final Review (max 3 cycles) → Commit + PR + Linear Update.

**Post-step file gate (critical innovation):** Snapshot changed files BEFORE `@test`, validate AFTER that only test-pattern files were created. Violation = discard output.

### Global Permission Config
```json
{
  "permission": {
    "bash": {
      "*": "allow",
      "rm -rf *": "deny",
      "sudo *": "deny",
      "chmod 777 *": "deny",
      "git push --force *": "deny",
      "linear *": "deny",
      "git push *": "ask",
      "pip install *": "ask",
      "npm install*": "ask",
      "docker *": "ask"
    },
    "read": {
      "*": "allow",
      "*.env": "deny",
      "*.env.*": "deny",
      "*.env.example": "allow"
    },
    "edit": {
      "*.lock": "deny",
      "package-lock.json": "deny"
    }
  }
}
```

---

## 3. CloudAI-X/opencode-workflow — 7-Agent Orchestrator Pattern

**URL:** https://github.com/cloudai-x/opencode-workflow
**Stars:** 208
**Pattern:** Orchestrator + 6 parallel specialists with commands/skills/plugins

### File Structure
```
opencode-workflow/
├─ agents/                        # Copy to .opencode/agent/
│  ├─ orchestrator.md             # Primary: master coordinator
│  ├─ code-reviewer.md            # Subagent: quality, patterns (read-only)
│  ├─ debugger.md                 # Subagent: bug investigation (bash access)
│  ├─ docs-writer.md              # Subagent: documentation (write access)
│  ├─ refactorer.md               # Subagent: code cleanup (edit access)
│  ├─ security-auditor.md         # Subagent: OWASP (read-only)
│  └─ test-architect.md           # Subagent: test strategy (write access)
├─ commands/                      # Copy to .opencode/command/
│  ├─ review.md, commit.md, architect.md, rapid.md, debug.md
│  ├─ refactor.md, security-audit.md, test-design.md, docs.md
│  ├─ parallel.md, verify-changes.md, mentor.md
├─ skills/                        # Copy to .opencode/skill/
│  └─ (7 domain knowledge skills)
└─ plugins/                       # Copy to .opencode/plugin/
   └─ (5 plugins: auto-format, security-scan, verification, notifications, parallel-guard)
```

### Agent: orchestrator.md (Primary)
```yaml
---
description: Master coordinator that decomposes complex tasks, delegates to specialist subagents
mode: primary
model: anthropic/claude-opus-4-5-20251101
temperature: 0.2
tools:
  write: true
  edit: true
  bash: true
permission:
  task:
    "*": allow
---
```

**6-phase workflow:** UNDERSTAND → PLAN → DELEGATE → INTEGRATE → VERIFY → DELIVER

**Parallel execution (critical innovation):** ALL Task calls for independent work must be in a SINGLE message. Separate messages = sequential.
```markdown
CORRECT (Parallel):
In ONE message, invoke:
- Task: code-reviewer analyzing src/auth
- Task: security-auditor reviewing authentication
- Task: test-architect designing test strategy

INCORRECT (Sequential):
Message 1: Task code-reviewer...
Message 2: Task security-auditor...
```

### Agent: code-reviewer.md (Subagent)
```yaml
---
description: Adversarial code reviewer — quality, maintainability, best practices
mode: subagent
model: anthropic/claude-opus-4-5-20251101
temperature: 0.1
tools:
  write: false
  edit: false
  bash: false
permission:
  edit: deny
  bash: deny
  webfetch: deny
---
```

5 review dimensions: Code Quality, Security (surface), Performance (surface), Maintainability, Consistency.

### Agent: security-auditor.md (Subagent)
```yaml
---
description: Security vulnerability auditor — OWASP Top 10
mode: subagent
model: anthropic/claude-opus-4-5-20251101
temperature: 0.1
tools:
  write: false
  edit: false
  bash: false
permission:
  edit: deny
  bash: deny
  webfetch: deny
---
```

### Agent: debugger.md (Subagent)
```yaml
---
description: Systematic bug investigator with bash access
mode: subagent
model: anthropic/claude-opus-4-5-20251101
temperature: 0.1
tools:
  write: false
  edit: false
  bash: true
permission:
  edit: deny
  bash:
    "*": allow
    "rm *": deny
    "git push*": deny
    "git reset --hard*": deny
---
```

7-step methodology: Reproduce → Gather Context → Form Hypothesis → Isolate → Trace → Verify Root Cause → Document.

### Agent: test-architect.md (Subagent)
```yaml
---
description: Test strategy designer — coverage, test design, best practices
mode: subagent
model: anthropic/claude-opus-4-5-20251101
temperature: 0.2
tools:
  write: true
  edit: true
  bash: false
permission:
  bash: deny
---
```

### Agent: refactorer.md (Subagent)
```yaml
---
description: Code refactoring specialist — clean code, design patterns
mode: subagent
model: anthropic/claude-opus-4-5-20251101
temperature: 0.2
tools:
  write: true
  edit: true
  bash: false
permission:
  bash: deny
---
```

### Agent: docs-writer.md (Subagent)
```yaml
---
description: Technical documentation writer — README, API docs, guides
mode: subagent
model: anthropic/claude-opus-4-5-20251101
temperature: 0.3
tools:
  write: true
  edit: true
  bash: false
permission:
  bash: deny
---
```

### Primary Agents (Tab to switch)
| Agent | What It Does |
|-------|-------------|
| build | Default. Full development work. |
| plan | Analysis only, no file changes. |
| orchestrator | Coordinates complex multi-step tasks. |

### Commands
| Command | What It Does |
|---------|-------------|
| `/review` | Multi-perspective code review |
| `/commit` | Generate conventional commit message |
| `/architect` | High-level design session |
| `/rapid` | Fast iteration, minimal ceremony |
| `/debug` | Systematic bug investigation |
| `/parallel` | Run multiple tasks at once |
| `/verify-changes` | Lint → Type → Build → Test → Review |

---

## 4. hueyexe/opencode-ensemble — Parallel Agent Teams Plugin

**URL:** https://github.com/hueyexe/opencode-ensemble
**Stars:** 138
**Pattern:** Plugin-based parallel agents with SQLite task board and git worktree isolation

### Architecture
```
opencode-ensemble Plugin
├─ src/
│  ├─ index.ts                   # Plugin entry, hooks, tool registration
│  ├─ db.ts                      # SQLite adapter (bun:sqlite / node:sqlite)
│  ├─ team-create.ts             # team_create tool
│  ├─ team-spawn.ts              # team_spawn tool (with plan_approval)
│  ├─ team-message.ts            # team_message tool
│  ├─ team-shutdown.ts           # team_shutdown tool (branch preservation)
│  ├─ team-merge.ts              # team_merge tool (worktree squash merge)
│  ├─ team-cleanup.ts            # team_cleanup tool (archive/purge)
│  ├─ team-status.ts             # team_status tool
│  ├─ team-view.ts               # team_view tool
│  ├─ team-tasks-list.ts         # team_tasks_list tool
│  ├─ team-tasks-add.ts          # team_tasks_add tool
│  ├─ team-tasks-complete.ts     # team_tasks_complete tool
│  ├─ team-claim.ts              # team_claim tool
│  ├─ team-results.ts            # team_results tool
│  ├─ team-broadcast.ts          # team_broadcast tool
│  ├─ dashboard.ts               # http://localhost:4747 dashboard
│  ├─ watchdog.ts                # Timeout/stall detection
│  ├─ recovery.ts                # Crash recovery
│  └─ db-adapter.ts              # Internal SQLite abstraction
├─ skills/opencode-ensemble/
│  └─ SKILL.md                   # Companion skill
├─ AGENTS.md                     # 482 lines - full development guidelines
└─ docs/
   ├─ dashboard.png
   └─ reference/
      ├─ opencode-pr-ugo/        # Reference implementation (internal APIs - do NOT use)
      └─ opencode-pr-dxm/        # Reference implementation (internal APIs - do NOT use)
```

### 14 Tools
| Tool | Who Can Use | Purpose |
|------|------------|---------|
| team_create | Any session | Create a team, caller becomes lead |
| team_spawn | Lead only | Start teammate with task (supports plan_approval) |
| team_message | Any member | DM to teammate or lead (approve/reject plans) |
| team_broadcast | Any member | Message everyone |
| team_tasks_list | Any member | View shared task board |
| team_tasks_add | Any member | Add tasks to board |
| team_tasks_complete | Any member | Mark task done, unblock deps |
| team_claim | Any member | Atomically claim a pending task |
| team_results | Any member | Retrieve full message content |
| team_shutdown | Lead only | Request teammate stop (preserves branch) |
| team_merge | Lead only | Merge teammate's branch (unstaged) |
| team_cleanup | Lead only | Archive team, safety-net merge |
| team_status | Any member | View members, statuses, task summary |
| team_view | Any member | Switch TUI to teammate's session |

### Agent Skill (teaches agent to use Ensemble)
Install: `npx skills@latest add hueyexe/opencode-ensemble --skill opencode-ensemble`

Good team shapes:
- **Scout, builder, reviewer**: explore agent maps code, build changes it, explore reviews
- **Parallel slices**: 2-3 build agents own independent files, one reviewer checks
- **Risky change**: use `plan_approval: true` on implementing teammate

### Realistic interaction example
```
team_tasks_add({
  tasks: [
    { content: "Map checkout webhook flow and identify idempotency risks", priority: "high" },
    { content: "Implement duplicate-webhook idempotency guard", priority: "high" },
  ],
})

team_spawn({
  name: "scout",
  agent: "explore",
  worktree: false,
  model: "openai/gpt-5.3-codex-spark",
  claim_task: "task_abc123",
  prompt: "Trace the checkout webhook flow. Do not edit files.",
})

team_spawn({
  name: "api-dev",
  agent: "build",
  model: "anthropic/claude-opus-4-7",
  plan_approval: true,
  claim_task: "task_def456",
  prompt: "After scout reports, implement the idempotency guard.",
})

# Teammates coordinate via team_message (peer-to-peer)
scout -> lead: "Checkout flow is src/webhooks/stripe.ts"
api-dev -> lead: "Plan ready: add unique event_id"
lead -> api-dev: approves plan

# Lead merges deliberately
team_results({ from: "api-dev" })
team_shutdown({ member: "api-dev" })
team_merge({ member: "api-dev" })
```

### AGENTS.md (Development Guidelines - 482 lines)
Key sections:
- **Architecture**: SQLite + promptAsync delivery + 14 tools
- **Settled Decisions** (12 items): SQLite, promptAsync, 14 separate tools, fire-and-forget spawn, worktree isolation, plan_approval is prompt-enforced, branch preservation is MANDATORY
- **Branch Preservation (Critical)**: `session.abort()` async deletes worktree + branch. MUST call `preserveBranch()` first which copies to `ensemble/preserved/{team}/{name}`
- **SDK Transport (Critical)**: Transport extraction via `input.client._client` (v1 underscore convention). Changing to `.client` breaks everything.
- **promptAsync Is Fire-and-Forget (Critical)**: NEVER await promptAsync. `.catch(() => { /* rollback */ })`
- **Lessons from Anthropic**: Separate tools > unified, teammates only see their 6 tools, no periodic reminders, task list is a coordination primitive, prefer prompt over new tools

### Installation
```json
// opencode.json
{
  "plugin": ["@hueyexe/opencode-ensemble@0.15.0"]
}

// ~/.config/opencode/opencode.json
{
  "permission": {
    "external_directory": {
      "~/.local/share/opencode/worktree/**": "allow"
    }
  }
}
```

### Model Configuration
```json
{
  "defaultModel": "anthropic/claude-sonnet-4-6",
  "modelsByAgent": {
    "build": "anthropic/claude-opus-4-7",
    "explore": "openai/gpt-5.3-codex-spark"
  },
  "modelPool": ["anthropic/claude-opus-4-7", "anthropic/claude-sonnet-4-6", "openai/gpt-5.4"],
  "modelAssignment": "rotate",
  "promptForModels": false
}
```

Resolution order: 1) explicit `model` on team_spawn 2) `modelsByAgent` 3) modelAssignment strategy 4) defaultModel 5) OpenCode default.

---

## 5. Rozariozaro/opencode-subagents — 6-Agent Audit-Gated Pipeline (from search snippets)

**URL:** https://github.com/Rozariozaro/opencode-subagents (404 — likely deleted/privated)
**Pattern:** Strict read-before-write, every implementation goes through auditor

### Architecture (from search)
```
┌──────────────────────────────────────┐
│              ARCHITECT               │
│   (Grills · Plans · Confirms)         │
└──────────────┬───────────────────────┘
               │ confirmed plan
┌──────────────▼───────────────────────┐
│              CONDUCTOR               │
│   (Delegates · Escalates · Verifies) │
└───┬──────┬──────┬──────┬────────────┘
    │      │      │      │
    ▼      ▼      ▼      ▼
  Agent  Agent  Agent  Auditor
```

### Known Features
- **6 agents, 6 skills, strict permission isolation, 7-phase workflow**
- **Read-before-write discipline**: agents must read and understand before writing
- **Audit gate**: all implementations go through a dedicated auditor (except docs)
- **33 commits** on main branch
- Built for iOS/macOS, KMP, backend services, Docker

---

## Cross-Cutting Patterns Summary

### What makes workflows dynamic (not rigid pipelines)

| Pattern | Found In | How It Works |
|---------|----------|-------------|
| Shared state file | CodeCrafter's Den | WORKFLOW_STATE.md — agents read/write sections |
| Parallel subagent dispatch | CloudAI-X | All Task calls in ONE message = parallel |
| Plugin-based task board | hueyexe/Ensemble | SQLite task board with depends_on, peer messaging |
| Review loops with convergence detection | ppries/gist | Max 3 cycles, stop if same findings twice |
| Post-step file gates | ppries/gist | Snapshot files before/after, validate test-only changes |
| Plan approval mode | hueyexe/Ensemble | `plan_approval: true` — teammate sends plan, lead approves |
| TDD with failure classification | ppries/gist | MISSING_BEHAVIOR vs TEST_BROKEN prevents false RED |
| Fire-and-forget with notifications | ppries/gist | User walks away, notified when done |
| Worktree isolation | hueyexe/Ensemble | Each teammate gets own git worktree, no conflicts |
| Temperature tuning per role | All | Planner 0.1, Debater 0.3, Implementor 0.15 |

### Permission patterns

**Path-based edit restriction:**
```yaml
permission:
  edit:
    "*": deny
    "WORKFLOW_STATE.md": allow
```

**Bash sandbox (default deny + allowlist):**
```yaml
permission:
  bash:
    "*": deny
    "uv run pytest *": allow
    "ls *": allow
```

**CLI gating (global deny + per-agent allow):**
```json
// Global: deny linear for everyone
{ "permission": { "bash": { "linear *": "deny" } } }
```
```yaml
# Per-agent: allow linear only for @pm
permission:
  bash:
    "*": deny
    "linear *": allow
    "linear issue delete*": deny
```

### File structure comparison

| System | Structure |
|--------|-----------|
| CodeCrafter's Den | `.opencode/agents/` + root `AGENTS.md` + `WORKFLOW_STATE.md` |
| ppries/gist | `~/.config/opencode/agents/` + `~/.config/opencode/docs/` + project `.opencode/commands/` |
| CloudAI-X | `.opencode/agent/` + `.opencode/command/` + `.opencode/skill/` + `.opencode/plugin/` |
| hueyexe/Ensemble | npm plugin (`@hueyexe/opencode-ensemble`) + `opencode.json` config |
| Rozariozaro | `.opencode/` with agents, skills, opencode.json |

### Model assignment strategies

| Strategy | Where |
|----------|-------|
| Same model all agents | CodeCrafter's Den (`github-copilot/gpt-5.3-codex` across all) |
| Per-agent in frontmatter | ppries/gist (`gpt-5.3-codex` for check/simplify, `claude-sonnet-4-6-1m` for make/test, `claude-haiku-4.5` for pm) |
| Per-agent in frontmatter | CloudAI-X (`claude-opus-4-5` for orchestrator/reviewer/auditor, varying temps) |
| Model pool with rotation | hueyexe/Ensemble (configurable per-agent, per-type, or pool with rotate/random) |
