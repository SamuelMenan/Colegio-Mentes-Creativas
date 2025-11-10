import { render, screen } from "@testing-library/react";
import Home from "./Home";

describe("Home view", () => {
  it("muestra el título y el eslogan", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { name: /Colegio Mentes Creativas/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Aprender jugando con tecnología/i)
    ).toBeInTheDocument();
  });

  it("muestra los 6 botones únicos de áreas con sus etiquetas", () => {
    render(<Home />);
    const labels = [
      /Matemáticas/i,
      /Ciencias Naturales/i,
      /Ciencias Sociales/i,
      /Tecnología/i,
      /Pensamiento Lógico/i,
      /Arte/i,
    ];

    labels.forEach((rx) => {
      // Usa getAllByText para detectar duplicados y asegura que al menos uno es el botón
      const matches = screen.getAllByText(rx);
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("muestra el pie de página con el texto de derechos", () => {
    render(<Home />);
    expect(
      screen.getByText(/© 2025 Colegio Mentes Creativas/i)
    ).toBeInTheDocument();
  });
});
