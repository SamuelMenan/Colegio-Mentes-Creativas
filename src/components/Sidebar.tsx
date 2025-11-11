import { NavLink } from "react-router-dom";
import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Globe, Layers, Rocket, Blocks } from "lucide-react";

interface Group {
  title: string;
  icon: ReactNode;
  items: { to: string; label: string }[];
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const toggle = () => setCollapsed((c) => !c);

  const groups: Group[] = [
    {
      title: "Inicio",
      icon: <Layers className="w-4 h-4" />,
      items: [{ to: "/", label: "Dashboard" }],
    },
    {
      title: "Ciencias Sociales / Geografía",
      icon: <Globe className="w-4 h-4" />,
      items: [{ to: "/planeta-tierra", label: "Planeta Tierra" }],
    },
    {
      title: "Tecnología y Pensamiento Lógico",
      icon: <Blocks className="w-4 h-4" />,
      items: [{ to: "/construccion-bloques3D", label: "Construcción (Bloques)" }],
    },
    {
      title: "Ciencias Naturales",
      icon: <Rocket className="w-4 h-4" />,
      items: [{ to: "/sistema-solar", label: "Sistema Solar Interactivo" }],
    },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col h-screen border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-[width] duration-300 ${
        collapsed ? "w-14" : "w-[260px]"
      }`}
    >
      {/* Toggle */}
      <div className="h-14 flex items-center justify-between px-2 border-b border-slate-200 dark:border-slate-800">
        {!collapsed && (
          <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">Menú</span>
        )}
        <button
          onClick={toggle}
          aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-2 space-y-4">
        {groups.map((g) => (
          <div key={g.title} className="px-2">
            <div className="flex items-center gap-2 mb-1 text-xs font-medium tracking-wide uppercase text-slate-500 dark:text-slate-400">
              {g.icon}
              {!collapsed && <span>{g.title}</span>}
            </div>
            <div className="space-y-1">
              {g.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `group flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    } ${collapsed ? "justify-center" : ""}`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 group-hover:scale-110 transition-transform" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="p-2 text-[10px] text-slate-400 dark:text-slate-500 select-none">
        {collapsed ? "© 2025" : "© 2025 Aula Interactiva"}
      </div>
    </aside>
  );
}
