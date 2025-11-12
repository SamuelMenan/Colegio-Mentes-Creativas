/* eslint-disable react/no-unknown-property */ // Props como position, castShadow son válidas en R3F
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, ThreeEvent, useFrame } from "@react-three/fiber";
import { Grid as DreiGrid, OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";
// Importa el tipo del ref de OrbitControls para evitar `any`
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

// Import vacío para asegurar las definiciones de JSX de R3F (evita augmentations manuales)
import "@react-three/fiber";

/**
 * Modelo 3D interactivo (R3F) para construcción con bloques estilo Minecraft.
 * Prioriza Aprendibilidad y Accesibilidad:
 * - Atajos: 1–4 materiales, G grilla, Ctrl+Z/Y, Supr, Ctrl+S/L, WASD/QE ghost, Enter para colocar.
 * - Panel accesible con ARIA, role="application", aria-live, tooltips y foco visible.
 */

export type Material = "madera" | "piedra" | "roble" | "cristal" | "cesped";
export interface Block {
  x: number; // eje X (ancho)
  y: number; // eje Y (profundidad del suelo)
  z: number; // eje Z (altura)
  material: Material;
}

const DEFAULT_GRID = { width: 16, depth: 16, height: 8 };
const STORAGE_KEY = "blocks-builder-v1";
const TUTORIAL_SEEN = "blocks-builder-tutorial-seen";
export const BLOCKS_ROUTE_PATH = "/construccion-bloques"; // alias solicitado
export const BLOCKS_ROUTE_PATH_3D = "/construccion-bloques3D";

const materialMeta: { key: Material; label: string; color: string; tex: string }[] = [
  { key: "piedra",  label: "Piedra",  color: "#6b7280", tex: "/textures/piedra.png" },
  { key: "madera",  label: "Madera",  color: "#b45309", tex: "/textures/madera.png" },
  { key: "roble",   label: "Roble",   color: "#8b5a2b", tex: "/textures/roble.png" },
  { key: "cristal", label: "Cristal", color: "#93c5fd", tex: "/textures/cristal.png" },
  { key: "cesped",  label: "Césped",  color: "#10b981", tex: "/textures/cesped.png" },
];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function useBlockEngine(opts?: { grid?: { width: number; depth: number; height: number } }) {
  const grid = opts?.grid ?? DEFAULT_GRID;

  const [blocksMap, setBlocksMap] = useState<Record<string, Block>>({});
  const [ghost, setGhost] = useState<{ x: number; y: number; z: number }>({
    x: Math.floor(grid.width / 2),
    y: Math.floor(grid.depth / 2),
    z: 0,
  });
  const [material, setMaterial] = useState<Material>("madera");
  const [showGrid, setShowGrid] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  // Reemplazar any[] por un tipo explícito
  type HistoryEntry = { type: "place" | "remove"; block: Block };
  const [undoStack, setUndoStack] = useState<HistoryEntry[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryEntry[]>([]);

  const keyFor = (b: { x: number; y: number; z: number }) => `${b.x},${b.y},${b.z}`;
  const blocksArray = useMemo(() => Object.values(blocksMap), [blocksMap]);

  const announce = useCallback((text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage((m) => (m === text ? null : m)), 2000);
  }, []);

  const placeBlock = useCallback(
    (pos?: { x: number; y: number; z: number }, mat?: Material) => {
      const p = pos ?? ghost;
      const m = mat ?? material;
      const k = keyFor(p);
      if (blocksMap[k]) {
        announce("Ya existe un bloque en esa celda");
        return false;
      }
      const newBlock: Block = { ...p, material: m };
      setBlocksMap((prev) => ({ ...prev, [k]: newBlock }));
      setUndoStack((s) => [...s, { type: "place", block: newBlock }]);
      setRedoStack([]);
      announce(`Bloque colocado: ${m}`);
      return true;
    },
    [ghost, material, blocksMap, announce]
  );

  const removeBlock = useCallback(
    (pos?: { x: number; y: number; z: number }) => {
      const p = pos ?? ghost;
      const k = keyFor(p);
      const existing = blocksMap[k];
      if (!existing) {
        announce("No hay bloque en esa celda");
        return false;
      }
      setBlocksMap((prev) => {
        const copy = { ...prev };
        delete copy[k];
        return copy;
      });
      setUndoStack((s) => [...s, { type: "remove", block: existing }]);
      setRedoStack([]);
      announce(`Bloque eliminado (${existing.material})`);
      return true;
    },
    [ghost, blocksMap, announce]
  );

  const undo = useCallback(() => {
    const last = undoStack[undoStack.length - 1];
    if (!last) {
      announce("Nada que deshacer");
      return;
    }
    setUndoStack((s) => s.slice(0, -1));
    if (last.type === "place") {
      const k = keyFor(last.block);
      setBlocksMap((prev) => {
        const copy = { ...prev };
        delete copy[k];
        return copy;
      });
      setRedoStack((r) => [...r, last]);
      announce("Deshacer: se quitó un bloque");
    } else if (last.type === "remove") {
      const k = keyFor(last.block);
      setBlocksMap((prev) => ({ ...prev, [k]: last.block }));
      setRedoStack((r) => [...r, last]);
      announce("Deshacer: se restauró un bloque");
    }
  }, [undoStack, announce]);

  const redo = useCallback(() => {
    const last = redoStack[redoStack.length - 1];
    if (!last) {
      announce("Nada que rehacer");
      return;
    }
    setRedoStack((s) => s.slice(0, -1));
    if (last.type === "place") {
      const k = keyFor(last.block);
      setBlocksMap((prev) => ({ ...prev, [k]: last.block }));
      setUndoStack((u) => [...u, last]);
      announce("Rehacer: colocado");
    } else if (last.type === "remove") {
      const k = keyFor(last.block);
      setBlocksMap((prev) => {
        const copy = { ...prev };
        delete copy[k];
        return copy;
      });
      setUndoStack((u) => [...u, last]);
      announce("Rehacer: eliminado");
    }
  }, [redoStack, announce]);

  const save = useCallback(() => {
    try {
      const payload = { blocks: blocksArray, material };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      announce("Proyecto guardado");
    } catch {
      announce("Error al guardar");
    }
  }, [blocksArray, material, announce]);

  const load = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        announce("No hay proyecto guardado");
        return;
      }
      const parsed = JSON.parse(raw) as { blocks: Block[]; material?: Material };
      const map: Record<string, Block> = {};
      parsed.blocks?.forEach((b) => (map[keyFor(b)] = b));
      setBlocksMap(map);
      if (parsed.material) setMaterial(parsed.material);
      setUndoStack([]);
      setRedoStack([]);
      announce(`Proyecto cargado (${parsed.blocks?.length ?? 0} bloques)`);
    } catch {
      announce("Error al cargar");
    }
  }, [announce]);

  const reset = useCallback(() => {
    setBlocksMap({});
    setUndoStack([]);
    setRedoStack([]);
    announce("Lienzo reiniciado");
  }, [announce]);

  return {
    grid,
    blocksMap,
    blocksArray,
    ghost,
    setGhost,
    material,
    setMaterial,
    showGrid,
    setShowGrid,
    placeBlock,
    removeBlock,
    undo,
    redo,
    save,
    load,
    reset,
    message,
    announce,
  };
}

/* ------------- Escena 3D (R3F) ------------- */
function MaterialsLib() {
  const paths = materialMeta.map(m => m.tex);
  // useTexture acepta un array y retorna array en mismo orden
  const loaded = useTexture(paths, (textures) => {
    textures.forEach((t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(1, 1); // ajusta si quieres mosaico (ej: 2,2 para césped)
      t.anisotropy = 8;
    });
  });

  const mats = useRef<Record<Material, THREE.Material>>({} as Record<Material, THREE.Material>);
  if (Object.keys(mats.current).length === 0) {
    materialMeta.forEach((meta, i) => {
      const tex = loaded[i] ?? null;
      let material: THREE.Material;
      if (meta.key === "cristal") {
        material = new THREE.MeshPhysicalMaterial({
          color: meta.color,
            map: tex || undefined,
            transmission: 0.85,
            roughness: 0.15,
            thickness: 0.6,
            transparent: true,
        });
      } else {
        material = new THREE.MeshStandardMaterial({
          color: meta.color,
          map: tex || undefined,
          roughness: meta.key === "piedra" ? 0.9 : 0.6,
          metalness: meta.key === "piedra" ? 0.1 : 0.0,
        });
      }
      mats.current[meta.key] = material;
    });
    (window as unknown as { __BLOCK_MATS__?: Record<Material, THREE.Material> }).__BLOCK_MATS__ = mats.current;
  }
  return null;
}

function BlockMesh({ block, engine }: { block: Block; engine: ReturnType<typeof useBlockEngine> }) {
  const pos = [block.x + 0.5, block.z + 0.5, block.y + 0.5] as [number, number, number];
  const mat: THREE.Material =
    (window as unknown as { __BLOCK_MATS__?: Record<string, THREE.Material> }).__BLOCK_MATS__?.[block.material] ??
    new THREE.MeshStandardMaterial({ color: "gray" });
  // Usar la altura del ghost exacta; elimina el desplazamiento +1
  const { grid, setGhost, placeBlock, ghost } = engine;

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setGhost({
      x: block.x,
      y: block.y,
      z: clamp(ghost.z, 0, grid.height - 1),
    });
  };

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    placeBlock({ x: block.x, y: block.y, z: clamp(ghost.z, 0, grid.height - 1) });
  };

  return (
    <mesh
      position={pos}
      castShadow
      receiveShadow
      material={mat}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
    >
      <boxGeometry args={[1, 1, 1]} />
    </mesh>
  );
}

// Preciso: se calcula la celda por coordenadas locales del plano (sin saltos perspectiva)
function computeCell(point: THREE.Vector3, grid: { width: number; depth: number }) {
  const x = clamp(Math.floor(point.x), 0, grid.width - 1);
  const y = clamp(Math.floor(point.z), 0, grid.depth - 1);
  return { x, y };
}

/**
 * GhostCube: cubo semitransparente que muestra la posición actual del "ghost".
 * Se marca como no raycastable para no bloquear punteros hacia el suelo o bloques.
 */
function GhostCube({ x, y, z, color }: { x: number; y: number; z: number; color?: string }) {
  const pos = [x + 0.5, z + 0.5, y + 0.5] as [number, number, number];
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: color ?? "#ffffff",
        opacity: 0.45,
        transparent: true,
        depthWrite: false,
      }),
    [color]
  );

  // Evita que el ghost capture eventos pointer (pasa a lo que esté debajo)
  const noopRaycast = useCallback(() => null, []);

  return (
    <mesh position={pos} material={mat} raycast={noopRaycast} renderOrder={999}>
      <boxGeometry args={[1, 1, 1]} />
    </mesh>
  );
}

function Scene3D(props: {
  engine: ReturnType<typeof useBlockEngine>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { engine, containerRef } = props;
  const { grid, blocksArray, ghost, setGhost, placeBlock, removeBlock, showGrid } = engine;

  // Tipar correctamente el ref de OrbitControls (evita `any`)
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  // Cámara ya establecida en Canvas; sólo fijamos target una vez
  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.target.set(grid.width / 2, 0, grid.depth / 2);
      controlsRef.current.update();
    }
  });

  const groundRef = useRef<THREE.Mesh>(null);

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const p = computeCell(e.point, grid);
    setGhost((g) => ({ ...g, x: p.x, y: p.y }));
  };

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    // Coloca exactamente donde está el ghost (ya alineado al puntero)
    placeBlock();
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onCtx = (ev: MouseEvent) => {
      ev.preventDefault();
      removeBlock();
    };
    el.addEventListener("contextmenu", onCtx);
    return () => el.removeEventListener("contextmenu", onCtx);
  }, [containerRef, removeBlock]);

  return (
    <>
      {/* Fondo claro */}
      <color attach="background" args={["#f8fafc"]} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[15, 25, 10]} intensity={0.8} castShadow />

      <MaterialsLib />

      {/* Plano base claro (césped suave) */}
      <mesh
        ref={groundRef}
        position={[grid.width / 2, 0, grid.depth / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        receiveShadow
      >
        <planeGeometry args={[grid.width, grid.depth]} />
        <meshStandardMaterial color="#e5f7e9" roughness={0.95} />
      </mesh>

      {showGrid && (
        <DreiGrid
          args={[grid.width, grid.depth]}
            sectionSize={1}
            cellSize={1}
            cellColor="#b6d7bc"
            sectionColor="#9ccaa3"
            fadeDistance={0}
            position={[grid.width / 2, 0.002, grid.depth / 2]}
            infiniteGrid={false}
        />
      )}

      <group>
        {blocksArray.map((b) => (
          <BlockMesh key={`${b.x},${b.y},${b.z}`} block={b} engine={engine} />
        ))}
      </group>

      <GhostCube x={ghost.x} y={ghost.y} z={ghost.z} color="#6366f1" />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.12}
        rotateSpeed={0.45}
        zoomSpeed={0.4}
        enablePan={false}
        minDistance={28}
        maxDistance={30}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2.05}
      />
    </>
  );
}

/* ------------- UI + Canvas ------------- */
export default function ConstruccionConBloques3D(props?: { grid?: { width: number; depth: number; height: number } }) {
  const engine = useBlockEngine({ grid: props?.grid });
  const {
    grid,
    blocksArray,
    ghost,
    setGhost,
    material,
    setMaterial,
    showGrid,
    setShowGrid,
    placeBlock,
    removeBlock,
    undo,
    redo,
    save,
    load,
    reset,
    message,
    announce,
  } = engine;

  const [tutorialStep, setTutorialStep] = useState<number | null>(() =>
    localStorage.getItem(TUTORIAL_SEEN) ? null : 0
  );

  useEffect(() => {
    if (tutorialStep === null) return;
    if (tutorialStep >= 3) {
      localStorage.setItem(TUTORIAL_SEEN, "1");
      setTutorialStep(null);
    }
  }, [tutorialStep]);

  // Keybindings accesibles
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^[1-4]$/.test(e.key)) {
        const idx = Number(e.key) - 1;
        const m = materialMeta[idx].key;
        setMaterial(m);
        announce(`Material: ${materialMeta[idx].label}`);
        e.preventDefault();
        return;
      }
      if (e.key.toLowerCase() === "g") {
        setShowGrid((v) => !v);
        announce(`Grilla ${showGrid ? "oculta" : "visible"}`);
        e.preventDefault();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "l") {
        e.preventDefault();
        load();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
        return;
      }
      // mover ghost (WASD sobre suelo) y QE altura
      const move: Record<string, [number, number, number]> = {
        ArrowLeft: [-1, 0, 0],
        ArrowRight: [1, 0, 0],
        ArrowUp: [0, -1, 0],
        ArrowDown: [0, 1, 0],
        a: [-1, 0, 0],
        d: [1, 0, 0],
        w: [0, -1, 0],
        s: [0, 1, 0],
        q: [0, 0, -1],
        e: [0, 0, 1],
        "+": [0, 0, 1],
        "-": [0, 0, -1],
      };
      const delta = move[e.key];
      if (delta) {
        setGhost((g) => ({
          x: clamp(g.x + delta[0], 0, grid.width - 1),
          y: clamp(g.y + delta[1], 0, grid.depth - 1),
          z: clamp(g.z + delta[2], 0, grid.height - 1),
        }));
        e.preventDefault();
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        placeBlock();
        e.preventDefault();
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        removeBlock();
        e.preventDefault();
        return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [grid, setGhost, setMaterial, showGrid, save, load, undo, redo, placeBlock, removeBlock, announce]);

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="p-4 text-slate-100">
      <div className="flex items-start gap-4">
        {/* Sidebar herramientas */}
        <aside className="w-56 bg-slate-900/60 p-3 rounded-lg border border-slate-700" aria-label="Panel de herramientas">
          <h3 className="text-lg font-semibold mb-2">Materiales</h3>
          <div role="radiogroup" aria-label="Seleccionar material" className="space-y-2">
            {materialMeta.map((m, idx) => (
              <label key={m.key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="material"
                  role="radio"
                  aria-checked={material === m.key}
                  checked={material === m.key}
                  onChange={() => {
                    setMaterial(m.key);
                    announce(`Material ${m.label}`);
                  }}
                  className="sr-only"
                />
                <span
                  className="w-8 h-8 rounded-sm border border-white/20"
                  style={{ background: m.color }}
                  aria-hidden
                  title={`${m.label} (${idx + 1})`}
                />
                <span className="text-sm">
                  {m.label} <span className="text-xs text-slate-400">({idx + 1})</span>
                </span>
              </label>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            <button
              onClick={() => save()}
              aria-label="Guardar"
              className="w-full px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-sm focus-visible:ring-2 focus-visible:ring-indigo-400"
              title="Guardar (Ctrl+S)"
            >
              Guardar (Ctrl+S)
            </button>
            <button
              onClick={() => load()}
              aria-label="Cargar"
              className="w-full px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 text-white text-sm focus-visible:ring-2 focus-visible:ring-indigo-400"
              title="Cargar (Ctrl+L)"
            >
              Cargar (Ctrl+L)
            </button>
            <div className="flex gap-2">
              <button onClick={() => undo()} aria-label="Deshacer" className="flex-1 px-2 py-2 rounded bg-yellow-600 hover:bg-yellow-500 text-sm">
                Deshacer
              </button>
              <button onClick={() => redo()} aria-label="Rehacer" className="flex-1 px-2 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-sm">
                Rehacer
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => reset()} aria-label="Reiniciar" className="flex-1 px-2 py-2 rounded bg-red-600 hover:bg-red-500 text-sm">
                Reiniciar
              </button>
              <button
                onClick={() => setShowGrid((v) => !v)}
                aria-label="Mostrar u ocultar grilla"
                className="flex-1 px-2 py-2 rounded bg-slate-600 hover:bg-slate-500 text-sm"
              >
                {showGrid ? "Ocultar grilla (G)" : "Mostrar grilla (G)"}
              </button>
            </div>
          </div>

          <div className="mt-3 text-sm text-slate-300">
            <div><strong>Atajos:</strong></div>
            <ul className="list-disc ml-5">
              <li>1–4: seleccionar material</li>
              <li>WASD/flechas mover ghost; Q/E sube/baja</li>
              <li>Enter/Espacio: colocar • Supr: eliminar</li>
              <li>Ctrl+Z / Ctrl+Y: deshacer/rehacer</li>
              <li>G: mostrar/ocultar grilla</li>
            </ul>
          </div>
        </aside>

        {/* Canvas 3D */}
        <main className="flex-1" aria-label="Área de construcción">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Construcción con Bloques (3D)</h2>
              <div className="text-sm text-slate-400">
                Celdas: {grid.width}×{grid.depth} × alturas {grid.height} — Bloques: {blocksArray.length}
              </div>
            </div>
            <div className="text-right text-sm">
              <div className="text-slate-300">Pos: x{ghost.x + 1} y{ghost.y + 1} z{ghost.z + 1}</div>
              <div className="text-slate-300">Material: {material}</div>
            </div>
          </div>

          <div
            ref={containerRef}
            role="application"
            aria-label="Escena 3D para construir con bloques"
            className="h-[540px] rounded-lg border border-slate-700 overflow-hidden bg-slate-900"
            tabIndex={0}
            title="Orbita con el mouse; rueda zoom; clic coloca; clic sobre bloque apila; botón derecho elimina"
          >
            <Canvas
              shadows
              dpr={[1, 2]}
              camera={{
                fov: 50,
                position: [DEFAULT_GRID.width * 0.9, DEFAULT_GRID.height * 2.2, DEFAULT_GRID.depth * 1.1],
                near: 0.1,
                far: 200,
              }}
            >
              <Scene3D engine={engine} containerRef={containerRef} />
            </Canvas>
          </div>
        </main>
      </div>

      {/* Anuncios accesibles */}
      <div aria-live="polite" className="sr-only" role="status">
        {message}
      </div>

      {/* Tutorial overlay */}
      {tutorialStep !== null && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" />
          <div className="relative w-full max-w-md bg-slate-900 text-white rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-bold mb-2">¿Cómo construir?</h3>
            <ol className="list-decimal ml-5 mb-4 space-y-2 text-sm">
              <li>Selecciona un material (1–4).</li>
              <li>Mueve el cursor con WASD o el mouse sobre la grilla. Q/E sube/baja.</li>
              <li>Enter o clic para colocar. Supr para eliminar. G para la grilla.</li>
            </ol>
            <div className="flex justify-between">
              <button
                onClick={() => {
                  localStorage.setItem(TUTORIAL_SEEN, "1");
                  setTutorialStep(null);
                }}
                className="px-3 py-2 rounded bg-slate-700"
              >
                Omitir
              </button>
              <button
                onClick={() => setTutorialStep((s) => (s !== null ? s + 1 : null))}
                className="px-3 py-2 rounded bg-indigo-600"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
