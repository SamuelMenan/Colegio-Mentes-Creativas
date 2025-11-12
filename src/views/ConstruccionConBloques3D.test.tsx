import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

/* Mock @react-three/fiber: simula Canvas y frame loop */
jest.mock("@react-three/fiber", () => {
  const camera = {
    position: { set: jest.fn() },
    lookAt: jest.fn(),
  };
  return {
    __esModule: true,
    Canvas: ({ children }: { children?: React.ReactNode }) =>
      React.createElement("div", { "data-testid": "r3f-canvas" }, children as any),
    useThree: () => ({ camera }),
    useFrame: () => {},
  };
});

/* Mock @react-three/drei: Grid, OrbitControls y useTexture */
jest.mock("@react-three/drei", () => {
  const Stub = () => null;

  const makeTex = () => ({
    wrapS: 0,
    wrapT: 0,
    repeat: { set: jest.fn() },
    anisotropy: 1,
    magFilter: 0,
    minFilter: 0,
  });

  const useTexture = (input: string | string[], onLoad?: (t: any) => void) => {
    if (Array.isArray(input)) {
      const arr = input.map(() => makeTex());
      onLoad?.(arr);
      return arr;
    }
    const tex = makeTex();
    onLoad?.(tex);
    return tex;
  };

  return { __esModule: true, OrbitControls: Stub, Grid: Stub, useTexture };
});

import ConstruccionConBloques3D, { useBlockEngine } from "./ConstruccionConBloques3D";

/** Harness del hook para testear lógica sin raycasting real */
function EngineHarness({ x, y, z }: { x: number; y: number; z: number }) {
  const engine = useBlockEngine();
  return (
    <div>
      <button data-testid="place" onClick={() => engine.placeBlock({ x, y, z })}>
        place
      </button>
      <div data-testid="count">{engine.blocksArray.length}</div>
      <ul data-testid="keys">
        {engine.blocksArray.map((b) => (
          <li key={`${b.x},${b.y},${b.z}`}>{`${b.x},${b.y},${b.z}`}</li>
        ))}
      </ul>
    </div>
  );
}

describe("ConstruccionConBloques3D - UI básica", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("renderiza el canvas 3D", () => {
    render(<ConstruccionConBloques3D />);
    expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument();
  });

  test("coloca bloque con Enter", async () => {
    render(<ConstruccionConBloques3D />);
    expect(screen.getByText(/Bloques:\s*0/)).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Enter" });
    await waitFor(() => expect(screen.getByText(/Bloques:\s*1/)).toBeInTheDocument());
  });

  test("drag con botón izquierdo no coloca bloque", () => {
    render(<ConstruccionConBloques3D />);
    const canvas = screen.getByTestId("r3f-canvas");
    fireEvent.pointerDown(canvas, { button: 0, clientX: 10, clientY: 10 });
    fireEvent.pointerMove(canvas, { clientX: 40, clientY: 40 });
    fireEvent.pointerUp(canvas);
    expect(screen.getByText(/Bloques:\s*0/)).toBeInTheDocument();
  });
});

describe("useBlockEngine - adyacencia y soporte", () => {
  test("si celda ocupada, coloca en adyacente libre con soporte", () => {
    const { rerender } = render(<EngineHarness x={0} y={0} z={0} />);
    const btn = screen.getByTestId("place");

    fireEvent.click(btn); // (0,0,0)
    expect(screen.getByTestId("count")).toHaveTextContent("1");

    rerender(<EngineHarness x={0} y={0} z={0} />); // ocupado -> (1,0,0)
    fireEvent.click(btn);
    expect(screen.getByTestId("count")).toHaveTextContent("2");

    expect(screen.getByTestId("keys").textContent!).toContain("1,0,0");
  });

  test("no permite flotar sin soporte", () => {
    const { rerender } = render(<EngineHarness x={0} y={0} z={0} />);
    const btn = screen.getByTestId("place");

    fireEvent.click(btn); // base
    expect(screen.getByTestId("count")).toHaveTextContent("1");

    rerender(<EngineHarness x={5} y={5} z={1} />); // sin soporte
    fireEvent.click(btn);
    expect(screen.getByTestId("count")).toHaveTextContent("1");
  });

  test("apilar arriba si hay bloque debajo", () => {
    const { rerender } = render(<EngineHarness x={0} y={0} z={0} />);
    const btn = screen.getByTestId("place");

    fireEvent.click(btn); // base
    rerender(<EngineHarness x={0} y={0} z={1} />); // arriba
    fireEvent.click(btn);
    expect(screen.getByTestId("count")).toHaveTextContent("2");
  });

  test("soporte lateral válido", () => {
    const { rerender } = render(<EngineHarness x={0} y={0} z={0} />);
    const btn = screen.getByTestId("place");

    fireEvent.click(btn); // (0,0,0)
    rerender(<EngineHarness x={1} y={0} z={0} />);
    fireEvent.click(btn); // (1,0,0)
    expect(screen.getByTestId("count")).toHaveTextContent("2");

    rerender(<EngineHarness x={1} y={0} z={1} />); // lateral soporta
    fireEvent.click(btn);
    expect(screen.getByTestId("count")).toHaveTextContent("3");
  });
});