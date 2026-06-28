# MiniSpec

**A lightweight specification standard for AI-assisted software development.**

MiniSpec is a tiny, token-frugal alternative to heavyweight Spec-Driven
Development toolkits. It separates **permanent knowledge** (what the project
*is*) from **temporal knowledge** (what is *being worked on*), and gives an AI
agent the minimum context it needs — and nothing more.

## Why

- 📖 Readable in under a minute.
- 🧠 Tiny token footprint.
- 🛠️ Works for new and existing projects.
- 📂 Modular: the agent reads only what it needs.
- 🚫 No documentation nobody will ever read again.

## Install

```bash
npx minispec init --here          # scaffold MiniSpec in the current project
npx minispec init my-app          # ...or into a new folder
npx minispec init --here --ai claude
```

This creates `.minispec/`, installs the chosen AI integration (for Claude Code:
`.claude/skills/minispec-*`), and adds a "read first" pointer to the AI context
file (`CLAUDE.md`).

## The standard

```
.minispec/
├── README.md          the reading contract for the agent
├── core/              PERMANENT knowledge (rarely changes)
│   ├── project.md         what / for whom / goal        (≤ 50 lines)
│   ├── architecture.md    high-level overview only      (≤ 100 lines)
│   ├── stack.md           technologies, listed not explained
│   ├── conventions.md     rules, short sentences
│   ├── glossary.md        domain terms
│   └── principles.md      engineering principles         (≤ 20 lines)
├── decisions/         ADRs — important decisions (permanent)
├── features/          TEMPORAL knowledge — work in progress only
└── templates/         feature.md · adr.md · bugfix.md
```

### Writing rules

1. **Hard limit: 100 lines per document.** `project.md` ≤ 50, `principles.md` ≤ 20.
2. Short sentences and lists. No filler prose.
3. One document = one topic. Never mix permanent and temporal knowledge.
4. Don't explain general technologies — only what is specific to this project.
5. Don't duplicate what the code already says. Document the *why*, not the *how*.

### Document formats

- **Feature** — `Goal / Context / Changes / Acceptance`
- **ADR** — `Decision / Motivation / Consequences`
- **Bugfix** — `Problem / Cause / Solution / Verification`

### Feature lifecycle

A feature file describes **work in progress only**. When it's done:

1. Promote anything **permanent** it revealed (a decision → ADR, a rule →
   `conventions.md`, a term → `glossary.md`).
2. **Delete** the feature file.

If `features/` is empty, nothing is in flight.

## Claude Code integration

`minispec init` installs four skills:

| Skill | Purpose |
|---|---|
| `/minispec-feature` | Create a feature spec |
| `/minispec-adr` | Record an architectural decision |
| `/minispec-bugfix` | Document a bug and its fix |
| `/minispec-implement` | List pending features and implement the chosen one |

## Roadmap

- v1: Claude Code integration (skills) — **this release**.
- Next: Cursor (rules), Codex (AGENTS.md), Gemini CLI integrations.

## License

MIT
