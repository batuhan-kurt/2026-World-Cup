"use client";

import { MatchResponse } from "@/lib/api";
import { formatMatchTime, getMinuteDisplay, cn } from "@/lib/utils";
import { Clock } from "lucide-react";

export function MatchCard({ match }: { match: MatchResponse }) {
  const isLive = ["1H", "2H", "HT", "ET", "BT", "P", "LIVE"].includes(match.fixture.status.short);
  const isFinished = ["FT", "AET", "PEN"].includes(match.fixture.status.short);
  const isUpcoming = !isLive && !isFinished;

  const scoreText = isUpcoming
    ? "- : -"
    : `${match.goals.home ?? 0} : ${match.goals.away ?? 0}`;

  const getStatusBadge = () => {
    if (isLive) {
      return (
        <span className="status-live">
          {getMinuteDisplay(match.fixture.status.elapsed, match.fixture.status.short)}
        </span>
      );
    }
    if (isFinished) {
      return <span className="status-finished">MS</span>;
    }
    return (
      <span className="status-upcoming flex items-center gap-1">
        <Clock className="w-3 h-3" />
        {formatMatchTime(match.fixture.date)}
      </span>
    );
  };

  return (
    <div className="glass-card p-4 group cursor-pointer relative overflow-hidden">
      {/* Background Glow during LIVE */}
      {isLive && (
        <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
      )}
      
      {/* Üst Bilgi: Zaman / Durum */}
      <div className="flex justify-between items-center mb-4 relative z-10">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          {match.league.round || "Grup Aşaması"}
        </span>
        {getStatusBadge()}
      </div>

      {/* Takımlar ve Skor */}
      <div className="flex items-center justify-between relative z-10">
        {/* Ev Sahibi */}
        <div className="flex flex-col items-center gap-2 w-1/3">
          <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center border-2 border-white/10 group-hover:border-white/30 transition-colors bg-white/5 p-1.5">
            <img src={match.teams.home.logo} alt={match.teams.home.name} className="w-full h-full object-contain" />
          </div>
          <span className="text-xs font-bold text-center text-slate-200 line-clamp-2">
            {match.teams.home.name}
          </span>
        </div>

        {/* Skor */}
        <div className="flex flex-col items-center justify-center w-1/3">
          <span className={cn(
            "font-display text-3xl font-black tracking-widest",
            isLive ? "text-red-400" : "text-white"
          )}>
            {scoreText}
          </span>
          {isFinished && match.score.penalty.home !== null && (
            <span className="text-[10px] text-slate-500 mt-1">
              (PEN: {match.score.penalty.home}-{match.score.penalty.away})
            </span>
          )}
        </div>

        {/* Deplasman */}
        <div className="flex flex-col items-center gap-2 w-1/3">
          <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center border-2 border-white/10 group-hover:border-white/30 transition-colors bg-white/5 p-1.5">
            <img src={match.teams.away.logo} alt={match.teams.away.name} className="w-full h-full object-contain" />
          </div>
          <span className="text-xs font-bold text-center text-slate-200 line-clamp-2">
            {match.teams.away.name}
          </span>
        </div>
      </div>
    </div>
  );
}
