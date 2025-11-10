import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";

// Views
import Home from "../views/Home";
import SistemaSolar from "../views/SistemaSolar";
import ConstruccionConBloques3D from "../views/ConstruccionConBloques3D";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="sistema-solar" element={<SistemaSolar />} />
        <Route path="construccion-bloques3D" element={<ConstruccionConBloques3D />} />
      </Route>
    </Routes>
  );
}
