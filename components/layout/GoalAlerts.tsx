"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function GoalAlerts() {
  const { data } = useSWR("/api/tournament-stats", fetcher, { refreshInterval: 60000 });
  const [lastGoalCount, setLastGoalCount] = useState<number | null>(null);
  const [showGoalAlert, setShowGoalAlert] = useState(false);

  useEffect(() => {
    if (data && data.totalGoals !== undefined) {
      if (lastGoalCount !== null && data.totalGoals > lastGoalCount) {
        // Yeni gol var!
        setShowGoalAlert(true);
        // 5 saniye sonra gizle
        setTimeout(() => setShowGoalAlert(false), 5000);
      }
      setLastGoalCount(data.totalGoals);
    }
  }, [data, lastGoalCount]);

  if (!showGoalAlert) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-bounce">
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.5)] border border-white/20 flex items-center gap-4">
        <div className="text-3xl animate-pulse">⚽</div>
        <div>
          <h4 className="font-black text-lg tracking-wider">GOL BİLDİRİMİ!</h4>
          <p className="text-sm font-medium text-white/90">Ağlar havalandı! Skorlar güncellendi.</p>
        </div>
      </div>
    </div>
  );
}
