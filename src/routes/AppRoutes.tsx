import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";

// Views
import Home from "../views/Home";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
  <Route index element={<Home />} />
  {/* Solo ruta de inicio */}
      </Route>
    </Routes>
  );
}
