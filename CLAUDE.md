# Reglas del proyecto

- Ruta raiz del proyecto: C:\Users\Jeffer\Desktop\Sebastian\solva-web\
- Usa SIEMPRE esta ruta exacta para leer y escribir archivos
- Usa SIEMPRE comandos PowerShell, nunca bash ni WSL
- Verifica con Get-Content despues de cada escritura para confirmar que el archivo no quedo vacio

## Memoria del proyecto

succ es la fuente PRINCIPAL de memoria para este proyecto. Al iniciar cada sesion:
1. Usar `succ_recall` o `succ_search` para recuperar el contexto relevante
2. Los archivos en `C:\Users\Jeffer\.claude\projects\...\memory\` son respaldo historico — no leerlos activamente a menos que succ no este disponible
3. Las credenciales sensibles (Supabase) siguen en `memory/project_credentials.md` — NO se migran a succ

## Reglas de memoria automatica con succ

SIEMPRE usar succ de forma implicita, sin que el usuario tenga que pedirlo explicitamente:

### Buscar en succ cuando el usuario diga:
- "busca como funciona X" / "como funciona X" → `succ_recall` + `succ_search_code`
- "donde esta X" / "encuentra X" / "como se hace X en el proyecto" → `succ_search_code`
- "recuerdas cuando..." / "habiamos dicho que..." / "como decidimos..." → `succ_recall`
- "que tenemos hecho" / "que falta" / "dame el estado" → `succ_recall query="estado pendientes"`
- Cualquier pregunta sobre arquitectura, decisiones o historia del proyecto → `succ_recall` primero

### Guardar en succ cuando el usuario diga:
- "recuerda esto" / "guardame esto" / "anota que..." → `succ_remember` inmediatamente
- "para despues" / "no olvidar" / "importante" → `succ_remember` con tag relevante
- Al resolver un bug no trivial → `succ_remember` con type="learning"
- Al tomar una decision de diseno → `succ_remember` con type="decision"
- Al descartar un enfoque → `succ_dead_end`

### Regla general:
Toda busqueda de informacion sobre el proyecto va a succ PRIMERO, antes que Grep o Glob.
Toda informacion nueva relevante sobre el proyecto se guarda en succ automaticamente.
El usuario NO necesita usar comandos succ — solo habla naturalmente y Claude los ejecuta.

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
