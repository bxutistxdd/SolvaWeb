# Reglas del proyecto

- Ruta raiz del proyecto: C:\Users\Jeffer\Desktop\Sebastian\Ecosistema\Proyectos\SolvaWeb\
- Usa SIEMPRE esta ruta exacta para leer y escribir archivos
- Usa SIEMPRE comandos PowerShell, nunca bash ni WSL
- Verifica con Get-Content despues de cada escritura para confirmar que el archivo no quedo vacio

## Memoria del proyecto (Engram)

Memoria en **Engram**, proyecto `solvaweb`, solo por CLI (sin daemon). Las reglas
completas de búsqueda, guardado y formato están en `~/.claude/CLAUDE.md`,
sección «Memoria: Engram». succ se retiró el 24-nov-2026: no usar `succ`.

- Al iniciar, el hook `SessionStart` ya muestra las memorias fijadas y
  recientes. Para más: `engram search "<1-3 palabras clave>" --project solvaweb --match all`.
- "recuerdas cuando…", "qué decidimos", "qué falta", historia del proyecto →
  buscar en Engram primero (mínimo 2 búsquedas con palabras distintas y luego
  `--all` antes de decir que no hay registro).
- "recuerda esto", decisiones, bugs no triviales, trampas, enfoques descartados →
  `engram save "<Tema>: <afirmación>" "<cuerpo con línea Claves:>" --project solvaweb --type <tipo> [--topic área/tema]`
  sin que el usuario lo pida. Estado/pendientes: `--type progress --topic estado/<tema>`.
- Credenciales y secretos: nunca en Engram (solo `.env.local`).
- Estructura y ubicación de código: Graphify primero, no Engram.


## Formato de commits — SIN coautoria de IA

Este proyecto se publica bajo autoria exclusiva del dueño (ver LICENSE y
README.md). Por eso, para este repo, ANULA el formato de commit por defecto
de succ/Claude Code:

- NUNCA agregar `Co-Authored-By: Claude ...` en los commits
- NUNCA agregar `Co-Authored-By: succ ...` en los commits
- NUNCA agregar lineas `Generated with [Claude Code]...` / `powered by [succ]...` / `Claude-Session: ...`
- Los commits van con el autor real (bxutistxdd) unicamente, sin trailers de IA

La constancia de que el proyecto fue desarrollado con asistencia de IA ya
queda documentada de forma general en README.md/LICENSE — no hace falta (ni
se quiere) repetirla por commit.

## graphify

This project has a graphify knowledge graph at .graphify/.

Rules:
- For codebase or architecture questions, when `.graphify/graph.json` exists, first run `graphify query "<question>"` (or `graphify path "<A>" "<B>"` / `graphify explain "<concept>"`); these return a scoped subgraph, usually much smaller than `GRAPH_REPORT.md` or raw grep output
- If .graphify/wiki/index.md exists, navigate it instead of reading raw files
- If .graphify/graph.json is missing but graphify-out/graph.json exists, run `graphify migrate-state --dry-run` first; if tracked legacy artifacts are reported, ask before using the recommended `git mv -f graphify-out .graphify` and commit message
- If .graphify/needs_update exists or .graphify/branch.json has stale=true, warn before relying on semantic results and run /graphify . --update when appropriate
- Before proposing or committing .graphify artifacts, run `graphify portable-check .graphify`; commit-safe graph artifacts must use repo-relative paths, and never commit .graphify/branch.json, .graphify/worktree.json, .graphify/needs_update, or .graphify/cache/. If a repo already tracks any of them, first add them to .gitignore, then propose `git rm --cached .graphify/branch.json .graphify/worktree.json .graphify/needs_update` and `git rm -r --cached .graphify/cache`; never mutate git state without asking
- Before deep graph traversal, prefer `graphify summary --graph .graphify/graph.json` for compact first-hop orientation
- For review impact on changed files, use `graphify review-delta --graph .graphify/graph.json` instead of generic traversal
- Read `.graphify/GRAPH_REPORT.md` only for broad architecture review or when `query` / `path` / `explain` do not surface enough context
- After modifying code files in this session, run `npx graphify hook-rebuild` to keep the graph current
