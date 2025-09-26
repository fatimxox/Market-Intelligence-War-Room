import React, { useState, useEffect } from "react";
import { User, Mission } from "../../types.ts";
import Card from "../ui/Card.tsx";
import { Trophy, Target, TrendingUp, Calendar, Award, Star, Zap } from "../../constants.tsx";
import { db } from "../../db.ts";

const MyCareerScreen = () => {
  const [user, setUser] = useState<User | null>(null);
  const [missionHistory, setMissionHistory] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('war-room-user');
    if (storedUser) {
        const currentUser: User = JSON.parse(storedUser);
        setUser(currentUser);
        
        const userTeams = db.getTeams().filter(t => t.members.some(m => m.email === currentUser.email));
        const userMissionIds = userTeams.map(t => t.mission_id);
        const history = db.getMissions().filter(m => userMissionIds.includes(m.id));
        setMissionHistory(history);
    }
    setLoading(false);
  }, []);

  const getWinRate = () => {
    if (!user?.total_missions) return 0;
    return Math.round(((user.missions_won || 0) / user.total_missions) * 100);
  };
  
  const getAchievements = () => [
    { name: "First Mission", earned: (user?.total_missions || 0) > 0 },
    { name: "Team Player", earned: (user?.total_missions || 0) >= 3 },
    { name: "Victory Streak", earned: (user?.missions_won || 0) >= 2 },
    { name: "Intelligence Expert", earned: getWinRate() >= 75 },
  ];

  if (loading || !user) {
    return <div className="flex justify-center items-center h-screen">Loading Career...</div>;
  }

  return (
    <div className="p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-primary-text mb-2">My Career</h1>
          <p className="text-gray-400">Your operative performance and achievements.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <Card className="bg-panel border-panel-border h-fit">
              <div className="p-6 text-center">
                 <img src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="Avatar" className="w-20 h-20 mx-auto mb-4 rounded-full border-2 border-accent bg-accent/20"/>
                <h3 className="text-lg font-bold">{user.displayName}</h3>
                <span className="text-sm px-2 py-0.5 rounded-full bg-green-500/20 text-green-300">Active Operative</span>
              </div>
            </Card>
          </aside>
          <main className="lg:col-span-3 space-y-6">
            <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <StatCard title="Total Missions" value={user.total_missions || 0} icon={<Target />} />
                 <StatCard title="Missions Won" value={user.missions_won || 0} icon={<Trophy />} />
                 <StatCard title="Win Rate" value={`${getWinRate()}%`} icon={<TrendingUp />} />
                 <StatCard title="Skill Rating" value={getWinRate() * 10 + (user.total_missions || 0) * 5} icon={<Zap />} />
            </section>
            <Card className="bg-panel border-panel-border">
                <div className="p-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><Award className="text-accent"/>Achievements</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {getAchievements().map(ach => (
                            <div key={ach.name} className={`p-4 rounded-lg border ${ach.earned ? 'bg-accent/10 border-accent/30' : 'bg-secondary border-panel-border opacity-60'}`}>
                                <div className="flex items-center gap-3"><Star className={ach.earned ? 'text-accent' : 'text-gray-500'}/> <h4 className="font-medium">{ach.name}</h4></div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
             <Card className="bg-panel border-panel-border">
                <div className="p-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><Calendar className="text-accent"/>Mission History</h2>
                     <div className="space-y-3">
                        {missionHistory.slice(0, 5).map(m => (
                            <div key={m.id} className="flex justify-between items-center p-4 bg-secondary rounded-lg">
                                <div><h4 className="font-medium">{m.title}</h4> <p className="text-sm text-gray-400">Target: {m.target_company}</p></div>
                                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-300">{m.status}</span>
                            </div>
                        ))}
                     </div>
                </div>
            </Card>
          </main>
        </div>
    </div>
  );
};

const StatCard: React.FC<{title: string, value: string | number, icon: React.ReactNode}> = ({title, value, icon}) => (
    <Card className="bg-panel border-panel-border p-4">
        <p className="text-sm text-gray-400">{title}</p>
        <div className="flex justify-between items-end">
            <p className="text-2xl font-bold">{value}</p>
            <div className="text-accent">{icon}</div>
        </div>
    </Card>
)

export default MyCareerScreen;