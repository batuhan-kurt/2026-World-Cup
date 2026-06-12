"use client";

import { useState, useMemo, useEffect } from "react";
import { Activity, Calendar, Trophy, Medal, Crown, Star, PlayCircle, MapPin, ChevronLeft, ChevronRight, X, RefreshCw, Heart, ShieldAlert, BarChart3, Users, TrendingUp } from "lucide-react";
import { WC_2026_CONFIG } from "@/lib/wc2026-config";
import { H2HAnalysis } from "./H2HAnalysis";
import useSWR from "swr";
import { mergeFixtures } from "@/lib/api-merger";
import { cn } from "@/lib/utils";

const formatDateShort = (dateStr: string) => {
  if (!dateStr) return "";
  const parts = dateStr.split(" ");
  if (parts.length < 2) return dateStr;
  
  const day = parts[0].padStart(2, '0');
  const monthStr = parts[1].toLowerCase();
  let month = "06";
  if (monthStr.includes("temmuz")) month = "07";
  
  return `${day}/${month}`;
};

export default function OverviewClient({ fixtures, liveMatches = [] }: { fixtures: any[], liveMatches?: any[] }) {
  const fetcher = (url: string) => fetch(url).then(res => res.json());
  
  // SWR Hook'larını sonradan tanımlayacağız (hooks call order kuralı nedeniyle memo'dan sonra çağıramayız)
  // Ancak refreshInterval'ı dinamik yapmak istiyoruz.
  const [globalRefreshInterval, setGlobalRefreshInterval] = useState(0);

  const { data: fixturesData, isLoading: isValidatingFixtures } = useSWR("/api/fixtures", fetcher, { refreshInterval: globalRefreshInterval });
  const displayFixtures = mergeFixtures(fixtures, fixturesData?.fixtures || []);

  const uniqueDates = useMemo(() => {
    const dates = Array.from(new Set(displayFixtures.map(f => f.date))).filter(Boolean);
    return dates.sort((a, b) => {
      if (a.includes("Haziran") && b.includes("Temmuz")) return -1;
      if (a.includes("Temmuz") && b.includes("Haziran")) return 1;
      const dayA = parseInt(a.split(" ")[0]);
      const dayB = parseInt(b.split(" ")[0]);
      return dayA - dayB;
    });
  }, [displayFixtures]);

  const [selectedDate, setSelectedDate] = useState(() => {
    const dates = Array.from(new Set(fixtures.map((f: any) => f.date))).filter(Boolean) as string[];
    const today = new Date();
    const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    const todayStr = `${today.getDate()} ${months[today.getMonth()]}`;
    const found = dates.find(d => d.startsWith(todayStr));
    return found || (uniqueDates.length > 0 ? uniqueDates[0] : "");
  });
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [favoriteTeam, setFavoriteTeam] = useState<string | null>(null);
  const [showFavoriteModal, setShowFavoriteModal] = useState(false);

  // Akıllı İstek Yönetimi (Smart Polling)
  useEffect(() => {
    const isAnyLive = displayFixtures.some(f => ["1H", "2H", "HT", "ET", "P", "LIVE"].includes(f.status));
    setGlobalRefreshInterval(isAnyLive ? 60000 : 0); // Canlı maç varsa 1 dakikada bir, yoksa 0 (kapalı)
  }, [displayFixtures]);

  const isSelectedMatchLive = selectedMatch && ["1H", "2H", "HT", "ET", "P", "LIVE"].includes(selectedMatch.status);
  const { data: fixtureDetailsData } = useSWR(
    selectedMatch?.fixtureId ? `/api/fixtures/${selectedMatch.fixtureId}` : null, 
    fetcher, 
    { refreshInterval: isSelectedMatchLive ? 60000 : 0 }
  );

  useEffect(() => {
    const saved = localStorage.getItem("favoriteTeam");
    if (saved) setFavoriteTeam(saved);
  }, []);

  const uniqueTeams = useMemo(() => {
    const teamMap = new Map();
    displayFixtures.forEach(f => {
      const isPlaceholder = (name: string) => {
        if (!name) return true;
        const lower = name.toLowerCase();
        return lower.includes("kazananı") || lower.includes("maç") || lower.includes("grup") || lower.includes("grubu") || lower.includes(".");
      };
      if (f.team1 && f.team1Logo && !isPlaceholder(f.team1)) teamMap.set(f.team1, f.team1Logo);
      if (f.team2 && f.team2Logo && !isPlaceholder(f.team2)) teamMap.set(f.team2, f.team2Logo);
    });
    return Array.from(teamMap.entries()).map(([name, logo]) => ({ name, logo })).sort((a, b) => a.name.localeCompare(b.name));
  }, [displayFixtures]);
  const [modalTab, setModalTab] = useState<"lineups" | "stats" | "details" | "h2h">("lineups");
  const [showSubstitutes, setShowSubstitutes] = useState(false);
  
  useEffect(() => {
    if (selectedMatch) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [selectedMatch]);
  
  const matchEvents = fixtureDetailsData?.fixtureDetails?.events || [];
  const matchLineups = fixtureDetailsData?.fixtureDetails?.lineups || [];
  const matchStats = fixtureDetailsData?.fixtureDetails?.statistics || [];

  const selectedMatches = useMemo(() => {
    return displayFixtures.filter(f => f.date === selectedDate);
  }, [displayFixtures, selectedDate]);

  const getStageMatches = (stage: string) => displayFixtures.filter(f => f.stage === stage);
  
  const favoriteFixtures = favoriteTeam 
    ? displayFixtures.filter(f => f.team1 === favoriteTeam || f.team2 === favoriteTeam)
    : [];
  
  return (
    <div className="space-y-12 animate-slide-up">
      {/* Genel Bilgi Kartı */}
      <section className="glass-panel p-6 rounded-[24px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-electric-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-3xl font-bold text-white mb-2">
              2026 FIFA Dünya Kupası
            </h2>
            <p className="text-slate-300 max-w-2xl leading-relaxed">
              Kuzey Amerika'nın (ABD, Meksika, Kanada) ev sahipliğinde düzenlenen 23. Dünya Kupası heyecanına hoş geldin! 48 takım, 104 maç ve 39 günlük futbol şöleni başlıyor.
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                <Calendar className="w-4 h-4 text-electric-400" />
                11 Haziran - 19 Temmuz 2026
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                <Trophy className="w-4 h-4 text-gold-400" />
                48 Takım, 12 Grup
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Favori Takım Seçimi Paneli */}
      <section className="mb-8">
         <div className="glass-panel p-6 rounded-2xl border border-electric-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <Heart className="w-24 h-24 text-electric-500" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div>
                  <h3 className="font-display text-2xl font-bold flex items-center gap-2 mb-2">
                     <span className="w-2 h-8 rounded-full bg-electric-500" />
                     Favori Takımını Seç
                  </h3>
                  <p className="text-sm text-slate-400">
                     Turnuvada desteklediğin takımı seçerek ona özel istatistikleri ve fikstürü Favoriler sekmesinden takip et.
                  </p>
               </div>
               
               <div className="w-full md:w-64">
                  <button 
                     type="button"
                     onClick={() => setShowFavoriteModal(true)}
                     className={cn(
                        "w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-xl py-4 px-5 focus:outline-none hover:bg-white/10 transition-colors",
                        favoriteTeam ? "text-white border-electric-500/50 shadow-[0_0_15px_rgba(37,99,235,0.2)]" : "text-slate-400"
                     )}
                  >
                     <div className="flex items-center gap-3">
                        {favoriteTeam ? (
                           <>
                              <img src={uniqueTeams.find(t => t.name === favoriteTeam)?.logo} className="w-6 h-6 object-cover rounded-full" />
                              <span className="font-bold text-sm">{favoriteTeam}</span>
                           </>
                        ) : (
                           <span className="font-semibold text-sm">Takım Seçin...</span>
                        )}
                     </div>
                     <ChevronRight className="w-5 h-5 text-slate-500" />
                  </button>
               </div>
            </div>
         </div>
      </section>

      {/* Favori Modal */}
      {showFavoriteModal && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowFavoriteModal(false)}>
            <div 
               className="glass-panel w-full max-w-lg h-[80vh] flex flex-col animate-slide-up border border-electric-500/30 overflow-hidden shadow-[0_0_50px_rgba(37,99,235,0.15)]"
               onClick={e => e.stopPropagation()}
            >
               <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                     <Heart className="w-5 h-5 text-electric-500" /> Favori Takımını Seç
                  </h3>
                  <button type="button" onClick={() => setShowFavoriteModal(false)} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors">
                     <X className="w-6 h-6" />
                  </button>
               </div>
               <div className="flex-1 overflow-y-auto p-4 custom-scrollbar grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {uniqueTeams.map(t => (
                     <button
                        key={t.name}
                        type="button"
                        onClick={() => {
                           setFavoriteTeam(t.name);
                           localStorage.setItem("favoriteTeam", t.name);
                           setShowFavoriteModal(false);
                        }}
                        className={cn(
                           "flex flex-col items-center justify-center gap-3 p-4 rounded-xl transition-all border",
                           favoriteTeam === t.name 
                              ? "bg-electric-500/20 border-electric-500 text-white font-bold shadow-[0_0_20px_rgba(37,99,235,0.2)]" 
                              : "bg-white/5 border-transparent text-slate-300 hover:bg-white/10 hover:border-white/10"
                        )}
                     >
                        <img src={t.logo} className="w-10 h-10 object-cover rounded-full shadow-lg" />
                        <span className="text-xs text-center">{t.name}</span>
                     </button>
                  ))}
               </div>
            </div>
         </div>
      )}

      {/* Tarihe Göre Fikstür Paneli */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-2xl font-bold flex items-center gap-2">
            <span className="w-2 h-8 rounded-full bg-electric-500" />
            Maç Takvimi
          </h3>
        </div>

        {/* Date Selector */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-4 mb-2">
          {uniqueDates.map(date => {
            const isSelected = date === selectedDate;
            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  "px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all border",
                  isSelected 
                    ? "bg-electric-500 text-white border-electric-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                    : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white"
                )}
              >
                {formatDateShort(date)}
              </button>
            );
          })}
        </div>

        {/* Selected Date Matches - Grid layout to fix width issues (max 2 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedMatches.map((f, i) => (
            <div 
              key={i} 
              onClick={() => {
                setSelectedMatch(f);
                setModalTab("lineups");
              }}
              className="glass-card hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full"
            >
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="text-xs font-bold text-electric-400 bg-electric-500/10 px-2 py-1 rounded">
                  {f.stage}
                </div>
                <div className="text-[11px] font-bold tracking-wider text-slate-400 flex items-center uppercase">
                  {f.status === "FT" ? (
                    <span className="text-slate-500 font-bold">MS (Tamamlandı)</span>
                  ) : ["LIVE", "1H", "2H", "HT", "ET", "P"].includes(f.status) ? (
                    <span className="text-red-500 font-bold animate-pulse flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> CANLI {f.elapsed ? `${f.elapsed}'` : ''}
                    </span>
                  ) : f.status?.startsWith("⏱") ? (
                    <span className="text-yellow-400 font-bold flex items-center gap-1">
                       {f.status}
                    </span>
                  ) : (
                    <span>{f.time} TSİ</span>
                  )}
                </div>
              </div>
              
              <div className="p-5 flex items-center justify-between flex-1">
                <div className="flex flex-col items-center flex-1 gap-2 w-1/3">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-white/5 p-1 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                    <img src={f.team1Logo} alt={f.team1} className="w-full h-full object-cover rounded-full" />
                  </div>
                  <div className="text-center font-bold text-sm text-slate-200 group-hover:text-white transition-colors line-clamp-2 w-full px-1">
                    {f.team1}
                  </div>
                </div>
                
                <div className="px-2 flex flex-col items-center justify-center w-1/3">
                  <div className={cn("px-3 py-2 rounded-lg border font-black text-xl shadow-inner whitespace-nowrap", ["LIVE", "1H", "2H", "HT", "ET", "P"].includes(f.status) ? "bg-red-500/10 border-red-500/30 text-red-500 animate-pulse" : "bg-white/10 border-white/5 text-white")}>
                    {f.score || "VS"}
                  </div>
                  {f.referee && (
                    <div className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-full border border-white/10 mx-auto w-fit max-w-full overflow-hidden">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 shrink-0"><path d="M12 10a4 4 0 1 1-4-4h8" /><path d="M16 6v4" /><path d="M8 2h8" /></svg>
                      <span className="truncate">{f.referee.split(" ").slice(-1)[0]}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-center flex-1 gap-2 w-1/3">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-white/5 p-1 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                    <img src={f.team2Logo} alt={f.team2} className="w-full h-full object-cover rounded-full" />
                  </div>
                  <div className="text-center font-bold text-sm text-slate-200 group-hover:text-white transition-colors line-clamp-2 w-full px-1">
                    {f.team2}
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-transparent via-white/5 to-transparent p-3 text-center text-[10px] font-bold tracking-widest text-slate-400 flex items-center justify-center gap-1.5 border-t border-white/5 mt-auto uppercase">
                <MapPin className="w-3 h-3 text-electric-500" />
                <span className="truncate max-w-[90%]">{f.venue === "?" ? "Stadyum Belirlenmedi" : f.venue}</span>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* Match Details Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedMatch(null)}>
          <div 
            className="glass-panel w-full max-w-3xl relative animate-slide-up border border-electric-500/30 shadow-[0_0_50px_rgba(59,130,246,0.15)] flex flex-col overflow-hidden max-h-[90vh] md:max-h-[85vh]"
            onClick={e => e.stopPropagation()}
          >
            <button 
              className="absolute top-3 right-3 md:top-4 md:right-4 p-2 bg-black/60 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-full transition-colors z-20 border border-white/10"
              onClick={() => setSelectedMatch(null)}
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Modal Header */}
            <div className="p-4 md:p-8 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
               <div className="text-center text-electric-400 font-bold text-[10px] uppercase tracking-widest mb-3">
                  {selectedMatch.stage} • {selectedMatch.date} • {selectedMatch.time} TSİ
               </div>
               
               <div className="flex items-center justify-between px-2 md:px-4">
                  <div className="flex flex-col items-center flex-1 gap-2 md:gap-4">
                     <img src={selectedMatch.team1Logo} alt={selectedMatch.team1} className="w-14 h-12 md:w-20 md:h-16 object-contain drop-shadow-xl" />
                     <span className="font-display font-black text-base md:text-2xl text-white text-center leading-tight">{selectedMatch.team1}</span>
                  </div>
                  
                  <div className="px-6 flex flex-col items-center gap-2">
                     <div className="flex flex-col items-center gap-1 mx-2 md:mx-4">
                      <div className="text-sm md:text-base font-black text-white bg-black/40 px-3 md:px-5 py-1.5 md:py-2 rounded-lg border border-white/10 shadow-inner group-hover:border-electric-500/30 transition-colors min-w-[60px] text-center">
                        {selectedMatch.score || "VS"}
                      </div>
                      {(selectedMatch.status === "1H" || selectedMatch.status === "2H" || selectedMatch.status === "HT" || selectedMatch.status === "LIVE") && (
                        <span className="text-[10px] font-bold text-red-500 animate-pulse">CANLI {selectedMatch.elapsed}'</span>
                      )}
                      {selectedMatch.status?.startsWith("⏱") && (
                        <span className="text-[10px] font-bold text-yellow-400">{selectedMatch.status}</span>
                      )}
                      {selectedMatch.status === "FT" && <span className="text-[10px] font-bold text-slate-500">MS (Tamamlandı)</span>}
                    </div>
                     <span className="text-[10px] text-slate-400 uppercase tracking-wider">Maç Skoru</span>
                     
                     {selectedMatch.referee && (
                        <div className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                           <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M12 10a4 4 0 1 1-4-4h8" /><path d="M16 6v4" /><path d="M8 2h8" /></svg>
                           {selectedMatch.referee}
                        </div>
                     )}
                  </div>
                  
                  <div className="flex flex-col items-center flex-1 gap-2 md:gap-4">
                     <img src={selectedMatch.team2Logo} alt={selectedMatch.team2} className="w-14 h-12 md:w-20 md:h-16 object-contain drop-shadow-xl" />
                     <span className="font-display font-black text-base md:text-2xl text-white text-center leading-tight">{selectedMatch.team2}</span>
                  </div>
               </div>
            </div>
            
            {/* Modal Body - Tabs */}
            <div className="p-3 md:p-8 bg-black/20 flex-1 overflow-y-auto">
               <div className="flex border-b border-white/10 mb-4 md:mb-6 overflow-x-auto hide-scrollbar">
                  <button 
                    onClick={() => setModalTab("h2h")}
                    className={cn("px-3 md:px-6 py-3 border-b-2 font-bold text-xs md:text-sm flex items-center gap-1 md:gap-2 transition-colors whitespace-nowrap shrink-0", modalTab === "h2h" ? "border-electric-500 text-electric-400" : "border-transparent text-slate-500 hover:text-slate-300")}
                  >
                     <TrendingUp className="w-3.5 h-3.5" /> Analiz
                  </button>
                  <button 
                    onClick={() => setModalTab("lineups")}
                    className={cn("px-3 md:px-6 py-3 border-b-2 font-bold text-xs md:text-sm flex items-center gap-1 md:gap-2 transition-colors whitespace-nowrap shrink-0", modalTab === "lineups" ? "border-electric-500 text-electric-400" : "border-transparent text-slate-500 hover:text-slate-300")}
                  >
                     <Users className="w-3.5 h-3.5" /> İlk 11'ler
                  </button>
                  <button 
                    onClick={() => setModalTab("stats")}
                    className={cn("px-3 md:px-6 py-3 border-b-2 font-bold text-xs md:text-sm flex items-center gap-1 md:gap-2 transition-colors whitespace-nowrap shrink-0", modalTab === "stats" ? "border-electric-500 text-electric-400" : "border-transparent text-slate-500 hover:text-slate-300")}
                  >
                     <BarChart3 className="w-3.5 h-3.5" /> İstatistikler
                  </button>
                  <button 
                    onClick={() => setModalTab("details")}
                    className={cn("px-3 md:px-6 py-3 border-b-2 font-bold text-xs md:text-sm flex items-center gap-1 md:gap-2 transition-colors whitespace-nowrap shrink-0", modalTab === "details" ? "border-electric-500 text-electric-400" : "border-transparent text-slate-500 hover:text-slate-300")}
                  >
                     <Activity className="w-3.5 h-3.5" /> Detay
                  </button>
               </div>
               
               {/* Content for Tabs */}
               {modalTab === "lineups" && (
                 matchLineups.length > 0 ? (
                   <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
                     <div className="relative w-full flex flex-col md:flex-row gap-4">
                        {/* Ortak Saha Arka Planı (Masaüstünde yan yana 2 yarı saha, mobilde alt alta) */}
                        <div className="absolute inset-0 bg-green-900/20 border-2 border-white/10 rounded-xl hidden md:block" />
                        <div className="absolute inset-y-0 left-1/2 w-px bg-white/10 hidden md:block" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-white/10 hidden md:block" />
                        
                        {matchLineups.map((lineup: any, idx: number) => {
                          // Oyuncuları mevkilerine göre grupla: G, D, M, F
                          const posOrder = { 'G': 1, 'D': 2, 'M': 3, 'F': 4 };
                          const groupedXI = (lineup.startXI || []).reduce((acc: any, curr: any) => {
                            const pos = curr.player?.pos || 'M';
                            if (!acc[pos]) acc[pos] = [];
                            acc[pos].push(curr);
                            return acc;
                          }, {});

                          // Sıralı diziliş
                          const sortedPositions = Object.keys(groupedXI).sort((a, b) => posOrder[a as keyof typeof posOrder] - posOrder[b as keyof typeof posOrder]);
                          // Deplasman takımı için sahayı ters çevir (G yukarıda, F aşağıda)
                          if (idx === 1) sortedPositions.reverse();

                          return (
                            <div key={idx} className={cn("flex-1 relative z-10 flex flex-col p-4 md:p-6 rounded-xl border border-white/5 md:border-none", idx === 0 ? "bg-electric-500/5 md:bg-transparent" : "bg-rose-500/5 md:bg-transparent")}>
                              <h4 className={"font-bold text-center mb-6 flex items-center justify-center gap-2 " + (idx === 0 ? "text-electric-400" : "text-rose-400")}>
                                <span className="text-white text-xs bg-white/10 px-2 py-0.5 rounded">{lineup?.formation || "?"}</span> {lineup?.team?.name || "Bilinmeyen Takım"} 
                              </h4>
                              
                              <div className="flex flex-col h-full justify-between gap-6">
                                {sortedPositions.map((pos) => (
                                  <div key={pos} className="flex justify-center gap-2 sm:gap-4">
                                    {groupedXI[pos].map((p: any, i: number) => (
                                      <div key={i} className="flex flex-col items-center justify-center w-14 sm:w-20 group cursor-default">
                                        <div className={cn("w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg border-2 transition-transform group-hover:scale-110", idx === 0 ? "bg-electric-600 border-electric-400 text-white" : "bg-white border-rose-500 text-rose-600")}>
                                          {p.player?.number || "-"}
                                        </div>
                                        <div className="bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded mt-1.5 w-full">
                                          <p className="text-[9px] sm:text-[10px] text-white text-center font-bold truncate">
                                            {p.player?.name?.split(' ').pop() || "Bilinmiyor"}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-center mt-4">
                        <button 
                          onClick={() => setShowSubstitutes(!showSubstitutes)}
                          className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold text-white transition-all flex items-center gap-2"
                        >
                          {showSubstitutes ? "Yedekleri Gizle" : "Yedekleri Göster"}
                        </button>
                      </div>

                      {showSubstitutes && (
                        <div className="flex justify-between items-start gap-4 animate-slide-up">
                          {matchLineups.map((lineup: any, idx: number) => (
                            <div key={idx} className="flex-1 bg-black/40 p-4 rounded-xl border border-white/5">
                               <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-3 text-center">Yedekler</h5>
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                  {(lineup.substitutes || []).map((p: any, i: number) => (
                                     <div key={i} className="flex items-center gap-2 px-2 py-1">
                                        <span className="text-[10px] text-slate-400 font-mono w-4 text-center shrink-0">{p.player?.number || "-"}</span>
                                        <span className="text-[10px] text-slate-400 truncate">{p.player?.name || "Bilinmiyor"}</span>
                                     </div>
                                  ))}
                               </div>
                            </div>
                          ))}
                        </div>
                      )}
                   </div>
                 ) : (
                   <div className="bg-white/5 border border-white/5 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                         <ShieldAlert className="w-8 h-8 text-slate-400" />
                      </div>
                      <h4 className="text-xl font-bold text-slate-300 mb-2">Henüz Açıklanmadı</h4>
                      <p className="text-sm text-slate-500 max-w-sm">
                         İlk 11 kadroları maç saatine yakın bir zamanda burada yer alacaktır.
                      </p>
                   </div>
                 )
               )}
               
               {modalTab === "stats" && (
                 matchStats.length === 2 ? (
                   <div className="space-y-6 max-w-2xl mx-auto">
                      {(matchStats[0]?.statistics || []).map((stat: any, idx: number) => {
                         const statAway = matchStats[1]?.statistics?.[idx];
                         if (!stat || !statAway) return null;
                         
                         const homeVal = parseInt(stat.value) || 0;
                         const awayVal = parseInt(statAway.value) || 0;
                         const total = homeVal + awayVal || 1;
                         const homePercent = (homeVal / total) * 100;
                         
                         return (
                           <div key={idx} className="space-y-2">
                              <div className="flex justify-between text-sm font-bold text-slate-300">
                                 <span>{stat.value !== null ? stat.value : 0}</span>
                                  <span className="text-slate-500 text-xs uppercase tracking-wider">{
                                    stat.type === "Ball Possession" ? "Topa Sahip Olma" :
                                    stat.type === "Total Shots" ? "Toplam Şut" :
                                    stat.type === "Shots on Goal" ? "İsabetli Şut" :
                                    stat.type === "Shots off Goal" ? "İsabetsiz Şut" :
                                    stat.type === "Blocked Shots" ? "Engellenen Şut" :
                                    stat.type === "Corner Kicks" ? "Korner" :
                                    stat.type === "Offsides" ? "Ofsayt" :
                                    stat.type === "Fouls" ? "Faul" :
                                    stat.type === "Yellow Cards" ? "Sarı Kart" :
                                    stat.type === "Red Cards" ? "Kırmızı Kart" :
                                    stat.type === "Total passes" ? "Toplam Pas" :
                                    stat.type === "Passes accurate" ? "İsabetli Pas" :
                                    stat.type === "Passes %" ? "Pas Yüzdesi" :
                                    stat.type === "Goalkeeper Saves" ? "Kaleci Kurtarışı" :
                                    stat.type
                                  }</span>
                                 <span>{statAway.value !== null ? statAway.value : 0}</span>
                              </div>
                              <div className="h-2 flex rounded-full overflow-hidden bg-white/5">
                                 <div className="bg-electric-500 h-full" style={{ width: `${homePercent}%` }} />
                                 <div className="bg-rose-500 h-full" style={{ width: `${100 - homePercent}%` }} />
                              </div>
                           </div>
                         );
                      })}
                   </div>
                 ) : (
                   <div className="bg-white/5 border border-white/5 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                         <BarChart3 className="w-8 h-8 text-slate-400" />
                      </div>
                      <h4 className="text-xl font-bold text-slate-300 mb-2">Henüz Açıklanmadı</h4>
                      <p className="text-sm text-slate-500 max-w-sm">
                         Maç başladıktan sonra tüm istatistik verileri anlık olarak burada listelenecektir.
                      </p>
                   </div>
                 )
               )}
               
               {modalTab === "details" && (
                 matchEvents.length > 0 ? (
                   <div className="relative space-y-4 max-w-2xl mx-auto py-4">
                     {/* Orta Çizgi */}
                     <div className="absolute inset-y-0 left-1/2 w-px bg-white/10 -translate-x-1/2" />
                     
                     {matchEvents.map((ev: any, idx: number) => {
                       // API'nin gönderdiği takımlar array'i ile event takım id'sini eşleştir. İsimlerle karşılaştırmak sorun çıkarabilir!
                       const homeTeamId = fixtureDetailsData?.fixtureDetails?.homeTeam?.id || fixtureDetailsData?.fixtureDetails?.teams?.home?.id;
                       const isHome = homeTeamId 
                                      ? ev?.team?.id === homeTeamId 
                                      : ev?.team?.name === selectedMatch?.team1;
                       
                       return (
                         <div key={idx} className={"flex items-center gap-4 w-full " + (isHome ? "flex-row" : "flex-row-reverse")}>
                           <div className={"w-[calc(50%-2rem)] flex flex-col " + (isHome ? "items-end text-right" : "items-start text-left")}>
                             <span className="text-sm font-bold text-white">{ev.player?.name || "Oyuncu"}</span>
                             {ev.assist?.name && <span className="text-xs text-slate-400">Asist: {ev.assist.name}</span>}
                             {ev.type === "subst" && ev.assist?.name && <span className="text-[10px] text-red-400">Çıkan: {ev.assist.name}</span>}
                           </div>
                           
                           <div className="w-16 flex flex-col items-center justify-center shrink-0 z-10">
                             <div className="w-10 h-10 rounded-full bg-black border border-white/20 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                               <span className="text-xs font-bold text-electric-400">{ev.time?.elapsed || 0}'</span>
                               {ev.time?.extra && <span className="text-[8px] text-electric-500">+{ev.time.extra}</span>}
                             </div>
                           </div>
                           
                           <div className={"w-[calc(50%-2rem)] flex items-center gap-2 " + (isHome ? "justify-start" : "justify-end")}>
                             {ev.type === "Goal" && <div className="w-6 h-6 bg-green-500/20 border border-green-500/30 text-green-400 rounded-full flex items-center justify-center text-xs shadow-lg" title={ev.detail || ""}>⚽</div>}
                             {ev.type === "Card" && ev.detail?.includes("Yellow") && <div className="w-4 h-6 bg-yellow-400 rounded-sm shadow-md border border-yellow-500" />}
                             {ev.type === "Card" && ev.detail?.includes("Red") && <div className="w-4 h-6 bg-red-500 rounded-sm shadow-md border border-red-600" />}
                             {ev.type === "subst" && <div className="w-6 h-6 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-full flex items-center justify-center text-xs">🔄</div>}
                             {ev.type === "Var" && <div className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded text-xs font-bold">VAR</div>}
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 ) : (
                   <div className="bg-white/5 border border-white/5 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                         <Activity className="w-8 h-8 text-slate-400" />
                      </div>
                      <h4 className="text-xl font-bold text-slate-300 mb-2">Henüz Açıklanmadı</h4>
                      <p className="text-sm text-slate-500 max-w-sm">
                         Maç içerisindeki önemli anlar (gol, kart, oyuncu değişikliği) anbean burada yer alacaktır.
                      </p>
                   </div>
                 )
               )}

                {/* H2H Tab Content */}
                {modalTab === "h2h" && (
                  (() => {
                    const t1Config = WC_2026_CONFIG.teams.find(t => t.turkishName === selectedMatch.team1 || t.name === selectedMatch.team1);
                    const t2Config = WC_2026_CONFIG.teams.find(t => t.turkishName === selectedMatch.team2 || t.name === selectedMatch.team2);
                    
                    if (!t1Config || !t2Config) {
                      return (
                        <div className="w-full max-w-4xl mx-auto">
                          <div className="bg-white/5 border border-white/5 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                             <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                <TrendingUp className="w-8 h-8 text-slate-400" />
                             </div>
                             <h4 className="text-xl font-bold text-slate-300 mb-2">Henüz Açıklanmadı</h4>
                             <p className="text-sm text-slate-500 max-w-sm">
                                Bu eşleşme için detaylı form ve geçmiş analiz verileri henüz oluşturulmadı.
                             </p>
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="w-full max-w-4xl mx-auto">
                        <H2HAnalysis 
                          team1Id={t1Config.id} 
                          team2Id={t2Config.id} 
                          team1Name={selectedMatch.team1} 
                          team2Name={selectedMatch.team2} 
                        />
                      </div>
                    );
                  })()
                )}
             </div>
            
            <div className="bg-black/40 p-4 text-center text-xs text-slate-500 flex justify-center items-center gap-2">
               <span>📍 Stadyum: <strong>{selectedMatch.venue}</strong></span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
