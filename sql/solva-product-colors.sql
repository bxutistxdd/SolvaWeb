-- Solva · Variantes de color por producto
-- Agrega la columna `colors` a `products`: array de variantes de color, cada
-- una con su propia galería de fotos. Ej. una sudadera en negro/gris/azul —
-- el cliente elige el color en la ficha de producto y la imagen principal
-- cambia a la galería de ese color (estilo Shein). Opcional: un producto sin
-- variantes (ej. joyería) simplemente deja `colors` vacío y sigue usando la
-- columna `images` como antes. Idempotente: seguro de re-ejecutar.
--
-- Forma de cada elemento de `colors`:
--   { "id": "negro", "name": "Negro", "images": ["https://.../a.jpg", ...] }

ALTER TABLE products ADD COLUMN IF NOT EXISTS colors JSONB NOT NULL DEFAULT '[]';
