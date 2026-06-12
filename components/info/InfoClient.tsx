"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Users, Euro, Activity, Shield, MapPin, ChevronLeft, ChevronRight, Trophy, Flag } from "lucide-react";

export function InfoClient({ teams, players }: { teams: any[], players: any[] }) {
  const [activeTab, setActiveTab] = useState<"teams" | "players">("teams");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const playersPerPage = 25;
  const totalPages = Math.ceil(players.length / playersPerPage);
  
  const currentPlayers = players.slice(
    (currentPage - 1) * playersPerPage, 
    currentPage * playersPerPage
  );

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display text-3xl font-black text-white">Turnuva Bilgileri</h2>
          <p className="text-sm text-slate-400 mt-1">En Değerli Milli Takımlar ve Kadrolar</p>
        </div>
      </div>
      
      <div className="flex border-b border-white/5 bg-black/20 rounded-t-2xl overflow-hidden">
        <button 
          className={cn("flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2", activeTab === "teams" ? "text-electric-400 border-b-2 border-electric-400 bg-electric-500/10" : "text-slate-500 hover:text-slate-300 hover:bg-white/5")}
          onClick={() => setActiveTab("teams")}
        >
          <Shield className="w-4 h-4" /> En Değerli Takımlar
        </button>
        <button 
          className={cn("flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2", activeTab === "players" ? "text-electric-400 border-b-2 border-electric-400 bg-electric-500/10" : "text-slate-500 hover:text-slate-300 hover:bg-white/5")}
          onClick={() => { setActiveTab("players"); setCurrentPage(1); }}
        >
          <Users className="w-4 h-4" /> En Değerli Oyuncular
        </button>
      </div>

      {activeTab === "teams" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {teams.map((team, idx) => (
            <div key={idx} className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">
                 <img src={team.logo} className="w-24 h-24 object-contain grayscale" alt={team.name} />
              </div>
              <div className="flex justify-between items-start">
                <h3 className="text-2xl font-black text-white font-display flex items-center gap-3 relative z-10">
                  <span className="text-electric-500 text-sm">{idx + 1}.</span> {team.name}
                </h3>
              </div>
              <div className="space-y-3 relative z-10 mt-2">
                 <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2"><Euro className="w-3.5 h-3.5 text-emerald-400"/> Toplam Değer</span>
                    <span className="text-lg font-black text-emerald-400">{team.total_value}</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-white/5 pb-2 px-1">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-2"><Users className="w-3.5 h-3.5"/> Kadro</span>
                    <span className="text-sm font-bold text-slate-300">{team.squad_size} Oyuncu</span>
                 </div>
                 <div className="flex justify-between items-center px-1">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-2"><Activity className="w-3.5 h-3.5"/> Yaş Ort.</span>
                    <span className="text-sm font-bold text-slate-300">{team.avg_age}</span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "players" && (
        <div className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentPlayers.map((player, idx) => {
              const globalRank = (currentPage - 1) * playersPerPage + idx + 1;
              return (
                <div key={idx} className="glass-panel p-0 relative overflow-hidden group hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all">
                  <div className="h-20 bg-gradient-to-r from-electric-900/50 to-transparent relative border-b border-white/5">
                    <div className="absolute top-3 left-4 text-3xl font-black text-white/10 font-display italic">#{globalRank}</div>
                    <div className="absolute bottom-0 right-4 translate-y-1/3 w-20 h-20 rounded-full bg-gradient-to-br from-electric-600 to-indigo-600 flex items-center justify-center text-white font-black opacity-50 group-hover:opacity-100 transition-opacity border-4 border-black/20">
                       {player.name.substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <div className="p-5 pt-3">
                    <h4 className="text-lg font-bold text-white mb-1 truncate" title={player.name}>{player.name}</h4>
                    <p className="text-xs font-bold text-electric-400 mb-4 uppercase tracking-widest truncate" title={player.position}>{player.position}</p>
                    
                    <div className="space-y-2">
                       <div className="flex justify-between items-center text-sm gap-2">
                          <span className="text-slate-500 shrink-0">Ülke</span>
                          <span className="font-semibold text-slate-200 truncate" title={player.country}>{player.country}</span>
                       </div>
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500 shrink-0">Kulüp</span>
                          <span className="font-semibold text-slate-200 flex items-center gap-1 truncate max-w-[140px]" title={player.club}>
                             <Shield className="w-3 h-3 text-slate-400 shrink-0" /> 
                             <span className="truncate">{player.club}</span>
                          </span>
                       </div>
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500">Yaş</span>
                          <span className="font-semibold text-slate-200">{player.age}</span>
                       </div>
                    </div>
                  </div>
                  <div className="bg-emerald-500/10 border-t border-emerald-500/20 p-4 flex justify-between items-center">
                    <span className="text-xs font-bold text-emerald-500/50 uppercase tracking-widest">Piyasa Değeri</span>
                    <span className="font-black text-emerald-400 text-lg">{player.value}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
             <span className="text-sm text-slate-400">
               Toplam <strong className="text-white">{players.length}</strong> oyuncudan <strong className="text-white">{(currentPage - 1) * playersPerPage + 1}-{Math.min(currentPage * playersPerPage, players.length)}</strong> arası gösteriliyor.
             </span>
             <div className="flex items-center gap-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-electric-500/20 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="text-sm font-bold text-white px-4">Sayfa {currentPage} / {totalPages}</div>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-electric-500/20 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
