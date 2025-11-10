import React, { useMemo, useState, useId, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// ---------------------------------------------------------------------------
// Datos y utilidades
// - Aprendibilidad: datos consistentes ayudan a comparar planetas.
// - Accesibilidad: se definen etiquetas y colores con alto contraste.
// ---------------------------------------------------------------------------
type PlanetKey =
  | "sol"
  | "mercurio"
  | "venus"
  | "tierra"
  | "luna"
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
  datoExtra?: string; // Dato adicional para "¿Sabías que...?"
  videoId?: string; // ID opcional de YouTube
  distanciaAU?: number; // Distancia media en UA para modo realista
  color: string; // Tailwind bg-* para el planeta
  sizePx: number; // tamaño del planeta en px (relativo y legible)
  orbitPercent: number; // diámetro del anillo de órbita en % del contenedor
  duration: number; // duración de órbita en segundos (más cerca = más rápido)
  alt: string; // descripción visual
  imageUrl: string; // URL de la imagen real del planeta
}

const PLANETAS: PlanetData[] = [
  {
    id: "sol",
    nombre: "Sol",
    tamano: "109 × Tierra",
    distancia: "Centro del sistema",
    lunas: 0,
    curiosidad: "Contiene más del 99% de la masa total del Sistema Solar.",
    datoExtra: "Su energía proviene de la fusión nuclear de hidrógeno en helio.",
    videoId: "zPgfsQoXRUk",
    distanciaAU: 0, // centro
    color: "bg-yellow-400",
    sizePx: 120,
    orbitPercent: 0,
    duration: 0,
    alt: "Imagen real del Sol mostrando su superficie brillante",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b4/The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg"
  },
  {
    id: "mercurio",
    nombre: "Mercurio",
    tamano: "0.38 × Tierra",
    distancia: "58 M km",
    lunas: 0,
    curiosidad:
      "El planeta más cercano al Sol; su día dura casi dos meses terrestres.",
    datoExtra: "Sus temperaturas varían de -180°C a 430°C entre la noche y el día.",
  videoId: "MzsbpWPBc0s",
    distanciaAU: 0.39,
    color: "bg-gray-300",
    sizePx: 10,
    orbitPercent: 24,
    duration: 6,
    alt: "Imagen real de Mercurio, planeta rocoso de color gris",
    // Fuente: NASA/Wikipedia (dominio público)
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/8/88/Reprocessed_Mariner_10_image_of_Mercury.jpg",
  },
  {
    id: "venus",
    nombre: "Venus",
    tamano: "0.95 × Tierra",
    distancia: "108 M km",
    lunas: 0,
    curiosidad:
      "Su atmósfera densa genera un efecto invernadero extremo, más caliente que Mercurio.",
    datoExtra: "Gira al revés (rotación retrógrada) respecto a la mayoría de planetas.",
  videoId: "ink28v2xlGY",
    distanciaAU: 0.72,
    color: "bg-yellow-300",
    sizePx: 14,
    orbitPercent: 32,
    duration: 10,
    alt: "Imagen real de Venus, cubierta por nubes amarillas densas",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/a/a0/VenusDonMiguel.gif",
  },
  {
    id: "tierra",
    nombre: "Tierra",
    tamano: "1.00 × Tierra",
    distancia: "150 M km",
    lunas: 1,
    curiosidad: "Único planeta conocido con vida y agua líquida abundante.",
    datoExtra: "La atmósfera está compuesta principalmente de nitrógeno y oxígeno.",
  videoId: "vuW8YJ532g8",
    distanciaAU: 1.0,
    color: "bg-blue-500",
    sizePx: 16,
    orbitPercent: 40,
    duration: 15,
    alt: "Fotografía real de la Tierra mostrando océanos y continentes",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/9/97/The_Earth_seen_from_Apollo_17.jpg",
  },
  {
    id: "luna",
    nombre: "Luna",
    tamano: "0.27 × Tierra",
    distancia: "384,400 km de la Tierra",
    lunas: 0,
    curiosidad: "Influye en las mareas y estabiliza la inclinación terrestre.",
    datoExtra: "Siempre nos muestra la misma cara debido a la rotación síncrona.",
    videoId: "A3raAc08xqQ",
    distanciaAU: 1.0, // aproximadamente órbita junto con la Tierra
    color: "bg-gray-200",
    sizePx: 8,
    orbitPercent: 6, // órbita local alrededor de la Tierra (valor relativo pequeño)
    duration: 6, // rotación rápida local
    alt: "Imagen real de la Luna con cráteres",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e1/FullMoon2010.jpg"
  },
  {
    id: "marte",
    nombre: "Marte",
    tamano: "0.53 × Tierra",
    distancia: "228 M km",
    lunas: 2,
    curiosidad:
      "Llamado el planeta rojo por el óxido de hierro de su superficie.",
    datoExtra: "Tiene los volcanes más grandes del Sistema Solar, como Olympus Mons.",
  videoId: "RLky_HlOWRg",
    distanciaAU: 1.52,
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
    datoExtra: "Emite más calor del que recibe del Sol debido a su compresión interna.",
  videoId: "02oQIvTCzNI",
    distanciaAU: 5.2,
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
    datoExtra: "Su densidad es tan baja que, hipotéticamente, podría flotar en agua.",
  videoId: "SIxyMBjtPYw",
    distanciaAU: 9.58,
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
    datoExtra: "Su color verdoso se debe al metano en su atmósfera.",
  videoId: "dTU5TkW4U8E",
    distanciaAU: 19.2,
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
    datoExtra: "Fue descubierto por predicción matemática antes de ser observado.",
  videoId: "5vcqxZz89Z4",
    distanciaAU: 30.05,
    color: "bg-indigo-500",
    sizePx: 20,
    orbitPercent: 92,
    duration: 54,
    alt: "Imagen real de Neptuno, azul profundo",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/5/56/Neptune_Full.jpg",
  },
];

// -------------------------------------------------------------
// Subcomponentes reutilizables
// -------------------------------------------------------------

type SolarBackgroundProps = {
  stars: { key: number; top: number; left: number; size: number; opacity: number }[];
  animateBg: boolean;
  theme: "dark" | "light";
};

const SolarBackground: React.FC<SolarBackgroundProps> = ({ stars, animateBg, theme }) => {
  return (
    <div className={`pointer-events-none absolute inset-0 ${theme === "light" ? "opacity-95" : ""}`}>
      <motion.div
        className="absolute inset-0"
        aria-hidden
        animate={animateBg ? { x: [0, -6, 0], y: [0, 4, 0] } : undefined}
        transition={animateBg ? { duration: 30, repeat: Infinity, ease: "easeInOut" } : undefined}
      >
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
              boxShadow: theme === "light" ? "0 0 6px rgba(0,0,0,0.25)" : "0 0 6px rgba(255,255,255,0.3)",
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};

type AccessibilityToggleProps = {
  isAccessible: boolean;
  onToggle: () => void;
};

const AccessibilityToggle: React.FC<AccessibilityToggleProps> = ({ isAccessible, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2"
    aria-pressed={isAccessible}
    aria-label="Activar modo accesible"
    title="Activar modo accesible"
  >
    {isAccessible ? "Modo accesible: ON" : "Activar modo accesible"}
  </button>
);

type OrbitRingProps = {
  size: string; // porcentaje ej. "60%"
  shouldAnimate: boolean;
  duration: number;
  children: React.ReactNode;
};

const OrbitRing: React.FC<OrbitRingProps> = ({ size, shouldAnimate, duration, children }) => (
  <div className="absolute inset-0 flex items-center justify-center">
    {/* Halo tenue de la órbita */}
    <div
      aria-hidden
      className="pointer-events-none rounded-full border border-white/20 shadow-[0_0_12px_rgba(80,160,255,0.25)]"
      style={{ width: size, height: size }}
    />
    {/* Contenedor rotatorio */}
    <motion.div
      className="absolute pointer-events-none"
      style={{ width: size, height: size }}
      animate={shouldAnimate ? { rotate: 360 } : undefined}
      transition={shouldAnimate ? { duration, ease: "linear", repeat: Infinity } : undefined}
    >
      {children}
    </motion.div>
  </div>
);

type PlanetButtonProps = {
  p: PlanetData;
  isAccessibleMode: boolean;
  shouldAnimate: boolean;
  selected: boolean;
  onSelect: (p: PlanetData) => void;
};

const PlanetButton: React.FC<PlanetButtonProps> = ({ p, isAccessibleMode, shouldAnimate, selected, onSelect }) => {
  const labelId = `label-${p.id}`;
  return (
    <motion.button
      type="button"
      role="listitem"
      aria-label={`Planeta ${p.nombre}. Pulsa para ver detalles`}
      aria-describedby={labelId}
      onClick={() => onSelect(p)}
      aria-roledescription="button"
      className={`group absolute left-1/2 -translate-x-1/2 -top-0 rounded-full overflow-hidden ${p.color} shadow-md ring-1 ring-white/30 hover:ring-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-300 pointer-events-auto z-10`}
      style={{ width: p.sizePx, height: p.sizePx, filter: "drop-shadow(0 0 6px rgba(255,255,255,0.2))" }}
      whileHover={shouldAnimate ? { scale: 1.2 } : undefined}
      whileFocus={shouldAnimate ? { scale: 1.2 } : undefined}
    >
      {/* Indicador de selección */}
      {selected && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full ring-2 ring-cyan-300/90 shadow-[0_0_12px_rgba(34,211,238,0.7)]"
        />
      )}
      {/* Imagen real del planeta y rotación propia */}
      <motion.img
        src={p.imageUrl}
        alt={p.alt}
        className="w-full h-full object-cover"
        loading="lazy"
        title={`Este es ${p.nombre}`}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
        style={{
          scale:
            p.id === "saturno" ? 1.36 :
            p.id === "neptuno" ? 1.34 :
            p.id === "urano" ? 1.30 : 1.18,
          transformOrigin: "center",
        }}
        animate={shouldAnimate ? { rotate: 360 } : undefined}
        transition={shouldAnimate ? { duration: 20 + (p.sizePx % 10), ease: "linear", repeat: Infinity } : undefined}
      />
      {/* Glow/volumen: degradado radial desde el lado del Sol (centro) */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 130%, rgba(255,255,255,0.45), rgba(255,255,255,0.08) 45%, rgba(0,0,0,0.15) 65%, transparent 75%)",
          mixBlendMode: "screen",
        }}
      />
      {/* Tooltip visual */}
      <span
        id={labelId}
        className={`pointer-events-none absolute left-1/2 -translate-x-1/2 -translate-y-full -top-2 whitespace-nowrap rounded-md bg-black/70 text-white px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition ${
          isAccessibleMode ? "opacity-100" : ""
        }`}
        role="tooltip"
      >
        {p.nombre}
      </span>
      <span className="sr-only">{p.nombre}</span>
    </motion.button>
  );
};

// Modal accesible con animación de zoom –
// - Aprendibilidad: estructura clara con lista de datos.
// - Accesibilidad: role="dialog", labels, contraste alto.
interface PlanetModalProps {
  planeta: PlanetData | null;
  onClose: () => void;
  isAccessibleMode?: boolean;
  onSpeakRequest?: (text: string) => void;
}

const PlanetModal: React.FC<PlanetModalProps> = ({ planeta, onClose, isAccessibleMode, onSpeakRequest }) => {
  const labelId = useId();
  const descId = useId();
  const [showVideo, setShowVideo] = useState(false);
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
                className="relative rounded-full overflow-hidden ring-2 ring-white/30 shadow-inner"
                style={{ width: 112, height: 112 }}
              >
                <img
                  src={planeta.imageUrl}
                  alt={planeta.alt}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  style={{
                    transform: `scale(${planeta.id === 'saturno' ? 1.40 : planeta.id === 'neptuno' ? 1.36 : planeta.id === 'urano' ? 1.32 : 1.14})`,
                    transformOrigin: 'center',
                  }}
                />
                {planeta.id === "saturno" && (
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full border-4 border-amber-200/60"
                    style={{ transform: "scale(1.38) rotate(15deg)" }}
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
              {planeta.datoExtra && (
                <li className="mt-2">
                  <strong>¿Sabías que…?</strong> {planeta.datoExtra}
                </li>
              )}
            </ul>
            {/* Video educativo */}
            <div className="mt-4 space-y-3">
              <button
                type="button"
                className="w-full px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-400 transition"
                onClick={() => setShowVideo((v) => !v)}
                aria-expanded={showVideo}
                aria-controls="video-educativo"
                aria-label="Mostrar u ocultar video educativo"
              >
                {showVideo ? "Ocultar video educativo" : "Ver video educativo"}
              </button>
              <AnimatePresence>
                {showVideo && (
                  <motion.div
                    id="video-educativo"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden rounded-lg border border-slate-700"
                  >
                    <div className="aspect-video">
                      <iframe
                        title={`Video educativo de ${planeta.nombre}`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        src={
                          planeta.videoId
                            ? `https://www.youtube.com/embed/${planeta.videoId}?cc_load_policy=1&hl=es&modestbranding=1&rel=0`
                            : `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(
                                `${planeta.nombre} planeta para niños`
                              )}&cc_load_policy=1&hl=es&modestbranding=1&rel=0`
                        }
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              {isAccessibleMode && (
                <button
                  type="button"
                  onClick={() =>
                    onSpeakRequest?.(
                      `${planeta.nombre}. Tamaño: ${planeta.tamano}. Distancia al Sol: ${planeta.distancia}. Lunas: ${planeta.lunas}. Curiosidad: ${planeta.curiosidad}. ${
                        planeta.datoExtra ? `Dato extra: ${planeta.datoExtra}.` : ""
                      }`
                    )
                  }
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-300"
                  aria-label="Leer descripción del planeta"
                >
                  Leer descripción
                </button>
              )}
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
  // Tema fijo oscuro (se elimina el toggle para simplificar)
  const [realOrbits, setRealOrbits] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.3);
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

  // Audio mínimo (click y ambiente sutil) sin recursos externos
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const ensureAudio = useCallback(async () => {
    if (audioCtxRef.current) return audioCtxRef.current;
    const AC: typeof AudioContext | undefined = (window as unknown as {
      AudioContext?: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
    }).AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null as unknown as AudioContext;
    const ctx = new AC();
    const gain = ctx.createGain();
    gain.gain.value = muted ? 0 : volume;
    gain.connect(ctx.destination);
    audioCtxRef.current = ctx;
    gainRef.current = gain;
    return ctx;
  }, [muted, volume]);

  const playClick = useCallback(async () => {
    if (muted) return;
  const ctx = await ensureAudio();
  if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 660;
    gain.gain.value = 0.0001;
    osc.connect(gain);
    gain.connect(gainRef.current!);
    osc.start();
    // env corto
    gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
    osc.stop(ctx.currentTime + 0.13);
  }, [ensureAudio, muted]);

  useEffect(() => {
    if (!gainRef.current) return;
    gainRef.current.gain.value = muted ? 0 : volume;
  }, [muted, volume]);

  // Speech synthesis
  const speakText = useCallback((text: string) => {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "es-ES";
      u.rate = 1;
      window.speechSynthesis.speak(u);
    } catch (e) {
      // Speech Synthesis no soportado o deshabilitado
      console.warn("Speech synthesis unavailable", e);
    }
  }, []);

  // Cálculo de órbitas reales (lineal en base a AU)
  const minOrbit = 24; // coincide con configuraciones actuales
  const maxOrbit = 92;
  const auValues = PLANETAS.map((p) => p.distanciaAU ?? 0.39);
  const minAU = Math.min(...auValues);
  const maxAU = Math.max(...auValues);
  const getOrbitPercent = (p: PlanetData) => {
    if (!realOrbits || !p.distanciaAU) return p.orbitPercent;
    const t = (p.distanciaAU - minAU) / (maxAU - minAU);
    return Math.round(minOrbit + t * (maxOrbit - minOrbit));
  };

  // Se elimina el zoom/drag para reducir complejidad

  return (
    <div className={`bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0b1020] via-[#101836] to-[#060912] min-h-[calc(100dvh-6rem)] py-8 px-4 grid place-items-center relative overflow-hidden`}>
      {/* Capa de estrellas con movimiento sutil */}
      <SolarBackground stars={stars} animateBg={shouldAnimate} theme={"dark"} />

      <div className="w-full max-w-[900px]">
        {/* Encabezado */}
        <header className="text-center mb-6">
          <motion.h1
            className={`text-3xl md:text-5xl font-extrabold text-yellow-300 drop-shadow [text-shadow:0_0_8px_rgba(255,255,255,0.25)]`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Sistema Solar Interactivo
          </motion.h1>
          <p className={`mt-2 text-lg md:text-xl text-slate-100 text-center`}>
            Haz clic en un planeta para conocerlo
          </p>
        </header>

        {/* Controles */}
        <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
          <div className="flex items-center gap-2">
            <AccessibilityToggle isAccessible={isAccessibleMode} onToggle={() => setIsAccessibleMode((v) => !v)} />
            <button
              type="button"
              onClick={() => setRealOrbits((v) => !v)}
              className="px-3 py-2 rounded-lg bg-sky-700 hover:bg-sky-600 text-white text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
              aria-pressed={realOrbits}
              aria-label="Alternar mostrar órbitas reales"
              title="Mostrar órbitas reales"
            >
              {realOrbits ? "Órbitas reales" : "Órbitas simples"}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              className="px-3 py-2 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
              aria-pressed={muted}
              aria-label={muted ? "Activar sonido" : "Silenciar sonido"}
              title={muted ? "Activar sonido" : "Silenciar sonido"}
            >
              {muted ? "Silenciado" : "Sonido ON"}
            </button>
            <label className="flex items-center gap-2 text-sm text-white">
              <span className="sr-only">Volumen</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.currentTarget.value))}
                aria-label="Ajustar volumen"
              />
            </label>
          </div>
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
          <div className="absolute inset-0 rounded-full shadow-inner bg-gradient-to-br from-[#0b0f22] via-[#232b69] to-[#121a3a]" />

          {/* Sol centrado con brillo, pulso y clic para información */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <button
                type="button"
                onClick={() => { setSeleccionado(PLANETAS.find(p => p.id === 'sol') || null); playClick(); }}
                className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-300"
                aria-label="Mostrar información del Sol"
                title="Sol"
              >
                <motion.div
                  aria-label="Imagen del Sol"
                  role="img"
                  className="rounded-full overflow-hidden shadow-[0_0_40px_rgba(255,200,0,0.55)]"
                  style={{ width: 120, height: 120 }}
                  animate={shouldAnimate ? { scale: [1, 1.06, 1], boxShadow: [
                    "0 0 40px rgba(255,200,0,0.45)",
                    "0 0 60px rgba(255,220,100,0.7)",
                    "0 0 40px rgba(255,200,0,0.45)",
                  ] } : undefined}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/b/b4/The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg"
                    alt="Imagen real del Sol"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "https://upload.wikimedia.org/wikipedia/commons/0/02/Solar_prominence.jpg";
                    }}
                  />
                </motion.div>
              </button>
              <motion.div
                aria-hidden
                className="absolute inset-0 rounded-full blur-xl bg-yellow-300/40"
                style={{ transform: "scale(1.4)" }}
                animate={shouldAnimate ? { opacity: [0.4, 0.7, 0.4] } : undefined}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>

          {/* Lista de planetas (rol list) */}
          <div
            role="list"
            aria-label="Lista de planetas del Sistema Solar"
            className="absolute inset-0"
          >
            {PLANETAS.filter(p => p.id !== 'sol' && p.id !== 'luna').map((p) => {
              const ringSize = `${getOrbitPercent(p)}%`;
              return (
                <OrbitRing key={p.id} size={ringSize} shouldAnimate={shouldAnimate} duration={p.duration}>
                  {/* Planeta */}
                  <PlanetButton
                    p={p}
                    isAccessibleMode={isAccessibleMode}
                    shouldAnimate={shouldAnimate}
                    selected={seleccionado?.id === p.id}
                    onSelect={(pl) => {
                      setSeleccionado(pl);
                      playClick();
                    }}
                  />
                  {/* Órbita local de la Luna alrededor de la Tierra */}
                  {p.id === 'tierra' && (
                    <div
                      className="absolute left-1/2 -translate-x-1/2 -top-0 -translate-y-1/2 pointer-events-none"
                      style={{ width: 56, height: 56 }}
                    >
                      <div
                        aria-hidden
                        className="absolute inset-0 rounded-full border border-white/15"
                      />
                      <motion.div
                        className="absolute inset-0"
                        animate={shouldAnimate ? { rotate: 360 } : undefined}
                        transition={shouldAnimate ? { duration: 6, ease: 'linear', repeat: Infinity } : undefined}
                      >
                        <PlanetButton
                          p={PLANETAS.find(x => x.id === 'luna') as PlanetData}
                          isAccessibleMode={isAccessibleMode}
                          shouldAnimate={shouldAnimate}
                          selected={seleccionado?.id === 'luna'}
                          onSelect={(pl) => { setSeleccionado(pl); playClick(); }}
                        />
                      </motion.div>
                    </div>
                  )}
                </OrbitRing>
              );
            })}
          </div>
        </section>

        {/* Pie: enlace simple de retorno */}
        <footer className="mt-8 text-center">
          <a
            href="/"
            className={`text-indigo-300 hover:text-indigo-200 underline`}
            aria-label="Volver al menú principal"
          >
            Volver al menú principal
          </a>
          <div className={`mt-2 text-xs text-slate-300`}>
            Basado en datos reales de NASA/Wikipedia – Propósito educativo
          </div>
        </footer>
      </div>

      {/* Modal del planeta */}
      <PlanetModal
        planeta={seleccionado}
        onClose={() => setSeleccionado(null)}
        isAccessibleMode={isAccessibleMode}
        onSpeakRequest={speakText}
      />
    </div>
  );
};

export default SistemaSolar;
