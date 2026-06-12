"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Info, Calendar, MapPin, X, Users, Star, ChevronDown, RefreshCw } from "lucide-react";
import useSWR from "swr";
import { mergeStandings, mergeFixtures } from "@/lib/api-merger";

export default function GroupsClient({ groups, fixtures, fullSquads }: { groups: any[], fixtures: any[], fullSquads: any }) {
  const [selectedGroupFixture, setSelectedGroupFixture] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  const getGroupFixtures = (groupName: string) => {
    const groupFix = fixtures.filter(f => f.stage === groupName);
    return mergeFixtures(groupFix, fixturesData?.fixtures || []);
  };

  const selectedTeamData = groups.flatMap(g => g.teams).find(t => t.id === selectedTeamId);

  const fetcher = (url: string) => fetch(url).then(res => res.json());
  const { data: standingsData, error, isLoading: isValidating } = useSWR("/api/standings", fetcher, { refreshInterval: 60000 });
  const { data: fixturesData, isLoading: isValidatingFixtures } = useSWR("/api/fixtures", fetcher, { refreshInterval: 30000 });
  
  const displayGroups = mergeStandings(groups, standingsData?.standings || []);
  const selectedSquadObj = selectedTeamData ? fullSquads[selectedTeamData.name] : null;

  return (
    <div className="space-y-8 animate-slide-up relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-black text-white flex items-center gap-3">Gruplar {isValidating && <RefreshCw className="w-5 h-5 text-electric-500 animate-spin" />}</h2>
          <p className="text-sm text-slate-400 mt-1">2026 Dünya Kupası Resmi Grupları ve Fikstürü</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {displayGroups.map((group, gIndex) => {
          const groupName = group.name;
          const teams = group.teams;
          return (
            <div key={groupName} className="glass-panel rounded-2xl overflow-hidden hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all flex flex-col">
              <div className="p-4 border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent flex items-center justify-between">
                <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                  <span className="w-1.5 h-6 rounded-full bg-electric-500" />
                  {groupName}
                </h3>
                <button 
                  onClick={() => setSelectedGroupFixture(groupName)}
                  className="text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-electric-500/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                >
                  Fikstürü Gör <ChevronDown className="w-3 h-3 -rotate-90" />
                </button>
              </div>

              <div className="p-0 overflow-x-auto custom-scrollbar flex-1">
                <table className="w-full min-w-[400px]">
                  <thead>
                    <tr className="text-[10px] text-slate-500 uppercase tracking-wider border-b border-white/5">
                      <th className="px-3 py-3 text-left font-bold w-10">Sıra</th>
                      <th className="px-2 py-3 text-left font-bold">Takım</th>
                      <th className="px-1 py-3 text-center font-bold w-8">O</th>
                      <th className="px-1 py-3 text-center font-bold w-8">A</th>
                      <th className="px-1 py-3 text-center font-bold w-8">Y</th>
                      <th className="px-1 py-3 text-center font-bold w-8">Av</th>
                      <th className="px-2 py-3 text-center font-bold text-electric-400 w-12">Puan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {teams.map((team: any, idx: number) => {
                      const isAdvancing = idx < 2;
                      return (
                        <tr key={idx} className="hover:bg-white/5 transition-colors group">
                          <td className="px-3 py-3">
                            <div className={cn(
                              "w-6 h-6 rounded flex items-center justify-center text-xs font-bold mx-auto",
                              isAdvancing ? "bg-electric-500 text-white" : "text-slate-500 bg-white/5"
                            )}>
                              {idx + 1}
                            </div>
                          </td>
                          <td className="px-2 py-3">
                            <div 
                              className="flex items-center gap-3 cursor-pointer group-hover:translate-x-1 transition-transform"
                              onClick={() => setSelectedTeamId(team.id)}
                            >
                              <div className="w-6 h-5 rounded-[2px] flex items-center justify-center overflow-hidden shrink-0">
                                <img 
                                  src={team.logo} 
                                  alt={team.name} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="font-medium text-slate-200 group-hover:text-electric-400 transition-colors whitespace-nowrap">{team.name}</span>
                            </div>
                          </td>
                          <td className="px-1 py-3 text-center text-slate-400">{team.played || 0}</td>
                          <td className="px-1 py-3 text-center text-slate-400">{team.goalsFor || 0}</td>
                          <td className="px-1 py-3 text-center text-slate-400">{team.goalsAgainst || 0}</td>
                          <td className="px-1 py-3 text-center text-slate-400">{team.goalDifference > 0 ? `+${team.goalDifference}` : (team.goalDifference || 0)}</td>
                          <td className="px-2 py-3 text-center font-bold text-white">{team.points || 0}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grup Fikstür Modalı */}
      {selectedGroupFixture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedGroupFixture(null)}>
          <div 
            className="glass-panel w-full max-w-2xl relative animate-slide-up border border-electric-500/30 shadow-[0_0_50px_rgba(59,130,246,0.15)] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-full transition-colors z-10"
              onClick={() => setSelectedGroupFixture(null)}
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent">
              <h3 className="font-display text-2xl font-black text-white flex items-center gap-2">
                <span className="w-2 h-8 rounded-full bg-electric-500" />
                {selectedGroupFixture} Fikstürü
              </h3>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4 custom-scrollbar">
              {getGroupFixtures(selectedGroupFixture).map((f: any, i: number) => (
                <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-electric-500/50 transition-colors group">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs text-electric-400 font-bold bg-electric-500/10 px-3 py-1 rounded flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> {f.date} • {f.time} TSİ
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1.5 truncate ml-4" title={f.venue}>
                      <MapPin className="w-3.5 h-3.5 text-slate-500" /> 
                      <span className="truncate">{f.venue}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-200 text-lg flex-1 flex items-center gap-3">
                      <img src={f.team1Logo} className="w-8 h-6 object-contain" /> {f.team1}
                    </div>
                    <div className="flex flex-col items-center gap-1 mx-4">
                      <div className="text-xl font-black text-white bg-black/40 px-5 py-2 rounded-lg border border-white/10 shadow-inner group-hover:border-electric-500/30 transition-colors min-w-[80px] text-center">
                        {f.score || "VS"}
                      </div>
                      {(f.status === "1H" || f.status === "2H" || f.status === "HT" || f.status === "LIVE") && (
                        <span className="text-[10px] font-bold text-red-500 animate-pulse">CANLI {f.elapsed}'</span>
                      )}
                      {f.status?.startsWith("⏱") && (
                        <span className="text-[10px] font-bold text-yellow-400">{f.status}</span>
                      )}
                      {f.status === "FT" && <span className="text-[10px] font-bold text-slate-500">MS (Tamamlandı)</span>}
                      {f.referee && (
                        <div className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-full border border-white/10">
                           <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M12 10a4 4 0 1 1-4-4h8" /><path d="M16 6v4" /><path d="M8 2h8" /></svg>
                           {f.referee.split(" ").slice(-1)[0]}
                        </div>
                      )}
                    </div>
                    <div className="font-bold text-slate-200 text-lg flex-1 flex items-center justify-end gap-3">
                      {f.team2} <img src={f.team2Logo} className="w-8 h-6 object-contain" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Takım Detay Modalı */}
      {selectedTeamId && selectedTeamData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedTeamId(null)}>
          <div 
            className="glass-panel w-full max-w-4xl max-h-[85vh] overflow-y-auto relative animate-slide-up border border-electric-500/30 shadow-[0_0_50px_rgba(59,130,246,0.15)]"
            onClick={e => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-full transition-colors z-10"
              onClick={() => setSelectedTeamId(null)}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8">
              <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
                <div className="w-32 h-24 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center shrink-0 p-2 shadow-2xl">
                  <img src={selectedTeamData.logo} alt={selectedTeamData.name} className="w-full h-full object-contain" />
                </div>
                
                <div className="flex-1">
                  <h2 className="text-4xl font-black text-white font-display mb-2">{selectedTeamData.name}</h2>
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
                    <span className="px-2.5 py-1 rounded-md bg-electric-500/20 text-electric-400 font-semibold border border-electric-500/30">
                      FIFA Dünya Kupası 2026
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 text-slate-300 bg-white/5 p-4 rounded-xl border border-white/5">
                      <Star className="w-6 h-6 text-gold-400" />
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Teknik Direktör</div>
                        <div className="font-semibold text-sm">{selectedTeamData.config?.coach || selectedSquadObj?.coach || "Bilinmiyor"}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-slate-300 bg-white/5 p-4 rounded-xl border border-white/5">
                      <MapPin className="w-6 h-6 text-red-400" />
                      <div className="overflow-hidden">
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Kamp Merkezi</div>
                        <div className="font-semibold text-sm truncate" title={selectedTeamData.config?.camp || "Bilinmiyor"}>{selectedTeamData.config?.camp || "Bilinmiyor"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-electric-400" /> Kadro
                  </h3>
                </div>

                {selectedSquadObj ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedSquadObj.players.map((player: any, pIdx: number) => (
                      <div key={pIdx} className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-[#1e293b] shrink-0 border border-white/10">
                          <img 
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=1e293b&color=fff`} 
                            alt={player.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="font-bold text-sm text-slate-200 truncate">{player.name}</div>
                          <div className="text-[11px] text-slate-400 font-medium truncate flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500/50"></span>
                            {player.club}
                          </div>
                        </div>
                        <div className="text-xl font-black text-white/20 pr-2">
                          {player.number}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-slate-400">Kadro bilgisi yakında eklenecektir.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
