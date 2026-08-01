/* Solva · página de detalle de producto (PDP).
   Galería dinámica, selección de acabado/talla con stock por talla, cantidad
   limitada al stock, y bloque de piezas relacionadas de la misma familia. */

import { useState, useEffect, useMemo } from "react";
import { VETA_DATA } from "../lib/data.js";
import { db } from "../lib/db.js";
import { visibleProducts } from "../lib/catalog.js";
import { getStockStatus } from "../lib/stock.js";
import { Reveal, Magnetic, Placeholder } from "../components/primitives.jsx";
import { ProductCard } from "../components/ProductCard.jsx";

export function PDP({ id, onNavigate, onAdd }) {
  // Re-render cuando el catálogo real de Supabase termina de cargar o
  // cambia — si no, esta pantalla puede quedarse mostrando el producto
  // semilla (joyería) mientras la carga real está en curso.
  const [, forceTick] = useState(0);
  useEffect(() => db.subscribe(() => forceTick((n) => n + 1)), []);

  const ready = db.isReady();
  const allProducts = db.getProducts();
  const found = allProducts.find((p) => p.id === id);
  const product = found || allProducts[0];
  const shape = VETA_DATA.shapes[product.cat]?.kind || "ring";

  // Variantes de color (si el producto las tiene): cada una trae su propia
  // galería de fotos. colorIdx decide cuál se muestra.
  const colors = useMemo(() => VETA_DATA.productColors(product), [product]);
  const [colorIdx, setColorIdx] = useState(0);
  useEffect(() => {
    setColorIdx(0);
  }, [id]);
  const safeColorIdx = Math.min(colorIdx, Math.max(0, colors.length - 1));

  // Galería dinámica: tantas vistas como imágenes tenga el producto (3-10).
  // Si hay variantes de color, la galería es la del color elegido.
  const imgs = useMemo(
    () => (colors.length ? colors[safeColorIdx].images : VETA_DATA.productImages(product)),
    [product, colors, safeColorIdx]
  );

  const [view, setView] = useState(0);
  const [size, setSize] = useState(
    () => product.sizes.find((sz) => db.getStock(product.id, sz) !== 0) || product.sizes[0]
  );
  const [finish, setFinish] = useState(product.finish);
  const [qty, setQty] = useState(1);

  /* Stock de la talla seleccionada */
  const stockInfo = getStockStatus(product.id, size);
  const maxQty = stockInfo.qty !== null ? stockInfo.qty : 99;
  const isOut = stockInfo.status === "out";
  const isLow = stockInfo.status === "low";

  /* Al cambiar talla: ajusta qty si supera el stock disponible */
  const handleSizeSelect = (s) => {
    const st = getStockStatus(product.id, s);
    setSize(s);
    if (st.qty !== null && qty > st.qty) setQty(Math.max(1, st.qty));
  };

  /* Al cambiar de color: cambia la galería mostrada y vuelve a la primera vista. */
  const handleColorSelect = (i) => {
    setColorIdx(i);
    setView(0);
  };

  const gallery = imgs.length ? imgs : [null]; // al menos un placeholder
  const safeView = Math.min(view, gallery.length - 1);

  const [animKey, setAnimKey] = useState(0);
  useEffect(() => {
    setAnimKey((k) => k + 1);
  }, [view]);
  useEffect(() => {
    setView(0);
  }, [id]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [id]);

  const related = visibleProducts()
    .filter((p) => p.cat === product.cat && p.id !== product.id)
    .slice(0, 4);

  // Mientras el catálogo real de Supabase no ha cargado, no mostrar nada
  // (evita el parpadeo con el seed de joyería mientras se resuelve el id).
  if (!ready) {
    return <main className="page-enter" style={{ minHeight: "60vh" }} />;
  }

  // Catálogo ya cargado y el id no corresponde a ningún producto real.
  if (!found) {
    return (
      <main className="page-enter">
        <div style={{ padding: "120px 24px", textAlign: "center" }}>
          <p className="body">No encontramos esta pieza. Puede que ya no esté disponible.</p>
          <button
            className="btn btn--ghost"
            style={{ marginTop: 16 }}
            onClick={() => onNavigate({ name: "catalog" })}
          >
            Volver al catálogo
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page-enter">
      <section className="pdp">
        <div className="pdp-gallery">
          <div className="pdp-thumbs">
            {gallery.map((src, i) => (
              <button
                key={i}
                className="pdp-thumb"
                data-on={safeView === i ? "1" : "0"}
                onClick={() => setView(i)}
                aria-label={`Vista ${i + 1}`}
              >
                <Placeholder
                  shape={shape}
                  tag={String(i + 1).padStart(2, "0")}
                  img={src || undefined}
                />
              </button>
            ))}
          </div>
          <div className="pdp-main-img" key={animKey}>
            <Placeholder
              shape={shape}
              label={`vista ${safeView + 1}`}
              tag={`${product.id.toUpperCase()} · ${String(safeView + 1).padStart(2, "0")}`}
              ratio="4 / 5"
              img={gallery[safeView] || undefined}
            />
          </div>
        </div>

        <div className="pdp-info">
          <Reveal>
            <div className="pdp-cat">
              {[
                db.getCategoryLabel(product.cat) ||
                  VETA_DATA.categories.find((c) => c.id === product.cat)?.label,
                product.subcat && db.getCategoryLabel(product.subcat),
                product.ref && db.getCategoryLabel(product.ref),
              ]
                .filter(Boolean)
                .join(" › ")}{" "}
              · {product.material}
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="pdp-title">{product.name}</h1>
          </Reveal>
          <Reveal delay={200}>
            <div className="pdp-price">
              {VETA_DATA.fmtPrice(product.price)}{" "}
              <span
                style={{
                  fontSize: 12,
                  color: "var(--ink-soft)",
                  fontFamily: "var(--mono)",
                  marginLeft: 8,
                }}
              >
                COP
              </span>
            </div>
          </Reveal>
          <Reveal delay={280}>
            <p className="pdp-desc">{product.desc}</p>
          </Reveal>

          {colors.length > 0 && (
            <Reveal delay={320}>
              <div className="pdp-section">
                <span className="pdp-section-label">Color: {colors[safeColorIdx].name}</span>
                <div className="variant-row">
                  {colors.map((c, i) => (
                    <button
                      key={c.id}
                      type="button"
                      className="variant-chip"
                      data-on={safeColorIdx === i ? "1" : "0"}
                      onClick={() => handleColorSelect(i)}
                      aria-label={`Ver en color ${c.name}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </Reveal>
          )}

          <Reveal delay={360}>
            <div className="pdp-section">
              <span className="pdp-section-label">Acabado</span>
              <div className="variant-row">
                {VETA_DATA.finishes.map((f) => (
                  <button
                    key={f}
                    className="variant-chip"
                    data-on={finish === f ? "1" : "0"}
                    onClick={() => setFinish(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={440}>
            <div className="pdp-section">
              <span className="pdp-section-label">Talla / largo</span>
              <div className="size-row">
                {product.sizes.map((s) => {
                  const st = getStockStatus(product.id, s);
                  return (
                    <button
                      key={s}
                      className={`size-chip${st.status === "out" ? " size-chip--out" : st.status === "low" ? " size-chip--low" : ""}`}
                      data-on={size === s ? "1" : "0"}
                      disabled={st.status === "out"}
                      onClick={() => handleSizeSelect(s)}
                    >
                      {s}
                      {st.status === "low" && <span className="size-chip-badge">{st.qty}</span>}
                    </button>
                  );
                })}
              </div>
              {(isOut || isLow) && (
                <p className={`pdp-stock-msg pdp-stock-msg--${isOut ? "out" : "low"}`}>
                  {isOut
                    ? "Esta talla está agotada. Selecciona otra o escríbenos."
                    : `Solo ${stockInfo.qty === 1 ? "queda 1 unidad" : `quedan ${stockInfo.qty} unidades`} en esta talla.`}
                </p>
              )}
            </div>
          </Reveal>

          <Reveal delay={520}>
            <div className="pdp-section">
              <span className="pdp-section-label">Cantidad</span>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <div className="cart-qty" style={{ marginTop: 0, width: "fit-content" }}>
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    disabled={isOut}
                    aria-label="Menos"
                  >
                    −
                  </button>
                  <span>{qty}</span>
                  <button
                    onClick={() => setQty(Math.min(maxQty, qty + 1))}
                    disabled={isOut || qty >= maxQty}
                    aria-label="Más"
                  >
                    +
                  </button>
                </div>
                {stockInfo.qty !== null && !isOut && (
                  <span className="pdp-stock-avail">{stockInfo.qty} disponibles en esta talla</span>
                )}
              </div>
            </div>
          </Reveal>

          <Reveal delay={600}>
            <div className="pdp-add">
              <Magnetic strength={0.12} style={{ flex: 1 }}>
                <button
                  className="btn"
                  style={{ width: "100%" }}
                  disabled={isOut}
                  onClick={() =>
                    !isOut &&
                    onAdd(product, {
                      size,
                      finish,
                      qty,
                      color: colors.length ? colors[safeColorIdx].name : null,
                      colorImg: colors.length ? colors[safeColorIdx].images[0] : null,
                    })
                  }
                >
                  {isOut ? "Talla agotada" : "Agregar a la bolsa"}
                </button>
              </Magnetic>
            </div>
          </Reveal>

          <Reveal delay={700}>
            <div className="pdp-details">
              <details className="detail-row" open>
                <summary>Especificación</summary>
                <p>
                  Material: <b>{product.material}</b>. Acabado: <b>{finish}</b>. Sello "925" grabado
                  al interior. Cada pieza incluye estuche de tela y certificado.
                </p>
              </details>
              <details className="detail-row">
                <summary>Envío</summary>
                <p>
                  Envío gratuito en pedidos a partir de $300.000 COP. Entrega en 3–5 días hábiles a
                  todo Colombia. Empaque sostenible reutilizable.
                </p>
              </details>
              <details className="detail-row">
                <summary>Garantía</summary>
                <p>
                  Garantía de por vida sobre la estructura. Limpieza profesional gratuita una vez al
                  año en cualquier momento.
                </p>
              </details>
              <details className="detail-row">
                <summary>Cuidado</summary>
                <p>
                  Guarda separado, evita perfumes y cremas en contacto directo. Pulir con paño
                  suave.{" "}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate({ name: "care" });
                    }}
                    style={{
                      color: "var(--ink)",
                      textDecoration: "underline",
                      textDecorationThickness: "0.5px",
                      textUnderlineOffset: 3,
                    }}
                  >
                    Ver guía completa →
                  </a>
                </p>
              </details>
            </div>
          </Reveal>
        </div>
      </section>

      {related.length > 0 && (
        <>
          <div className="section-head">
            <div>
              <span className="eyebrow">— También te puede interesar</span>
              <h2 className="h-2">
                De la misma <em>familia.</em>
              </h2>
            </div>
          </div>
          <div className="section-body" style={{ paddingBottom: 120 }}>
            <div className="feature-row">
              {related.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onOpen={(p) => onNavigate({ name: "pdp", id: p.id })}
                  delay={i * 80}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
