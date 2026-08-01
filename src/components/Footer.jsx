/* Solva · pie de página con enlaces de tienda, marca y contacto. */

import { BRAND } from "../lib/brand.js";

export function Footer({ onNavigate }) {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-col">
          <div className="wordmark" style={{ fontSize: 16 }}>
            {BRAND.name}
          </div>
          <p className="footer-tagline">{BRAND.tagline}</p>
        </div>
        <div className="footer-col">
          <h4>Tienda</h4>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onNavigate({ name: "catalog", filter: "camisetas" });
            }}
          >
            Camisetas
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onNavigate({ name: "catalog", filter: "zapatilla" });
            }}
          >
            Zapatillas
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onNavigate({ name: "catalog" });
            }}
          >
            Ver todo
          </a>
        </div>
        <div className="footer-col">
          <h4>Marca</h4>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onNavigate({ name: "care" });
            }}
          >
            Cuidado de la prenda
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onNavigate({ name: "story" });
            }}
          >
            Nuestra historia
          </a>
          <a href="#">Garantía</a>
          <a href="#">Envíos</a>
        </div>
        <div className="footer-col">
          <h4>Contacto</h4>
          <a href={`https://wa.me/${BRAND.waPhone}`} target="_blank" rel="noopener">
            WhatsApp
          </a>
          <a href={BRAND.instagramUrl} target="_blank" rel="noopener">
            Instagram
          </a>
          <a href={`mailto:${BRAND.contactEmail}`}>{BRAND.contactEmail}</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © {BRAND.year} {BRAND.name}
        </span>
        <span>Hecho con tiempo, no con prisa.</span>
      </div>
    </footer>
  );
}
