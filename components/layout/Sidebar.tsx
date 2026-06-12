"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Users, 
  Trophy, 
  BarChart3, 
  Target,
  Dices,
  BookOpen,
  Gamepad2,
  Heart,
  RefreshCcw,
  CheckCircle2
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Genel Bakış", href: "/", icon: Home },
  { name: "Favori Takım", href: "/favoriler", icon: Heart },
  { name: "Kadrolar", href: "/takimlar", icon: Users },
  { name: "Katılan Takımlar", href: "/katilan-takimlar", icon: Target },
  { name: "Puan Durumu", href: "/gruplar", icon: Trophy },
  { name: "Simülasyon", href: "/simulasyon", icon: Gamepad2 },
  { name: "Tahminler", href: "/tahminler", icon: Dices },
  { name: "Piyasa Değerleri", href: "/bilgiler", icon: BookOpen },
  { name: "İstatistikler", href: "/istatistikler", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const [clearing, setClearing] = useState(false);
  const [cleared, setCleared] = useState(false);

  const handleClearCache = async () => {
    setClearing(true);
    try {
      const res = await fetch("/api/admin/cache-clear", { method: "POST" });
      if (res.ok) {
        setCleared(true);
        setTimeout(() => setCleared(false), 2000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="glass-panel h-full w-full flex flex-col p-6 rounded-none border-t-0 border-b-0 border-l-0">
      {/* Logo Alanı */}
      <div className="flex flex-col gap-1 mb-10 mt-2">
        <h1 className="font-display text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 leading-none">
          WC 2026
        </h1>
        <p className="text-xs font-semibold text-gold-500 uppercase tracking-widest">
          Canlı Dashboard
        </p>
      </div>

      {/* Navigasyon */}
      <nav className="flex-1 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                isActive
                  ? "bg-electric-500/10 text-electric-400 border border-electric-500/20"
                  : "text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-electric-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
              )}
              <Icon 
                className={cn(
                  "w-5 h-5 transition-transform duration-300", 
                  isActive ? "scale-110" : "group-hover:scale-110"
                )} 
              />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Alt Bilgi */}
      <div className="mt-auto pt-6 flex flex-col gap-4">
        {/* Cache Clear Button */}
        <div className="relative p-5 rounded-2xl bg-gradient-to-br from-electric-600/20 via-electric-500/10 to-transparent border border-electric-500/20 overflow-hidden group hover:border-electric-500/40 transition-colors">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-electric-500/20 rounded-full blur-2xl group-hover:bg-electric-500/30 transition-colors" />
          <div className="absolute top-0 right-0 p-3 opacity-20">
            <Trophy className="w-16 h-16 text-electric-400 group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-electric-400 animate-pulse" />
              <span className="text-[10px] font-black text-electric-400 uppercase tracking-widest">Kuzey Amerika</span>
            </div>
            <h4 className="font-display font-black text-xl text-white mb-1">FIFA 2026</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed max-w-[150px]">
              ABD, Meksika ve Kanada'nın ev sahipliğinde tarihi turnuva.
            </p>
          </div>
        </div>

        <button 
          onClick={handleClearCache}
          disabled={clearing || cleared}
          className={cn(
            "flex items-center justify-center gap-2 py-2.5 rounded-lg border text-[11px] font-bold uppercase tracking-widest transition-all w-full",
            cleared 
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
              : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white"
          )}
        >
          {cleared ? (
            <><CheckCircle2 className="w-3.5 h-3.5" /> Temizlendi</>
          ) : (
            <><RefreshCcw className={cn("w-3.5 h-3.5", clearing && "animate-spin")} /> {clearing ? "Temizleniyor..." : "Önbelleği Temizle"}</>
          )}
        </button>
      </div>
    </div>
  );
}
