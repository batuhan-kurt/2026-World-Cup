"use client";

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
  Heart
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Genel", href: "/", icon: Home },
  { name: "Favori", href: "/favoriler", icon: Heart },
  { name: "Puan Dur.", href: "/gruplar", icon: Trophy },
  { name: "Simüle", href: "/simulasyon", icon: Gamepad2 },
  { name: "Tahmin", href: "/tahminler", icon: Dices },
  { name: "Piyasa Değ.", href: "/bilgiler", icon: BookOpen },
  { name: "İstat", href: "/istatistikler", icon: BarChart3 },
  { name: "Kadrolar", href: "/takimlar", icon: Users },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="glass-panel border-t border-l-0 border-r-0 border-b-0 rounded-none px-2 py-2 pb-safe w-full">
      <nav className="flex items-center justify-between">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full py-2 gap-1 rounded-xl transition-all",
                isActive 
                  ? "text-electric-400" 
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-lg transition-all",
                isActive && "bg-electric-500/20"
              )}>
                <Icon className={cn("w-5 h-5", isActive && "fill-electric-500/20")} />
              </div>
              <span className={cn(
                "text-[10px] font-medium",
                isActive ? "text-electric-400" : "text-slate-500"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
