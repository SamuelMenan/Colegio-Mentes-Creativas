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

  it("muestra accesos disponibles y deshabilitados correctamente", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    // Disponibles (3 enlaces)
    expect(screen.getByRole("link", { name: /Abrir área de Ciencias Naturales/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Abrir área de Ciencias Sociales\/Geografía/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Abrir área de Tecnología y Pensamiento Lógico/i })).toBeInTheDocument();
    // No disponibles (2 botones deshabilitados)
    const matematicas = screen.getByRole("button", { name: /Abrir área de Matemáticas\/Geometría.*no disponible/i });
    const arte = screen.getByRole("button", { name: /Abrir área de Arte y Creatividad.*no disponible/i });
    expect(matematicas).toHaveAttribute("aria-disabled", "true");
    expect(arte).toHaveAttribute("aria-disabled", "true");
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
