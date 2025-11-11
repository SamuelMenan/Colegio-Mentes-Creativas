import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";

/* Mock @react-three/fiber: sólo estructura mínima */
jest.mock("@react-three/fiber", () => {
  return {
    __esModule: true,
    Canvas: () => React.createElement("div", { "data-testid": "r3f-canvas" }),
    useThree: () => ({
      camera: {
        position: { set: jest.fn() },
        lookAt: jest.fn(),
      },
    }),
    useFrame: () => {},
  };
});

/* Mock @react-three/drei */
jest.mock("@react-three/drei", () => {
  const Stub = () => null;
  return { __esModule: true, OrbitControls: Stub, Grid: Stub };
});

import ConstruccionConBloques3D from "./ConstruccionConBloques3D";

describe("ConstruccionConBloques3D - UI básica", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("renderiza el canvas 3D", () => {
    render(<ConstruccionConBloques3D />);
    expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument();
    expect(screen.getByText(/Bloques:/)).toBeInTheDocument();
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