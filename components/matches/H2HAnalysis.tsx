"use client";

import useSWR from "swr";
import { History, TrendingUp, HelpCircle, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface Props {
  team1Id: number;
  team2Id: number;
  team1Name: string;
  team2Name: string;
}

export function H2HAnalysis({ team1Id, team2Id, team1Name, team2Name }: Props) {
  const { data, error, isLoading } = useSWR(`/api/h2h?t1=${team1Id}&t2=${team2Id}`, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500 animate-pulse">
         <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <Activity className="w-6 h-6 text-electric-500" />
         </div>
         <p>Analiz verileri yükleniyor...</p>
      </div>
    );
  }

  if (error || !data || data.error || !data.response || data.response.length === 0) {
    return (
      <div className="bg-white/5 border border-white/5 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center">
         <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <HelpCircle className="w-8 h-8 text-slate-400" />
         </div>
         <h4 className="text-xl font-bold text-slate-300 mb-2">Henüz Açıklanmadı</h4>
         <p className="text-sm text-slate-500 max-w-sm">
            İki takım arasındaki detaylı form ve geçmiş karşılaşma analizleri sistem tarafından yakında yüklenecektir.
         </p>
      </div>
    );
  }

  // data.response is an array of matches between these two teams
  const matches = data.response || [];
  
  let t1Wins = 0;
  let t2Wins = 0;
  let draws = 0;
  
  matches.forEach((m: any) => {
    if (m.teams.home.winner) {
      if (m.teams.home.id === team1Id) t1Wins++;
      else t2Wins++;
    } else if (m.teams.away.winner) {
      if (m.teams.away.id === team1Id) t1Wins++;
      else t2Wins++;
    } else {
      draws++;
    }
  });

  const total = t1Wins + t2Wins + draws || 1;
  const t1Percent = Math.round((t1Wins / total) * 100);
  const t2Percent = Math.round((t2Wins / total) * 100);
  const drawPercent = Math.round((draws / total) * 100);

  // Take last 5 matches for H2H list
  const recentH2H = [...matches].sort((a: any, b: any) => new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime()).slice(0, 5);

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Kazanma Olasılıkları (H2H Sonuçlarına Göre) */}
      <div className="bg-black/30 border border-white/5 p-6 rounded-2xl">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
           <TrendingUp className="w-4 h-4 text-electric-400" /> Geçmiş Eşleşmeler Analizi
        </h3>
        
        <div className="flex justify-between items-end mb-2 px-1">
           <div className="flex flex-col">
              <span className="text-2xl font-black text-electric-400">{t1Percent}%</span>
              <span className="text-xs font-bold text-slate-500 uppercase">{team1Name}</span>
           </div>
           <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-slate-300">{drawPercent}%</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Beraberlik</span>
           </div>
           <div className="flex flex-col items-end">
              <span className="text-2xl font-black text-rose-400">{t2Percent}%</span>
              <span className="text-xs font-bold text-slate-500 uppercase">{team2Name}</span>
           </div>
        </div>
        
        <div className="h-3 w-full flex rounded-full overflow-hidden border border-white/10">
           <div className="bg-electric-500 h-full transition-all" style={{ width: `${t1Percent}%` }} />
           <div className="bg-slate-500 h-full transition-all" style={{ width: `${drawPercent}%` }} />
           <div className="bg-rose-500 h-full transition-all" style={{ width: `${t2Percent}%` }} />
        </div>
        <p className="text-center text-[10px] text-slate-500 mt-3 font-mono">Toplam {matches.length} karşılaşma baz alınmıştır.</p>
      </div>

      {/* Önceki Karşılaşmalar */}
      <div className="bg-black/30 border border-white/5 p-6 rounded-2xl">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
           <History className="w-4 h-4 text-gold-500" /> Son {recentH2H.length} Karşılaşma (H2H)
        </h3>
        
        <div className="space-y-2">
           {recentH2H.map((m: any, idx: number) => {
             const date = new Date(m.fixture.date).toLocaleDateString("tr-TR", { year: 'numeric', month: 'short', day: 'numeric' });
             const isT1Home = m.teams.home.id === team1Id;
             const t1Score = isT1Home ? m.goals.home : m.goals.away;
             const t2Score = isT1Home ? m.goals.away : m.goals.home;
             
             let resultColor = "text-slate-400 bg-white/5";
             if (t1Score > t2Score) resultColor = "text-electric-400 bg-electric-500/10";
             else if (t2Score > t1Score) resultColor = "text-rose-400 bg-rose-500/10";

             return (
               <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/5">
                 <div className="w-24 text-xs text-slate-500 font-mono">{date}</div>
                 <div className="flex-1 flex items-center justify-center gap-3">
                   <span className={cn("text-sm font-bold truncate", isT1Home ? "text-white" : "text-slate-400")}>{team1Name}</span>
                   <div className={cn("px-3 py-1 rounded font-black text-sm", resultColor)}>
                      {t1Score} - {t2Score}
                   </div>
                   <span className={cn("text-sm font-bold truncate", !isT1Home ? "text-white" : "text-slate-400")}>{team2Name}</span>
                 </div>
               </div>
             );
           })}
        </div>
      </div>
    </div>
  );
}
