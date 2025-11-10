
import { NavLink } from "react-router-dom";

interface SidebarItem {
  label: string;
  route: string;
}

const items: SidebarItem[] = [
  { label: "Inicio", route: "/" }
];

export default function Sidebar() {
  return (
    <aside className="hidden md:block w-full md:w-[240px] border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="p-3 space-y-1">
        {items.map(({ label, route }) => (
          <NavLink
            key={route}
            to={route}
            className={({ isActive }) =>
              `w-full text-left flex items-center justify-between rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 
               hover:bg-slate-50 dark:hover:bg-slate-800 
               ${isActive ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" : ""}`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
