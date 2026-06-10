import React, { useState } from "react";
import {
  BookOpen,
  LogOut,
  Code,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  activePage: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`${isCollapsed ? "w-20" : "w-64"} h-full flex flex-col bg-zeo-bg border-r border-zeo-border/50 shrink-0 transition-all duration-300 ease-in-out relative`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-zeo-card border border-zeo-border p-1 rounded-full text-gray-400 hover:text-white hover:border-cyan-500 transition-colors shadow-lg z-50"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Logo Area */}
      <div
        className={`h-16 flex items-center ${isCollapsed ? "justify-center" : "px-6"} border-b border-zeo-border/30 overflow-hidden whitespace-nowrap`}
      >
        <div className="w-8 h-8 min-w-[32px] rounded-lg bg-gradient-to-br from-zeo-secondary to-zeo-primary flex items-center justify-center shadow-lg shadow-purple-500/20">
          <span className="text-white font-bold text-xl">E</span>
        </div>

        <h1
          className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 ml-3 transition-opacity duration-300 ${isCollapsed ? "opacity-0 w-0" : "opacity-100"}`}
        >
          EzBook
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-6 overflow-x-hidden">
        <ul className="space-y-1">
          <li>
            <button
              title="E-Book"
              className={`w-full flex items-center ${isCollapsed ? "justify-center px-0" : "px-3"} py-2.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 transition-all hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]`}
            >
              <BookOpen size={18} className={isCollapsed ? "" : "mr-3"} />

              <span
                className={`font-medium transition-opacity duration-300 whitespace-nowrap ${isCollapsed ? "hidden" : "block"}`}
              >
                E-Book
              </span>

              {!isCollapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
              )}
            </button>
          </li>
        </ul>
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-zeo-border/30">
        <button
          className={`flex items-center ${isCollapsed ? "justify-center" : "px-3"} py-2 text-red-400 hover:text-red-300 transition-colors w-full rounded-lg hover:bg-red-500/5`}
        >
          <LogOut size={18} className={isCollapsed ? "" : "mr-3"} />
          {!isCollapsed && <span>Keluar</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
