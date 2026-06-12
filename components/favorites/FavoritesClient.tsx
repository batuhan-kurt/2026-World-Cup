"use client";

import { useState, useEffect, useMemo } from "react";
import { Heart, Calendar, Shield, MapPin, Flag, User, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import useSWR from "swr";
import { mergeFixtures } from "@/lib/api-merger";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function FavoritesClient({ teams, players, fixtures, groups }: { teams: any[], players: any[], fixtures: any[], groups: any }) {
  const [favoriteTeam, setFavoriteTeam] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { data: fixturesData } = useSWR("/api/fixtures", fetcher, { refreshInterval: 60000 });

  useEffect(() => {
    const saved = localStorage.getItem("favoriteTeam");
    if (saved) setFavoriteTeam(saved);
    setIsLoading(false);
  }, []);

  const teamData = useMemo(() => {
    if (!favoriteTeam) return null;
    return teams.find(t => t.name === favoriteTeam) || { name: favoriteTeam, logo: `https://ui-avatars.com/api/?name=${favoriteTeam}&background=1e293b&color=fff` };
  }, [favoriteTeam, teams]);

  const teamPlayers = useMemo(() => {
    if (!favoriteTeam || !teamData.englishName) return [];
    
    let targetCountry = teamData.englishName;
    if (targetCountry === "Turkey") targetCountry = "Turkiye";
    if (targetCountry === "USA") targetCountry = "United States";
    if (targetCountry === "DR Congo") targetCountry = "Democratic Republic of the Congo";

    return players.filter(p => p.country === targetCountry);
  }, [favoriteTeam, players, teamData]);

  const displayFixtures = useMemo(() => {
    const staticTeamFixtures = fixtures.filter(f => f.team1 === favoriteTeam || f.team2 === favoriteTeam);
    return mergeFixtures(staticTeamFixtures, fixturesData?.fixtures || []);
  }, [favoriteTeam, fixtures, fixturesData]);

  if (isLoading) {
    return <div className="animate-pulse h-96 bg-white/5 rounded-2xl w-full"></div>;
  }

  if (!favoriteTeam || !teamData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-slide-up">
         <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,255,255,0.05)] border border-white/10">
            <Heart className="w-12 h-12 text-slate-500" />
         </div>
         <h2 className="text-2xl font-black font-display text-white mb-2">Henüz Bir Favori Takım Seçmediniz</h2>
         <p className="text-slate-400 max-w-md">Genel Bakış sayfasından veya üstteki menüden bir takım seçerek, sadece ona özel maç takvimini ve istatistikleri burada görebilirsiniz.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up pb-20">
      {/* Header */}
      <div className="glass-panel p-4 md:p-8 rounded-3xl border border-electric-500/30 relative overflow-hidden flex flex-col md:flex-row items-center gap-4 md:gap-8 group">
         
         <div className="w-20 h-20 md:w-32 md:h-32 shrink-0 relative z-10 p-2 bg-white/5 rounded-full border-4 border-electric-500/20 shadow-[0_0_50px_rgba(37,99,235,0.2)]">
            <img src={teamData.logo} className="w-full h-full object-cover rounded-full" />
         </div>
         
         <div className="relative z-10 flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
               <Heart className="w-5 h-5 text-electric-500 fill-electric-500" />
               <span className="text-sm font-bold text-electric-400 uppercase tracking-widest">Favori Takımınız</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white font-display mb-4">{teamData.name}</h1>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
               {teamData.group && (
                  <span className="bg-white/10 px-4 py-2 rounded-lg text-sm font-bold text-white flex items-center gap-2">
                     <Flag className="w-4 h-4 text-electric-400" /> {teamData.group}
                  </span>
               )}
               {teamData.coach && (
                  <span className="bg-white/10 px-4 py-2 rounded-lg text-sm font-bold text-white flex items-center gap-2">
                     <User className="w-4 h-4 text-slate-400" /> {teamData.coach}
                  </span>
               )}
               {teamData.camp && (
                  <span className="bg-white/10 px-4 py-2 rounded-lg text-sm font-bold text-white flex items-center gap-2 line-clamp-1">
                     <MapPin className="w-4 h-4 text-red-400" /> {teamData.camp}
                  </span>
               )}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Fikstür */}
         <div className="lg:col-span-2 space-y-4">
            <h3 className="font-display text-2xl font-bold flex items-center gap-2">
               <span className="w-1.5 h-6 rounded-full bg-electric-500" /> Maç Takvimi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {displayFixtures.length > 0 ? displayFixtures.map((f, i) => (
                  <div key={i} className="glass-panel p-4 rounded-xl border border-white/5 relative overflow-hidden group hover:border-electric-500/30 transition-colors">
                     <div className="flex justify-between items-center mb-4 text-xs font-bold text-slate-400 bg-white/5 p-2 rounded-lg">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {f.date}</span>
                        <div className="flex items-center">
                          {f.status === "FT" ? (
                            <span className="text-slate-500 font-bold">MS (Tamamlandı)</span>
                          ) : ["LIVE", "1H", "2H", "HT", "ET", "P"].includes(f.status || "") ? (
                            <span className="text-red-500 font-bold animate-pulse flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> CANLI {f.elapsed ? `${f.elapsed}'` : ''}
                            </span>
                          ) : (f.status && f.status.startsWith("⏱")) ? (
                            <span className="text-yellow-400 font-bold flex items-center gap-1">
                               {f.status}
                            </span>
                          ) : (
                            <span>{f.time} TSİ</span>
                          )}
                        </div>
                     </div>
                     <div className="flex items-center justify-between px-2">
                        <div className="flex flex-col items-center gap-2 w-1/3">
                           <img src={f.team1Logo} className="w-10 h-10 object-cover rounded-full shadow-lg bg-white/5 p-0.5" />
                           <span className={cn("text-sm font-bold text-center line-clamp-1", f.team1 === favoriteTeam ? "text-electric-400" : "text-white")}>{f.team1}</span>
                        </div>
                        
                        <div className="w-1/3 flex flex-col items-center justify-center">
                           <div className={cn("inline-block px-3 py-1 rounded-lg font-black text-xl shadow-inner whitespace-nowrap", ["LIVE", "1H", "2H", "HT", "ET", "P"].includes(f.status || "") ? "bg-red-500/10 border border-red-500/30 text-red-500 animate-pulse" : f.score ? "bg-white/10 border border-white/5 text-white" : "text-slate-600 bg-black/30")}>
                             {f.score || "VS"}
                           </div>
                           {f.referee && (
                             <div className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-full border border-white/10 mx-auto w-fit">
                               <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M12 10a4 4 0 1 1-4-4h8" /><path d="M16 6v4" /><path d="M8 2h8" /></svg>
                               {f.referee.split(" ").slice(-1)[0]}
                             </div>
                           )}
                        </div>

                        <div className="flex flex-col items-center gap-2 w-1/3">
                           <img src={f.team2Logo} className="w-10 h-10 object-cover rounded-full shadow-lg bg-white/5 p-0.5" />
                           <span className={cn("text-sm font-bold text-center line-clamp-1", f.team2 === favoriteTeam ? "text-electric-400" : "text-white")}>{f.team2}</span>
                        </div>
                     </div>
                     <div className="mt-4 pt-3 border-t border-white/5 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1">
                        <MapPin className="w-3 h-3" /> {f.venue === "?" ? "Belirlenmedi" : f.venue}
                     </div>
                  </div>
               )) : (
                  <div className="col-span-2 p-8 text-center bg-white/5 rounded-xl border border-dashed border-white/10 text-slate-400">
                     Fikstür bilgisi bulunamadı.
                  </div>
               )}
            </div>
         </div>

         {/* Kadro */}
         <div className="space-y-4">
            <h3 className="font-display text-2xl font-bold flex items-center gap-2">
               <span className="w-1.5 h-6 rounded-full bg-electric-500" /> Kadro Özeti
            </h3>
            <div className="glass-panel p-4 rounded-xl border border-white/5 h-[400px] overflow-y-auto custom-scrollbar">
               {teamPlayers.length > 0 ? teamPlayers.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border-b border-white/5 hover:bg-white/5 transition-colors">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                           {p.position.substring(0,2).toUpperCase()}
                        </div>
                        <div>
                           <div className="font-bold text-white text-sm">{p.name}</div>
                           <div className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Shield className="w-3 h-3" /> {p.club}
                           </div>
                        </div>
                     </div>
                     <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                        {p.value}
                     </div>
                  </div>
               )) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm gap-3">
                     <AlertCircle className="w-8 h-8" />
                     Kadro verisi bulunamadı.
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
