"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Check, Shield, Sword, X, Share } from "lucide-react";
import { cn } from "@/lib/utils";

const FORMATIONS: Record<string, string[]> = {
  "4-3-3": ["GK", "LB", "CB1", "CB2", "RB", "CM1", "CDM", "CM2", "LW", "ST", "RW"],
  "4-4-2": ["GK", "LB", "CB1", "CB2", "RB", "LM", "CM1", "CM2", "RM", "ST1", "ST2"],
  "4-2-3-1": ["GK", "LB", "CB1", "CB2", "RB", "CDM1", "CDM2", "LAM", "CAM", "RAM", "ST"],
  "3-5-2": ["GK", "LCB", "CB", "RCB", "LWB", "CM1", "CDM", "CM2", "RWB", "ST1", "ST2"]
};

// ... POSITION_COORDS mapping skipped ...
const POSITION_COORDS: Record<string, any> = {
  "4-3-3": {
    "GK": { bottom: "5%", left: "50%" },
    "LB": { bottom: "25%", left: "15%" },
    "CB1": { bottom: "20%", left: "35%" },
    "CB2": { bottom: "20%", left: "65%" },
    "RB": { bottom: "25%", left: "85%" },
    "CM1": { bottom: "45%", left: "30%" },
    "CDM": { bottom: "35%", left: "50%" },
    "CM2": { bottom: "45%", left: "70%" },
    "LW": { bottom: "75%", left: "20%" },
    "ST": { bottom: "85%", left: "50%" },
    "RW": { bottom: "75%", left: "80%" },
  },
  "4-4-2": {
    "GK": { bottom: "5%", left: "50%" },
    "LB": { bottom: "25%", left: "15%" },
    "CB1": { bottom: "20%", left: "35%" },
    "CB2": { bottom: "20%", left: "65%" },
    "RB": { bottom: "25%", left: "85%" },
    "LM": { bottom: "50%", left: "15%" },
    "CM1": { bottom: "45%", left: "35%" },
    "CM2": { bottom: "45%", left: "65%" },
    "RM": { bottom: "50%", left: "85%" },
    "ST1": { bottom: "80%", left: "35%" },
    "ST2": { bottom: "80%", left: "65%" },
  },
  "4-2-3-1": {
    "GK": { bottom: "5%", left: "50%" },
    "LB": { bottom: "25%", left: "15%" },
    "CB1": { bottom: "20%", left: "35%" },
    "CB2": { bottom: "20%", left: "65%" },
    "RB": { bottom: "25%", left: "85%" },
    "CDM1": { bottom: "40%", left: "35%" },
    "CDM2": { bottom: "40%", left: "65%" },
    "LAM": { bottom: "60%", left: "20%" },
    "CAM": { bottom: "65%", left: "50%" },
    "RAM": { bottom: "60%", left: "80%" },
    "ST": { bottom: "85%", left: "50%" },
  },
  "3-5-2": {
    "GK": { bottom: "5%", left: "50%" },
    "LCB": { bottom: "20%", left: "25%" },
    "CB": { bottom: "18%", left: "50%" },
    "RCB": { bottom: "20%", left: "75%" },
    "LWB": { bottom: "45%", left: "10%" },
    "CM1": { bottom: "45%", left: "35%" },
    "CDM": { bottom: "35%", left: "50%" },
    "CM2": { bottom: "45%", left: "65%" },
    "RWB": { bottom: "45%", left: "90%" },
    "ST1": { bottom: "80%", left: "35%" },
    "ST2": { bottom: "80%", left: "65%" },
  }
};

export function FormationBuilder({ players = [] }: { players?: any[] }) {
  const [formation, setFormation] = useState("4-3-3");
  const [squad, setSquad] = useState<Record<string, string>>({});
  const [selectingPos, setSelectingPos] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const form = params.get("formation");
    if (form && FORMATIONS[form]) {
      setFormation(form);
      const newSquad: Record<string, string> = {};
      FORMATIONS[form].forEach(pos => {
        const val = params.get(pos);
        if (val) newSquad[pos] = val;
      });
      setSquad(newSquad);
    }
  }, []);

  const handleCopyLink = () => {
    const params = new URLSearchParams();
    params.set("formation", formation);
    Object.entries(squad).forEach(([pos, name]) => {
      params.set(pos, name);
    });
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url);
    alert("İlk 11 linki panoya kopyalandı! Artık paylaşabilirsiniz.");
  };

  const handleSelectPlayer = (pos: string) => {
    setSelectingPos(pos);
    setSearchQuery("");
  };
  
  const confirmPlayer = (name: string) => {
    if (selectingPos) {
      setSquad(prev => ({ ...prev, [selectingPos]: name }));
      setSelectingPos(null);
    }
  };

  const getPlayerCategory = (tmPosition: string) => {
    if (["Centre-Forward", "Right Winger", "Left Winger", "Second Striker"].includes(tmPosition)) return "Forvet";
    if (["Central Midfield", "Defensive Midfield", "Attacking Midfield", "Right Midfield", "Left Midfield"].includes(tmPosition)) return "Orta Saha";
    if (["Centre-Back", "Right-Back", "Left-Back"].includes(tmPosition)) return "Defans";
    if (["Goalkeeper"].includes(tmPosition)) return "Kaleci";
    return "Bilinmiyor";
  };

  const getAllowedCategories = (pos: string) => {
    const isForward = ["ST", "ST1", "ST2", "RW", "LW", "LM", "RM", "RAM", "LAM"].some(p => pos.includes(p));
    const isMidfield = ["CM", "CM1", "CM2", "CDM", "CDM1", "CDM2", "CAM", "RAM", "LAM"].some(p => pos.includes(p));
    const isDefense = ["CB", "CB1", "CB2", "LCB", "RCB", "RB", "LB", "RWB", "LWB"].some(p => pos.includes(p));
    const isGK = pos.includes("GK");
    
    const allowed = [];
    if (isForward) allowed.push("Forvet");
    if (isMidfield) allowed.push("Orta Saha");
    if (isDefense) allowed.push("Defans");
    if (isGK) allowed.push("Kaleci");
    return allowed;
  };
  
  const filteredPlayers = useMemo(() => {
    if (!selectingPos) return [];
    const validCategories = getAllowedCategories(selectingPos);
    
    return players.filter(p => {
      const pCat = getPlayerCategory(p.position);
      const posMatch = validCategories.length === 0 || validCategories.includes(pCat);
      const searchMatch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const alreadyInSquad = Object.values(squad).includes(p.name);
      return posMatch && searchMatch && !alreadyInSquad;
    }).slice(0, 50);
  }, [selectingPos, searchQuery, players, squad]);

  const fallbackPlayers = ["Arda Güler", "Kylian Mbappé", "Jude Bellingham", "Lamine Yamal", "Kenan Yıldız", "Virgil van Dijk", "Thibaut Courtois"].filter(n => !Object.values(squad).includes(n) && n.toLowerCase().includes(searchQuery.toLowerCase()));

  const displayList = players.length > 0 ? filteredPlayers : fallbackPlayers.map(name => ({ name, position: "Bilinmiyor" }));

  return (
    <div className="space-y-6">
      {/* Diziliş Seçimi ve Paylaş */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
          <span className="text-sm text-slate-400 font-bold uppercase tracking-wider mr-2">Diziliş:</span>
          {Object.keys(FORMATIONS).map(f => (
            <button
              key={f}
              onClick={() => { setFormation(f); setSquad({}); }}
              className={cn(
                "px-4 py-2 rounded-lg font-bold text-sm transition-all border",
                formation === f 
                  ? "bg-electric-500 text-white border-electric-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                  : "bg-black/30 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <button 
          onClick={handleCopyLink}
          className="bg-electric-600 hover:bg-electric-500 text-white px-5 py-3.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] flex items-center gap-2 justify-center"
        >
          <Share className="w-4 h-4" /> Linki Kopyala
        </button>
      </div>

      {/* Saha Çizimi */}
      <div className="relative w-full max-w-lg mx-auto h-[650px] bg-gradient-to-t from-green-900 to-emerald-800 rounded-xl border border-white/10 shadow-2xl overflow-hidden p-3">
        <div className="relative w-full h-full border-[3px] border-white/40 overflow-hidden">
           {/* Alt Ceza Sahası */}
           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[50%] h-[16%] border-t-[3px] border-x-[3px] border-white/40"></div>
           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[20%] h-[6%] border-t-[3px] border-x-[3px] border-white/40"></div>
           <div className="absolute bottom-[16%] left-1/2 -translate-x-1/2 w-24 h-12 border-[3px] border-b-0 rounded-t-full border-white/40"></div>
           
           {/* Orta Çizgi */}
           <div className="absolute top-1/2 left-0 w-full h-[3px] bg-white/40 -translate-y-1/2"></div>
           <div className="absolute top-1/2 left-1/2 w-28 h-28 border-[3px] border-white/40 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
           <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/40 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
           
           {/* Üst Ceza Sahası */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[50%] h-[16%] border-b-[3px] border-x-[3px] border-white/40"></div>
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[20%] h-[6%] border-b-[3px] border-x-[3px] border-white/40"></div>
           <div className="absolute top-[16%] left-1/2 -translate-x-1/2 w-24 h-12 border-[3px] border-t-0 rounded-b-full border-white/40"></div>

        {/* Oyuncu Pozisyonları */}
        {FORMATIONS[formation].map(pos => {
          const coords = POSITION_COORDS[formation][pos];
          const player = squad[pos];
          return (
            <div 
              key={pos} 
              className="absolute w-14 h-14 -translate-x-1/2 translate-y-1/2 flex flex-col items-center justify-center gap-1 group z-10"
              style={{ bottom: coords.bottom, left: coords.left }}
            >
              <button 
                onClick={() => handleSelectPlayer(pos)}
                className={cn(
                  "w-11 h-11 rounded-full flex items-center justify-center transition-all border-2 shadow-lg",
                  player 
                    ? "bg-white text-black border-white hover:scale-110" 
                    : "bg-white/10 text-white/70 backdrop-blur-md border-white/30 hover:border-electric-400 hover:text-electric-400 hover:bg-white/20"
                )}
              >
                {player ? (
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(player)}&background=fff&color=000&rounded=true`} 
                    alt={player} 
                    className="w-full h-full rounded-full"
                  />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
              </button>
              
              <div className="text-[9px] font-black uppercase bg-black/60 px-2 py-0.5 rounded text-white shadow min-w-max">
                {player ? player.split(' ').pop() : pos}
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* Oyuncu Seçme Modalı */}
      {selectingPos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setSelectingPos(null)}>
          <div 
            className="glass-panel w-full max-w-md relative animate-slide-up border border-electric-500/30 shadow-[0_0_50px_rgba(59,130,246,0.15)] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h3 className="font-bold text-white flex items-center gap-2">
                <span className="bg-electric-500/20 text-electric-400 px-2 py-0.5 rounded text-xs">{selectingPos}</span> Mevkisi İçin Oyuncu Seç
              </h3>
              <button onClick={() => setSelectingPos(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4">
              <input 
                type="text" 
                placeholder="Oyuncu ara (Örn: Arda Güler, Mbappe)" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-electric-500 mb-4"
              />
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {displayList.length === 0 ? (
                  <div className="text-center text-slate-500 py-4 text-sm">Bu mevki için oyuncu bulunamadı. Aramayı genişletin.</div>
                ) : (
                  displayList.map(p => (
                    <button 
                      key={p.name}
                      onClick={() => confirmPlayer(p.name)}
                      className="w-full text-left px-4 py-3 bg-white/5 hover:bg-electric-500/20 rounded-lg border border-white/5 transition-colors text-sm font-medium text-slate-200 flex justify-between items-center group"
                    >
                      <div className="flex items-center gap-3">
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=1e293b&color=fff&size=32`} className="rounded-full" />
                        <div>
                          <div className="text-slate-200">{p.name}</div>
                          <div className="text-[10px] bg-electric-500/20 text-electric-400 px-2 py-0.5 rounded inline-block font-bold uppercase tracking-wider">{getPlayerCategory(p.position)}</div>
                        </div>
                      </div>
                      <Plus className="w-4 h-4 text-electric-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
