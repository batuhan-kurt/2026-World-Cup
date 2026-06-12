"use client";

import { useState } from "react";
import { Gamepad2, Play, FastForward, Trophy, Shield, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Team = {
  id: string | number;
  name: string;
  logo: string;
  power: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
};

type Group = {
  name: string;
  teams: Team[];
};

type Match = {
  id: string;
  team1: Team | null;
  team2: Team | null;
  score1: number | null;
  score2: number | null;
  winner: Team | null;
  isSimulated: boolean;
};

const STAGES = ["Gruplar", "Son 32", "Son 16", "Çeyrek Final", "Yarı Final", "Final", "Şampiyon"];

// Simulate a single match based on team powers
const simulateMatch = (t1: Team, t2: Team, isKnockout: boolean = false): { s1: number, s2: number, winner: Team | null } => {
  const powerDiff = t1.power - t2.power;
  
  // Base chance to score
  let t1ExpectedGoals = 1.2 + (powerDiff / 20);
  let t2ExpectedGoals = 1.2 - (powerDiff / 20);
  
  // Randomness factor (Increased variance for surprises)
  t1ExpectedGoals = Math.max(0, t1ExpectedGoals * (Math.random() * 2));
  t2ExpectedGoals = Math.max(0, t2ExpectedGoals * (Math.random() * 2));
  
  let s1 = Math.round(t1ExpectedGoals);
  let s2 = Math.round(t2ExpectedGoals);

  // If knockout, no draws allowed (randomly give one a goal)
  if (isKnockout && s1 === s2) {
    if (Math.random() > 0.5) s1 += 1;
    else s2 += 1;
  }

  let winner = null;
  if (s1 > s2) winner = t1;
  else if (s2 > s1) winner = t2;
  else winner = null; // Group stage draw
  
  return { s1, s2, winner };
};

export function SimulationClient({ initialGroups }: { initialGroups: Group[] }) {
  const [stageIndex, setStageIndex] = useState(0);
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [knockoutMatches, setKnockoutMatches] = useState<Match[]>([]);
  const [champion, setChampion] = useState<Team | null>(null);
  const [stageSimulated, setStageSimulated] = useState(false);
  const [nextStageBuffer, setNextStageBuffer] = useState<Match[]>([]);

  const currentStage = STAGES[stageIndex];

  const simulateGroupStage = () => {
    // Simulate all group matches
    const newGroups = groups.map(g => {
      const teams = g.teams.map(t => ({...t}));
      // Every team plays every other team
      for (let i=0; i<teams.length; i++) {
        for (let j=i+1; j<teams.length; j++) {
          const res = simulateMatch(teams[i], teams[j], false);
          teams[i].played++;
          teams[j].played++;
          teams[i].goalsFor += res.s1;
          teams[i].goalsAgainst += res.s2;
          teams[j].goalsFor += res.s2;
          teams[j].goalsAgainst += res.s1;
          
          if (res.s1 > res.s2) {
            teams[i].points += 3;
            teams[i].wins++;
            teams[j].losses++;
          } else if (res.s2 > res.s1) {
            teams[j].points += 3;
            teams[j].wins++;
            teams[i].losses++;
          } else {
            teams[i].points += 1;
            teams[j].points += 1;
            teams[i].draws++;
            teams[j].draws++;
          }
        }
      }
      
      // Sort group
      teams.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        const gdA = a.goalsFor - a.goalsAgainst;
        const gdB = b.goalsFor - b.goalsAgainst;
        if (gdB !== gdA) return gdB - gdA;
        return b.goalsFor - a.goalsFor;
      });
      
      return { ...g, teams };
    });
    
    setGroups(newGroups);
    
    // Determine advancing teams (Top 2 from 12 groups = 24 teams + top 8 3rd places = 32 teams)
    const advancing: Team[] = [];
    const thirdPlaces: Team[] = [];
    
    newGroups.forEach(g => {
      advancing.push(g.teams[0], g.teams[1]);
      thirdPlaces.push(g.teams[2]);
    });
    
    // Sort third places
    thirdPlaces.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const gdA = a.goalsFor - a.goalsAgainst;
      const gdB = b.goalsFor - b.goalsAgainst;
      return gdB - gdA;
    });
    
    advancing.push(...thirdPlaces.slice(0, 8));
    
    // Shuffle slightly for matchups (Simplified logic: Random draw for round of 32 from advancing 32 teams)
    advancing.sort(() => 0.5 - Math.random());
    
    const r32: Match[] = [];
    for (let i=0; i<16; i++) {
      r32.push({
        id: `r32-${i}`,
        team1: advancing[i*2],
        team2: advancing[i*2+1],
        score1: null,
        score2: null,
        winner: null,
        isSimulated: false
      });
    }
    
    setNextStageBuffer(r32);
    setStageSimulated(true);
  };

  const simulateKnockoutStage = (allAtOnce: boolean = true) => {
    // Simulate current matches
    const newMatches = [...knockoutMatches];
    let allSimulated = true;
    
    for (const m of newMatches) {
      if (!m.isSimulated) {
        if (!m.team1 || !m.team2) continue;
        const res = simulateMatch(m.team1, m.team2, true);
        m.score1 = res.s1;
        m.score2 = res.s2;
        m.winner = res.winner;
        m.isSimulated = true;
        
        if (!allAtOnce) {
          allSimulated = false;
          break; // only simulate one
        }
      }
    }
    
    setKnockoutMatches(newMatches);
    
    // Check if stage is fully simulated
    if (newMatches.every(m => m.isSimulated)) {
      setStageSimulated(true);
    }
  };

  const handleAdvanceStage = () => {
    if (stageIndex === 0) {
      setKnockoutMatches(nextStageBuffer);
      setStageIndex(1);
      setStageSimulated(false);
      return;
    }
    
    const completedMatches = knockoutMatches;
    const winners = completedMatches.map(m => m.winner!).filter(Boolean);
    
    if (winners.length === 1) {
      // Champion found
      setChampion(winners[0]);
      setStageIndex(6); // Şampiyon
      return;
    }
    
    // Create next stage matches
    const nextMatches: Match[] = [];
    for (let i=0; i<winners.length/2; i++) {
      nextMatches.push({
        id: `next-${i}`,
        team1: winners[i*2],
        team2: winners[i*2+1],
        score1: null,
        score2: null,
        winner: null,
        isSimulated: false
      });
    }
    
    setKnockoutMatches(nextMatches);
    setStageIndex(prev => prev + 1);
    setStageSimulated(false);
  };

  const renderGroupTable = (group: Group) => (
    <div key={group.name} className="glass-panel p-4 rounded-xl text-xs border border-white/5 relative overflow-hidden">
      <div className="font-bold text-white mb-3 text-sm flex items-center gap-2">
         <span className="w-1.5 h-4 rounded-full bg-electric-500" />
         {group.name}
      </div>
      <table className="w-full text-slate-300">
        <thead>
          <tr className="text-[10px] text-slate-500 border-b border-white/10 uppercase">
            <th className="text-left font-normal pb-2">Takım</th>
            <th className="text-center font-normal pb-2">O</th>
            <th className="text-center font-normal pb-2">Av</th>
            <th className="text-center font-bold text-white pb-2">P</th>
          </tr>
        </thead>
        <tbody>
          {group.teams.map((t, i) => (
            <tr key={t.name} className={cn("border-b border-white/5", i < 2 && "bg-emerald-500/5")}>
              <td className="py-2 flex items-center gap-2">
                <span className="text-[10px] text-slate-500 w-3">{i+1}.</span>
                <img src={t.logo} alt="" className="w-4 h-4 object-contain" />
                <span className={cn("font-medium", i < 2 ? "text-emerald-400" : "text-white")}>{t.name}</span>
              </td>
              <td className="text-center py-2">{t.played}</td>
              <td className="text-center py-2">{t.goalsFor - t.goalsAgainst}</td>
              <td className="text-center py-2 font-bold text-white">{t.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-black text-white flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-electric-500" /> Simülasyon
          </h2>
          <p className="text-sm text-slate-400 mt-1">Takımların güçlerine ve form durumlarına göre yapay zeka destekli eğlenceli turnuva simülasyonu.</p>
        </div>
      </div>

      {/* Aşama İlerleme Çubuğu */}
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-2">
         {STAGES.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
               <div className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all",
                  i === stageIndex ? "bg-electric-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" :
                  i < stageIndex ? "bg-white/10 text-emerald-400" : "bg-black/40 text-slate-500"
               )}>
                  {s}
               </div>
               {i < STAGES.length - 1 && <ChevronRight className="w-3 h-3 text-slate-600" />}
            </div>
         ))}
      </div>

      {/* Kontrol Paneli */}
      {stageIndex < 6 && (
        <div className="glass-panel p-6 rounded-2xl border border-electric-500/20 flex flex-col sm:flex-row gap-4 items-center justify-between">
           <div>
             <h3 className="text-lg font-bold text-white mb-1">Mevcut Aşama: <span className="text-electric-400">{currentStage}</span></h3>
             <p className="text-xs text-slate-400">Simülasyonu çalıştırarak bir sonraki tura geçin.</p>
           </div>
           
           {/* Stage Control */}
           <div className="flex justify-center gap-4">
              {stageIndex === 0 ? (
                <>
                  <button 
                    onClick={simulateGroupStage}
                    disabled={stageSimulated}
                    className="bg-electric-600 hover:bg-electric-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {stageSimulated ? "Gruplar Tamamlandı" : "Grupları Simüle Et"}
                  </button>
                  {stageSimulated && (
                    <button 
                      onClick={handleAdvanceStage}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-pulse"
                    >
                      Sonraki Aşamaya Geç
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button 
                    onClick={() => simulateKnockoutStage(true)}
                    disabled={stageSimulated}
                    className="bg-electric-600 hover:bg-electric-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {stageSimulated ? "Maçlar Tamamlandı" : "Tüm Eşleşmeleri Simüle Et"}
                  </button>
                  {stageSimulated && (
                    <button 
                      onClick={handleAdvanceStage}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-pulse"
                    >
                      Sonraki Aşamaya Geç
                    </button>
                  )}
                </>
              )}
           </div>
        </div>
      )}

      {/* İçerik Ekranı */}
      <div className="mt-8">
         {stageIndex === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
               {groups.map(renderGroupTable)}
            </div>
         )}
         
         {stageIndex > 0 && stageIndex < 6 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               {knockoutMatches.map((m, i) => (
                  <div key={i} className="glass-panel p-4 rounded-xl border border-white/10 flex flex-col justify-center gap-3 relative overflow-hidden group hover:border-white/20 transition-colors">
                     {m.isSimulated && <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl" />}
                     
                     {/* Team 1 */}
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <img src={m.team1?.logo} className="w-6 h-6 object-contain" />
                           <span className={cn("text-sm font-bold", m.winner === m.team1 ? "text-white" : m.isSimulated ? "text-slate-500" : "text-slate-300")}>
                              {m.team1?.name}
                           </span>
                        </div>
                        <span className={cn("text-lg font-black", m.winner === m.team1 ? "text-electric-400" : "text-white")}>
                           {m.score1 !== null ? m.score1 : "-"}
                        </span>
                     </div>
                     
                     {/* Divider */}
                     <div className="w-full h-px bg-white/5" />
                     
                     {/* Team 2 */}
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <img src={m.team2?.logo} className="w-6 h-6 object-contain" />
                           <span className={cn("text-sm font-bold", m.winner === m.team2 ? "text-white" : m.isSimulated ? "text-slate-500" : "text-slate-300")}>
                              {m.team2?.name}
                           </span>
                        </div>
                        <span className={cn("text-lg font-black", m.winner === m.team2 ? "text-electric-400" : "text-white")}>
                           {m.score2 !== null ? m.score2 : "-"}
                        </span>
                     </div>
                  </div>
               ))}
            </div>
         )}

         {stageIndex === 6 && champion && (
            <div className="glass-panel p-12 rounded-[24px] flex flex-col items-center justify-center text-center border border-gold-500/30 relative overflow-hidden animate-zoom-in">
               <div className="absolute inset-0 bg-gradient-to-t from-gold-500/20 to-transparent" />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold-500/20 rounded-full blur-[100px] pointer-events-none" />
               
               <Trophy className="w-32 h-32 text-gold-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.6)] mb-6 relative z-10 animate-bounce" />
               <h3 className="text-xl font-bold text-gold-400 uppercase tracking-widest mb-2 relative z-10">2026 Dünya Şampiyonu</h3>
               <h1 className="text-6xl font-black text-white font-display mb-6 relative z-10">{champion.name}</h1>
               <img src={champion.logo} className="w-24 h-24 object-contain drop-shadow-2xl relative z-10" />
               
               <button 
                 onClick={() => window.location.reload()}
                 className="mt-12 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-bold transition-all relative z-10"
               >
                 Yeniden Simüle Et
               </button>
            </div>
         )}
      </div>
    </div>
  );
}
