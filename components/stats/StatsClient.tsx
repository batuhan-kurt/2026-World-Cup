"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Goal, Target, ShieldAlert, BarChart3, TrendingUp, Users, Shield, Square } from "lucide-react";
import { WC_2026_CONFIG } from "@/lib/wc2026-config";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function StatsClient() {
  const [activeTab, setActiveTab] = useState<"players" | "teams">("players");
  const { data: statsData } = useSWR("/api/tournament-stats", fetcher, { refreshInterval: 60000 });

  const getTurkishName = (name: string) => {
    if (!name) return "";
    const team = WC_2026_CONFIG.teams.find(t => t.name.toLowerCase() === name.toLowerCase());
    return team ? team.turkishName : name;
  };

  return (
    <div className="space-y-8 animate-slide-up pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="font-display text-3xl font-black text-white">İstatistikler</h2>
          <p className="text-sm text-slate-400 mt-1">2026 Dünya Kupası'nın öne çıkan rakamları ve rekorları.</p>
        </div>
      </div>
      
      {/* Genel Bakış İstatistikleri */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div className="glass-panel p-4 flex flex-col gap-2 items-center text-center justify-center border-dashed border-white/20">
            <TrendingUp className="w-6 h-6 text-slate-500 mb-1" />
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Oynanan Maç</span>
            <span className="text-2xl font-black text-white">
              {statsData ? `${statsData.totalMatches} / 104` : <span className="animate-pulse text-white/30">...</span>}
            </span>
         </div>
         <div className="glass-panel p-4 flex flex-col gap-2 items-center text-center justify-center border-dashed border-white/20">
            <Goal className="w-6 h-6 text-slate-500 mb-1" />
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Toplam Gol</span>
            <span className="text-2xl font-black text-white">
              {statsData ? statsData.totalGoals : <span className="animate-pulse text-white/30">...</span>}
            </span>
         </div>
         <div className="glass-panel p-4 flex flex-col gap-2 items-center text-center justify-center border-dashed border-white/20">
            <Square fill="currentColor" className="w-6 h-6 text-yellow-500 mb-1" />
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Sarı Kart</span>
            <span className="text-2xl font-black text-yellow-500">
              {statsData ? statsData.totalYellowCards : <span className="animate-pulse text-yellow-500/30">...</span>}
            </span>
         </div>
         <div className="glass-panel p-4 flex flex-col gap-2 items-center text-center justify-center border-dashed border-white/20">
            <Square fill="currentColor" className="w-6 h-6 text-red-500 mb-1" />
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Kırmızı Kart</span>
            <span className="text-2xl font-black text-red-500">
              {statsData ? statsData.totalRedCards : <span className="animate-pulse text-red-500/30">...</span>}
            </span>
         </div>
      </div>

      <div className="flex border-b border-white/5 bg-black/20 rounded-t-2xl overflow-hidden mt-8">
        <button 
          className={cn("flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2", activeTab === "players" ? "text-electric-400 border-b-2 border-electric-400 bg-electric-500/10" : "text-slate-500 hover:text-slate-300 hover:bg-white/5")}
          onClick={() => setActiveTab("players")}
        >
          <Users className="w-4 h-4" /> Oyuncu İstatistikleri
        </button>
        <button 
          className={cn("flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2", activeTab === "teams" ? "text-electric-400 border-b-2 border-electric-400 bg-electric-500/10" : "text-slate-500 hover:text-slate-300 hover:bg-white/5")}
          onClick={() => setActiveTab("teams")}
        >
          <Shield className="w-4 h-4" /> Takım İstatistikleri
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
         {activeTab === "players" ? (
           <>
             {/* Gol Krallığı Placeholder */}
             <div className="glass-panel p-6 border border-white/10 relative overflow-hidden group">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                   <span className="w-1.5 h-6 rounded-full bg-blue-500" /> Gol Krallığı
                </h3>
                
                {statsData && statsData.topScorers && statsData.topScorers.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {statsData.topScorers.map((scorer: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-slate-500 w-4">{idx + 1}.</span>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white">{scorer.name}</span>
                            <span className="text-[10px] text-slate-400">{scorer.team}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-lg">
                          <Goal className="w-4 h-4 text-blue-400" />
                          <span className="font-bold text-blue-400">{scorer.goals}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-black/30 border border-white/5 border-dashed rounded-xl p-8 flex flex-col items-center text-center gap-3">
                     <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-slate-500" />
                     </div>
                     <div className="font-bold text-slate-300">Henüz Açıklanmadı</div>
                     <p className="text-xs text-slate-500 max-w-xs">Turnuva başladığında gol krallığı yarışı burada anlık olarak güncellenecektir.</p>
                  </div>
                )}
             </div>

             {/* Asist Krallığı */}
             <div className="glass-panel p-6 border border-white/10 relative overflow-hidden group">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                   <span className="w-1.5 h-6 rounded-full bg-emerald-500" /> Asist Krallığı
                </h3>
                
                {statsData && statsData.topAssisters && statsData.topAssisters.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {statsData.topAssisters.map((assister: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-slate-500 w-4">{idx + 1}.</span>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white">{assister.name}</span>
                            <span className="text-[10px] text-slate-400">{assister.team}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 rounded-lg">
                          <Target className="w-4 h-4 text-emerald-400" />
                          <span className="font-bold text-emerald-400">{assister.assists}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-black/30 border border-white/5 border-dashed rounded-xl p-8 flex flex-col items-center text-center gap-3">
                     <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-slate-500" />
                     </div>
                     <div className="font-bold text-slate-300">Henüz Açıklanmadı</div>
                     <p className="text-xs text-slate-500 max-w-xs">Turnuva başladığında asist liderleri tablosu burada görüntülenecektir.</p>
                  </div>
                )}
             </div>

             {/* En İyi Maç Reytingi Placeholder */}
             <div className="glass-panel p-6 border border-white/10 relative overflow-hidden group">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                   <span className="w-1.5 h-6 rounded-full bg-purple-500" /> En İyi Maç Reytingi
                </h3>
                
                <div className="bg-black/30 border border-white/5 border-dashed rounded-xl p-8 flex flex-col items-center text-center gap-3">
                   <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-slate-500" />
                   </div>
                   <div className="font-bold text-slate-300">Henüz Açıklanmadı</div>
                   <p className="text-xs text-slate-500 max-w-xs">Maçlarda en yüksek ortalama reytinge ulaşan oyuncular listelenecektir.</p>
                </div>
             </div>

             {/* En Çok Kalesini Gole Kapatan Kaleciler Placeholder */}
             <div className="glass-panel p-6 border border-white/10 relative overflow-hidden group">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                   <span className="w-1.5 h-6 rounded-full bg-slate-300" /> En Çok Kalesini Gole Kapatanlar
                </h3>
                
                <div className="bg-black/30 border border-white/5 border-dashed rounded-xl p-8 flex flex-col items-center text-center gap-3">
                   <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                      <Goal className="w-6 h-6 text-slate-500" />
                   </div>
                   <div className="font-bold text-slate-300">Henüz Açıklanmadı</div>
                   <p className="text-xs text-slate-500 max-w-xs">Gol yemeyen kaleciler (Clean Sheet) maçlar oynandıkça sıralanacaktır.</p>
                </div>
             </div>

             {/* En Çok Sarı Kart Gören Oyuncular */}
             <div className="glass-panel p-6 border border-white/10 relative overflow-hidden group">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                   <span className="w-1.5 h-6 rounded-full bg-yellow-400" /> En Çok Sarı Kart Görenler
                </h3>
                <div className="bg-black/30 border border-white/5 border-dashed rounded-xl p-8 flex flex-col items-center text-center gap-3">
                   <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-2">
                      <div className="w-4 h-6 bg-yellow-400 rounded-sm shadow-md border border-yellow-500" />
                   </div>
                   <div className="font-bold text-slate-300">Henüz Açıklanmadı</div>
                   <p className="text-xs text-slate-500 max-w-xs">En çok sarı kart gören oyuncular.</p>
                </div>
             </div>

             {/* En Çok Kırmızı Kart Gören Oyuncular */}
             <div className="glass-panel p-6 border border-white/10 relative overflow-hidden group">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                   <span className="w-1.5 h-6 rounded-full bg-red-600" /> En Çok Kırmızı Kart Görenler
                </h3>
                <div className="bg-black/30 border border-white/5 border-dashed rounded-xl p-8 flex flex-col items-center text-center gap-3">
                   <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-2">
                      <div className="w-4 h-6 bg-red-600 rounded-sm shadow-md border border-red-700" />
                   </div>
                   <div className="font-bold text-slate-300">Henüz Açıklanmadı</div>
                   <p className="text-xs text-slate-500 max-w-xs">En çok kırmızı kart gören oyuncular.</p>
                </div>
             </div>
           </>
         ) : (
           <>
             {/* En Çok Gol Atan Takım */}
             <div className="glass-panel p-6 border border-white/10 relative overflow-hidden group">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                   <span className="w-1.5 h-6 rounded-full bg-electric-500" /> En Çok Gol Atan Takımlar
                </h3>
                
                {statsData && statsData.topScoringTeams && statsData.topScoringTeams.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {statsData.topScoringTeams.map((team: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-slate-500 w-4">{idx + 1}.</span>
                          <span className="text-sm font-bold text-white">{getTurkishName(team.name)}</span>
                        </div>
                        <div className="flex flex-col items-end">
                           <div className="flex items-center gap-2 px-3 py-1 bg-electric-500/20 rounded-lg">
                             <div className="w-4 h-4 text-xs flex items-center justify-center">⚽</div>
                             <span className="font-bold text-electric-400">{team.scored}</span>
                           </div>
                           <span className="mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">{team.played} Maç</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-black/30 border border-white/5 border-dashed rounded-xl p-8 flex flex-col items-center text-center gap-3">
                     <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-slate-500" />
                     </div>
                     <div className="font-bold text-slate-300">Henüz Açıklanmadı</div>
                     <p className="text-xs text-slate-500 max-w-xs">Hücum gücü en yüksek takımlar maçlar oynandıkça listelenecektir.</p>
                  </div>
                )}
             </div>

             {/* En Az Gol Yiyen Takım */}
             <div className="glass-panel p-6 border border-white/10 relative overflow-hidden group">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                   <span className="w-1.5 h-6 rounded-full bg-emerald-500" /> En Az Gol Yiyen Takımlar
                </h3>
                
                {statsData && statsData.bestDefendingTeams && statsData.bestDefendingTeams.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {statsData.bestDefendingTeams.map((team: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-slate-500 w-4">{idx + 1}.</span>
                          <span className="text-sm font-bold text-white">{getTurkishName(team.name)}</span>
                        </div>
                        <div className="flex flex-col items-end">
                           <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 rounded-lg">
                             <Goal className="w-4 h-4 text-emerald-400" />
                             <span className="font-bold text-emerald-400">{team.conceded}</span>
                           </div>
                           <span className="mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">{team.played} Maç</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-black/30 border border-white/5 border-dashed rounded-xl p-8 flex flex-col items-center text-center gap-3">
                     <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-2">
                        <Goal className="w-6 h-6 text-slate-500" />
                        <span className="sr-only">Savunma İstatistikleri</span>
                     </div>
                     <div className="font-bold text-slate-300">Henüz Açıklanmadı</div>
                     <p className="text-xs text-slate-500 max-w-xs">En iyi savunma yapan ve en az gol yiyen takımlar maçlar oynandıkça listelenecektir.</p>
                  </div>
                )}
             </div>

             {/* En Çok Sarı Kart Gören Takımlar */}
             <div className="glass-panel p-6 border border-white/10 relative overflow-hidden group">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                   <span className="w-1.5 h-6 rounded-full bg-yellow-400" /> En Çok Sarı Kart Gören Takımlar
                </h3>
                <div className="bg-black/30 border border-white/5 border-dashed rounded-xl p-8 flex flex-col items-center text-center gap-3">
                   <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-2">
                      <div className="w-4 h-6 bg-yellow-400 rounded-sm shadow-md border border-yellow-500" />
                   </div>
                   <div className="font-bold text-slate-300">Henüz Açıklanmadı</div>
                   <p className="text-xs text-slate-500 max-w-xs">Turnuvada en çok sarı kart gören takımlar listelenecektir.</p>
                </div>
             </div>

             {/* En Çok Kırmızı Kart Gören Takımlar */}
             <div className="glass-panel p-6 border border-white/10 relative overflow-hidden group">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                   <span className="w-1.5 h-6 rounded-full bg-red-600" /> En Çok Kırmızı Kart Gören Takımlar
                </h3>
                <div className="bg-black/30 border border-white/5 border-dashed rounded-xl p-8 flex flex-col items-center text-center gap-3">
                   <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-2">
                      <div className="w-4 h-6 bg-red-600 rounded-sm shadow-md border border-red-700" />
                   </div>
                   <div className="font-bold text-slate-300">Henüz Açıklanmadı</div>
                   <p className="text-xs text-slate-500 max-w-xs">Turnuvada en çok kırmızı kart gören takımlar listelenecektir.</p>
                </div>
             </div>
           </>
         )}
      </div>
    </div>
  );
}
