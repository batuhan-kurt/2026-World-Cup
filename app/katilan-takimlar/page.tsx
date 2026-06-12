import { getTeamsInfoData } from "@/lib/data-service";
import { WC_2026_CONFIG } from "@/lib/wc2026-config";
import { Trophy, Calendar, MapPin, CheckCircle2 } from "lucide-react";

export const revalidate = 86400;

export default function ParticipatingTeamsPage() {
  const teamsInfo = getTeamsInfoData();
  
  // Combine with config data for logos and turkish names
  const teamsList = Object.entries(teamsInfo).map(([name, info]: [string, any]) => {
    const configTeam = WC_2026_CONFIG.teams.find(t => 
      (t as any).turkishName === name || t.name === name || t.name.includes(name)
    );
    
    return {
      name,
      ...info,
      logo: configTeam ? configTeam.logo : 'https://media.api-sports.io/football/leagues/1.png',
      id: configTeam ? configTeam.id : Math.random()
    };
  });

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h2 className="font-display text-3xl font-black text-white">Katılan Takımlar</h2>
        <p className="text-sm text-slate-400 mt-1">2026 Dünya Kupası'na katılmaya hak kazanan takımların ansiklopedik bilgileri.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamsList.map((team, idx) => (
          <div key={idx} className="glass-card overflow-hidden hover:-translate-y-1 transition-transform group">
            <div className="bg-white/5 px-6 py-5 border-b border-white/5 flex items-center gap-4">
              <div className="w-12 h-10 rounded-full overflow-hidden flex items-center justify-center bg-white/5 border border-white/10 p-1">
                <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />
              </div>
              <h3 className="font-bold text-xl text-white group-hover:text-electric-400 transition-colors">{team.name}</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-electric-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Nasıl Katıldı?</p>
                  <p className="text-sm font-medium text-slate-200">{team.how_qualified}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Katılım Sayısı & Son Katılım</p>
                  <p className="text-sm font-medium text-slate-200">{team.appearances.replace('.', '')}. Katılımı (Son: {team.last_app})</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Trophy className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">En İyi Derece</p>
                  <p className="text-sm font-medium text-gold-300">{team.best_result}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
