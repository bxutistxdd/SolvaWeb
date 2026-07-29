/* Solva admin · pestaña Configuración (WhatsApp, contraseña, reset de
   catálogo, cierre de sesión). */

import { useState, useEffect } from "react";
import { db } from "../../lib/db.js";

function ChangePwForm() {
  const [cur, setCur] = useState("");
  const [nxt, setNxt] = useState("");
  const [rep, setRep] = useState("");
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (nxt !== rep) {
      setMsg({ ok: false, t: "Las nuevas contraseñas no coinciden." });
      return;
    }
    if (nxt.length < 6) {
      setMsg({ ok: false, t: "Mínimo 6 caracteres." });
      return;
    }
    setBusy(true);
    // Verificar la contraseña actual reautenticando
    const auth = await db.signIn(cur);
    if (!auth.ok) {
      setMsg({ ok: false, t: "Contraseña actual incorrecta." });
      setBusy(false);
      return;
    }
    const res = await db.changePassword(nxt);
    if (!res.ok) {
      setMsg({ ok: false, t: res.error || "No se pudo cambiar la contraseña." });
      setBusy(false);
      return;
    }
    setMsg({ ok: true, t: "Contraseña cambiada correctamente." });
    setCur("");
    setNxt("");
    setRep("");
    setBusy(false);
  };
  return (
    <form onSubmit={submit} className="adm-pw-form">
      <label className="adm-lbl" htmlFor="adm-pw-cur">
        Contraseña actual
      </label>
      <input
        id="adm-pw-cur"
        type="password"
        className="adm-input adm-input--sm"
        placeholder="Contraseña actual"
        value={cur}
        onChange={(e) => setCur(e.target.value)}
        name="current-password"
        autoComplete="current-password"
      />
      <label className="adm-lbl" htmlFor="adm-pw-new">
        Nueva contraseña
      </label>
      <input
        id="adm-pw-new"
        type="password"
        className="adm-input adm-input--sm"
        placeholder="Nueva contraseña"
        value={nxt}
        onChange={(e) => setNxt(e.target.value)}
        name="new-password"
        autoComplete="new-password"
      />
      <label className="adm-lbl" htmlFor="adm-pw-rep">
        Repetir nueva contraseña
      </label>
      <input
        id="adm-pw-rep"
        type="password"
        className="adm-input adm-input--sm"
        placeholder="Repetir nueva"
        value={rep}
        onChange={(e) => setRep(e.target.value)}
        name="new-password-repeat"
        autoComplete="new-password"
      />
      {msg && (
        <p className={`adm-msg${msg.ok ? " adm-msg--ok" : " adm-msg--err"}`} aria-live="polite">
          {msg.t}
        </p>
      )}
      <button
        type="submit"
        className="adm-btn adm-btn--primary adm-btn--sm"
        disabled={busy || !cur || !nxt || !rep}
      >
        {busy ? "Guardando…" : "Cambiar contraseña"}
      </button>
    </form>
  );
}

export function TabConfig({ cfg, save, onLogout, resetProducts }) {
  const [phone, setPhone] = useState(cfg.wa_phone);
  const [savedPhone, setSavedPhone] = useState(false);
  useEffect(() => {
    setPhone(cfg.wa_phone);
  }, [cfg.wa_phone]);
  return (
    <div className="adm-page">
      <div className="adm-cfg-section adm-form-card">
        <h3 className="adm-cfg-h">WhatsApp del negocio</h3>
        <p className="adm-hint">Número con código de país, sin + ni espacios. Ej: 573001234567</p>
        <div className="adm-row-inline">
          <label className="adm-lbl sr-only" htmlFor="adm-cfg-phone">
            WhatsApp del negocio
          </label>
          <input
            id="adm-cfg-phone"
            className="adm-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ maxWidth: 260 }}
            name="business-whatsapp"
            type="tel"
            inputMode="numeric"
            autoComplete="off"
          />
          <button
            className="adm-btn adm-btn--primary adm-btn--sm"
            onClick={() => {
              save({ wa_phone: phone.replace(/\D/g, "") });
              setSavedPhone(true);
              setTimeout(() => setSavedPhone(false), 2000);
            }}
          >
            {savedPhone ? "Guardado ✓" : "Guardar"}
          </button>
        </div>
      </div>
      <div className="adm-cfg-section adm-form-card">
        <h3 className="adm-cfg-h">Cambiar contraseña</h3>
        <p className="adm-hint">
          Cambia la contraseña que recibiste al configurar esta instancia tras el primer acceso.
        </p>
        <ChangePwForm />
      </div>
      <div className="adm-cfg-section adm-form-card">
        <h3 className="adm-cfg-h">Datos de productos</h3>
        <p className="adm-hint">
          Restablece el catálogo al estado inicial (productos de data.js). Los productos
          personalizados se perderán.
        </p>
        <button
          className="adm-btn adm-btn--ghost"
          onClick={() => {
            if (
              window.confirm(
                "¿Restablecer el catálogo a los productos originales? Los cambios en productos se perderán."
              )
            )
              resetProducts();
          }}
        >
          Restablecer catálogo original
        </button>
      </div>
      <div className="adm-cfg-section">
        <h3 className="adm-cfg-h">Sesión</h3>
        <p className="adm-hint">La sesión se cierra automáticamente al cerrar el navegador.</p>
        <button className="adm-btn adm-btn--ghost" onClick={onLogout}>
          Cerrar sesión
        </button>
      </div>
      <hr className="adm-hr" />
      <p className="adm-note">
        <strong>Nota:</strong> Stock, visibilidad, productos y configuración se guardan en Supabase
        y están disponibles desde cualquier dispositivo en tiempo real.
      </p>
    </div>
  );
}
