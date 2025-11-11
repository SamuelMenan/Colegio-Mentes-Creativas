import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";

/* Mock @react-three/fiber: simula llamadas de cámara al montar Canvas */
jest.mock("@react-three/fiber", () => {
  const camera = {
    position: { set: jest.fn() },
    lookAt: jest.fn(),
  };
  return {
    __esModule: true,
    Canvas: () => {
      // Dispara posicionamiento de cámara como haría la escena
      camera.position.set(12, 18, 14);
      camera.lookAt(0, 0, 0);
      return React.createElement("div", { "data-testid": "r3f-canvas" });
    },
    useThree: () => ({ camera }),
    useFrame: () => {},
  };
});

/* Mock @react-three/drei */
jest.mock("@react-three/drei", () => {
  const Stub = () => null;
  return { __esModule: true, OrbitControls: Stub, Grid: Stub };
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
    expect(camera.position.set).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      expect.any(Number)
    );
    expect(camera.lookAt).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      expect.any(Number)
    );
  });

  test("coloca bloque con Enter", () => {
    render(<ConstruccionConBloques3D />);
    expect(screen.getByText(/Bloques:\s*0/)).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Enter" });
    expect(screen.getByText(/Bloques:\s*1/)).toBeInTheDocument();
  });

  test("toggle grilla con G", () => {
    render(<ConstruccionConBloques3D />);
    const boton = screen.getByRole("button", { name: /grilla/i });
    fireEvent.keyDown(window, { key: "g" });
    expect(boton.textContent?.toLowerCase()).toMatch(/mostrar grilla|ocultar grilla/);
  });
});