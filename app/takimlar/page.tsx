import { TeamGrid } from "@/components/teams/TeamGrid";
import { getTeams } from "@/lib/api";

export const revalidate = 86400; // 24 saatte bir ISR

export default async function TeamsPage() {
  const teamsData = await getTeams(1, 2026);
  const teams = teamsData || [];

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display text-3xl font-black text-white">Takımlar</h2>
          <p className="text-sm text-slate-400 mt-1">2026 Dünya Kupası'na katılacak takımların tam kadrosu ve detayları.</p>
        </div>
      </div>
      
      {teams.length === 0 ? (
        <div className="glass-panel p-12 text-center flex flex-col items-center">
          <div className="w-12 h-12 text-slate-500 mb-4" />
          <h3 className="text-xl font-bold text-slate-300 mb-2">Takımlar Bekleniyor</h3>
          <p className="text-slate-400">API-Football veritabanında 2026 Dünya Kupası takımları henüz yayına alınmadığı için liste boş görünmektedir. Maçlar oynandıkça veya API güncellendikçe otomatik olarak düşecektir.</p>
        </div>
      ) : (
        <TeamGrid teams={teams} />
      )}
    </div>
  );
}
