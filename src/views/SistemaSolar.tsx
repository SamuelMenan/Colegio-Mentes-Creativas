import React, { useMemo, useState, useId } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// ---------------------------------------------------------------------------
// Datos y utilidades
// - Aprendibilidad: datos consistentes ayudan a comparar planetas.
// - Accesibilidad: se definen etiquetas y colores con alto contraste.
// ---------------------------------------------------------------------------
type PlanetKey =
  | "mercurio"
  | "venus"
  | "tierra"
  | "marte"
  | "jupiter"
  | "saturno"
  | "urano"
  | "neptuno";

interface PlanetData {
  id: PlanetKey;
  nombre: string;
  tamano: string; // Relación de diámetros aprox vs. Tierra
  distancia: string; // Distancia media al Sol
  lunas: number;
  curiosidad: string;
  color: string; // Tailwind bg-* para el planeta
  sizePx: number; // tamaño del planeta en px (relativo y legible)
  orbitPercent: number; // diámetro del anillo de órbita en % del contenedor
  duration: number; // duración de órbita en segundos (más cerca = más rápido)
  alt: string; // descripción visual
  imageUrl: string; // URL de la imagen real del planeta
}

const PLANETAS: PlanetData[] = [
  {
    id: "mercurio",
    nombre: "Mercurio",
    tamano: "0.38 × Tierra",
    distancia: "58 M km",
    lunas: 0,
    curiosidad:
      "El planeta más cercano al Sol; su día dura casi dos meses terrestres.",
    color: "bg-gray-300",
    sizePx: 10,
    orbitPercent: 24,
    duration: 6,
    alt: "Imagen real de Mercurio, planeta rocoso de color gris",
    // Fuente: NASA/Wikipedia (dominio público)
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/2/2e/Mercury_in_true_color.jpg",
  },
  {
    id: "venus",
    nombre: "Venus",
    tamano: "0.95 × Tierra",
    distancia: "108 M km",
    lunas: 0,
    curiosidad:
      "Su atmósfera densa genera un efecto invernadero extremo, más caliente que Mercurio.",
    color: "bg-yellow-300",
    sizePx: 14,
    orbitPercent: 32,
    duration: 10,
    alt: "Imagen real de Venus, cubierta por nubes amarillas densas",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/e/e5/Venus-real_color.jpg",
  },
  {
    id: "tierra",
    nombre: "Tierra",
    tamano: "1.00 × Tierra",
    distancia: "150 M km",
    lunas: 1,
    curiosidad: "Único planeta conocido con vida y agua líquida abundante.",
    color: "bg-blue-500",
    sizePx: 16,
    orbitPercent: 40,
    duration: 15,
    alt: "Fotografía real de la Tierra mostrando océanos y continentes",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/9/97/The_Earth_seen_from_Apollo_17.jpg",
  },
  {
    id: "marte",
    nombre: "Marte",
    tamano: "0.53 × Tierra",
    distancia: "228 M km",
    lunas: 2,
    curiosidad:
      "Llamado el planeta rojo por el óxido de hierro de su superficie.",
    color: "bg-red-500",
    sizePx: 12,
    orbitPercent: 48,
    duration: 18,
    alt: "Imagen real de Marte, el planeta rojo",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg",
  },
  {
    id: "jupiter",
    nombre: "Júpiter",
    tamano: "11.2 × Tierra",
    distancia: "778 M km",
    lunas: 95,
    curiosidad:
      "El más grande; destaca su Gran Mancha Roja, una tormenta gigante.",
    color: "bg-orange-400",
    sizePx: 26,
    orbitPercent: 60,
    duration: 30,
    alt: "Imagen real de Júpiter con su Gran Mancha Roja",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e2/Jupiter.jpg",
  },
  {
    id: "saturno",
    nombre: "Saturno",
    tamano: "9.45 × Tierra",
    distancia: "1.43 B km",
    lunas: 146,
    curiosidad: "Famoso por sus anillos visibles de hielo y roca.",
    color: "bg-amber-300",
    sizePx: 24,
    orbitPercent: 72,
    duration: 38,
    alt: "Imagen real de Saturno con sus anillos",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/c7/Saturn_during_Equinox.jpg",
  },
  {
    id: "urano",
    nombre: "Urano",
    tamano: "4.00 × Tierra",
    distancia: "2.87 B km",
    lunas: 27,
    curiosidad:
      "Gira prácticamente de costado, generando estaciones muy largas.",
    color: "bg-teal-400",
    sizePx: 20,
    orbitPercent: 82,
    duration: 46,
    alt: "Imagen real de Urano de tono verde azulado",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3d/Uranus2.jpg",
  },
  {
    id: "neptuno",
    nombre: "Neptuno",
    tamano: "3.88 × Tierra",
    distancia: "4.50 B km",
    lunas: 14,
    curiosidad: "Tiene vientos supersónicos; el más lejano del Sol.",
    color: "bg-indigo-500",
    sizePx: 20,
    orbitPercent: 92,
    duration: 54,
    alt: "Imagen real de Neptuno, azul profundo",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/5/56/Neptune_Full.jpg",
  },
];

// Modal accesible con animación de zoom –
// - Aprendibilidad: estructura clara con lista de datos.
// - Accesibilidad: role="dialog", labels, contraste alto.
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
          <motion.div
            className="absolute inset-0 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-label="Cerrar modal"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: "spring", stiffness: 160, damping: 18 }}
            className="relative w-full max-w-md rounded-2xl bg-slate-900 text-white shadow-xl border border-slate-700 p-6"
          >
            <h2 id={labelId} className="text-2xl font-extrabold mb-1">
              {planeta.nombre}
            </h2>
            <p id={descId} className="text-sm text-slate-300 mb-4">
              Información esencial para estudiantes de primaria.
            </p>
            <div className="flex items-center justify-center mb-4">
              <div
                role="img"
                aria-label={planeta.alt}
                className={`relative rounded-full ${planeta.color} shadow-inner`}
                style={{ width: 112, height: 112 }}
              >
                {planeta.id === "saturno" && (
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full border-4 border-amber-200/60"
                    style={{ transform: "scale(1.4) rotate(15deg)" }}
                  />
                )}
              </div>
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <strong>Tamaño:</strong> {planeta.tamano}
              </li>
              <li>
                <strong>Distancia al Sol:</strong> {planeta.distancia}
              </li>
              <li>
                <strong>Lunas:</strong> {planeta.lunas}
              </li>
              <li>
                <strong>Curiosidad:</strong> {planeta.curiosidad}
              </li>
            </ul>
            <div className="mt-6 flex justify-end">
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

// Componente principal: sistema solar centrado con órbitas animadas
// - Aprendibilidad: instrucciones claras y diseño consistente.
// - Accesibilidad: alto contraste, etiquetas aria, modo accesible para detener animaciones.
const SistemaSolar: React.FC = () => {
  const [seleccionado, setSeleccionado] = useState<PlanetData | null>(null);
  const [isAccessibleMode, setIsAccessibleMode] = useState(false);
  const reduceMotion = useReducedMotion();

  // Si el usuario prefiere menos movimiento o modo accesible está activo, no animamos.
  const shouldAnimate = useMemo(
    () => !isAccessibleMode && !reduceMotion,
    [isAccessibleMode, reduceMotion]
  );

  // Posiciones de estrellas estáticas –
  // Aprendibilidad: refuerza el contexto espacial; Accesibilidad: decorativo aria-hidden.
  const stars = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        key: i,
        top: (i * 37) % 100, // valores pseudo-determinísticos
        left: (i * 53) % 100,
        size: (i % 3) + 1,
        opacity: 0.4 + ((i * 7) % 6) / 10,
      })),
    []
  );

  return (
    <div className="min-h-[calc(100dvh-6rem)] py-8 px-4 grid place-items-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0b1020] via-[#101836] to-[#060912] relative overflow-hidden">
      {/* Capa de estrellas */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {stars.map((s) => (
          <span
            key={s.key}
            className="absolute rounded-full bg-white"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: s.size,
              height: s.size,
              opacity: s.opacity,
              boxShadow: "0 0 6px rgba(255,255,255,0.3)",
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-[900px]">
        {/* Encabezado */}
        <header className="text-center mb-6">
          <motion.h1
            className="text-3xl md:text-5xl font-extrabold text-yellow-300 drop-shadow [text-shadow:0_0_8px_rgba(255,255,255,0.25)]"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Sistema Solar Interactivo
          </motion.h1>
          <p className="mt-2 text-lg md:text-xl text-slate-100 text-center">
            Haz clic en un planeta para conocerlo
          </p>
        </header>

        {/* Controles de accesibilidad */}
        <div className="flex justify-end mb-3">
          <button
            type="button"
            onClick={() => setIsAccessibleMode((v) => !v)}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2"
            aria-pressed={isAccessibleMode}
            aria-label="Activar modo accesible"
            title="Activar modo accesible"
          >
            {isAccessibleMode ? "Modo accesible: ON" : "Activar modo accesible"}
          </button>
        </div>

        {/* Sistema solar centrado */}
        <section
          aria-labelledby="zona-interactiva"
          className="relative mx-auto w-full aspect-square max-w-[900px] rounded-full"
        >
          <h2 id="zona-interactiva" className="sr-only">
            Zona interactiva del sistema solar
          </h2>

          {/* Fondo dentro del disco principal (gradiente y glow) */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#0b0f22] via-[#232b69] to-[#121a3a] shadow-inner" />

          {/* Sol centrado con brillo sutil usando imagen real */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <motion.div
                aria-label="Imagen del Sol"
                role="img"
                className="rounded-full overflow-hidden shadow-[0_0_40px_rgba(255,200,0,0.55)]"
                style={{ width: 120, height: 120 }}
                animate={shouldAnimate ? { scale: [1, 1.03, 1] } : undefined}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Sun_white.jpg"
                  alt="Imagen real del Sol en luz blanca"
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <div
                aria-hidden
                className="absolute inset-0 rounded-full blur-xl bg-yellow-300/40"
                style={{ transform: "scale(1.4)" }}
              />
            </div>
          </div>

          {/* Lista de planetas (rol list) */}
          <div
            role="list"
            aria-label="Lista de planetas del Sistema Solar"
            className="absolute inset-0"
          >
            {PLANETAS.map((p) => {
              // Componente órbita: un anillo visible y un contenedor que rota
              const ringSize = `${p.orbitPercent}%`; // diámetro del anillo
              const labelId = `label-${p.id}`;
              return (
                <div key={p.id} className="absolute inset-0 flex items-center justify-center">
                  {/* Anillo de órbita – semitransparente para referencia visual */}
                  <div
                    aria-hidden
                    className="rounded-full border border-white/15"
                    style={{ width: ringSize, height: ringSize }}
                  />

                  {/* Contenedor rotatorio */}
                  <motion.div
                    className="absolute"
                    style={{ width: ringSize, height: ringSize }}
                    animate={shouldAnimate ? { rotate: 360 } : undefined}
                    transition={shouldAnimate ? { duration: p.duration, ease: "linear", repeat: Infinity } : undefined}
                  >
                    {/* Botón planeta en el borde superior */}
                    <motion.button
                      type="button"
                      role="listitem"
                      aria-label={`Planeta ${p.nombre}. Pulsa para ver detalles`}
                      aria-describedby={labelId}
                      onClick={() => setSeleccionado(p)}
                      aria-roledescription="button"
                      className={`group absolute left-1/2 -translate-x-1/2 -top-0 rounded-full overflow-hidden ${p.color} shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-300`}
                      style={{ width: p.sizePx, height: p.sizePx }}
                      whileHover={shouldAnimate ? { scale: 1.2 } : undefined}
                      whileFocus={shouldAnimate ? { scale: 1.2 } : undefined}
                    >
                      {/* Imagen real del planeta – accesible */}
                      <img
                        src={p.imageUrl}
                        alt={p.alt}
                        className="w-full h-full object-cover"
                      />
                      {/* Tooltip visual – Aprendibilidad: nombre al pasar */}
                      <span
                        id={labelId}
                        className={`pointer-events-none absolute left-1/2 -translate-x-1/2 -translate-y-full -top-2 whitespace-nowrap rounded-md bg-black/70 text-white px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition ${
                          isAccessibleMode ? "opacity-100" : ""
                        }`}
                        role="tooltip"
                      >
                        {p.nombre}
                      </span>
                      {/* Texto para lectores de pantalla */}
                      <span className="sr-only">{p.nombre}</span>
                    </motion.button>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Pie: enlace simple de retorno */}
        <footer className="mt-8 text-center">
          <a
            href="/"
            className="text-indigo-300 hover:text-indigo-200 underline"
            aria-label="Volver al menú principal"
          >
            Volver al menú principal
          </a>
        </footer>
      </div>

      {/* Modal del planeta */}
      <PlanetModal planeta={seleccionado} onClose={() => setSeleccionado(null)} />
    </div>
  );
};

export default SistemaSolar;
