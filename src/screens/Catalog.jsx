/* Solva · catálogo con filtros (familia, subcategoría, material), orden y
   búsqueda en vivo. */

import { useState, useEffect, useMemo } from "react";
import { VETA_DATA } from "../lib/data.js";
import { db } from "../lib/db.js";
import { visibleProducts } from "../lib/catalog.js";
import { searchProducts } from "../lib/search.js";
import { ProductCard } from "../components/ProductCard.jsx";

export function Catalog({ filter, search, onNavigate }) {
  // Re-render cuando el catálogo de Supabase carga o cambia (realtime), para
  // no quedarse pegado en el seed estático si Catalog montó antes de que
  // db.init() resolviera.
  const [, forceTick] = useState(0);
  useEffect(() => db.subscribe(() => forceTick((n) => n + 1)), []);
  const all = useMemo(() => visibleProducts(), [db.getProducts()]);
  const [cat, setCat] = useState(filter || "all");
  const [subcat, setSubcat] = useState("all");
  const [color, setColor] = useState("all");
  const [sort, setSort] = useState("default");
  const [q, setQ] = useState(search || "");

  useEffect(() => {
    setCat(filter || "all");
    setSubcat("all");
  }, [filter]);
  useEffect(() => {
    setQ(search || "");
  }, [search]);
  useEffect(() => {
    setSubcat("all");
  }, [cat]);

  const catList = db.getCategories(1) || VETA_DATA.categories;
  const subcatList = cat !== "all" ? db.getChildren(cat) : [];

  // Colores disponibles entre los productos visibles (con variantes de
  // color); si ningún producto tiene colores, este filtro no se muestra.
  const colorList = useMemo(() => {
    const names = new Set();
    all.forEach((p) => VETA_DATA.productColors(p).forEach((c) => names.add(c.name)));
    return Array.from(names).sort();
  }, [all]);

  const filtered = useMemo(() => {
    let list = all;
    if (cat !== "all") list = list.filter((p) => p.cat === cat);
    if (subcat !== "all") list = list.filter((p) => p.subcat === subcat);
    if (color !== "all")
      list = list.filter((p) => VETA_DATA.productColors(p).some((c) => c.name === color));
    if (q.trim()) return searchProducts(q, list);
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [all, cat, subcat, color, q, sort]);

  return (
    <main className="page-enter">
      <header className="cat-head">
        <div>
          <span className="eyebrow">— Catálogo</span>
          <h1 className="h-1">
            {cat === "all" ? (
              <>Todas las piezas</>
            ) : (
              catList.find((c) => c.id === cat)?.label || db.getCategoryLabel(cat)
            )}
          </h1>
        </div>
        <span className="count">{String(filtered.length).padStart(2, "0")} piezas</span>
      </header>

      <div className="filters">
        <div className="filters-inner">
          <div className="catalog-search-wrap">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="15"
              height="15"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.5-4.5" />
            </svg>
            <input
              className="catalog-search-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar en el catálogo…"
              aria-label="Buscar productos"
            />
            {q && (
              <button
                className="catalog-search-clear"
                onClick={() => setQ("")}
                aria-label="Limpiar"
              >
                ×
              </button>
            )}
          </div>
          <div className="filter-group">
            <span className="filter-group-label">Familia</span>
            <button
              className="chip"
              data-on={cat === "all" ? "1" : "0"}
              onClick={() => setCat("all")}
            >
              Todas
            </button>
            {catList.map((c) => (
              <button
                key={c.id}
                className="chip"
                data-on={cat === c.id ? "1" : "0"}
                onClick={() => setCat(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
          {subcatList.length > 0 && (
            <div className="filter-group">
              <span className="filter-group-label">Subcategoría</span>
              <button
                className="chip"
                data-on={subcat === "all" ? "1" : "0"}
                onClick={() => setSubcat("all")}
              >
                Todas
              </button>
              {subcatList.map((c) => (
                <button
                  key={c.id}
                  className="chip"
                  data-on={subcat === c.id ? "1" : "0"}
                  onClick={() => setSubcat(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}
          {colorList.length > 0 && (
            <div className="filter-group">
              <span className="filter-group-label">Color</span>
              <button
                className="chip"
                data-on={color === "all" ? "1" : "0"}
                onClick={() => setColor("all")}
              >
                Todos
              </button>
              {colorList.map((c) => (
                <button
                  key={c}
                  className="chip"
                  data-on={color === c ? "1" : "0"}
                  onClick={() => setColor(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
          <div className="filter-group" style={{ marginLeft: "auto" }}>
            <span className="filter-group-label">Orden</span>
            <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="default">Sugerido</option>
              <option value="price-asc">Precio · menor</option>
              <option value="price-desc">Precio · mayor</option>
              <option value="name">Nombre</option>
            </select>
          </div>
        </div>
      </div>

      <div className="cat-grid-products">
        {filtered.length === 0 ? (
          <div
            style={{
              gridColumn: "1/-1",
              padding: "80px 0",
              textAlign: "center",
              color: "var(--ink-soft)",
            }}
          >
            <p className="body">
              {q.trim()
                ? `Sin resultados para "${q}". Prueba otro término o busca algo más general.`
                : "Sin resultados para esta combinación."}
            </p>
          </div>
        ) : (
          filtered.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              onOpen={(p) => onNavigate({ name: "pdp", id: p.id })}
              delay={(i % 8) * 50}
            />
          ))
        )}
      </div>
    </main>
  );
}
