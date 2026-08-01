/* Solva · estado del carrito (persistido en localStorage).
   Guarda items del carrito, respeta el stock por talla al agregar/aumentar
   cantidades, y calcula subtotal/total. Sin códigos de descuento ni
   cotizaciones intermedias: el checkout va directo a un link de WhatsApp
   (ver CartDrawer.jsx). */

import { useState, useEffect, useCallback } from "react";
import { db } from "../lib/db.js";
import { VETA_DATA } from "../lib/data.js";

export function useCart() {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("solva-cart") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("solva-cart", JSON.stringify(items));
  }, [items]);

  const add = useCallback((product, opts) => {
    setItems((prev) => {
      const key = `${product.id}::${opts.size}::${opts.color || ""}`;
      const idx = prev.findIndex((it) => it.key === key);
      const cur = idx >= 0 ? prev[idx].qty : 0;
      const req = opts.qty || 1;
      const stock = db.getStock(product.id, opts.size);
      const cap = stock !== null && stock !== undefined ? stock : Infinity;
      const newQty = Math.min(cur + req, cap);
      if (newQty <= 0) return prev;
      if (idx >= 0) {
        if (newQty === prev[idx].qty) return prev;
        const next = [...prev];
        next[idx] = { ...next[idx], qty: newQty };
        return next;
      }
      return [
        ...prev,
        {
          key,
          id: product.id,
          name: product.name,
          price: product.price,
          size: opts.size,
          color: opts.color || null,
          qty: newQty,
          img: opts.colorImg || VETA_DATA.productImages(product)[0] || null,
          shape: VETA_DATA.shapes[product.cat]?.kind || "generic",
        },
      ];
    });
  }, []);
  const remove = useCallback((key) => setItems((prev) => prev.filter((it) => it.key !== key)), []);
  const setQty = useCallback(
    (key, qty) =>
      setItems((prev) => {
        if (qty <= 0) return prev.filter((it) => it.key !== key);
        const item = prev.find((it) => it.key === key);
        if (!item) return prev;
        const stock = db.getStock(item.id, item.size);
        const cap = stock !== null && stock !== undefined ? stock : Infinity;
        return prev.map((it) => (it.key === key ? { ...it, qty: Math.min(qty, cap) } : it));
      }),
    []
  );
  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const count = items.reduce((a, it) => a + it.qty, 0);
  const subtotal = items.reduce((a, it) => a + it.qty * it.price, 0);
  const total = subtotal;

  return {
    items,
    add,
    remove,
    setQty,
    clear,
    count,
    subtotal,
    total,
  };
}
