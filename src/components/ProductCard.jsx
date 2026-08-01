/* Solva · tarjeta de producto para grillas de catálogo y destacados. */

import { VETA_DATA } from "../lib/data.js";
import { db } from "../lib/db.js";
import { isProductSoldOut } from "../lib/stock.js";
import { Reveal, Placeholder } from "./primitives.jsx";

export function ProductCard({ product, onOpen, delay = 0 }) {
  const shape = VETA_DATA.shapes[product.cat]?.kind || "generic";
  const img = VETA_DATA.productImages(product)[0] || null;
  const soldOut = isProductSoldOut(product);
  const colors = VETA_DATA.productColors(product);
  const catLabel = db.getCategoryLabel(product.cat) || product.cat;
  const sub = colors.length
    ? `${colors.length} ${colors.length === 1 ? "color" : "colores"}`
    : catLabel;
  return (
    <Reveal delay={delay}>
      <button
        className={`product-card${soldOut ? " product-card--out" : ""}`}
        onClick={() => onOpen(product)}
      >
        <Placeholder shape={shape} label={catLabel} tag={product.id.toUpperCase()} img={img} />
        {soldOut && <span className="product-card-soldout">Agotado</span>}
        <div className="product-card-meta">
          <div>
            <h4>{product.name}</h4>
            <span className="product-card-sub">{sub}</span>
          </div>
          <span className="price">{VETA_DATA.fmtPrice(product.price)}</span>
        </div>
      </button>
    </Reveal>
  );
}
