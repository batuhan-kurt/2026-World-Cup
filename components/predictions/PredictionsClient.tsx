"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { User, Trophy, Goal, Target, Send, Star, AlertTriangle, Activity, Heart, ArrowDownCircle, Users, Plus, X, Check, Lock, ChevronRight, Trash2 } from "lucide-react";
import { FormationBuilder } from "./FormationBuilder";

interface Prediction {
  id: string;
  createdAt: string;
  author: string;
  champion: string;
  topScorer: string;
  assistKing: string;
  mvp: string;
  favoritePlayer: string;
  underperformingTeam: string;
  matchPredictions: Record<string, string>;
  type?: string;
}

export default function PredictionsClient({ fixtures, groups, players = [] }: { fixtures: any[], groups: any[], players?: any[] }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [author, setAuthor] = useState("");
  const [champion, setChampion] = useState("");
  const [topScorer, setTopScorer] = useState("");
  const [assistKing, setAssistKing] = useState("");
  const [mvp, setMvp] = useState("");
  const [favoritePlayer, setFavoritePlayer] = useState("");
  const [underperformingTeam, setUnderperformingTeam] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "matches" | "formation">("general");
  const [matchPredictions, setMatchPredictions] = useState<Record<string, {t1: string, t2: string}>>({});
  const [showMatchSelector, setShowMatchSelector] = useState(false);
  const [showChampionSelector, setShowChampionSelector] = useState(false);
  const [showSurpriseSelector, setShowSurpriseSelector] = useState(false);

  useEffect(() => {
    fetch("/api/predictions")
      .then(res => res.json())
      .then(data => {
        setPredictions(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Tahminler yüklenemedi", err);
        setIsLoading(false);
      });
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.toLowerCase() === "worldcuptr") {
      setIsAuthenticated(true);
      setPasswordError("");
    } else {
      setPasswordError("Hatalı şifre. Lütfen tekrar deneyin.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu tahmini silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/predictions/${id}`, { method: "DELETE" });
      if (res.ok) setPredictions(predictions.filter(p => p.id !== id));
    } catch (e) {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author) return;
    if (activeTab === "general" && !champion) return;
    if (activeTab === "matches" && Object.keys(matchPredictions).filter(k => matchPredictions[k].t1 !== "").length === 0) return;

    setIsSubmitting(true);
    
    // Format match predictions
    const formattedMatchPredictions: Record<string, string> = {};
    Object.entries(matchPredictions).forEach(([key, val]) => {
      if (val.t1 !== "" && val.t2 !== "") {
        formattedMatchPredictions[key] = `${val.t1}-${val.t2}`;
      }
    });

    const newPrediction = {
      author,
      champion,
      topScorer,
      assistKing,
      mvp,
      favoritePlayer,
      underperformingTeam,
      matchPredictions: formattedMatchPredictions,
      type: activeTab === "matches" ? "match" : "general"
    };

    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPrediction),
      });
      
      if (res.ok) {
        const responseData = await res.json();
        const added = responseData.prediction || responseData;
        setPredictions([added, ...predictions]);
        // Reset form
        setChampion("");
        setTopScorer("");
        setAssistKing("");
        setMvp("");
        setFavoritePlayer("");
        setUnderperformingTeam("");
        setMatchPredictions({});
        setActiveTab("general");
        alert("Tahmininiz başarıyla kaydedildi!");
      }
    } catch (error) {
      console.error("Hata", error);
      alert("Bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const teams = groups.flatMap(g => g.teams).map(t => t.name).sort((a, b) => a.localeCompare(b, "tr"));
  const groupFixtures = fixtures.filter(f => f.stage.startsWith("Grup")).sort((a, b) => {
    if (!a.date || !b.date) return 0;
    if (a.date.includes("Haziran") && b.date.includes("Temmuz")) return -1;
    if (a.date.includes("Temmuz") && b.date.includes("Haziran")) return 1;
    const dayA = parseInt(a.date.split(" ")[0]);
    const dayB = parseInt(b.date.split(" ")[0]);
    return dayA - dayB;
  });

  const handleMatchScoreChange = (fid: string, team: 1 | 2, value: string) => {
    setMatchPredictions(prev => ({
      ...prev,
      [fid]: {
        ...prev[fid],
        [team === 1 ? 't1' : 't2']: value
      }
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 animate-slide-up">
        <form onSubmit={handleLogin} className="glass-panel w-full max-w-md p-6 md:p-8 rounded-3xl flex flex-col items-center gap-5 text-center border-t border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.15)] relative overflow-hidden">
           <div className="absolute top-0 right-0 w-48 h-48 bg-electric-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
           <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center relative z-10 border border-white/10">
              <Lock className="w-7 h-7 text-electric-400" />
           </div>
           <div className="relative z-10 w-full space-y-1">
             <h2 className="text-xl md:text-2xl font-black text-white font-display">Tahminlere Giriş</h2>
             <p className="text-slate-400 text-sm">Bu alana erişmek için lütfen parolayı girin.</p>
           </div>
           
           <div className="w-full relative z-10 space-y-3">
             <input 
               type="password"
               value={password}
               onChange={e => setPassword(e.target.value)}
               placeholder="Parolayı girin..."
               autoComplete="current-password"
               className="w-full bg-black/50 border border-white/10 rounded-xl py-4 px-4 text-center text-white focus:outline-none focus:border-electric-500 text-lg tracking-widest transition-colors"
             />
             {passwordError && <p className="text-red-400 text-sm font-bold">{passwordError}</p>}
             
             <button type="submit" className="w-full bg-electric-600 hover:bg-electric-500 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]">
               Giriş Yap
             </button>
           </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-black text-white">Tahminler</h2>
          <p className="text-sm text-slate-400 mt-1">2026 Dünya Kupası için kendi tahminlerini oluştur, ilk 11'ini kur ve diğerleriyle yarış.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Tahmin Ekleme Formu */}
        <div className="glass-panel rounded-2xl overflow-hidden lg:col-span-1 h-fit lg:sticky lg:top-24">
          <div className="bg-electric-600/20 border-b border-electric-500/30 p-6 flex flex-col gap-4">
            <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-electric-400" /> Tahminini Yap
            </h3>
            
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Adınız / Rumuzunuz" 
                required
                value={author}
                onChange={e => setAuthor(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-electric-500 transition-colors"
              />
            </div>
          </div>
          
          <div className="flex border-b border-white/5 bg-black/20">
            <button 
              type="button"
              className={cn("flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors", activeTab === "general" ? "text-electric-400 border-b-2 border-electric-400 bg-electric-500/10" : "text-slate-500 hover:text-slate-300")}
              onClick={() => setActiveTab("general")}
            >
              Genel
            </button>
            <button 
              type="button"
              className={cn("flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors", activeTab === "matches" ? "text-electric-400 border-b-2 border-electric-400 bg-electric-500/10" : "text-slate-500 hover:text-slate-300")}
              onClick={() => setActiveTab("matches")}
            >
              Maçlar
            </button>
            <button 
              type="button"
              className={cn("flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors", activeTab === "formation" ? "text-electric-400 border-b-2 border-electric-400 bg-electric-500/10" : "text-slate-500 hover:text-slate-300")}
              onClick={() => setActiveTab("formation")}
            >
              İlk 11
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
              
              {activeTab === "general" ? (
                <>
                  {/* Şampiyon */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Trophy className="w-3.5 h-3.5 text-gold-500" /> Şampiyon
                    </label>
                    <button 
                      type="button"
                      onClick={() => setShowChampionSelector(true)}
                      className={cn(
                         "w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none transition-colors",
                         champion ? "text-white border-gold-500/50" : "text-slate-400"
                      )}
                    >
                      {champion ? champion : "Şampiyon takım seçin..."}
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>
                    {/* Champion Modal */}
                    {showChampionSelector && (
                       <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowChampionSelector(false)}>
                          <div 
                             className="glass-panel w-full max-w-sm h-[60vh] flex flex-col animate-slide-up border border-gold-500/30 overflow-hidden"
                             onClick={e => e.stopPropagation()}
                          >
                             <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                   Şampiyon Seç
                                </h3>
                                <button type="button" onClick={() => setShowChampionSelector(false)} className="text-slate-400 hover:text-white">
                                   <X className="w-5 h-5" />
                                </button>
                             </div>
                             <div className="flex-1 overflow-y-auto p-2 custom-scrollbar grid grid-cols-2 gap-2">
                                {teams.map(t => (
                                   <button
                                      key={t}
                                      type="button"
                                      onClick={() => {
                                         setChampion(t);
                                         setShowChampionSelector(false);
                                      }}
                                      className={cn(
                                         "w-full text-left px-3 py-2 rounded-lg text-sm transition-all border",
                                         champion === t 
                                            ? "bg-gold-500/20 border-gold-500 text-white font-bold" 
                                            : "bg-white/5 border-transparent text-slate-300 hover:bg-white/10"
                                      )}
                                   >
                                      {t}
                                   </button>
                                ))}
                             </div>
                          </div>
                       </div>
                    )}
                  </div>
                  
                  {/* Gol Kralı */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Goal className="w-3.5 h-3.5 text-blue-400" /> Gol Kralı
                    </label>
                    <input 
                      type="text" 
                      placeholder="Örn: Kylian Mbappé..."
                      value={topScorer}
                      onChange={e => setTopScorer(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-400 focus:bg-blue-500/10 transition-all font-semibold placeholder:font-normal placeholder:text-slate-500"
                    />
                  </div>

                  {/* Asist Kralı */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Target className="w-3.5 h-3.5 text-emerald-400" /> Asist Kralı
                    </label>
                    <input 
                      type="text" 
                      placeholder="Örn: Kevin De Bruyne..."
                      value={assistKing}
                      onChange={e => setAssistKing(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-emerald-400 focus:bg-emerald-500/10 transition-all font-semibold placeholder:font-normal placeholder:text-slate-500"
                    />
                  </div>

                  {/* Turnuva MVP */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 text-yellow-400" /> Turnuvanın Oyuncusu (MVP)
                    </label>
                    <input 
                      type="text" 
                      placeholder="Örn: Jude Bellingham..."
                      value={mvp}
                      onChange={e => setMvp(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-yellow-400 focus:bg-yellow-500/10 transition-all font-semibold placeholder:font-normal placeholder:text-slate-500"
                    />
                  </div>

                  {/* Favori Oyuncu */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Heart className="w-3.5 h-3.5 text-red-400" /> Favori Oyuncun
                    </label>
                    <input 
                      type="text" 
                      placeholder="Örn: Arda Güler..."
                      value={favoritePlayer}
                      onChange={e => setFavoritePlayer(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-red-400 focus:bg-red-500/10 transition-all font-semibold placeholder:font-normal placeholder:text-slate-500"
                    />
                  </div>

                  {/* Sürpriz */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <ArrowDownCircle className="w-3.5 h-3.5 text-orange-400" /> Sürpriz Yapacak Takım
                    </label>
                    <button 
                      type="button"
                      onClick={() => setShowSurpriseSelector(true)}
                      className={cn(
                         "w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none transition-colors",
                         underperformingTeam ? "text-white border-orange-500/50" : "text-slate-400"
                      )}
                    >
                      {underperformingTeam ? underperformingTeam : "Takım seçin..."}
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </button>
                    {/* Surprise Modal */}
                    {showSurpriseSelector && (
                       <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowSurpriseSelector(false)}>
                          <div 
                             className="glass-panel w-full max-w-sm h-[60vh] flex flex-col animate-slide-up border border-orange-500/30 overflow-hidden"
                             onClick={e => e.stopPropagation()}
                          >
                             <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                   Sürpriz Yapacak Takım
                                </h3>
                                <button type="button" onClick={() => setShowSurpriseSelector(false)} className="text-slate-400 hover:text-white">
                                   <X className="w-5 h-5" />
                                </button>
                             </div>
                             <div className="flex-1 overflow-y-auto p-2 custom-scrollbar grid grid-cols-2 gap-2">
                                {teams.map(t => (
                                   <button
                                      key={t}
                                      type="button"
                                      onClick={() => {
                                         setUnderperformingTeam(t);
                                         setShowSurpriseSelector(false);
                                      }}
                                      className={cn(
                                         "w-full text-left px-3 py-2 rounded-lg text-sm transition-all border",
                                         underperformingTeam === t 
                                            ? "bg-orange-500/20 border-orange-500 text-white font-bold" 
                                            : "bg-white/5 border-transparent text-slate-300 hover:bg-white/10"
                                      )}
                                   >
                                      {t}
                                   </button>
                                ))}
                             </div>
                          </div>
                       </div>
                    )}
                  </div>
                </>
              ) : activeTab === "matches" ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                     <p className="text-xs text-slate-400">Tahmin etmek istediğin maçları listeye ekle:</p>
                     <button 
                       type="button"
                       onClick={() => setShowMatchSelector(true)}
                       className="bg-electric-500/20 text-electric-400 hover:bg-electric-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors border border-electric-500/30"
                     >
                       <Plus className="w-3.5 h-3.5" /> Maç Ekle
                     </button>
                  </div>
                  
                  {/* Match Selector Modal */}
                  {showMatchSelector && (
                     <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowMatchSelector(false)}>
                        <div 
                           className="glass-panel w-full max-w-lg h-[70vh] flex flex-col animate-slide-up border border-electric-500/30 overflow-hidden"
                           onClick={e => e.stopPropagation()}
                        >
                           <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                              <h3 className="font-bold text-white flex items-center gap-2">
                                 Tahmin Edilecek Maçı Seç
                              </h3>
                              <button type="button" onClick={() => setShowMatchSelector(false)} className="text-slate-400 hover:text-white">
                                 <X className="w-5 h-5" />
                              </button>
                           </div>
                           <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2">
                              {groupFixtures.map(f => {
                                 const fid = `${f.team1}-vs-${f.team2}`;
                                 const isAdded = !!matchPredictions[fid];
                                 return (
                                    <button
                                       key={fid}
                                       type="button"
                                       disabled={isAdded}
                                       onClick={() => {
                                          setMatchPredictions(prev => ({
                                             ...prev,
                                             [fid]: { t1: "", t2: "" }
                                          }));
                                          setShowMatchSelector(false);
                                       }}
                                       className={cn(
                                          "w-full flex items-center justify-between p-3 rounded-xl border transition-all text-sm",
                                          isAdded 
                                             ? "bg-white/5 border-white/5 opacity-50 cursor-not-allowed" 
                                             : "bg-black/40 border-white/10 hover:border-electric-500/50 hover:bg-electric-500/10"
                                       )}
                                    >
                                       <div className="flex flex-col items-start gap-1">
                                          <span className="text-[10px] text-electric-400 font-bold">{f.date}</span>
                                          <span className="font-bold text-white flex items-center gap-2">
                                             {f.team1} <span className="text-slate-500 text-[10px]">VS</span> {f.team2}
                                          </span>
                                       </div>
                                       {!isAdded && <Plus className="w-4 h-4 text-electric-400" />}
                                       {isAdded && <Check className="w-4 h-4 text-emerald-500" />}
                                    </button>
                                 );
                              })}
                           </div>
                        </div>
                     </div>
                  )}

                  <div className="space-y-4 mt-4">
                    {Object.keys(matchPredictions).length === 0 && (
                      <div className="text-center py-8 text-slate-500 text-sm border border-dashed border-white/10 rounded-xl bg-white/5">
                        Henüz tahmin edilecek maç eklenmedi.
                      </div>
                    )}
                    {Object.entries(matchPredictions).map(([fid, scores]) => {
                      const [t1, t2] = fid.split('-vs-');
                      return (
                        <div key={fid} className="bg-gradient-to-r from-white/5 to-transparent p-4 rounded-xl border border-white/5 relative group shadow-lg">
                          <button 
                            type="button"
                            onClick={() => {
                              const newPreds = {...matchPredictions};
                              delete newPreds[fid];
                              setMatchPredictions(newPreds);
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          
                          <div className="text-center mb-3">
                             <span className="text-[10px] text-electric-400 font-bold uppercase tracking-widest bg-electric-500/10 px-2 py-0.5 rounded">Skor Tahmini</span>
                          </div>
                          
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 text-right text-sm font-black text-white">{t1}</div>
                            
                            <div className="flex items-center gap-2">
                              <input 
                                type="number" 
                                min="0" max="20"
                                value={scores.t1}
                                onChange={(e) => handleMatchScoreChange(fid, 1, e.target.value)}
                                className="w-14 h-12 bg-black border-2 border-white/10 rounded-xl text-center text-white text-xl font-black focus:border-electric-500 outline-none shadow-inner hide-arrows" 
                              />
                              <span className="text-slate-500 font-black text-xl">:</span>
                              <input 
                                type="number" 
                                min="0" max="20"
                                value={scores.t2}
                                onChange={(e) => handleMatchScoreChange(fid, 2, e.target.value)}
                                className="w-14 h-12 bg-black border-2 border-white/10 rounded-xl text-center text-white text-xl font-black focus:border-electric-500 outline-none shadow-inner hide-arrows" 
                              />
                            </div>
                            
                            <div className="flex-1 text-left text-sm font-black text-white">{t2}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-electric-500/10 border border-electric-500/20 p-6 rounded-xl text-center space-y-3">
                   <div className="w-12 h-12 bg-electric-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                     <Users className="w-6 h-6 text-electric-400" />
                   </div>
                   <h3 className="text-white font-bold text-lg">İlk 11'ini Kur</h3>
                   <p className="text-xs text-slate-400">
                     Sağ taraftaki geniş ekrandan dizilişinizi seçip rüya takımınızı oluşturun. Ardından <strong className="text-white">Linki Kopyala</strong> butonuna basarak arkadaşlarınızla paylaşabilirsiniz!
                   </p>
                </div>
              )}
            </div>
            
            {activeTab !== "formation" && (
              <div className="p-4 border-t border-white/5 bg-black/20">
                <button 
                  type="submit" 
                  disabled={isSubmitting || !author || (activeTab === "general" ? !champion : Object.keys(matchPredictions).filter(k => matchPredictions[k].t1 !== "" && matchPredictions[k].t2 !== "").length === 0)}
                  className="w-full bg-electric-600 hover:bg-electric-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "Gönderiliyor..." : "Tahminimi Paylaş"}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Tahmin Listesi / İlk 11 Ekranı */}
        <div className="lg:col-span-2 space-y-4">
          {activeTab === "formation" ? (
             <FormationBuilder players={players} />
          ) : (
            isLoading ? (
              <div className="glass-card h-48 animate-pulse flex items-center justify-center text-slate-500">Yükleniyor...</div>
            ) : (() => {
              const feed = activeTab === "general"
                ? predictions.filter(p => p.type === "general" || (!p.type && p.champion))
                : predictions.filter(p => p.type === "match" || Object.keys(p.matchPredictions || {}).length > 0);
              return feed.length === 0 ? (
              <div className="glass-panel p-12 text-center rounded-[24px]">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-300 mb-2">Henüz Tahmin Yok</h3>
                <p className="text-slate-400">İlk tahmini sen yap ve arkadaşlarına meydan oku!</p>
              </div>
            ) : (
              feed.map((pred) => (
                <div key={pred.id} className="glass-card p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-gold-500/10 transition-colors" />
                  
                  <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-electric-500 to-electric-700 flex items-center justify-center text-white font-bold font-display shadow-lg">
                          {pred.author.substring(0,2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-lg">{pred.author}</h4>
                          <span className="text-xs text-slate-500">
                            {new Date(pred.createdAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute:"2-digit" })}
                          </span>
                        </div>
                      </div>
                      {pred.author === author && (
                        <button onClick={() => handleDelete(pred.id)} className="text-slate-500 hover:text-red-400 transition-colors p-2 z-20 relative">
                           <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {(pred.champion || pred.topScorer || pred.assistKing || pred.mvp || pred.favoritePlayer || pred.underperformingTeam) && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10 mb-6">
                      {pred.champion && (
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1.5 mb-1">
                          <Trophy className="w-3 h-3 text-gold-500" /> Şampiyon
                        </div>
                        <div className="font-semibold text-slate-200">{pred.champion}</div>
                      </div>
                    )}
                    
                    {pred.topScorer && (
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1.5 mb-1">
                          <Goal className="w-3 h-3 text-blue-400" /> Gol Kralı
                        </div>
                        <div className="font-semibold text-slate-200">{pred.topScorer}</div>
                      </div>
                    )}

                    {pred.assistKing && (
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1.5 mb-1">
                          <Target className="w-3 h-3 text-emerald-400" /> Asist Kralı
                        </div>
                        <div className="font-semibold text-slate-200">{pred.assistKing}</div>
                      </div>
                    )}

                    {pred.mvp && (
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1.5 mb-1">
                          <Star className="w-3 h-3 text-yellow-400" /> Turnuva MVP
                        </div>
                        <div className="font-semibold text-slate-200">{pred.mvp}</div>
                      </div>
                    )}
                    
                    {pred.favoritePlayer && (
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1.5 mb-1">
                          <Heart className="w-3 h-3 text-red-400" /> Favori
                        </div>
                        <div className="font-semibold text-slate-200">{pred.favoritePlayer}</div>
                      </div>
                    )}
                    
                    {pred.underperformingTeam && (
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1.5 mb-1">
                          <ArrowDownCircle className="w-3 h-3 text-orange-400" /> Sürpriz Takım
                        </div>
                        <div className="font-semibold text-slate-200">{pred.underperformingTeam}</div>
                      </div>
                    )}
                  </div>
                  )}
                  
                  {pred.matchPredictions && Object.keys(pred.matchPredictions).length > 0 && (
                    <div className="relative z-10">
                      <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-electric-400" /> Maç Skor Tahminleri
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(pred.matchPredictions).map(([matchKey, score]) => (
                          <div key={matchKey} className="bg-black/30 border border-white/5 px-3 py-2 rounded-lg text-xs flex items-center gap-2">
                            <span className="text-slate-400">{matchKey.split('-vs-')[0]}</span>
                            <span className="font-bold text-white bg-white/10 px-1.5 py-0.5 rounded">{score}</span>
                            <span className="text-slate-400">{matchKey.split('-vs-')[1]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            );
            })()
          )}
        </div>

      </div>
    </div>
  );
}
