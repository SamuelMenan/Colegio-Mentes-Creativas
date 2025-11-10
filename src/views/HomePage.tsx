import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="py-10 px-6 max-w-5xl mx-auto">
      <motion.h1
        className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Colegio Mentes Creativas
      </motion.h1>

      {/* Sección: Contexto del Proyecto */}
      <section aria-labelledby="contexto-titulo" className="mb-12">
        <motion.h2
          id="contexto-titulo"
          className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-4"
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          1. Contexto del Proyecto
        </motion.h2>
        <p className="leading-relaxed text-slate-700 dark:text-slate-300 text-lg">
          El <strong>Colegio Mentes Creativas</strong> busca implementar una aplicación multimedia que apoye los
          procesos de enseñanza-aprendizaje de los estudiantes de <strong>4° y 5° grado</strong> en áreas clave del
          currículo: <em>matemáticas, ciencias naturales, ciencias sociales, tecnología, pensamiento lógico y arte</em>.
        </p>
        <p className="leading-relaxed text-slate-700 dark:text-slate-300 text-lg mt-4">
          Debido a un acceso <strong>limitado a internet</strong>, se requiere una solución capaz de funcionar en un
          <strong>servidor local</strong> accesible desde los equipos de la sala de informática, garantizando continuidad
          del servicio sin dependencia de conectividad externa.
        </p>
        <p className="leading-relaxed text-slate-700 dark:text-slate-300 text-lg mt-4">
          Esta información se obtuvo mediante entrevistas al rector y docentes durante una visita institucional, lo que
          permitió alinear el enfoque pedagógico y técnico a las necesidades reales del plantel.
        </p>
        <div className="mt-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700">
          <p className="text-emerald-700 dark:text-emerald-300 font-medium">
            Enfoque: accesibilidad, inclusión, soporte offline y expansión futura de contenidos.
          </p>
        </div>
      </section>

      {/* Sección: Objetivos del Proyecto */}
      <section aria-labelledby="objetivos-titulo" className="mb-12">
        <motion.h2
          id="objetivos-titulo"
          className="text-2xl md:text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-4"
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          2. Objetivos del Proyecto
        </motion.h2>
        <ul className="space-y-3 text-lg">
          <li className="flex gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-bold">1</span>
            <p className="flex-1 text-slate-700 dark:text-slate-300">
              Desarrollar un aplicativo <strong>interactivo, accesible e inclusivo</strong> adaptado a estudiantes de primaria.
            </p>
          </li>
          <li className="flex gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-bold">2</span>
            <p className="flex-1 text-slate-700 dark:text-slate-300">
              Brindar a los docentes herramientas para el <strong>seguimiento académico</strong>: progreso, evaluaciones y repetición de pruebas.
            </p>
          </li>
          <li className="flex gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-bold">3</span>
            <p className="flex-1 text-slate-700 dark:text-slate-300">
              Incorporar recursos multimedia (<em>audio, video, gráficos 3D</em>) que favorezcan el <strong>aprendizaje lúdico</strong> y significativo.
            </p>
          </li>
          <li className="flex gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-bold">4</span>
            <p className="flex-1 text-slate-700 dark:text-slate-300">
              Garantizar que la herramienta permita <strong>escalar contenidos</strong> y nuevas temáticas en el futuro.
            </p>
          </li>
        </ul>
        <div className="mt-6 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700">
          <p className="text-indigo-700 dark:text-indigo-300 font-medium">
            La plataforma se concibe como un ecosistema educativo vivo que evoluciona con las necesidades del colegio.
          </p>
        </div>
      </section>

      {/* CTA futura */}
      <section aria-labelledby="cta-proximos" className="mb-4">
        <h2 id="cta-proximos" className="sr-only">Próximos pasos</h2>
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <button className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2">
            Explorar módulos
          </button>
          <button className="px-6 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2">
            Documentación técnica
          </button>
        </div>
      </section>
    </div>
  );
}
