# read/workflow.md

## Two Modes of Working

### Mode A — Direct Task

For small, clear, self-contained work.

**Use for:** bug fixes, small changes, single-file refactors, quick questions.

**Rules:**
- Clear task → execute immediately, no unnecessary questions
- Ambiguous → ask one focused question, then execute
- Turns complex mid-way → stop, recommend switching to Speckit
- Bug report → fix it autonomously, no hand-holding needed

### Mode B — Speckit Workflow

For features, complex tasks, or anything touching 3+ files.

Use Speckit CLI slash commands:
- `/speckit.specify "Feature Name"` → specification phase
- `/speckit.implement` → implementation phase

| Situation | Mode |
|-----------|------|
| Bug fix | Direct |
| Small change or refactor | Direct |
| New feature | Speckit |
| Complex / multi-file / unclear | Speckit |

**Rules:**
- Enter Speckit for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways → STOP and re-plan, do not keep pushing
- After ANY correction → update `read/lessons.md`

## Model Routing

| Command | Model | Role |
|---------|-------|------|
| `claude` | Opus (Claude.ai login) | All phases except implement |
| `s-claude` | GLM (Z.ai) | Speckit implement only |

> Always start with `claude`. Only switch to `s-claude` for implementation.
