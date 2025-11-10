import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";

// Views
import HomePage from "../views/HomePage";
// Eliminadas vistas no requeridas

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
  {/* Solo ruta de inicio */}
      </Route>
    </Routes>
  );
}
