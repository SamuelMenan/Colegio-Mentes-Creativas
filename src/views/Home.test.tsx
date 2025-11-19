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
    // Disponibles: deben ser <a> (link)
    expect(screen.getByRole("link", { name: /Abrir área de Ciencias Naturales/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Abrir área de Ciencias Sociales y Geografía/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Abrir área de Tecnología/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Abrir área de Pensamiento Lógico/i })).toBeInTheDocument();
    // No disponibles: visibles pero aria-disabled
    const matematicas = screen.getByRole("button", { name: /Abrir área de Matemáticas.*no disponible/i });
    const arte = screen.getByRole("button", { name: /Abrir área de Arte.*no disponible/i });
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
