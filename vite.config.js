import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Solva se sirve como GitHub Pages de proyecto en bxutistxdd.github.io/solva-web,
// por eso base debe ser "/solva-web/" para que los assets no den 404.
// Si algún día se usa un dominio propio (CNAME), cambiar base a "/".
export default defineConfig({
  base: "/solva-web/",
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
