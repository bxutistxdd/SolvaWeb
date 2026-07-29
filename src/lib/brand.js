/* Solva · configuración central de marca.
   Plantilla reutilizable: todo dato específico de un negocio (nombre, textos
   cortos, WhatsApp, contacto, colores) vive aquí. Para lanzar una nueva
   instancia, edita solo este archivo (y .env / Supabase) en vez de buscar
   strings sueltos por el código. */

export const BRAND = {
  // Nombre de la marca, tal como se muestra en el wordmark, el título y el
  // panel admin.
  name: "Solva",

  // Año que se muestra en pies de página / menús (actualízalo cada año).
  year: 2026,

  // Frase corta para el <title> y meta description.
  metaTitle: "Solva — Catálogo y ventas por WhatsApp",
  metaDescription:
    "Solva: plantilla de tienda online con catálogo curado y venta directa por WhatsApp.",

  // Eslóganes genéricos de e-commerce (no específicos de ningún rubro).
  tagline: "Un catálogo cuidado, pensado para vender directo por WhatsApp.",
  heroTitle: "Catálogo",
  heroSubtitle: "que convierte",
  heroEyebrow: "— Colección permanente",
  heroMeta: ["Piezas seleccionadas", "Catálogo curado", "Hecho para vender"],

  // WhatsApp del negocio — SOLO dígitos, con código de país, sin "+" ni
  // espacios (formato que usa la API de wa.me). Placeholder: reemplázalo por
  // el número real de cada instancia antes de publicar.
  waPhone: "57XXXXXXXXXX",

  // Redes / contacto — placeholders, editar por instancia.
  instagramUrl: "https://www.instagram.com/tu_negocio/",
  contactEmail: "hola@solva.app",

  // Correo interno del único usuario admin (Supabase Auth). La pantalla de
  // login solo pide la contraseña; este correo se usa por debajo.
  adminEmail: "admin@solva.app",
};

export default BRAND;
