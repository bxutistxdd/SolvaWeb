# Solva

Plantilla base reutilizable de tienda web con catálogo y venta directa por
WhatsApp, más un panel de administración integrado. Pensada para lanzar
instancias nuevas rápido: se clona, se ajusta `src/lib/brand.js` y el
proyecto Supabase de cada negocio, y queda lista.

## Qué incluye

- Catálogo público con filtros, búsqueda y fichas de producto
- Carrito de compras que termina en un link directo de WhatsApp (`wa.me`)
  con el resumen del pedido — sin backend ni pasos intermedios
- Panel de administración (`#admin`): catálogo (CRUD), categorías, stock por
  talla/variante y configuración básica (WhatsApp del negocio, contraseña)
- Autenticación de un único usuario admin vía Supabase Auth

## Qué NO incluye (a propósito)

Esta plantilla es intencionalmente simple. No trae agente de WhatsApp con
IA, gestión de conversaciones/chats, seguimiento de pedidos vía WhatsApp ni
códigos de descuento — esas son integraciones específicas de negocio que se
agregan por instancia si se necesitan, no parte de la base.

## Stack

- Frontend: React 18 + Vite (ESM, estructura modular en `src/`)
- Backend / datos: Supabase (Postgres + Auth)
- Deploy: GitHub Actions → GitHub Pages

## Configurar una instancia nueva

1. Clona el repo y ajusta `package.json` (`name`) y `vite.config.js`
   (`base`) si el nombre del repo cambia.
2. Crea un proyecto Supabase y aplica el SQL de `sql/`.
3. Copia `.env.example` a `.env` y completa `VITE_SUPABASE_URL` /
   `VITE_SUPABASE_ANON_KEY`.
4. Edita `src/lib/brand.js`: nombre, textos, WhatsApp, redes y correo.
5. Reemplaza el catálogo semilla de `src/lib/data.js` y las imágenes en
   `public/assets/images/` por las del negocio.

## Estructura

- `src/admin/` — panel de administración (productos, categorías, stock,
  config)
- `src/cart/` — carrito y búsqueda
- `src/components/` — componentes de UI compartidos
- `src/lib/` — acceso a datos (Supabase), catálogo, marca (`brand.js`), stock
- `src/screens/` — pantallas públicas (home, catálogo, PDP, cuidado,
  historia)

## Autoría

Desarrollado y mantenido por **Juan Sebastian Galindo Bautista**
([bxutistxdd](https://github.com/bxutistxdd)).

Este proyecto fue desarrollado por el autor con asistencia de herramientas
de inteligencia artificial (Claude Code, de Anthropic) durante el proceso
de desarrollo, bajo su dirección y control. Ver [LICENSE](./LICENSE).
