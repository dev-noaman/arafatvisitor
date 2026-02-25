# read/speckit.md

## Speckit Phase Instructions

Speckit is managed via CLI slash commands. Each phase produces structured output.

### Phase 1 — Specify (`/speckit.specify`)

Define the feature completely before any code.

- Inputs, outputs, edge cases, API contracts
- Affected modules and files
- Role-based behavior (ADMIN, RECEPTION, HOST, STAFF)
- Database changes needed

### Phase 2 — Architecture

Design the solution. Read `read/code-quality.md` during this phase.

- File structure decisions with tradeoffs
- API endpoint design (match existing patterns in `CLAUDE.md` gotchas)
- Component tree for frontend changes
- Database schema changes (Prisma migrations)
- Justify every decision

Pause and ask for feedback before proceeding to implementation.

### Phase 3 — Implement (`/speckit.implement`)

Execute via `s-claude` (GLM). Opus does not participate.

**Rules:**
- One task at a time, complete fully before moving on
- Read existing files first — match project conventions
- Production-ready code only — no placeholders, no debug logs
- Verify it works before marking done — read `read/verification.md`
- Blocker → log it, switch back to `claude`, do not improvise architecture
- After correction → update `read/lessons.md`

### Phase 4 — Review

Back to `claude` (Opus). Validate implementation:

- Does it match the specification?
- Are all API contracts correct? (check `CLAUDE.md` gotchas)
- Types consistent between frontend and backend?
- Error states handled (loading, empty, error)?
- Rate limiting considered?
- Works for all roles?
