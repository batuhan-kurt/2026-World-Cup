"use client";

export function Header() {
  return (
    <header className="glass-panel border-t-0 border-l-0 border-r-0 rounded-none px-4 py-3 flex items-center justify-between">
      <div className="flex flex-col">
        <h1 className="font-display text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 leading-tight">
          WC 2026
        </h1>
        <p className="text-[10px] font-semibold text-gold-500 uppercase tracking-widest">
          Canlı Dashboard
        </p>
      </div>
      
      {/* İsteğe bağlı sağ üst ikon veya kullanıcı profili konulabilir */}
      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
        <span className="text-xs">⚽️</span>
      </div>
    </header>
  );
}
