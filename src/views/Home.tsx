import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";
import { BookOpen, FlaskConical, Globe, Cpu, Brain, Palette } from "lucide-react";

type MenuItem = {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string; // tailwind bg color class
  aria: string;
};

const MENU: MenuItem[] = [
  { label: "Matemáticas", icon: BookOpen, color: "bg-blue-500", aria: "Abrir área de Matemáticas" },
  { label: "Ciencias Naturales", icon: FlaskConical, color: "bg-green-500", aria: "Abrir área de Ciencias Naturales" },
  { label: "Ciencias Sociales", icon: Globe, color: "bg-yellow-500", aria: "Abrir área de Ciencias Sociales" },
  { label: "Tecnología", icon: Cpu, color: "bg-indigo-500", aria: "Abrir área de Tecnología" },
  { label: "Pensamiento Lógico", icon: Brain, color: "bg-emerald-500", aria: "Abrir área de Pensamiento Lógico" },
  { label: "Arte", icon: Palette, color: "bg-pink-500", aria: "Abrir área de Arte" },
];

type Slide = {
  id: number;
  title: string;
  caption: string;
  color: string; // tailwind bg color
  emoji: string;
};

const SLIDES: Slide[] = [
  { id: 1, title: "Laboratorio divertido", caption: "Experimentos y descubrimientos", color: "from-green-400 to-emerald-600", emoji: "🧪" },
  { id: 2, title: "Retos matemáticos", caption: "Sumas, restas y ¡problemas!", color: "from-blue-400 to-indigo-600", emoji: "➕" },
  { id: 3, title: "Arte y colores", caption: "Creatividad sin límites", color: "from-pink-400 to-rose-600", emoji: "🎨" },
];

export default function Home() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % SLIDES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const current = SLIDES[index];

  return (
    <div className="min-h-[calc(100vh-3.5rem)] pb-10">
      {/* Encabezado */}
      <header className="text-center py-10">
        <motion.h1
          className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Colegio Mentes Creativas
        </motion.h1>
        <motion.p
          className="mt-3 text-xl md:text-2xl text-slate-600 dark:text-slate-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          “Aprender jugando con tecnología”
        </motion.p>
      </header>

      {/* Menú principal */}
      <section aria-labelledby="areas-conocimiento" className="px-4">
        <h2 id="areas-conocimiento" className="sr-only">Áreas del conocimiento</h2>
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {MENU.map(({ label, icon: Icon, color, aria }) => (
            <motion.button
              key={label}
              type="button"
              aria-label={aria}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="group focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-indigo-300 rounded-2xl"
            >
              <div className={`rounded-2xl p-5 h-full flex flex-col items-center justify-center text-center shadow-md bg-white/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition` }>
                <div className={`w-14 h-14 ${color} text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition` }>
                  <Icon aria-hidden="true" className="w-8 h-8" />
                </div>
                <span className="mt-3 font-semibold text-slate-800 dark:text-slate-100 text-sm md:text-base">
                  {label}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Sección multimedia (carrusel simple) */}
      <section aria-labelledby="carrusel" className="px-4 mt-12">
        <div className="max-w-5xl mx-auto">
          <h2 id="carrusel" className="sr-only">Actividades destacadas</h2>
          <div className="relative h-48 md:h-60 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-gradient-to-r">
            <AnimatePresence mode="wait">
              <motion.figure
                key={current.id}
                className={`absolute inset-0 bg-gradient-to-r ${current.color} flex items-center justify-center`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.5 }}
                aria-label={`${current.title}: ${current.caption}`}
              >
                <div className="text-center text-white drop-shadow-sm px-6">
                  <div className="text-5xl md:text-6xl" aria-hidden="true">{current.emoji}</div>
                  <figcaption className="mt-2 text-lg md:text-xl font-semibold">
                    {current.title}
                  </figcaption>
                  <p className="text-sm md:text-base">{current.caption}</p>
                </div>
              </motion.figure>
            </AnimatePresence>
          </div>
          <p className="mt-4 text-center text-lg md:text-xl text-slate-700 dark:text-slate-300">
            Explora, juega y aprende con nosotros.
          </p>
        </div>
      </section>

      {/* Pie de página */}
      <footer className="mt-14 px-4">
        <div className="max-w-6xl mx-auto text-center text-slate-600 dark:text-slate-400">
          <p className="text-sm md:text-base">© 2025 Colegio Mentes Creativas | Proyecto educativo interactivo</p>
          <p className="text-sm mt-1">
            <a
              href="mailto:contacto@mentescreativas.edu"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Contáctanos
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
