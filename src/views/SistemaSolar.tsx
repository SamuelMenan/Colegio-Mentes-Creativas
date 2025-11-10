import React, { useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ---------------------------------------------------------------------------
// Datos de planetas (simplificados) – Contribuye a aprendibilidad presentando
// información estructurada y consistente para cada ítem interactivo.
// ---------------------------------------------------------------------------
interface PlanetData {
  id: string;
  nombre: string;
  tamano: string; // Diámetro relativo
  distancia: string; // Distancia promedio al Sol
  lunas: number;
  curiosidad: string;
  color: string; // Tailwind color para la "esfera"
  alt: string; // Texto alternativo accesible
}

const PLANETAS: PlanetData[] = [
  {
    id: "mercurio",
    nombre: "Mercurio",
    tamano: "0.38 × Tierra",
    distancia: "58 M km",
    lunas: 0,
    curiosidad: "Es el planeta más cercano al Sol y tiene extremos de temperatura.",
    color: "bg-gray-400",
    alt: "Esfera gris que representa a Mercurio",
  },
  {
    id: "venus",
    nombre: "Venus",
    tamano: "0.95 × Tierra",
    distancia: "108 M km",
    lunas: 0,
    curiosidad: "Su atmósfera provoca un efecto invernadero intenso, más caliente que Mercurio.",
    color: "bg-yellow-300",
    alt: "Esfera amarillo pálido que representa a Venus",
  },
  {
    id: "tierra",
    nombre: "Tierra",
    tamano: "1.00 × Tierra",
    distancia: "150 M km",
    lunas: 1,
    curiosidad: "Único planeta conocido con vida y agua líquida en abundancia.",
    color: "bg-blue-500",
    alt: "Esfera azul con tonos verdes que representa a la Tierra",
  },
  {
    id: "marte",
    nombre: "Marte",
    tamano: "0.53 × Tierra",
    distancia: "228 M km",
    lunas: 2,
    curiosidad: "Conocido como el planeta rojo por su superficie rica en óxido de hierro.",
    color: "bg-red-500",
    alt: "Esfera roja que representa a Marte",
  },
  {
    id: "jupiter",
    nombre: "Júpiter",
    tamano: "11.2 × Tierra",
    distancia: "778 M km",
    lunas: 95,
    curiosidad: "El planeta más grande del sistema solar con una gran mancha roja (tormenta gigante).",
    color: "bg-orange-400",
    alt: "Esfera grande naranja que representa a Júpiter",
  },
  {
    id: "saturno",
    nombre: "Saturno",
    tamano: "9.45 × Tierra",
    distancia: "1.43 B km",
    lunas: 146,
    curiosidad: "Famoso por sus anillos visibles formados por hielo y roca.",
    color: "bg-amber-300",
    alt: "Esfera amarilla con anillo que representa a Saturno",
  },
  {
    id: "urano",
    nombre: "Urano",
    tamano: "4.00 × Tierra",
    distancia: "2.87 B km",
    lunas: 27,
    curiosidad: "Gira inclinado de costado, lo que causa estaciones extremas.",
    color: "bg-teal-400",
    alt: "Esfera azul verdosa que representa a Urano",
  },
  {
    id: "neptuno",
    nombre: "Neptuno",
    tamano: "3.88 × Tierra",
    distancia: "4.50 B km",
    lunas: 14,
    curiosidad: "Tiene vientos supersónicos y es el más lejano del Sol.",
    color: "bg-indigo-500",
    alt: "Esfera índigo que representa a Neptuno",
  },
];

// Modal accesible – Aprendibilidad: muestra info clara y estructurada.
interface PlanetModalProps {
  planeta: PlanetData | null;
  onClose: () => void;
}

const PlanetModal: React.FC<PlanetModalProps> = ({ planeta, onClose }) => {
  const labelId = useId();
  const descId = useId();
  return (
    <AnimatePresence>
      {planeta && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelId}
          aria-describedby={descId}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Fondo semitransparente */}
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-label="Cerrar modal"
          />
          {/* Contenido del modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 150, damping: 18 }}
              className="relative w-full max-w-md rounded-2xl bg-slate-900 text-white shadow-lg border border-slate-700 p-6"
            >
              <h2 id={labelId} className="text-2xl font-bold mb-2">
                {planeta.nombre}
              </h2>
              <p id={descId} className="text-sm text-slate-300 mb-4">
                Datos básicos y curiosidad sobre {planeta.nombre}.
              </p>
              {/* Imagen descriptiva (placeholder – aprendibilidad y accesibilidad) */}
              <div className="flex items-center justify-center mb-4">
                <div
                  role="img"
                  aria-label={planeta.alt}
                  className={`w-28 h-28 rounded-full ${planeta.color} flex items-center justify-center shadow-inner relative`}
                >
                  {/* Si fuese Saturno podríamos simular anillo */}
                  {planeta.id === "saturno" && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full border-4 border-amber-200 animate-pulse"
                    />
                  )}
                </div>
              </div>
              <ul className="space-y-2 text-sm">
                <li><strong>Tamaño:</strong> {planeta.tamano}</li>
                <li><strong>Distancia al Sol:</strong> {planeta.distancia}</li>
                <li><strong>Número de lunas:</strong> {planeta.lunas}</li>
                <li><strong>Curiosidad:</strong> {planeta.curiosidad}</li>
              </ul>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-400 transition"
                  aria-label="Cerrar información del planeta"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Componente principal Sistema Solar Interactivo.
// Cumple con Aprendibilidad (layout claro, instrucciones) y Accesibilidad (roles, aria, contraste).
const SistemaSolar: React.FC = () => {
  const [seleccionado, setSeleccionado] = useState<PlanetData | null>(null);

  return (
    <div className="py-8 px-4 max-w-6xl mx-auto">
      {/* Encabezado accesible */}
      <header className="text-center mb-8">
        <motion.h1
          className="text-3xl md:text-5xl font-extrabold text-yellow-300 drop-shadow [text-shadow:0_0_8px_rgba(255,255,255,0.3)]"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Sistema Solar Interactivo
        </motion.h1>
        <motion.p
          className="mt-2 text-lg md:text-xl text-slate-100 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Aprende sobre los planetas: haz clic en un planeta para conocer datos y curiosidades.
        </motion.p>
      </header>

      {/* Introducción educativa – Aprendibilidad: texto contextual breve */}
      <section aria-labelledby="intro" className="mb-10">
        <h2 id="intro" className="sr-only">Introducción educativa</h2>
        <p className="leading-relaxed text-slate-200 text-base md:text-lg">
          El <strong>Sistema Solar</strong> está formado por el Sol y los cuerpos que giran a su alrededor: planetas, lunas, asteroides y cometas. Cada planeta es único en tamaño, temperatura y composición. Explorarlos fomenta la curiosidad y el pensamiento científico.
        </p>
      </section>

      {/* Zona interactiva – planetas orbitando */}
      <section aria-labelledby="zona-interactiva" className="mb-12">
        <h2 id="zona-interactiva" className="text-xl font-bold text-slate-100 mb-4">Haz clic en un planeta para conocerlo</h2>
        <div
          role="list"
          aria-label="Lista de planetas del Sistema Solar"
          className="relative mx-auto w-full max-w-3xl aspect-square bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 rounded-full overflow-hidden shadow-inner"
        >
          {/* Sol central */}
          <div
            role="img"
            aria-label="Representación del Sol"
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-yellow-400 shadow-lg animate-pulse" />
          </div>
          {PLANETAS.map((p, i) => {
            const angle = (i / PLANETAS.length) * Math.PI * 2;
            const radius = 140; // radio base
            const x = Math.cos(angle) * radius + 220; // ajustes para centrar
            const y = Math.sin(angle) * radius + 220;
            return (
              <motion.button
                key={p.id}
                type="button"
                role="listitem"
                aria-label={`Planeta ${p.nombre}. Pulsa para ver detalles`}
                onClick={() => setSeleccionado(p)}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.15 }}
                whileFocus={{ scale: 1.15 }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-300 rounded-full ${p.color} shadow-md flex items-center justify-center text-xs font-bold text-white`}
                style={{ left: x, top: y, width: 48, height: 48 }}
              >
                <span aria-hidden="true">{p.nombre.charAt(0)}</span>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Zona multimedia – video accesible con subtítulos (placeholder) */}
      <section aria-labelledby="video-educativo" className="mb-12">
        <h2 id="video-educativo" className="text-xl font-bold text-slate-100 mb-4">Video educativo</h2>
        <p className="text-slate-300 mb-4">Observa este video para reforzar lo aprendido. Incluye subtítulos para accesibilidad.</p>
        <div className="max-w-3xl mx-auto">
          <div className="aspect-video w-full rounded-xl overflow-hidden ring-2 ring-indigo-400 bg-black flex items-center justify-center text-slate-200 text-center p-6">
            {/* Placeholder: podría integrarse un iframe YouTube con track de subtítulos */}
            <p className="text-sm md:text-base">[Video educativo con subtítulos próximamente]</p>
          </div>
          <button
            type="button"
            aria-label="Ver Video Educativo"
            className="mt-4 px-5 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2"
          >
            Ver Video Educativo
          </button>
        </div>
      </section>

      {/* Pie de sección */}
      <footer className="mt-8 text-center">
        <a
          href="/"
          className="text-indigo-300 hover:text-indigo-200 underline"
          aria-label="Volver al menú principal"
        >
          Volver al menú principal
        </a>
      </footer>

      {/* Modal de planeta */}
      <PlanetModal planeta={seleccionado} onClose={() => setSeleccionado(null)} />
    </div>
  );
};

export default SistemaSolar;
