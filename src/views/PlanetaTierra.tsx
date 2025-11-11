/* eslint-disable react/no-unknown-property */
import React, { useCallback, useId, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';

// -------------------------------------------------------------
// Tipos e interfaces
// -------------------------------------------------------------
export interface PaisData {
  id: string;
  nombre: string;
  capital: string;
  idioma: string;
  poblacion: string; // string legible para niños
  moneda: string;
  curiosidad: string;
  banderaUrl: string;
  imagenUrl: string; // imagen del país o paisaje
  videoId?: string;
  coords: [number, number]; // [lat, lon]
  pickRadiusDeg: number; // radio aproximado en grados para selección sobre el globo
}

// -------------------------------------------------------------
// Datos: 10 países con información educativa y coordenadas aproximadas
// Fuente banderas/imágenes: Wikipedia (dominio público y/o uso educativo)
// -------------------------------------------------------------
export const PAISES: PaisData[] = [
  {
    id: 'col',
    nombre: 'Colombia',
    capital: 'Bogotá',
    idioma: 'Español',
    poblacion: '52 millones',
    moneda: 'Peso colombiano',
    curiosidad: 'Colombia es el segundo país más biodiverso del mundo.',
    banderaUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Colombia.svg',
    imagenUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Cocora_Valley_near_Salento%2C_Colombia.jpg',
    videoId: 'QtXxIzo63ms',
  coords: [4.711, -74.072],
  pickRadiusDeg: 6,
  },
  {
    id: 'mex',
    nombre: 'México',
    capital: 'Ciudad de México',
    idioma: 'Español',
    poblacion: '129 millones',
    moneda: 'Peso mexicano',
    curiosidad: 'La civilización maya destacó en astronomía y matemáticas.',
    banderaUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Flag_of_Mexico.svg',
    imagenUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/61/Chichen_Itza_3.jpg',
    videoId: 'aLHnduUqDdY',
  coords: [19.4326, -99.1332],
  pickRadiusDeg: 7,
  },
  {
    id: 'usa',
    nombre: 'Estados Unidos',
    capital: 'Washington D. C.',
    idioma: 'Inglés (de facto)',
    poblacion: '333 millones',
    moneda: 'Dólar estadounidense',
    curiosidad: 'Tiene parques nacionales muy famosos como el Gran Cañón.',
    banderaUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg',
    imagenUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Grand_Canyon_view_from_Pima_Point_2010.jpg',
    videoId: '8K523eNAmnw',
  coords: [38.9072, -77.0369],
  pickRadiusDeg: 10,
  },
  {
    id: 'bra',
    nombre: 'Brasil',
    capital: 'Brasilia',
    idioma: 'Portugués',
    poblacion: '214 millones',
    moneda: 'Real brasileño',
    curiosidad: 'La Amazonia es el bosque tropical más grande del planeta.',
    banderaUrl: 'https://upload.wikimedia.org/wikipedia/en/0/05/Flag_of_Brazil.svg',
    imagenUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Amazon_Rainforest.jpg',
    videoId: 'LwGqQlvRNGI',
  coords: [-15.7939, -47.8828],
  pickRadiusDeg: 9,
  },
  {
    id: 'fra',
    nombre: 'Francia',
    capital: 'París',
    idioma: 'Francés',
    poblacion: '68 millones',
    moneda: 'Euro',
    curiosidad: 'La Torre Eiffel es uno de los monumentos más visitados del mundo.',
    banderaUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c3/Flag_of_France.svg',
    imagenUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Tour_Eiffel_Wikimedia_Commons.jpg',
    videoId: '-P5wsMJ_S7E',
  coords: [48.8566, 2.3522],
  pickRadiusDeg: 4,
  },
  {
    id: 'jpn',
    nombre: 'Japón',
    capital: 'Tokio',
    idioma: 'Japonés',
    poblacion: '125 millones',
    moneda: 'Yen',
    curiosidad: 'Japón está formado por más de 6.800 islas.',
    banderaUrl: 'https://upload.wikimedia.org/wikipedia/en/9/9e/Flag_of_Japan.svg',
    imagenUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Mount_Fuji_from_Yamanashi.jpg',
    videoId: 'i8IllhhaLP8',
  coords: [35.6762, 139.6503],
  pickRadiusDeg: 6,
  },
  {
    id: 'egy',
    nombre: 'Egipto',
    capital: 'El Cairo',
    idioma: 'Árabe',
    poblacion: '109 millones',
    moneda: 'Libra egipcia',
    curiosidad: 'Hogar de las pirámides de Giza, maravilla del mundo antiguo.',
    banderaUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Flag_of_Egypt.svg',
    imagenUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Kheops-Pyramid.jpg',
    videoId: 'wnrZQWgvGMw',
  coords: [30.0444, 31.2357],
  pickRadiusDeg: 6,
  },
  {
    id: 'aus',
    nombre: 'Australia',
    capital: 'Canberra',
    idioma: 'Inglés',
    poblacion: '26 millones',
    moneda: 'Dólar australiano',
    curiosidad: 'Es el país más grande de Oceanía y famoso por la Gran Barrera de Coral.',
    banderaUrl: 'https://upload.wikimedia.org/wikipedia/en/b/b9/Flag_of_Australia.svg',
    imagenUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/17/Great_Barrier_Reef.jpg',
    videoId: 'VQXrotBsDog',
  coords: [-35.2809, 149.1300],
  pickRadiusDeg: 8,
  },
  {
    id: 'esp',
    nombre: 'España',
    capital: 'Madrid',
    idioma: 'Español',
    poblacion: '48 millones',
    moneda: 'Euro',
    curiosidad: 'Tiene cuatro lenguas cooficiales y gran patrimonio histórico.',
    banderaUrl: 'https://upload.wikimedia.org/wikipedia/en/9/9a/Flag_of_Spain.svg',
    imagenUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Plaza_Mayor_de_Madrid_06.jpg',
    videoId: 'i8vAD-Sm9rA',
  coords: [40.4168, -3.7038],
  pickRadiusDeg: 6,
  },
  {
    id: 'can',
    nombre: 'Canadá',
    capital: 'Ottawa',
    idioma: 'Inglés y francés',
    poblacion: '40 millones',
    moneda: 'Dólar canadiense',
    curiosidad: 'Posee algunos de los lagos más grandes del mundo.',
    banderaUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Flag_of_Canada.svg',
    imagenUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Moraine_Lake_17092005.jpg',
    videoId: 'yIen3mz6_4o',
  coords: [45.4215, -75.6972],
  pickRadiusDeg: 10,
  },
];

// -------------------------------------------------------------
// Utilidades
// -------------------------------------------------------------
const useSpeech = () => {
  return useCallback((text: string) => {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'es-ES';
      u.rate = 1;
      window.speechSynthesis.speak(u);
    } catch (e) {
      console.warn('Speech synthesis unavailable', e);
    }
  }, []);
};

// Conversión lat/lon (grados) a coordenadas XYZ en esfera de radio r
// Conversión lat/lon -> XYZ siguiendo la convención de three.js (seam a 180°): sumamos 180° a la longitud
// lat: grados (-90 Sur a 90 Norte), lon: grados (-180 Oeste a 180 Este)
const latLonToVector3 = (lat: number, lon: number, r: number) => {
  // phi = ángulo desde el polo norte
  const phi = (90 - lat) * (Math.PI / 180);
  // theta = longitud con desplazamiento +180° para alinear con el mapeo UV de sphereGeometry
  const theta = (lon + 180) * (Math.PI / 180);
  // fórmula esférica (manteniendo eje Y como vertical)
  const x = -r * Math.sin(phi) * Math.cos(theta);
  const z = r * Math.sin(phi) * Math.sin(theta);
  const y = r * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
};

// Proyección inversa de un punto 3D en la esfera a lat/lon (en grados)
const vector3ToLatLon = (v: THREE.Vector3) => {
  const r = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z) || 1;
  const phi = Math.acos(v.y / r); // 0..pi
  // Invertimos la fórmula anterior: theta incluye el desplazamiento +180 usado al proyectar
  const theta = Math.atan2(v.z, -v.x); // -pi..pi
  const lat = 90 - (phi * 180) / Math.PI;
  let lon = (theta * 180) / Math.PI - 180; // compensar el +180 agregado en la proyección
  // Normalizamos a [-180, 180]
  if (lon > 180) lon -= 360;
  if (lon < -180) lon += 360;
  return { lat, lon };
};

// Distancia aproximada en grados entre dos pares lat/lon
const haversineDeg = (a: { lat: number; lon: number }, b: { lat: number; lon: number }) => {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const la1 = toRad(a.lat);
  const la2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h = sinDLat * sinDLat + Math.cos(la1) * Math.cos(la2) * sinDLon * sinDLon;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  const deg = (c * 180) / Math.PI;
  return deg; // "grados geodésicos" aproximados
};

// Fondo de estrellas animado
const EstrellasFondo: React.FC<{ stars: { key: number; top: number; left: number; size: number; opacity: number }[]; animate: boolean }>
  = ({ stars, animate }) => (
  <div className="pointer-events-none absolute inset-0">
    <motion.div
      className="absolute inset-0"
      aria-hidden
      animate={animate ? { x: [0, -6, 0], y: [0, 4, 0] } : undefined}
      transition={animate ? { duration: 30, repeat: Infinity, ease: 'easeInOut' } : undefined}
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
            boxShadow: '0 0 6px rgba(255,255,255,0.3)'
          }}
        />
      ))}
    </motion.div>
  </div>
);

// -------------------------------------------------------------
// Subcomponente: Punto clickeable sobre el globo
// -------------------------------------------------------------
const PaisPunto3D: React.FC<{
  pais: PaisData;
  radio: number;
  onClick: (p: PaisData) => void;
  showLabel?: boolean;
}> = ({ pais, radio, onClick, showLabel }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hover, setHover] = useState(false);
  const pos = useMemo(() => latLonToVector3(pais.coords[0], pais.coords[1], radio + 0.02), [pais, radio]);
  return (
    <group position={pos.toArray()}>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(pais); }}
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
        onPointerOut={() => setHover(false)}
      >
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color={hover ? '#22d3ee' : '#f59e0b'} emissive={hover ? new THREE.Color('#22d3ee') : new THREE.Color('#000000')} emissiveIntensity={hover ? 0.5 : 0} />
      </mesh>
      {(hover || showLabel) && (
        <Html distanceFactor={10} position={[0, 0.36, 0]}>
          <div className="px-2 py-1 rounded bg-black/80 text-white text-xs border border-white/20 whitespace-nowrap">
            {pais.nombre}
          </div>
        </Html>
      )}
    </group>
  );
};

// -------------------------------------------------------------
// Modal educativo del país (accesible)
// -------------------------------------------------------------
const ModalPais: React.FC<{ pais: PaisData | null; onClose: () => void; onSpeak?: (t: string) => void; isAccessible?: boolean }>
  = ({ pais, onClose, onSpeak, isAccessible }) => {
  const labelId = useId();
  const descId = useId();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  // Foco automático al abrir
  React.useEffect(() => {
    if (pais && closeBtnRef.current) {
      closeBtnRef.current.focus();
    }
  }, [pais]);
  return (
    <AnimatePresence>
      {pais && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelId}
          aria-describedby={descId}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div className="absolute inset-0 bg-black/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 160, damping: 18 }}
            className="relative w-full max-w-lg rounded-2xl bg-slate-900 text-white shadow-xl border border-slate-700 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <img src={pais.banderaUrl} alt={`Bandera de ${pais.nombre}`} className="w-8 h-5 object-cover rounded shadow" />
              <h2 id={labelId} className="text-2xl font-extrabold">{pais.nombre}</h2>
            </div>
            <p id={descId} className="text-sm text-slate-300 mb-3">{pais.curiosidad}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div><strong>Capital:</strong> {pais.capital}</div>
              <div><strong>Idioma:</strong> {pais.idioma}</div>
              <div><strong>Población:</strong> {pais.poblacion}</div>
              <div><strong>Moneda:</strong> {pais.moneda}</div>
            </div>
            {pais.videoId && (
              <div className="mb-4 rounded-lg overflow-hidden border border-slate-700">
                <div className="aspect-video">
                  <iframe
                    title={`Video educativo de ${pais.nombre}`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    src={`https://www.youtube.com/embed/${pais.videoId}?cc_load_policy=1&hl=es&modestbranding=1&rel=0`}
                  />
                </div>
              </div>
            )}
            <div className="mt-6 flex justify-end gap-3">
              {isAccessible && (
                <button
                  type="button"
                  onClick={() => onSpeak?.(`${pais.nombre}. Capital: ${pais.capital}. Idioma: ${pais.idioma}. Población: ${pais.poblacion}. Moneda: ${pais.moneda}. Curiosidad: ${pais.curiosidad}.`)}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-300"
                >Leer</button>
              )}
              <button
                ref={closeBtnRef}
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-400"
              >Cerrar</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// -------------------------------------------------------------
// Mini Quiz de Geografía (10 preguntas)
// -------------------------------------------------------------
interface QuizQ {
  id: string;
  pregunta: string;
  opciones: { id: string; texto: string }[];
  correcta: string;
}

const QuizGeografia: React.FC = () => {
  const preguntas: QuizQ[] = [
    { id: 'q1', pregunta: '¿Cuál es el país más grande del mundo?', correcta: 'rus', opciones: [
      { id: 'chn', texto: 'China' }, { id: 'rus', texto: 'Rusia' }, { id: 'can', texto: 'Canadá' }, { id: 'usa', texto: 'Estados Unidos' } ] },
    { id: 'q2', pregunta: '¿Dónde se encuentra la Torre Eiffel?', correcta: 'fra', opciones: [
      { id: 'esp', texto: 'España' }, { id: 'ita', texto: 'Italia' }, { id: 'fra', texto: 'Francia' }, { id: 'deu', texto: 'Alemania' } ] },
    { id: 'q3', pregunta: '¿Qué idioma se habla principalmente en Brasil?', correcta: 'por', opciones: [
      { id: 'por', texto: 'Portugués' }, { id: 'esp', texto: 'Español' }, { id: 'eng', texto: 'Inglés' }, { id: 'fra', texto: 'Francés' } ] },
    { id: 'q4', pregunta: '¿Qué país tiene forma de bota?', correcta: 'ita', opciones: [
      { id: 'ita', texto: 'Italia' }, { id: 'esp', texto: 'España' }, { id: 'gre', texto: 'Grecia' }, { id: 'tur', texto: 'Turquía' } ] },
    { id: 'q5', pregunta: '¿Cuál es la capital de Japón?', correcta: 'tok', opciones: [
      { id: 'osa', texto: 'Osaka' }, { id: 'tok', texto: 'Tokio' }, { id: 'nag', texto: 'Nagoya' }, { id: 'sap', texto: 'Sapporo' } ] },
    { id: 'q6', pregunta: '¿Qué océano es el más grande?', correcta: 'pac', opciones: [
      { id: 'atl', texto: 'Atlántico' }, { id: 'ind', texto: 'Índico' }, { id: 'pac', texto: 'Pacífico' }, { id: 'art', texto: 'Ártico' } ] },
    { id: 'q7', pregunta: '¿En qué continente está Egipto?', correcta: 'afr', opciones: [
      { id: 'eur', texto: 'Europa' }, { id: 'asi', texto: 'Asia' }, { id: 'afr', texto: 'África' }, { id: 'oce', texto: 'Oceanía' } ] },
    { id: 'q8', pregunta: '¿Cuál es el desierto cálido más grande?', correcta: 'sah', opciones: [
      { id: 'sah', texto: 'Sahara' }, { id: 'ara', texto: 'Arabia' }, { id: 'kal', texto: 'Kalahari' }, { id: 'nam', texto: 'Namib' } ] },
    { id: 'q9', pregunta: '¿Qué país es famoso por la Gran Muralla?', correcta: 'chn', opciones: [
      { id: 'kor', texto: 'Corea' }, { id: 'vnm', texto: 'Vietnam' }, { id: 'chn', texto: 'China' }, { id: 'jpn', texto: 'Japón' } ] },
    { id: 'q10', pregunta: '¿Cuál es la montaña más alta del mundo?', correcta: 'eva', opciones: [
      { id: 'eva', texto: 'Everest' }, { id: 'kil', texto: 'Kilimanjaro' }, { id: 'den', texto: 'Denali' }, { id: 'mnt', texto: 'Mont Blanc' } ] },
  ];

  const [i, setI] = useState(0);
  const [res, setRes] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const cur = preguntas[i];
  const sel = res[cur.id];
  const pick = (opt: string) => { if (!done) setRes((r) => ({ ...r, [cur.id]: opt })); };
  const next = () => { if (i < preguntas.length - 1) setI((v) => v + 1); };
  const prev = () => { if (i > 0) setI((v) => v - 1); };
  const finish = () => setDone(true);
  const reset = () => { setI(0); setRes({}); setDone(false); };
  const score = done ? preguntas.filter((q) => res[q.id] === q.correcta).length : 0;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm mb-1 font-medium text-indigo-200">Pregunta {i + 1} de {preguntas.length}</p>
        <h4 className="font-semibold mb-3">{cur.pregunta}</h4>
        <div className="flex flex-wrap gap-2">
          {cur.opciones.map((o) => {
            const selHere = sel === o.id;
            const isCorrect = done && o.id === cur.correcta;
            const isWrongSel = done && selHere && o.id !== cur.correcta;
            return (
              <button
                key={o.id}
                type="button"
                disabled={done && sel != null}
                onClick={() => pick(o.id)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-colors ${
                  selHere && !done ? 'bg-indigo-600 text-white' : ''
                } ${!selHere && !done ? 'bg-slate-700 hover:bg-slate-600 text-white' : ''} ${isCorrect ? 'bg-emerald-600 text-white' : ''} ${isWrongSel ? 'bg-rose-600 text-white' : ''}`.replace(/\s+/g, ' ')}
              >{o.texto}</button>
            );
          })}
        </div>
        {sel && !done && (
          <p className="mt-3 text-sm">{sel === cur.correcta ? '¡Correcto! ✅' : 'No es correcto, intenta otra opción.'}</p>
        )}
        {done && (
          <p className="mt-3 text-sm text-indigo-200">Aciertos: {score} / {preguntas.length} ({Math.round((score / preguntas.length) * 100)}%)</p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={prev} disabled={i === 0 || done} className="px-3 py-1.5 rounded-md text-xs font-semibold bg-slate-700 disabled:opacity-40 hover:bg-slate-600 text-white">Anterior</button>
        <button type="button" onClick={next} disabled={i === preguntas.length - 1 || done} className="px-3 py-1.5 rounded-md text-xs font-semibold bg-slate-700 disabled:opacity-40 hover:bg-slate-600 text-white">Siguiente</button>
        {!done && (
          <button type="button" onClick={finish} disabled={Object.keys(res).length < preguntas.length} className="px-3 py-1.5 rounded-md text-xs font-semibold bg-emerald-600 disabled:opacity-40 hover:bg-emerald-500 text-white">Terminar</button>
        )}
        {done && (
          <button type="button" onClick={reset} className="px-3 py-1.5 rounded-md text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white">Reiniciar</button>
        )}
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// Escena 3D: Globo terráqueo
// -------------------------------------------------------------
const Tierra3D: React.FC<{ onPick: (p: PaisData) => void; speed: number; paused: boolean; showLabels: boolean }>
  = ({ onPick, speed, paused, showLabels }) => {
  const earthRef = useRef<THREE.Mesh>(null!);
  const earthGroupRef = useRef<THREE.Group>(null!);
  const radius = 6;
  // Texturas de la Tierra con carga segura (sin Suspense)
  const [earthTex, setEarthTex] = useState<THREE.Texture | null>(null);
  const [normalMap, setNormalMap] = useState<THREE.Texture | null>(null);
  const [specularMap, setSpecularMap] = useState<THREE.Texture | null>(null);
  const [texError, setTexError] = useState(false);
  const [cloudsMap, setCloudsMap] = useState<THREE.Texture | null>(null);

  React.useEffect(() => {
    let mounted = true;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin?.('anonymous');

    // Utilidad: intenta cargar una textura local y, si falla, usa una remota
    const tryLoadWithFallback = (
      localUrl: string,
      remoteUrl: string,
      onOk: (t: THREE.Texture) => void,
      onFail?: () => void
    ) => {
      loader.load(
        localUrl,
        (t) => onOk(t),
        undefined,
        () => {
          loader.load(
            remoteUrl,
            (t) => onOk(t),
            undefined,
            () => { onFail?.(); }
          );
        }
      );
    };

    // Difusa (local si existe, si no threejs examples)
    tryLoadWithFallback(
      '/textures/earth/earth_atmos_2048.jpg',
      'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
      (tex) => { if (mounted) setEarthTex(tex); },
      () => { if (mounted) setTexError(true); }
    );
    // Normal (opcional)
    tryLoadWithFallback(
      '/textures/earth/earth_normal_2048.jpg',
      'https://threejs.org/examples/textures/planets/earth_normal_2048.jpg',
      (tex) => { if (mounted) setNormalMap(tex); }
    );
    // Specular (opcional)
    tryLoadWithFallback(
      '/textures/earth/earth_specular_2048.jpg',
      'https://threejs.org/examples/textures/planets/earth_specular_2048.jpg',
      (tex) => { if (mounted) setSpecularMap(tex); }
    );
    // Nubes (capa extra semitransparente)
    tryLoadWithFallback(
      '/textures/earth/earth_clouds_1024.png',
      'https://threejs.org/examples/textures/planets/earth_clouds_1024.png',
      (tex) => { if (mounted) { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; setCloudsMap(tex); } }
    );

    return () => { mounted = false; };
  }, []);

  const cloudsRef = useRef<THREE.Mesh>(null!);
  useFrame(() => {
    if (!paused && earthGroupRef.current) {
      earthGroupRef.current.rotation.y += 0.0025 * Math.max(0.1, speed);
      if (cloudsRef.current) {
        cloudsRef.current.rotation.y += 0.0035 * Math.max(0.1, speed);
      }
    }
  });

  // Raycaster para selección directa sobre la superficie
  const gl = THREE;
  const rayRef = useRef(new gl.Raycaster());
  const pointerRef = useRef(new gl.Vector2());
  const handlePointerDown = (e: { clientX: number; clientY: number; target: EventTarget & HTMLElement; camera: THREE.Camera }) => {
    if (!earthRef.current) return;
    // Coordenadas normalizadas del cursor
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    pointerRef.current.set(x, y);
    rayRef.current.setFromCamera(pointerRef.current, e.camera);
    const intersects = rayRef.current.intersectObject(earthRef.current, false);
    if (intersects.length > 0) {
      // Pasar al espacio local del globo antes de convertir a lat/lon
      const worldPoint = intersects[0].point.clone();
      const local = earthRef.current.worldToLocal(worldPoint);
      const p3 = local.clone().normalize().multiplyScalar(radius);
      const { lat, lon } = vector3ToLatLon(p3);
      // Buscar país más cercano dentro de su radio
      let best: { pais: PaisData; d: number } | null = null;
      for (const pais of PAISES) {
        const d = haversineDeg({ lat, lon }, { lat: pais.coords[0], lon: pais.coords[1] });
        if (d <= pais.pickRadiusDeg) {
          if (!best || d < best.d) best = { pais, d };
        }
      }
      if (best) onPick(best.pais);
    }
  };

  return (
    <group ref={earthGroupRef} rotation={[0, Math.PI, 0]} onPointerDown={handlePointerDown}>
      {/* Luces */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} color={0xfff2cc} />
      <directionalLight position={[-10, -6, -4]} intensity={0.3} color={0x88aaff} />

      {/* Estrellas de fondo */}
      <Stars radius={200} depth={50} count={2500} factor={3} fade />

      {/* Globo */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[radius, 64, 64]} />
        {earthTex ? (
          <meshPhongMaterial map={earthTex} normalMap={normalMap ?? undefined} specularMap={specularMap ?? undefined} specular={new THREE.Color('#222')} shininess={20} />
        ) : (
          // Material de reserva si la textura no carga (evita errores y muestra algo)
          <meshStandardMaterial color={texError ? '#2563eb' : '#0f172a'} roughness={0.8} metalness={0} />
        )}
      </mesh>

      {/* Capa de nubes semitransparente */}
      {cloudsMap && (
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[radius + 0.06, 64, 64]} />
          <meshPhongMaterial map={cloudsMap} transparent opacity={0.36} depthWrite={false} />
        </mesh>
      )}

      {/* Puntos de países (hijos del grupo de la Tierra para rotar juntos) */}
      {PAISES.map((pais) => (
        <PaisPunto3D key={pais.id} pais={pais} radio={radius} onClick={onPick} showLabel={showLabels} />
      ))}

      <OrbitControls enablePan={false} enableZoom enableRotate autoRotate={!paused} autoRotateSpeed={0.6 * Math.max(0.1, speed)} />
    </group>
  );
};

// Pequeño ErrorBoundary para evitar que un error de WebGL/recursos deje la página en blanco
class ErrorBoundary extends React.Component<{ fallback?: React.ReactNode; children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { fallback?: React.ReactNode; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch() { /* opcional: report */ }
  render() {
    if (this.state.hasError) return this.props.fallback ?? <div className="p-4 text-sm text-rose-300">No se pudo cargar la vista 3D. Cambia a vista 2D.</div>;
    return this.props.children;
  }
}

// Fallback con acciones para errores 3D
const Fallback3DError: React.FC<{ onSwitch2D?: () => void; onRetry?: () => void }>
  = ({ onSwitch2D, onRetry }) => (
  <div className="absolute inset-0 grid place-items-center">
    <div className="px-4 py-3 rounded-lg bg-black/70 text-slate-100 text-sm border border-white/20 space-y-2 text-center">
      <div className="font-semibold">No se pudo cargar la vista 3D.</div>
      <div className="opacity-80">Puedes cambiar a vista 2D o intentar de nuevo.</div>
      <div className="flex items-center justify-center gap-2 pt-1">
        {onSwitch2D && (
          <button type="button" onClick={onSwitch2D} className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500">
            Cambiar a 2D
          </button>
        )}
        {onRetry && (
          <button type="button" onClick={onRetry} className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500">
            Reintentar 3D
          </button>
        )}
      </div>
    </div>
  </div>
);

// -------------------------------------------------------------
// Vista 2D: Mapa plano con puntos
// -------------------------------------------------------------
const Mapa2D: React.FC<{ onPick: (p: PaisData) => void; showLabels: boolean }>
  = ({ onPick, showLabels }) => {
  const mapUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/2000px-World_map_-_low_resolution.svg.png';
  // Proyección equirectangular (Plate Carrée) para esta imagen de mapa
  // Nota: Mantiene 3D intacto; solo afecta el posicionamiento 2D
  const posFromLatLon = (lat: number, lon: number) => {
    const left = ((lon + 180) / 360) * 100; // [0..100]
    const top = ((90 - lat) / 180) * 100;
    return { left: `${left}%`, top: `${top}%` };
  };
  return (
    <div className="relative w-full max-w-[900px] mx-auto rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
      <img src={mapUrl} alt="Mapa del mundo" className="w-full h-auto" />
      {PAISES.map((pais) => {
        const pos = (() => {
          const base = posFromLatLon(pais.coords[0], pais.coords[1]);
          // Ajustes finos por país (solo 2D) si el mapa base desplaza regiones
          const tweaks: Record<string, { dx?: number; dy?: number }> = {
            // ligeros ajustes empíricos (en porcentaje del ancho/alto contenedor)
            'can': { dy: -0.8 },
            'usa': { dy: -0.2 },
            'mex': { dy: 0.3 },
            'col': { dy: 0.6 },
            'bra': { dy: 0.4 },
            'esp': { dy: 0.2 },
            'fra': { dy: 0.1 },
            'egy': { dy: 0.2 },
            'jpn': { dy: -0.1 },
            'aus': { dy: 0.4 },
          };
          // Offset global para alinear abajo/izquierda en 2D
          const globalDX = -2.5; // mover a la izquierda (~1.2%)
          const globalDY = 6.0;  // mover hacia abajo (~0.9%)
          const t = tweaks[pais.id];
          const leftNum = parseFloat(base.left) + globalDX;
          const topNum = parseFloat(base.top) + globalDY;
          if (t) {
            return {
              left: `${leftNum + (t.dx ?? 0)}%`,
              top: `${topNum + (t.dy ?? 0)}%`,
            };
          }
          return { left: `${leftNum}%`, top: `${topNum}%` };
        })();
        return (
          <button
            key={`2d-${pais.id}`}
            type="button"
            onClick={() => onPick(pais)}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-amber-400 ring-2 ring-white/50 hover:bg-cyan-300"
            style={pos}
            aria-label={`Ver ${pais.nombre}`}
            title={pais.nombre}
          >
            {showLabels && (
              <span className="absolute left-1/2 -translate-x-1/2 -translate-y-full text-[10px] text-white bg-black/70 rounded px-1 py-0.5 whitespace-nowrap">{pais.nombre}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

// -------------------------------------------------------------
// Componente principal: PlanetaTierra
// -------------------------------------------------------------
const PlanetaTierra: React.FC = () => {
  const [paisSel, setPaisSel] = useState<PaisData | null>(null);
  const [isAccessible, setIsAccessible] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showLabels, setShowLabels] = useState(false);
  const [view, setView] = useState<'3d' | '2d'>('3d');
  const [canvasKey, setCanvasKey] = useState(0);
  const speak = useSpeech();
  const reduceMotion = useReducedMotion();
  const animate = useMemo(() => !isAccessible && !reduceMotion, [isAccessible, reduceMotion]);

  const curiosidades = [
    'El desierto del Sahara es tan grande como Estados Unidos.',
    'Colombia es el segundo país más biodiverso del mundo.',
    'Australia es el país más grande de Oceanía.',
    'Japón está formado por más de 6.800 islas.',
    'Egipto es hogar de una de las Siete Maravillas del Mundo Antiguo.',
  ];
  const [idxCurio, setIdxCurio] = useState(0);

  const stars = useMemo(() => Array.from({ length: 90 }, (_, i) => ({
    key: i,
    top: (i * 37) % 100,
    left: (i * 53) % 100,
    size: (i % 3) + 1,
    opacity: 0.4 + ((i * 7) % 6) / 10,
  })), []);

  // Si no hay soporte WebGL, forzar vista 2D para evitar pantalla en blanco
  const webglOk = useMemo(() => {
    try {
      const c = document.createElement('canvas');
      return !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch {
      return false;
    }
  }, []);
  React.useEffect(() => {
    if (!webglOk && view === '3d') setView('2d');
  }, [webglOk, view]);

  return (
    <div className="relative min-h-[calc(100dvh-6rem)] py-8 px-4 grid place-items-center overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0b1020] via-[#101836] to-[#060912]">
      <EstrellasFondo stars={stars} animate={animate} />

      <div className="w-full max-w-[1000px] mx-auto text-slate-100">
        {/* Encabezado */}
        <header className="text-center mb-6">
          <motion.h1 className="text-3xl md:text-5xl font-extrabold text-emerald-300 drop-shadow" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            Planeta Tierra Interactivo
          </motion.h1>
          <p className="mt-2 text-lg md:text-xl">Explora países en un globo 3D o en un mapa 2D</p>
        </header>

        {/* Controles superiores */}
        <section className="mb-4 rounded-xl bg-slate-800/60 border border-slate-700 p-4">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAccessible((v) => !v)}
                className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                aria-pressed={isAccessible}
              >{isAccessible ? 'Modo accesible: ON' : 'Activar modo accesible'}</button>

              <button
                type="button"
                onClick={() => setShowLabels((v) => !v)}
                className="px-3 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-600 text-white text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                aria-pressed={showLabels}
              >{showLabels ? 'Etiquetas visibles' : 'Mostrar etiquetas'}</button>

              <button
                type="button"
                // Selecciona un índice aleatorio diferente al actual para variedad
                onClick={() => setIdxCurio(() => {
                  let next = idxCurio;
                  if (curiosidades.length > 1) {
                    while (next === idxCurio) {
                      next = Math.floor(Math.random() * curiosidades.length);
                    }
                  }
                  return next;
                })}
                className="px-3 py-2 rounded-lg bg-amber-700 hover:bg-amber-600 text-white text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >Dato curioso</button>

              <label htmlFor="velocidad-rot" className="flex items-center gap-2 text-xs select-none">
                Velocidad
                <input id="velocidad-rot" type="range" min={0.25} max={2} step={0.25} value={speed} disabled={isAccessible} onChange={(e) => setSpeed(parseFloat(e.target.value))} className="accent-emerald-400 w-24 disabled:opacity-40" />
                <span className="w-10 text-right tabular-nums">{speed.toFixed(2)}x</span>
              </label>

              <div role="group" aria-label="Cambiar vista" className="flex items-center gap-1">
                {['3d','2d'].map((v) => (
                  <button key={v} type="button" onClick={() => setView(v as '3d'|'2d')} className={`px-2 py-1 rounded-md text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${view===v? 'bg-fuchsia-600 text-white':'bg-slate-700 hover:bg-slate-600 text-slate-100'}`}>{v === '3d' ? 'Vista 3D' : 'Vista 2D'}</button>
                ))}
              </div>
            </div>
            <span className="text-slate-200 text-sm max-w-[420px] line-clamp-2" role="status" aria-live="polite">{curiosidades[idxCurio]}</span>
          </div>
        </section>

        {/* Vista principal */}
        <section className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950/60 backdrop-blur-sm p-2">
          {view === '3d' ? (
            <div className="relative h-[520px] w-full rounded-lg overflow-hidden">
              <ErrorBoundary fallback={<Fallback3DError onSwitch2D={() => setView('2d')} onRetry={() => setCanvasKey((k) => k + 1)} />}>
                <Canvas key={canvasKey} camera={{ position: [0, 8, 16], fov: 50 }} shadows>
                  <React.Suspense fallback={<Html><div className="px-3 py-1.5 rounded-md bg-black/70 text-white text-xs">Cargando Tierra 3D…</div></Html>}>
                    <Tierra3D onPick={(p) => setPaisSel(p)} speed={speed} paused={isAccessible} showLabels={showLabels} />
                  </React.Suspense>
                </Canvas>
              </ErrorBoundary>
            </div>
          ) : (
            <div className="w-full">
              <Mapa2D onPick={(p) => setPaisSel(p)} showLabels={showLabels} />
            </div>
          )}
        </section>

        {/* Mini Quiz */}
        <section className="w-full mt-6 mx-auto rounded-xl bg-slate-800/60 border border-slate-700 p-4">
          <h3 className="text-lg font-bold mb-2">Mini Quiz: Geografía Mundial</h3>
          <QuizGeografia />
        </section>

        {/* Pie simple */}
        <footer className="mt-8 text-center">
          <a href="/" className="text-indigo-300 hover:text-indigo-200 underline">Volver al menú principal</a>
          <div className="mt-2 text-xs text-slate-300">Datos educativos de uso general (Wikipedia/NASA) – Propósito educativo</div>
        </footer>
      </div>

      <ModalPais pais={paisSel} onClose={() => setPaisSel(null)} onSpeak={speak} isAccessible={isAccessible} />
    </div>
  );
};

export default PlanetaTierra;
