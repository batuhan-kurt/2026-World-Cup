"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Menu, X, Home, Heart, Trophy, BarChart3, Target, 
  BookOpen, Gamepad2, Users, Dices
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Genel Bakış", href: "/", icon: Home, color: "text-electric-400" },
  { name: "Favori Takım", href: "/favoriler", icon: Heart, color: "text-rose-400" },
  { name: "Puan Durumu", href: "/gruplar", icon: Trophy, color: "text-gold-400" },
  { name: "Simülasyon", href: "/simulasyon", icon: Gamepad2, color: "text-purple-400" },
  { name: "Tahminler", href: "/tahminler", icon: Dices, color: "text-emerald-400" },
  { name: "Piyasa Değerleri", href: "/bilgiler", icon: BookOpen, color: "text-sky-400" },
  { name: "İstatistikler", href: "/istatistikler", icon: BarChart3, color: "text-orange-400" },
  { name: "Kadrolar", href: "/takimlar", icon: Users, color: "text-indigo-400" },
  { name: "Katılan Takımlar", href: "/katilan-takimlar", icon: Trophy, color: "text-teal-400" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="glass-panel border-t-0 border-l-0 border-r-0 rounded-none px-4 py-3 flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="font-display text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 leading-tight">
            WC 2026
          </h1>
          <p className="text-[10px] font-semibold text-gold-500 uppercase tracking-widest">
            Canlı Dashboard
          </p>
        </div>
        
        {/* Hamburger Button */}
        <button
          onClick={() => setOpen(true)}
          className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all"
          aria-label="Menüyü Aç"
        >
          <Menu className="w-5 h-5 text-slate-300" />
        </button>
      </header>

      {/* Drawer Overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          {/* Drawer Panel */}
          <div
            className="absolute top-0 right-0 h-full w-72 bg-[#080B14] border-l border-white/10 flex flex-col shadow-2xl animate-slide-in-right"
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div>
                <div className="font-display text-lg font-black text-white">WC 2026</div>
                <div className="text-[10px] font-bold text-gold-500 uppercase tracking-widest">Canlı Dashboard</div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all",
                      isActive
                        ? "bg-electric-500/20 text-white border border-electric-500/30"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
                    )}
                  >
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", isActive ? "bg-electric-500/30" : "bg-white/5")}>
                      <Icon className={cn("w-4 h-4", isActive ? "text-electric-400" : item.color)} />
                    </div>
                    {item.name}
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-electric-400" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-white/10">
              <p className="text-[10px] text-slate-600 text-center">FIFA 2026 • Kuzey Amerika</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
