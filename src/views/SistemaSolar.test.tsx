import { render, screen, fireEvent } from "@testing-library/react";
import SistemaSolar from "./SistemaSolar";

describe("SistemaSolar", () => {
  test("renderiza encabezado y texto de instrucción", () => {
    render(<SistemaSolar />);
    expect(
      screen.getByRole("heading", { name: /Sistema Solar Interactivo/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/haz clic en un planeta para conocerlo/i)
    ).toBeInTheDocument();
  });

  test("abre y cierra modal de planeta", async () => {
    render(<SistemaSolar />);
    // Buscar planeta por su rol explícito listitem y nombre accesible
    const mercurioItem = screen.getByRole("listitem", {
      name: /Planeta Mercurio/i,
    });
    fireEvent.click(mercurioItem);
    // Esperar a que aparezca el modal accesible
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Mercurio/i })).toBeInTheDocument();
    // Cerrar
    fireEvent.click(screen.getByRole("button", { name: /Cerrar información del planeta/i }));
  });
});
