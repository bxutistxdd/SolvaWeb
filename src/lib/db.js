/* Solva · capa de datos (Supabase)
   Un solo cliente (anon/publishable key). Las lecturas son públicas.
   Las escrituras del panel admin requieren sesión iniciada (Supabase Auth):
   tras el login el cliente lleva el JWT y las políticas RLS permiten escribir
   solo al rol `authenticated`. La service key NUNCA se usa en el navegador.

   Es un módulo ESM que se importa explícitamente (`import { db } from
   "../lib/db.js"`). Sigue siendo un singleton: Supabase se inicializa una
   sola vez al importar.

   Plantilla base: esta capa cubre products/stock/settings/categories +
   pedidos manuales (orders) + autenticación + imágenes de producto. El
   agente de WhatsApp, las cotizaciones de carrito y los códigos de
   descuento NO forman parte de la plantilla base — se agregan por
   instancia si el negocio los necesita. */

import { createClient } from "@supabase/supabase-js";
import { VETA_DATA } from "./data.js";
import { BRAND } from "./brand.js";

export const db = (function () {
  // Placeholders — configura tu proyecto Supabase por variables de entorno
  // (Vite: import.meta.env.VITE_*) o reemplázalos directamente por instancia.
  const URL = import.meta.env.VITE_SUPABASE_URL || "https://TU-PROYECTO.supabase.co";
  const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || "TU_ANON_KEY_PUBLICA";
  // Correo fijo del único administrador. La pantalla de login solo pide la
  // contraseña; el correo se usa internamente.
  const ADMIN_EMAIL = BRAND.adminEmail;

  const sb = createClient(URL, ANON, {
    auth: { persistSession: true, autoRefreshToken: true, storage: window.localStorage },
  });

  // Caché en memoria
  let _products = null;
  let _stock = {};
  let _settings = {};
  let _categories = [];
  let _ready = false;
  let _listeners = [];

  function _notify() {
    _listeners.forEach((fn) => fn());
  }

  /* ── helpers ── */
  function _mapProduct(row) {
    return {
      id: row.id,
      name: row.name,
      cat: row.cat,
      subcat: row.subcat || null,
      ref: row.ref || null,
      material: row.material,
      finish: row.finish,
      price: row.price,
      sizes: row.sizes || [],
      blurb: row.blurb || "",
      desc: row.description || "",
      images: row.images || {},
      colors: row.colors || [],
      visible: row.visible,
      featured: row.featured,
    };
  }

  /* ── carga de datos ── */
  async function loadProducts() {
    const { data, error } = await sb.from("products").select("*").order("cat");
    if (error) {
      console.warn("[SOLVA_DB] products:", error.message);
      return;
    }
    _products = data.map(_mapProduct);
  }

  async function loadStock() {
    const { data, error } = await sb.from("stock").select("*");
    if (error) {
      console.warn("[SOLVA_DB] stock:", error.message);
      return;
    }
    _stock = {};
    data.forEach((r) => {
      _stock[r.product_id + "::" + r.size] = r.qty;
    });
  }

  async function loadSettings() {
    const { data, error } = await sb.from("settings").select("*");
    if (error) return;
    _settings = {};
    data.forEach((r) => {
      _settings[r.key] = r.value;
    });
  }

  async function loadCategories() {
    const { data, error } = await sb.from("categories").select("*").order("level").order("sort");
    if (error) {
      console.warn("[SOLVA_DB] categories:", error.message);
      return;
    }
    _categories = data || [];
  }

  async function init() {
    await Promise.all([loadProducts(), loadStock(), loadSettings(), loadCategories()]);
    _ready = true;
    _notify();

    // Suscripción en tiempo real — stock
    sb.channel("stock-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "stock" }, async () => {
        await loadStock();
        _notify();
      })
      .subscribe();

    // Suscripción en tiempo real — products
    sb.channel("products-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, async () => {
        await loadProducts();
        _notify();
      })
      .subscribe();

    // Suscripción en tiempo real — categories
    sb.channel("categories-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, async () => {
        await loadCategories();
        _notify();
      })
      .subscribe();

    return { products: _products, stock: _stock, settings: _settings };
  }

  /* ── lecturas ── */
  function getProducts() {
    return _products || VETA_DATA.products;
  }

  // Mapa completo de stock ("productId::size" -> qty). Lo usa el panel admin
  // para renderizar la matriz de existencias.
  function getStockMap() {
    return _stock;
  }

  function getStock(productId, size) {
    const v = _stock[productId + "::" + size];
    return v === undefined ? null : v;
  }

  function getSetting(key, fallback) {
    return _settings[key] !== undefined ? _settings[key] : fallback;
  }

  /* ── categorías (lecturas) ── */
  // level: 1=categoría, 2=subcategoría, 3=referencia. Sin level → todas.
  function getCategories(level) {
    if (!_categories || _categories.length === 0) {
      // Fallback al seed estático (solo nivel 1) mientras la tabla no carga.
      return level == null || level === 1 ? VETA_DATA.categories : [];
    }
    return level == null ? _categories : _categories.filter((c) => c.level === level);
  }
  function getChildren(parentId) {
    return (_categories || [])
      .filter((c) => c.parent_id === parentId)
      .sort((a, b) => (a.sort || 0) - (b.sort || 0));
  }
  function getCategoryLabel(id) {
    if (!id) return "";
    const c = (_categories || []).find((x) => x.id === id);
    if (c) return c.label;
    const seed = VETA_DATA.categories.find((x) => x.id === id);
    return seed ? seed.label : id;
  }
  function getCategoryPrefix(catId) {
    const c = (_categories || []).find((x) => x.id === catId && x.level === 1);
    if (c && c.prefix) return c.prefix;
    const seed = { anillos: "an", collares: "co", aretes: "ar", pulseras: "pu", piercings: "pi" }[
      catId
    ];
    if (seed) return seed;
    return (
      (catId || "prod")
        .replace(/[^a-z0-9]/gi, "")
        .slice(0, 2)
        .toLowerCase() || "pr"
    );
  }
  // Cuenta productos que referencian una categoría o cualquiera de sus
  // descendientes (en cat/subcat/ref). Para advertir antes de eliminar.
  function countProductsInCategory(id) {
    const ids = new Set([id]);
    let added = true;
    while (added) {
      added = false;
      (_categories || []).forEach((c) => {
        if (c.parent_id && ids.has(c.parent_id) && !ids.has(c.id)) {
          ids.add(c.id);
          added = true;
        }
      });
    }
    return (_products || []).filter((p) => ids.has(p.cat) || ids.has(p.subcat) || ids.has(p.ref))
      .length;
  }

  function isHidden(id) {
    const p = (_products || []).find((x) => x.id === id);
    return p ? p.visible === false : false;
  }

  // true una vez que el catálogo real de Supabase ya cargó. Antes de eso,
  // getProducts() devuelve el seed estático como respaldo temporal — las
  // pantallas que muestran UN producto puntual (PDP) deben esperar a esto
  // en vez de arriesgarse a mostrar el seed por error de ID.
  function isReady() {
    return _ready;
  }

  function onReady(fn) {
    if (_ready) {
      fn();
      return () => {};
    }
    _listeners.push(fn);
    return () => {
      _listeners = _listeners.filter((l) => l !== fn);
    };
  }

  // Suscripción persistente: se llama en cada cambio (carga inicial, realtime,
  // o tras una escritura del admin). Útil para que el panel refleje cambios en vivo.
  function subscribe(fn) {
    _listeners.push(fn);
    if (_ready) fn();
    return () => {
      _listeners = _listeners.filter((l) => l !== fn);
    };
  }

  /* ── autenticación admin ── */
  async function signIn(password) {
    const { data, error } = await sb.auth.signInWithPassword({ email: ADMIN_EMAIL, password });
    return { ok: !error, error: error ? error.message : null, session: data?.session || null };
  }
  async function signOut() {
    await sb.auth.signOut();
  }
  async function getSession() {
    const { data } = await sb.auth.getSession();
    return data?.session || null;
  }
  function onAuthChange(fn) {
    const { data } = sb.auth.onAuthStateChange((_event, session) => fn(session));
    return () => data?.subscription?.unsubscribe?.();
  }
  async function changePassword(newPassword) {
    const { error } = await sb.auth.updateUser({ password: newPassword });
    return { ok: !error, error: error ? error.message : null };
  }

  /* ── escrituras admin (requieren sesión) ── */
  async function setStock(productId, size, qty) {
    if (qty == null || qty < 0) {
      // Cantidad negativa = "sin definir": borrar la fila
      const { error } = await sb.from("stock").delete().match({ product_id: productId, size });
      if (error) throw error;
      delete _stock[productId + "::" + size];
    } else {
      const { error } = await sb
        .from("stock")
        .upsert({ product_id: productId, size, qty }, { onConflict: "product_id,size" });
      if (error) throw error;
      _stock[productId + "::" + size] = qty;
    }
    _notify();
  }

  async function clearStock() {
    const { error } = await sb.from("stock").delete().neq("product_id", "");
    if (error) throw error;
    _stock = {};
    _notify();
  }

  async function setVisible(productId, visible) {
    const { error } = await sb.from("products").update({ visible }).eq("id", productId);
    if (error) throw error;
    if (_products) {
      _products = _products.map((p) => (p.id === productId ? { ...p, visible } : p));
    }
    _notify();
  }

  async function setFeatured(productId, featured) {
    const { error } = await sb.from("products").update({ featured }).eq("id", productId);
    if (error) throw error;
    if (_products) {
      _products = _products.map((p) => (p.id === productId ? { ...p, featured } : p));
    }
    _notify();
  }

  async function upsertProduct(product) {
    const prev = (_products || []).find((p) => p.id === product.id);
    const row = {
      id: product.id,
      name: product.name,
      cat: product.cat,
      subcat: product.subcat || null,
      ref: product.ref || null,
      material: product.material,
      finish: product.finish,
      price: Number(product.price),
      sizes: product.sizes,
      blurb: product.blurb || "",
      description: product.desc || "",
      images: Array.isArray(product.images) ? product.images : product.images || {},
      colors: Array.isArray(product.colors) ? product.colors : [],
      visible: product.visible !== false,
      featured: product.featured || false,
    };
    const { error } = await sb.from("products").upsert(row, { onConflict: "id" });
    if (error) throw error;
    // Borrar de Storage las imágenes que el admin quitó o reemplazó (galería
    // base + la de cada variante de color).
    if (prev) {
      const oldUrls = VETA_DATA.allProductImages(prev);
      const newUrls = VETA_DATA.allProductImages(product);
      const removed = oldUrls.filter((u) => !newUrls.includes(u));
      for (const u of removed) await deleteStorageImage(u);
    }
    await loadProducts();
    _notify();
  }

  async function deleteProduct(id) {
    const prev = (_products || []).find((p) => p.id === id);
    const { error } = await sb.from("products").delete().eq("id", id);
    if (error) throw error;
    if (prev) {
      for (const u of VETA_DATA.allProductImages(prev)) await deleteStorageImage(u);
    }
    if (_products) {
      _products = _products.filter((p) => p.id !== id);
    }
    _notify();
  }

  /* ── categorías (escrituras, requieren sesión) ── */
  async function upsertCategory(cat) {
    const row = {
      id: cat.id,
      parent_id: cat.parent_id || null,
      level: cat.level,
      label: cat.label,
      blurb: cat.blurb || "",
      prefix: cat.prefix || null,
      sort: cat.sort || 0,
    };
    const { error } = await sb.from("categories").upsert(row, { onConflict: "id" });
    if (error) throw error;
    await loadCategories();
    _notify();
  }

  async function deleteCategory(id) {
    // El cascade en DB elimina subcategorías/referencias hijas; los productos
    // referenciados quedan con cat/subcat/ref en null (FK on delete set null).
    const { error } = await sb.from("categories").delete().eq("id", id);
    if (error) throw error;
    await Promise.all([loadCategories(), loadProducts()]);
    _notify();
  }

  /* ── imágenes de producto en Supabase Storage (bucket product-images) ──
     Subida nativa: el admin arrastra archivos, se comprimen en el navegador
     (canvas) y se suben aquí. Solo se borran objetos de ESTE bucket; las URLs
     externas/legacy (Cloudinary, Unsplash, assets/) se ignoran.            */
  function _productImgPath(url) {
    if (typeof url !== "string") return null;
    const marker = "/product-images/";
    const i = url.indexOf(marker);
    if (i === -1) return null;
    return decodeURIComponent(url.slice(i + marker.length).split("?")[0]);
  }

  async function uploadProductImage(file, productId, idx) {
    const session = await getSession();
    if (!session) throw new Error("Sesión expirada. Vuelve a iniciar sesión.");
    if (!file) throw new Error("No hay imagen para subir.");
    const type = file.type || "image/webp";
    const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : "jpg";
    const path = `${(productId || "tmp").replace(/[^a-z0-9-]/gi, "")}-${idx}-${Date.now()}.${ext}`;
    const { error } = await sb.storage
      .from("product-images")
      .upload(path, file, { contentType: type, upsert: true });
    if (error) throw new Error("No se pudo subir la imagen: " + error.message);
    const { data } = sb.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  }

  async function deleteStorageImage(url) {
    const path = _productImgPath(url);
    if (!path) return; // URL externa/legacy: no se toca
    try {
      await sb.storage.from("product-images").remove([path]);
    } catch (e) {
      console.warn("[SOLVA_DB] deleteStorageImage:", e.message);
    }
  }

  async function saveSetting(key, value) {
    const { error } = await sb.from("settings").upsert({ key, value }, { onConflict: "key" });
    if (error) throw error;
    _settings[key] = value;
    _notify();
  }

  /* ── pedidos (tabla `orders`, registro manual desde #admin → Despachos) ──
     Venta 100% manual en la plantilla base: no hay bot ni cotizaciones
     automáticas. El admin registra el pedido a mano y le hace seguimiento
     de estado (pending → dispatched → delivered) aquí. */
  async function getOrders(status) {
    let q = sb.from("orders").select("*").order("created_at", { ascending: false });
    if (status) q = q.eq("status", status);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  }

  async function updateOrderStatus(id, status) {
    const { error } = await sb.from("orders").update({ status }).eq("id", id);
    if (error) throw error;
  }

  async function updateOrderNotes(id, admin_notes) {
    const { error } = await sb.from("orders").update({ admin_notes }).eq("id", id);
    if (error) throw error;
  }

  async function updateOrderDeliveryNotes(id, delivery_notes) {
    const { error } = await sb.from("orders").update({ delivery_notes }).eq("id", id);
    if (error) throw error;
  }

  async function toggleOrderHidden(id, hidden) {
    const { error } = await sb.from("orders").update({ hidden }).eq("id", id);
    if (error) throw error;
  }

  async function deleteOrder(id) {
    const { error } = await sb.from("orders").delete().eq("id", id);
    if (error) throw error;
  }

  async function createOrder(fields) {
    const row = {
      status: "pending",
      source: "manual",
      phone: fields.phone,
      customer_name: fields.customer_name || null,
      city: fields.city || null,
      neighborhood: fields.neighborhood || null,
      address: fields.address || null,
      apt_ref: fields.apt_ref || null,
      payment_method: fields.payment_method || null,
      recipient_name: fields.recipient_name || null,
      items: fields.items,
      notes: fields.notes || null,
      delivery_notes: fields.delivery_notes || null,
      subtotal: fields.total != null ? fields.total : null,
      total: fields.total != null ? fields.total : null,
    };
    const { data, error } = await sb.from("orders").insert(row).select().single();
    if (error) throw error;
    return data;
  }

  return {
    init,
    isReady,
    onReady,
    subscribe,
    getProducts,
    getStock,
    getStockMap,
    getSetting,
    isHidden,
    // categorías
    getCategories,
    getChildren,
    getCategoryLabel,
    getCategoryPrefix,
    countProductsInCategory,
    upsertCategory,
    deleteCategory,
    // imágenes
    uploadProductImage,
    deleteStorageImage,
    signIn,
    signOut,
    getSession,
    onAuthChange,
    changePassword,
    setStock,
    clearStock,
    setVisible,
    setFeatured,
    upsertProduct,
    deleteProduct,
    saveSetting,
    // pedidos
    getOrders,
    updateOrderStatus,
    updateOrderNotes,
    updateOrderDeliveryNotes,
    toggleOrderHidden,
    deleteOrder,
    createOrder,
    sb,
  };
})();

export default db;
