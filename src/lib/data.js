/* Solva · catálogo semilla (Colombia)
   Precios en COP. Es el respaldo estático que se muestra mientras Supabase
   (ver lib/db.js) termina de cargar el catálogo real. La fuente de verdad en
   producción es la tabla `products`; esto solo evita una pantalla vacía. */

const products = [
  // ── CAMISETAS ────────────────────────────────────────────
  {
    id: "ca-01",
    name: "Camiseta Estampado - Arcangel",
    cat: "camisetas",
    price: 110000,
    sizes: ["S", "M", "L", "XL"],
    blurb: "Estampado gráfico a pecho completo, algodón pesado.",
    desc: "Camiseta oversize con estampado Arcángel. Algodón 100%, tela gruesa que no se transparenta.",
    images: [],
  },
  {
    id: "ca-02",
    name: "Camiseta Basic Blanca",
    cat: "camisetas",
    subcat: "camisetas-blancas",
    price: 65000,
    sizes: ["S", "M", "L", "XL"],
    blurb: "El básico de siempre, corte recto.",
    desc: "Camiseta lisa en algodón peinado, corte recto, sin estampado.",
    images: [],
  },

  // ── ZAPATILLAS ───────────────────────────────────────────
  {
    id: "za-01",
    name: "zapatillas",
    cat: "zapatilla",
    price: 180000,
    sizes: ["38", "39", "40", "41"],
    blurb: "Silueta retro running, para el día a día.",
    desc: "Zapatillas estilo retro running. Entresuela amortiguada, malla transpirable.",
    images: [],
  },
  {
    id: "za-02",
    name: "Zapatillas Adidas Runner",
    cat: "zapatilla",
    subcat: "zapatilla-adidas",
    price: 220000,
    sizes: ["38", "39", "40", "41"],
    blurb: "Ligereza para correr o para el día a día.",
    desc: "Zapatillas deportivas con suela de EVA y upper en mesh.",
    images: [],
  },
];

const categories = [
  { id: "camisetas", label: "Camisetas", blurb: "Estampadas y básicas, algodón pesado." },
  { id: "zapatilla", label: "Zapatilla", blurb: "Nike, Adidas y más, para el día a día." },
];

const materials = [];
const finishes = [];

// Placeholder genérico único — para ropa casi siempre hay foto real, así
// que ya no se usa un ícono distinto por categoría.
const shapes = {};

// Formato Colombia: $180.000 (punto como separador de miles, sin decimales)
export const fmtPrice = (n) =>
  "$" +
  Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

// Normaliza product.colors a un array de variantes { id, name, images }.
// Cada variante es un color/estampado distinto del mismo producto (ej: una
// sudadera en negro, gris y azul), con su propia galería de fotos. Un
// producto sin variantes (ej: joyería) simplemente no trae `colors`.
export const productColors = (p) => {
  if (!p || !Array.isArray(p.colors)) return [];
  return p.colors
    .filter((c) => c && typeof c === "object")
    .map((c) => ({
      id: c.id || c.name,
      name: c.name || c.id || "",
      images: Array.isArray(c.images) ? c.images.filter(Boolean) : [],
    }))
    .filter((c) => c.images.length > 0);
};

// Normaliza product.images a un array ordenado de URLs, soportando tanto el
// formato nuevo (array dinámico de 3-10) como el legacy ({main,profile,detail,context}).
// El índice 0 es la imagen principal (catálogo / carrito / búsqueda).
// Si el producto tiene variantes de color, se usa la galería del primer
// color como imagen/galería por defecto (antes de que el cliente elija).
export const productImages = (p) => {
  if (!p) return [];
  const colors = productColors(p);
  if (colors.length) return colors[0].images;
  const im = p.images;
  if (Array.isArray(im)) return im.filter(Boolean);
  if (im && typeof im === "object") {
    return [im.main, im.profile, im.detail, im.context].filter(Boolean);
  }
  return [];
};

// Todas las URLs de imagen que "pertenecen" a un producto (galería base +
// la de cada variante de color), sin duplicados. Lo usa la capa de datos
// para saber qué archivos borrar de Storage al editar/eliminar un producto.
export const allProductImages = (p) => {
  if (!p) return [];
  const flat = Array.isArray(p.images) ? p.images.filter(Boolean) : [];
  const fromColors = productColors(p).flatMap((c) => c.images);
  return Array.from(new Set([...flat, ...fromColors]));
};

// Objeto agregado — se mantiene la forma `VETA_DATA.*` que ya usaba el resto
// del código, pero ahora importado explícitamente en vez de un global window.
export const VETA_DATA = {
  products,
  categories,
  materials,
  finishes,
  shapes,
  fmtPrice,
  productImages,
  productColors,
  allProductImages,
};
