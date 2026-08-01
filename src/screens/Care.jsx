/* Solva · guía de cuidado de la prenda (contenido estático en 6 pasos). */

import { Reveal } from "../components/primitives.jsx";
import { BRAND } from "../lib/brand.js";

export function Care() {
  const steps = [
    {
      n: "01",
      title: "Lava al revés",
      body: "Voltea la prenda antes de lavar para proteger el estampado. El roce con otras prendas es la primera causa de que se desgaste.",
    },
    {
      n: "02",
      title: "Agua fría, ciclo suave",
      body: "El agua caliente encoge la tela y desgasta el color más rápido. Separa las prendas oscuras de las claras.",
    },
    {
      n: "03",
      title: "Evita la secadora",
      body: "Seca a la sombra y en plano si es posible. El calor de la secadora es la causa número uno de que una prenda se deforme.",
    },
    {
      n: "04",
      title: "Estampados: trato extra",
      body: "No planches directo sobre el estampado. Plancha del lado interior o con un paño de por medio, a temperatura media.",
    },
    {
      n: "05",
      title: "¿Dudas con una talla o pedido?",
      body: `Escríbenos por WhatsApp a ${BRAND.name} y te ayudamos a coordinar un cambio o resolver cualquier duda.`,
    },
    {
      n: "06",
      title: "Guarda bien",
      body: "Dobla en vez de colgar las prendas de punto grueso (como sudaderas) para que no pierdan la forma en el hombro.",
    },
  ];
  return (
    <main className="page-enter">
      <section className="care-hero">
        <Reveal>
          <span className="eyebrow">— Guía</span>
        </Reveal>
        <Reveal delay={100}>
          <h1 className="h-1">
            Cuidar la prenda
            <br />
            <em>es que dure más.</em>
          </h1>
        </Reveal>
        <Reveal delay={300}>
          <p className="body-lg" style={{ maxWidth: "60ch" }}>
            Una prenda bien tratada conserva su color y su forma por mucho más tiempo. Estos seis
            pasos cubren el 95% de lo que necesitas saber para mantener tu ropa de {BRAND.name}{" "}
            como el día uno.
          </p>
        </Reveal>
      </section>
      <div className="care-steps">
        {steps.map((s, i) => (
          <Reveal key={i} delay={i * 60} className="care-step">
            <div className="care-step-n">{s.n}</div>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </Reveal>
        ))}
      </div>
    </main>
  );
}
