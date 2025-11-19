import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

  test("lista de planetas accesible y elementos presentes", () => {
    render(<SistemaSolar />);
    const lista = screen.getByRole("list", { name: /Lista de planetas del Sistema Solar/i });
    expect(lista).toBeInTheDocument();
    // Debe existir al menos Mercurio y Neptuno como items
    expect(
      screen.getByRole("listitem", { name: /Planeta Mercurio/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("listitem", { name: /Planeta Neptuno/i })
    ).toBeInTheDocument();
  });

  test("abrir modal del Sol desde el botón central", async () => {
    render(<SistemaSolar />);
    fireEvent.click(screen.getByRole("button", { name: /Mostrar información del Sol/i }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    // Evitar colisión con "Sistema Solar Interactivo" usando nombre exacto y nivel
    expect(screen.getByRole("heading", { level: 2, name: /^Sol$/i })).toBeInTheDocument();
    // Cerrar tocando el fondo
    fireEvent.click(screen.getByLabelText(/Cerrar modal/i));
  });

  test("toggle de órbitas reales cambia el texto del botón", () => {
    render(<SistemaSolar />);
    const btn = screen.getByRole("button", { name: /Alternar mostrar órbitas reales/i });
    expect(btn).toHaveTextContent(/Órbitas simples/i);
    fireEvent.click(btn);
    expect(btn).toHaveTextContent(/Órbitas reales/i);
  });

  test("modo accesible deshabilita control de velocidad y cambia la etiqueta", () => {
    render(<SistemaSolar />);
    const toggleAcc = screen.getByRole("button", { name: /Activar modo accesible/i });
    const rangoVelocidad = screen.getByLabelText(/Controlar velocidad de animación/i) as HTMLInputElement;
    expect(toggleAcc).toBeInTheDocument();
    expect(rangoVelocidad).not.toBeDisabled();
    fireEvent.click(toggleAcc);
    // Cambia el texto visible del botón
    expect(screen.getByRole("button", { name: /Activar modo accesible/i })).toHaveTextContent(/Modo accesible: ON/i);
    // El control de velocidad queda deshabilitado
    expect(rangoVelocidad).toBeDisabled();
  });

  test("mostrar etiquetas y resaltar interiores cambian el texto de sus botones", () => {
    render(<SistemaSolar />);
    const btnLabels = screen.getByRole("button", { name: /Mostrar etiquetas/i });
    const btnInteriores = screen.getByRole("button", { name: /Resaltar planetas interiores/i });
    expect(btnLabels).toHaveTextContent(/Mostrar etiquetas/i);
    fireEvent.click(btnLabels);
    expect(btnLabels).toHaveTextContent(/Etiquetas visibles/i);
    expect(btnInteriores).toHaveTextContent(/Resaltar interiores/i);
    fireEvent.click(btnInteriores);
    expect(btnInteriores).toHaveTextContent(/Interiores resaltados/i);
  });

  test("vista 3D abre y cierra overlay", async () => {
    render(<SistemaSolar />);
    fireEvent.click(screen.getByRole("button", { name: /Activar vista 3D/i }));
    const dialog3d = await screen.findByRole("dialog", { name: /Vista 3D del Sistema Solar/i });
    expect(dialog3d).toBeInTheDocument();
    // Cerrar por botón
    fireEvent.click(screen.getByRole("button", { name: /Cerrar vista 3D/i }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: /Vista 3D del Sistema Solar/i })).not.toBeInTheDocument();
    });
  });

  test("modal de planeta: toggle de video educativo muestra y oculta iframe", async () => {
    render(<SistemaSolar />);
    const venus = screen.getByRole("listitem", { name: /Planeta Venus/i });
    fireEvent.click(venus);
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    const btnVideo = screen.getByRole("button", { name: /Mostrar u ocultar video educativo/i });
    // Estado inicial: texto "Ver video educativo"
    expect(btnVideo).toHaveTextContent(/Ver video educativo/i);
    fireEvent.click(btnVideo);
    // Debe aparecer el contenedor del video: verificamos por id
    expect(document.getElementById("video-educativo")).toBeTruthy();
    // Ocultar (animación con AnimatePresence requiere esperar al desmontaje)
    fireEvent.click(btnVideo);
    await waitFor(() => {
      expect(document.getElementById("video-educativo")).toBeNull();
    });
    // Cerrar modal
    fireEvent.click(screen.getByRole("button", { name: /Cerrar información del planeta/i }));
  });

  test("quiz: navegación siguiente/anterior y feedback de selección", () => {
    render(<SistemaSolar />);
    // Verifica encabezado de pregunta
    expect(screen.getByText(/Pregunta 1 de 20/i)).toBeInTheDocument();
    // Seleccionar respuesta correcta en la 1 (Mercurio)
    fireEvent.click(screen.getByRole("button", { name: /Mercurio/i }));
    expect(screen.getByText(/Correcto|¡Correcto!|Correcto!/i)).toBeInTheDocument();
    // Siguiente (usar coincidencia exacta para evitar el botón "Siguiente dato curioso")
    fireEvent.click(screen.getByRole("button", { name: /^Siguiente$/i }));
    expect(screen.getByText(/Pregunta 2 de 20/i)).toBeInTheDocument();
    // Anterior
    fireEvent.click(screen.getByRole("button", { name: /^Anterior$/i }));
    expect(screen.getByText(/Pregunta 1 de 20/i)).toBeInTheDocument();
  });
});
