/// <reference types="vite/client" />
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

// Helper de rutas para respetar BASE_URL (Vite)
// Vite provides import.meta.env.BASE_URL at build time; to avoid TypeScript errors in environments
// where "import.meta" isn't allowed we read a runtime global fallback (__BASE_URL__) and default to "/".
const BASE_URL = (typeof (globalThis as any).__BASE_URL__ === "string" && (globalThis as any).__BASE_URL__) || "/";
const TEX = (p: string) => `${BASE_URL.replace(/\/$/, "")}/${p.replace(/^\//, "")}`;

const materialMeta: { key: Material; label: string; color: string; tex: string }[] = [
  { key: "piedra",  label: "Piedra",  color: "#6b7280", tex: TEX("textures/piedra.png") },
  { key: "madera",  label: "Madera",  color: "#b45309", tex: TEX("textures/madera.png") },
  { key: "roble",   label: "Roble",   color: "#8b5a2b", tex: TEX("textures/roble.png") },
  { key: "cristal", label: "Cristal", color: "#93c5fd", tex: TEX("textures/cristal.png") },
  { key: "cesped",  label: "Césped",  color: "#10b981", tex: TEX("textures/cesped.png") },
];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function useBlockEngine(opts?: { grid?: { width: number; depth: number; height: number } }) {
  const grid = opts?.grid ?? DEFAULT_GRID;

  const [ghost, setGhost] = useState<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
  const [blocksMap, setBlocksMap] = useState<Record<string, Block>>({});
  const [material, setMaterial] = useState<Material>("madera");
  const [showGrid, setShowGrid] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  // Agregar de nuevo los estados para undo/redo (faltaban)
  const [undoStack, setUndoStack] = useState<{ type: "place" | "remove"; block: Block }[]>([]);
  const [redoStack, setRedoStack] = useState<{ type: "place" | "remove"; block: Block }[]>([]);

  const keyFor = (b: { x: number; y: number; z: number }) => `${b.x},${b.y},${b.z}`;
  const blocksArray = useMemo(() => Object.values(blocksMap), [blocksMap]);

  const announce = useCallback((text: string) => {
    setMessage(text);
    const id = window.setTimeout(() => setMessage((m) => (m === text ? null : m)), 1800);
    return () => window.clearTimeout(id);
  }, []);

  // Colocación con adyacentes + soporte (debajo o lateral). Evita bloques flotantes.
  const placeBlock = useCallback(
    (pos?: { x: number; y: number; z: number }, mat?: Material) => {
      let p = pos ?? ghost;
      const m = mat ?? material;

      const inside = (c: typeof p) =>
        c.x >= 0 && c.x < grid.width && c.y >= 0 && c.y < grid.depth && c.z >= 0 && c.z < grid.height;
      const free = (c: typeof p) => !blocksMap[keyFor(c)];
      const hasSideNeighbor = (c: typeof p) => {
        const at = (x: number, y: number, z: number) => blocksMap[keyFor({ x, y, z })];
        return !!(
          at(c.x + 1, c.y, c.z) ||
          at(c.x - 1, c.y, c.z) ||
          at(c.x, c.y + 1, c.z) ||
          at(c.x, c.y - 1, c.z)
        );
      };
      const supported = (c: typeof p) =>
        c.z === 0 || !!blocksMap[keyFor({ x: c.x, y: c.y, z: c.z - 1 })] || hasSideNeighbor(c);

      // Si la celda objetivo está ocupada, intenta adyacentes (derecha, izquierda, adelante, atrás)
      if (!free(p)) {
        const candidates: typeof p[] = [
          { x: p.x + 1, y: p.y, z: p.z },
          { x: p.x - 1, y: p.y, z: p.z },
          { x: p.x, y: p.y + 1, z: p.z },
          { x: p.x, y: p.y - 1, z: p.z },
        ];
        const found = candidates.find((c) => inside(c) && free(c) && supported(c));
        if (!found) {
          announce("Celda ocupada y sin adyacente válido con soporte");
          return false;
        }
        p = found;
      } else {
        // Si está libre, validar soporte igualmente
        if (!supported(p)) {
          announce("Debe tener soporte (debajo o lateral)");
          return false;
        }
      }

      const k = keyFor(p);
      const newBlock: Block = { ...p, material: m };
      setBlocksMap((prev) => ({ ...prev, [k]: newBlock }));
      setUndoStack((s) => [...s, { type: "place", block: newBlock }]);
      setRedoStack([]);
      announce("Bloque colocado");
      return true;
    },
    [ghost, material, blocksMap, grid.width, grid.depth, grid.height, announce]
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
  const loaded = useTexture(paths, (textures: THREE.Texture[]) => {
    textures.forEach((t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(1, 1);
      t.anisotropy = 8;
      // Compatibilidad según versión de three: colorSpace (>= r152) o encoding (< r152)
      const srgbColorSpace = (THREE as typeof THREE & { SRGBColorSpace?: unknown }).SRGBColorSpace;
      if (srgbColorSpace && "colorSpace" in t) {
        (t as THREE.Texture & { colorSpace?: unknown }).colorSpace = srgbColorSpace;
      }
      const sRGBEncoding = (THREE as typeof THREE & { sRGBEncoding?: unknown }).sRGBEncoding;
      if (sRGBEncoding && "encoding" in t) {
        (t as THREE.Texture & { encoding?: unknown }).encoding = sRGBEncoding;
      }
    });
  }) as THREE.Texture[];

  const mats = useRef<Record<Material, THREE.Material>>({} as Record<Material, THREE.Material>);
  if (Object.keys(mats.current).length === 0) {
    materialMeta.forEach((meta, i) => {
      const tex = loaded[i] ?? null;
      let material: THREE.Material;
      if (meta.key === "cristal") {
        material = new THREE.MeshPhysicalMaterial({
          color: tex ? "#ffffff" : meta.color,
          map: tex || undefined,
          transmission: 0.85,
          roughness: 0.15,
          thickness: 0.6,
          transparent: true,
        });
      } else {
        // Para evitar saturación de la textura (especialmente madera),
        // usamos color blanco cuando hay textura para no tintarla.
        material = new THREE.MeshStandardMaterial({
          color: tex ? "#ffffff" : meta.color,
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
  const { grid, setGhost, placeBlock, ghost } = engine;

  const clickState = useRef<{ down: boolean; moved: boolean; x: number; y: number; t0: number }>({
    down: false,
    moved: false,
    x: 0,
    y: 0,
    t0: 0,
  });

  const startClick = (e: ThreeEvent<PointerEvent>) => {
    clickState.current = { down: true, moved: false, x: e.clientX, y: e.clientY, t0: e.timeStamp };
  };
  const markMove = (e: ThreeEvent<PointerEvent>) => {
    if (!clickState.current.down) return;
    const dx = Math.abs(e.clientX - clickState.current.x);
    const dy = Math.abs(e.clientY - clickState.current.y);
    if (dx + dy > 6) clickState.current.moved = true;
  };
  const isClick = (e: ThreeEvent<PointerEvent>) => {
    const s = clickState.current;
    clickState.current.down = false;
    return !s.moved && e.timeStamp - s.t0 < 250;
  };

  // Calcula la celda adyacente según la normal de la cara
  const computeGhostFromFace = (normal: THREE.Vector3) => {
    const nx = Math.round(normal.x);
    const ny = Math.round(normal.y);
    const nz = Math.round(normal.z);
    const target = {
      x: clamp(block.x + nx, 0, grid.width - 1),
      y: clamp(block.y + nz, 0, grid.depth - 1),
      z: clamp(block.z + ny, 0, grid.height - 1),
    };
    return target;
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    markMove(e);
    if (e.face?.normal) {
      // Mostrar la vista previa EXACTA donde se colocará el bloque si se hace click
      const tgt = computeGhostFromFace(e.face.normal);
      setGhost(tgt);
    } else {
      // Si no hay normal (caso raro), mantener coordenadas base del bloque
      setGhost({
        x: block.x,
        y: block.y,
        z: clamp(ghost.z, 0, grid.height - 1),
      });
    }
  };

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    startClick(e);
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!isClick(e)) return;

    const faceNormal = e.face?.normal;
    if (faceNormal) {
      const target = computeGhostFromFace(faceNormal);
      placeBlock(target);
      return;
    }
    // Fallback: apila sobre altura actual del ghost (ya visible)
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
      onPointerUp={handlePointerUp}
    >
      <boxGeometry args={[1, 1, 1]} />
    </mesh>
  );
}

// Preciso: se calcula la celda por coordenadas locales del plano (sin saltos perspectiva)
export function computeCell(point: THREE.Vector3, grid: { width: number; depth: number }) {
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
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  // Textura de césped para el suelo
  const groundTex = useTexture(TEX("textures/cespedF.png"));
  useEffect(() => {
    if (!groundTex) return;
    groundTex.wrapS = groundTex.wrapT = THREE.RepeatWrapping;
    groundTex.repeat.set(grid.width, grid.depth); // 1 tile por celda
    groundTex.anisotropy = 8;
    groundTex.magFilter = THREE.NearestFilter;
    groundTex.minFilter = THREE.NearestMipMapLinearFilter;
  }, [groundTex, grid.width, grid.depth]);

  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.target.set(grid.width / 2, 0, grid.depth / 2);
      controlsRef.current.update();
    }
  });

  const groundRef = useRef<THREE.Mesh>(null);

  // Click vs drag sobre el suelo (no colocar durante drag)
  const groundClick = useRef<{ down: boolean; moved: boolean; x: number; y: number; t0: number }>({
    down: false,
    moved: false,
    x: 0,
    y: 0,
    t0: 0,
  });
  const startGround = (e: ThreeEvent<PointerEvent>) => {
    groundClick.current = { down: true, moved: false, x: e.clientX, y: e.clientY, t0: e.timeStamp };
  };
  const markGroundMove = (e: ThreeEvent<PointerEvent>) => {
    if (!groundClick.current.down) return;
    const dx = Math.abs(e.clientX - groundClick.current.x);
    const dy = Math.abs(e.clientY - groundClick.current.y);
    if (dx + dy > 6) groundClick.current.moved = true;
  };
  const isGroundClick = (e: ThreeEvent<PointerEvent>) => {
    const s = groundClick.current;
    groundClick.current.down = false;
    return !s.moved && e.timeStamp - s.t0 < 250;
  };

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    markGroundMove(e);
    const p = computeCell(e.point, grid);
    // Alinea siempre ghost al suelo cuando el puntero está sobre el plano base
    setGhost((g) => ({ x: p.x, y: p.y, z: g.z }));
  };

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    startGround(e);
  };

  const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!isGroundClick(e)) return; // fue drag: solo mover cámara
    placeBlock(); // click corto: colocar en la celda del ghost
  };

  // Scroll para zoom (limites min/max) y botón derecho para eliminar
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onCtx = (ev: MouseEvent) => {
      ev.preventDefault();
      removeBlock();
    };

    const onWheel = (ev: WheelEvent) => {
      ev.preventDefault();
      const controls = controlsRef.current;
      if (!controls) return;
      const cam = controls.object as THREE.PerspectiveCamera;
      const target = controls.target.clone();

      const dir = cam.position.clone().sub(target).normalize();
      const curr = cam.position.distanceTo(target);
      const step = 1.2;
      const next = clamp(curr + (ev.deltaY > 0 ? 1 : -1) * step, 12, 80);

      cam.position.copy(target.add(dir.multiplyScalar(next)));
      controls.update();
    };

    el.addEventListener("contextmenu", onCtx, { passive: false });
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("contextmenu", onCtx);
      el.removeEventListener("wheel", onWheel);
    };
  }, [containerRef, removeBlock]);

  return (
    <>
      {/* Fondo claro */}
      <color attach="background" args={["#f8fafc"]} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[15, 25, 10]} intensity={0.8} castShadow />

      <MaterialsLib />

      {/* Plano base con textura de césped */}
      <mesh
        ref={groundRef}
        position={[grid.width / 2, 0, grid.depth / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}  // asegurar pointerUp para click vs drag
        receiveShadow
      >
        <planeGeometry args={[grid.width, grid.depth]} />
        {/* si ya aplicaste textura, deja el material con map; aquí respetamos tu estado actual */}
        <meshStandardMaterial map={groundTex} color="#ffffff" roughness={0.95} />
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
        enablePan={false}
        enableZoom={false} // el zoom lo manejamos con el listener 'wheel'
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
                  className={`w-8 h-8 rounded-sm border border-white/30 overflow-hidden relative ${
                    material === m.key ? "ring-2 ring-indigo-400" : ""
                  }`}
                  style={{
                    backgroundColor: m.color,                 // fallback
                    backgroundImage: `url(${m.tex})`,
                    backgroundSize: m.key === "cristal" ? "contain" : "cover",
                    backgroundRepeat: m.key === "cristal" ? "no-repeat" : "repeat",
                    backgroundPosition: "center",
                    imageRendering: "pixelated"
                  }}
                  aria-hidden
                  title={`${m.label} (${idx + 1})`}
                >
                  {m.key === "cristal" && (
                    <span className="absolute inset-0 bg-white/30 mix-blend-overlay pointer-events-none" />
                  )}
                </span>
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
