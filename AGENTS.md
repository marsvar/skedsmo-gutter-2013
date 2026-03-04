# AGENTS.md

Cross-tool context file for AI coding assistants.

## Context source of truth

- Use `CLAUDE.md` as the primary project context and coaching-domain knowledge.
- If another tool expects a different instructions filename, keep this file and point to `CLAUDE.md` rather than duplicating content.

## Tool mapping

- Claude Code: reads `CLAUDE.md`
- Codex/Codex CLI: reads `AGENTS.md` and should load `CLAUDE.md`
- Other tools (Cursor/Cline/Aider/etc.): use their local instruction file, but reference `CLAUDE.md` as the canonical source.

## Maintenance rule

When updating project context, edit `CLAUDE.md` first and then only update references in tool-specific files.
