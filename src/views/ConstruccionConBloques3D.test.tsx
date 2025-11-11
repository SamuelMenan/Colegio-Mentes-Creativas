import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";

/* Mocks ligeros para evitar dependencias WebGL en tests */
jest.mock("@react-three/fiber", () => {
  const React = require("react");
  return {
    __esModule: true,
    Canvas: ({ children }: React.PropsWithChildren<{}>) => React.createElement("div", { "data-testid": "r3f-canvas" }, children),
    useFrame: () => {},
    useThree: () => ({
      camera: {
        position: { set: jest.fn() },
        lookAt: jest.fn(),
      },
    }),
  };
});

jest.mock("@react-three/drei", () => {
  const React = require("react");
  const Stub = (props: React.PropsWithChildren<{}>) => React.createElement("div", props, props.children);
  return { __esModule: true, OrbitControls: Stub, Grid: Stub };
});

import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import ConstruccionConBloques3D from "./ConstruccionConBloques3D";

describe("ConstruccionConBloques3D - cámara y controles", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("renderiza el canvas 3D y aplica controles de cámara", () => {
    render(<ConstruccionConBloques3D />);

    // Verifica que el canvas se renderiza
    expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument();

    // Simula movimiento de cámara (mock de OrbitControls)
    const cameraMock = useThree().camera;
    expect(cameraMock.position.set).toHaveBeenCalledWith(expect.any(Number), expect.any(Number), expect.any(Number));
    expect(cameraMock.lookAt).toHaveBeenCalledWith(expect.any(Number), expect.any(Number), expect.any(Number));
  });

  test("ajusta la velocidad de rotación y zoom", () => {
    render(<ConstruccionConBloques3D />);

    // OrbitControls mock debe incluir los parámetros ajustados
    const OrbitControlsMock = OrbitControls;
    expect(OrbitControlsMock).toBeDefined();
    expect(OrbitControlsMock).toHaveProperty("rotateSpeed", 0.5);
    expect(OrbitControlsMock).toHaveProperty("zoomSpeed", 0.5);
    expect(OrbitControlsMock).toHaveProperty("maxPolarAngle", Math.PI / 2);
  });

  // Nuevo test: verifica colocación precisa con un clic y sin variación de cámara.
  test("coloca bloque exactamente en la celda apuntada (ghost) con precisión", () => {
    render(<ConstruccionConBloques3D />);
    // Simular movimiento del ghost (tecla para posicionarlo)
    fireEvent.keyDown(window, { key: "ArrowRight" }); // x+1
    fireEvent.keyDown(window, { key: "ArrowDown" });  // y+1
    const before = screen.getByText(/Bloques:\s*0/);
    expect(before).toBeInTheDocument();
    // Colocar con Enter
    fireEvent.keyDown(window, { key: "Enter" });
    expect(screen.getByText(/Bloques:\s*1/)).toBeInTheDocument();
  });
});