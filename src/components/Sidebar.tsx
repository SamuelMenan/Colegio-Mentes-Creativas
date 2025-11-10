import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="hidden md:block w-full md:w-[240px] border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <nav className="space-y-1 p-3">
        {/* Enlace a Inicio */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `block px-3 py-2 rounded-md text-sm font-medium ${
              isActive
                ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`
          }
        >
          Inicio
        </NavLink>

        {/* Enlace a Sistema Solar */}
        <NavLink
          to="/sistema-solar"
          className={({ isActive }) =>
            `block px-3 py-2 rounded-md text-sm font-medium ${
              isActive
                ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`
          }
        >
          Sistema Solar
        </NavLink>

        {/* Enlace a Construcción con Bloques */}
        <NavLink
          to="/construccion-bloques3D"
          className={({ isActive }) =>
            `block px-3 py-2 rounded-md text-sm font-medium ${
              isActive
                ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`
          }
        >
          Construcción con Bloques
        </NavLink>
      </nav>
    </aside>
  );
}
