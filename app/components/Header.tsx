import React from "react";
import { Book } from "lucide-react";

const Header: React.FC = () => {
  return (
    <header className="h-20 flex items-center justify-between px-8 bg-zeo-bg border-b border-zeo-border/50 shrink-0">
      <div className="flex items-center">
        <div className="p-2.5 bg-cyan-500/10 rounded-xl mr-4 border border-cyan-500/20">
          <Book className="text-cyan-400" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">E-Book Generator</h2>
          <p className="text-sm text-zeo-muted">
            Buat konten buku profesional dengan bantuan AI Gemini Pro
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
