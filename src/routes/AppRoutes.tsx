import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";

// Views
import Home from "../views/Home";
import SistemaSolar from "../views/SistemaSolar";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="sistema-solar" element={<SistemaSolar />} />
      </Route>
    </Routes>
  );
}
