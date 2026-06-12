"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { X, Trophy, MapPin, Calendar, Star, Users as UsersIcon } from "lucide-react";

export function TeamGrid({ teams }: { teams: any[] }) {
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);
  const [squad, setSquad] = useState<any[]>([]);
  const [isLoadingSquad, setIsLoadingSquad] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);

  const openTeamDetails = async (teamObj: any) => {
    setSelectedTeam(teamObj);
    setSelectedPlayer(null);
    setIsLoadingSquad(true);
    setSquad([]);
    
    try {
      const res = await fetch(`/api/squad?teamId=${teamObj.team.id}`);
      if (res.ok) {
        const data = await res.json();
        setSquad(data.squad || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingSquad(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {teams.map((t) => {
          return (
            <button
              key={t.team.id}
              onClick={() => openTeamDetails(t)}
              className="glass-card p-4 flex flex-col items-center gap-3 hover:scale-105 transition-transform cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-gold-500/50 transition-colors bg-white/5 p-2">
                <img 
                  src={t.team.logo} 
                  alt={t.team.name} 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-slate-200 group-hover:text-white transition-colors line-clamp-1">{t.team.name}</h3>
                <span className="text-xs text-slate-500 font-medium">{t.team.code}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Takım Detay Modalı */}
      {selectedTeam && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setSelectedTeam(null); setSelectedPlayer(null); }} />
          <div className="glass-panel relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[32px] p-0 flex flex-col md:flex-row shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-slide-up border border-white/10">
            
            {/* Sol Taraf - Takım Bilgisi */}
            <div className="md:w-1/3 bg-white/5 p-8 border-r border-white/10 flex flex-col items-center text-center">
              <button 
                onClick={() => { setSelectedTeam(null); setSelectedPlayer(null); }}
                className="absolute top-6 left-6 md:hidden w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 mb-6 shadow-2xl bg-white/5 p-4">
                <img 
                  src={selectedTeam.team.logo} 
                  alt={selectedTeam.team.name} 
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="font-display text-3xl font-black text-white mb-1">{selectedTeam.team.name}</h2>
              <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-slate-300 mb-8 border border-white/5">
                {selectedTeam.team.country}
              </span>

              <div className="w-full space-y-4 text-left">
                <div className="flex items-center gap-3 text-slate-300 bg-white/5 p-3 rounded-xl">
                  <Star className="w-5 h-5 text-gold-400" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Teknik Direktör</div>
                    <div className="font-semibold text-sm">{selectedTeam.team.coach || "Bilinmiyor"}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-300 bg-white/5 p-3 rounded-xl">
                  <MapPin className="w-5 h-5 text-red-400" />
                  <div className="overflow-hidden">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Kamp Merkezi</div>
                    <div className="font-semibold text-sm truncate" title={selectedTeam.venue.name || "Bilinmiyor"}>{selectedTeam.venue.name || "Bilinmiyor"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sağ Taraf - Kadro */}
            <div className="md:w-2/3 p-6 md:p-8 flex flex-col relative">
              <button 
                onClick={() => { setSelectedTeam(null); setSelectedPlayer(null); }}
                className="hidden md:flex absolute top-6 right-6 w-8 h-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-electric-400" />
                Takım Kadrosu
              </h3>
              
              <div className="flex-1 overflow-y-auto pr-2 pb-8 space-y-6 custom-scrollbar">
                {isLoadingSquad ? (
                  <div className="flex items-center justify-center h-48 text-slate-400">
                    <div className="w-6 h-6 border-2 border-electric-500 border-t-transparent rounded-full animate-spin mr-3" />
                    Kadro bilgileri Sofascore ağından çekiliyor...
                  </div>
                ) : squad.length === 0 ? (
                  <div className="text-center text-slate-500 py-12">
                    Bu takımın güncel turnuva kadrosu henüz açıklanmadı veya sistemde yok.
                  </div>
                ) : (
                  ["Goalkeeper", "Defender", "Midfielder", "Attacker"].map((pos) => {
                    const posPlayers = squad.filter(p => p.position === pos);
                    if (posPlayers.length === 0) return null;
                    
                    const posTr = pos === "Goalkeeper" ? "Kaleci" : pos === "Defender" ? "Defans" : pos === "Midfielder" ? "Orta Saha" : "Forvet";

                    return (
                      <div key={pos}>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">{posTr}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {posPlayers.map(player => (
                            <div 
                              key={player.id}
                              onClick={() => setSelectedPlayer(player === selectedPlayer ? null : player)}
                              className={cn(
                                "p-3 rounded-xl border border-transparent transition-all cursor-pointer group flex flex-col justify-center",
                                selectedPlayer?.id === player.id 
                                  ? "bg-gradient-to-br from-electric-500/20 to-electric-900/40 border-electric-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]" 
                                  : "bg-white/5 hover:bg-white/10 hover:border-white/10"
                              )}
                            >
                              <div className="flex items-center gap-3 w-full">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 shrink-0 border border-white/5 group-hover:border-electric-400/50 transition-colors">
                                  <img src={player.photo} alt={player.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 overflow-hidden flex flex-col justify-center">
                                  <div className="font-bold text-sm text-slate-200 group-hover:text-white truncate w-full">{player.name}</div>
                                  <div className="text-[11px] text-slate-400 font-medium truncate flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500/50"></span>
                                    {player.club}
                                  </div>
                                </div>
                                {selectedPlayer?.id !== player.id && (
                                  <div className="text-xl font-black text-white/10 group-hover:text-white/20 transition-colors pr-2">
                                    {player.number}
                                  </div>
                                )}
                              </div>
                              
                              {/* Modern Expanded Details */}
                              {selectedPlayer?.id === player.id && (
                                <div className="mt-4 pt-3 border-t border-electric-500/20 flex items-center justify-around animate-slide-up">
                                  <div className="flex flex-col items-center">
                                    <span className="text-[10px] text-electric-300/70 uppercase tracking-widest font-bold">Forma No</span>
                                    <span className="text-2xl font-black text-electric-400 font-display">{player.number || "?"}</span>
                                  </div>
                                  <div className="h-8 w-px bg-electric-500/20"></div>
                                  <div className="flex flex-col items-center">
                                    <span className="text-[10px] text-electric-300/70 uppercase tracking-widest font-bold">Yaş</span>
                                    <span className="text-2xl font-black text-white font-display">{player.age !== "?" ? player.age : "-"}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
