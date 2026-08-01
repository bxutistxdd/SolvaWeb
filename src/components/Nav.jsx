/* Solva · barra de navegación (desktop + menú móvil fullscreen) y wordmark. */

import { useState, useEffect } from "react";
import { Magnetic } from "./primitives.jsx";
import { BRAND } from "../lib/brand.js";

/* Logotipo textual · vuelve a inicio. */
function Wordmark({ onClick }) {
  return (
    <a
      className="wordmark"
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
      }}
      aria-label={`${BRAND.name} · inicio`}
    >
      {BRAND.name}
    </a>
  );
}

export function Nav({ route, onNavigate, cartCount, cartBump, onCartOpen, onSearchOpen }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Cierra el menú cuando cambia la ruta */
  useEffect(() => {
    setMenuOpen(false);
  }, [route]);

  /* Bloquea scroll del body cuando el menú está abierto */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  /* Cierra con Escape */
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const links = [
    { id: "home", label: "Inicio" },
    { id: "catalog", label: "Catálogo" },
    { id: "care", label: "Cuidado" },
    { id: "story", label: "Nuestra historia" },
  ];
  const isActive = (id) => {
    if (id === "catalog") return route.name === "catalog" || route.name === "pdp";
    return route.name === id;
  };
  const handleNav = (r) => {
    setMenuOpen(false);
    onNavigate(r);
  };

  return (
    <>
      <nav className="nav" data-scrolled={scrolled ? "1" : "0"}>
        <div>
          <Wordmark onClick={() => handleNav({ name: "home" })} />
        </div>
        <div className="nav-links">
          {links.map((l) => (
            <Magnetic key={l.id} strength={0.4} radius={48}>
              <a
                className="nav-link"
                data-active={isActive(l.id) ? "1" : "0"}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleNav({ name: l.id });
                }}
              >
                {l.label}
              </a>
            </Magnetic>
          ))}
        </div>
        <div className="nav-right">
          <button className="nav-search-btn" onClick={onSearchOpen} aria-label="Buscar">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="17"
              height="17"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.5-4.5" />
            </svg>
          </button>
          <button className="nav-cart-btn" data-bump={cartBump ? "1" : "0"} onClick={onCartOpen}>
            Bolsa
            <span className="nav-cart-count">{cartCount}</span>
          </button>
          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
          >
            <span className="nav-hamburger-icon" data-open={menuOpen ? "1" : "0"}>
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </nav>

      {/* Menú móvil fullscreen — z-index 99, el nav queda encima (100) */}
      <div
        className="nav-mobile-menu"
        data-on={menuOpen ? "1" : "0"}
        aria-hidden={!menuOpen}
        role="dialog"
        aria-label="Menú de navegación"
      >
        {links.map((l) => (
          <a
            key={l.id}
            className="nav-mobile-link"
            data-active={isActive(l.id) ? "1" : "0"}
            href="#"
            tabIndex={menuOpen ? 0 : -1}
            onClick={(e) => {
              e.preventDefault();
              handleNav({ name: l.id });
            }}
          >
            {l.label}
          </a>
        ))}
        <div className="nav-mobile-footer">
          <span>
            {BRAND.name} · {BRAND.year}
          </span>
          <span>Hecho en Colombia</span>
        </div>
      </div>
    </>
  );
}
