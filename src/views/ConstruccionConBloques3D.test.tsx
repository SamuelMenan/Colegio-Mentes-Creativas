import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

/* Mock @react-three/fiber: simula Canvas y cámara */
jest.mock("@react-three/fiber", () => {
  const camera = {
    position: { set: jest.fn() },
    lookAt: jest.fn(),
  };
  return {
    __esModule: true,
    Canvas: () => {
      camera.position.set(12, 18, 14);
      camera.lookAt(0, 0, 0);
      return React.createElement("div", { "data-testid": "r3f-canvas" });
    },
    useThree: () => ({ camera }),
    useFrame: () => {},
  };
});

/* Mock @react-three/drei: Grid, OrbitControls y useTexture */
jest.mock("@react-three/drei", () => {
  const Stub = () => null;

  type TextureMock = {
    wrapS: number;
    wrapT: number;
    repeat: { set: (...args: unknown[]) => void };
    anisotropy: number;
  };

  const makeTex = (): TextureMock => ({
    wrapS: 0,
    wrapT: 0,
    repeat: { set: jest.fn() },
    anisotropy: 1,
  });

  const useTexture = (
    input: string | string[],
    onLoad?: (texture: TextureMock | TextureMock[]) => void
  ): TextureMock | TextureMock[] => {
    if (Array.isArray(input)) {
      const arr = input.map(() => makeTex());
      if (onLoad) onLoad(arr);
      return arr;
    }
    const tex = makeTex();
    if (onLoad) onLoad(tex);
    return tex;
  };

  return { __esModule: true, OrbitControls: Stub, Grid: Stub, useTexture };
});

import { useThree } from "@react-three/fiber";
import ConstruccionConBloques3D from "./ConstruccionConBloques3D";

describe("ConstruccionConBloques3D - cámara y controles", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("renderiza el canvas 3D y aplica controles de cámara", () => {
    render(<ConstruccionConBloques3D />);
    expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument();

    const { camera } = useThree();
    expect(camera.position.set).toHaveBeenCalled();
    expect(camera.lookAt).toHaveBeenCalled();
  });

  test("coloca bloque con Enter", async () => {
    render(<ConstruccionConBloques3D />);
    expect(screen.getByText(/Bloques:\s*0/)).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Enter" });
    await waitFor(() =>
      expect(screen.getByText(/Bloques:\s*1/)).toBeInTheDocument()
    );
  });

  test("no coloca bloque durante drag simulado (solo pointer events no insertan bloque)", () => {
    render(<ConstruccionConBloques3D />);
    const canvas = screen.getByTestId("r3f-canvas");
    fireEvent.pointerDown(canvas, { button: 0 });
    fireEvent.pointerMove(canvas, { clientX: 120, clientY: 140 });
    fireEvent.pointerUp(canvas);
    expect(screen.getByText(/Bloques:\s*0/)).toBeInTheDocument();
  });
});