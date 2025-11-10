import { render, screen } from "@testing-library/react";
import App from "./App";

test("renderiza el título principal (heading)", () => {
  render(<App />);
  // Busca el heading principal por rol para evitar la coincidencia con el footer
  expect(
    screen.getByRole("heading", { name: /Colegio Mentes Creativas/i })
  ).toBeInTheDocument();
});