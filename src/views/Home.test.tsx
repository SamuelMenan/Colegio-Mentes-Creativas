import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from "./Home";

describe("Home view", () => {
  it("muestra el título y el eslogan", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(
      screen.getByRole("heading", { name: /Colegio Mentes Creativas/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Aprender jugando con tecnología/i)
    ).toBeInTheDocument();
  });

  it("muestra accesos disponibles y son enlaces navegables", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    // Secciones con contenido actualmente disponible
    const naturales = screen.getByRole("link", { name: /Abrir área de Ciencias Naturales/i });
    const logico = screen.getByRole("link", { name: /Abrir área de Pensamiento Lógico/i });
    expect(naturales).toBeInTheDocument();
    expect(logico).toBeInTheDocument();
  });

  it("muestra el pie de página con el texto de derechos", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(
      screen.getByText(/© 2025 Colegio Mentes Creativas/i)
    ).toBeInTheDocument();
  });
});
