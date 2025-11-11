import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PlanetaTierra from "./PlanetaTierra";

// Nota: evitamos renderizar Canvas en pruebas usando la vista 2D

describe("PlanetaTierra", () => {
  // Polyfill básico para ResizeObserver requerido por react-three-fiber en JSDOM
  beforeAll(() => {
    if (!('ResizeObserver' in global)) {
      // Polyfill mínimo si no existe
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
      };
    }
  });

  test("renderiza encabezado y cambia a vista 2D", () => {
    render(<PlanetaTierra />);
    expect(screen.getByText(/Planeta Tierra Interactivo/i)).toBeInTheDocument();

    const vista2dBtn = screen.getByRole("button", { name: /Vista 2D/i });
    fireEvent.click(vista2dBtn);

    // aparece el mapa del mundo en 2D
    expect(screen.getByAltText(/Mapa del mundo/i)).toBeInTheDocument();
  });

  test("abre modal de país en vista 2D y puede cerrarse", async () => {
    render(<PlanetaTierra />);
    fireEvent.click(screen.getByRole("button", { name: /Vista 2D/i }));

    // Hacemos clic en un país (usar Colombia si está disponible)
    const verColombia = await screen.findByRole("button", { name: /Ver Colombia/i });
    fireEvent.click(verColombia);

    // Modal con el nombre del país
    const heading = await screen.findByRole("heading", { name: /Colombia/i });
    expect(heading).toBeInTheDocument();

    // Cerrar
    const cerrar = screen.getByRole("button", { name: /Cerrar/i });
    fireEvent.click(cerrar);

    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: /Colombia/i })).not.toBeInTheDocument();
    });
  });
});
