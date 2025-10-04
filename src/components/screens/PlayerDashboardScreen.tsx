import React, { useState, useEffect } from 'react';
import Card from '../ui/Card.tsx';
import Button from '../ui/Button.tsx';
import { Mission, MissionStatus, User, UserRole } from '../../types.ts';
import { useNavigate } from 'react-router-dom';
import { Target, Users, Clock, Trophy, Zap, AlertCircle, Play, Eye, Crown, Shield, BarChart3, Calendar, ChevronRight, TrendingUp } from '../icons.tsx';
import { db } from '../../lib/db.ts';
import { motion } from 'framer-motion';

const DashboardScreen: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const storedUser = localStorage.getItem('war-room-user');
      if (storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);

        const allMissions = await db.getMissions();
        const allDbUsers = await db.getUsers();

        if (parsedUser.role === UserRole.ADMIN) {
          setMissions(allMissions);
          setAllUsers(allDbUsers);
        } else {
          setMissions(allMissions.filter(m => [MissionStatus.SCHEDULED, MissionStatus.RECRUITING, MissionStatus.ACTIVE, MissionStatus.COMPLETED].includes(m.status)));
        }
      } else {
        navigate('/login');
      }
    };
    loadData();
  }, [navigate]);

  const isAdmin = user?.role === UserRole.ADMIN;

  const getStatusColor = (status: MissionStatus) => {
    switch (status) {
      case MissionStatus.SCHEDULED: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case MissionStatus.RECRUITING: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case MissionStatus.ACTIVE: return 'bg-accent/20 text-accent border-accent/30 animate-pulse';
      case MissionStatus.EVALUATION: return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case MissionStatus.COMPLETED: return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: MissionStatus) => {
    switch (status) {
      case MissionStatus.SCHEDULED: return <Calendar className="w-4 h-4" />;
      case MissionStatus.RECRUITING: return <Users className="w-4 h-4" />;
      case MissionStatus.ACTIVE: return <Zap className="w-4 h-4" />;
      case MissionStatus.EVALUATION: return <Clock className="w-4 h-4" />;
      case MissionStatus.COMPLETED: return <Trophy className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactElement<React.SVGProps<SVGSVGElement>> }> = ({ title, value, icon }) => (
    <Card className="p-5 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -right-4 -top-4 text-panel-border/10">
            {React.cloneElement(icon, { className: 'w-24 h-24' })}
        </div>
        <p className="text-sm text-gray-400 font-medium">{title}</p>
        <p className="text-4xl font-bold text-primary-text mt-2 z-10">{value}</p>
    </Card>
  );

  const getWinRate = () => {
    if (!user?.total_missions) return 0;
    return Math.round(((user.missions_won || 0) / user.total_missions) * 100);
  }
  
  const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {
    const loadTeams = async () => {
      const allTeams = await db.getTeams();
      setTeams(allTeams);
    };
    loadTeams();
  }, []);

  const getPlayerTeam = (missionId: string) => {
      const missionTeams = teams.filter(t => t.mission_id === missionId);
      const alpha = missionTeams.find(t => t.team_name === 'alpha' && t.members.some((m: any) => m.email === user?.email));
      if (alpha) return 'alpha';
      const beta = missionTeams.find(t => t.team_name === 'beta' && t.members.some((m: any) => m.email === user?.email));
      if (beta) return 'beta';
      return null;
  }

  return (
    <div className="min-h-screen bg-transparent p-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              {isAdmin ? <Crown className="w-8 h-8 text-accent" /> : <Shield className="w-8 h-8 text-accent" />}
              <h1 className="text-4xl font-bold text-primary-text">{isAdmin ? 'Control Center' : 'Operative Dashboard'}</h1>
            </div>
            <p className="text-gray-400">Welcome, {user?.displayName}. {isAdmin ? 'Oversee all active and pending intelligence operations.' : 'Review available missions and prepare for engagement.'}</p>
          </div>
        </header>

        <motion.section
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { staggerChildren: 0.1 } }}
        >
          {isAdmin ? (
            <>
              <StatCard title="Total Missions" value={missions.length} icon={<Target />} />
              <StatCard title="Active Players" value={allUsers.length} icon={<Users />} />
              <StatCard title="Live Missions" value={missions.filter(m => m.status === 'active').length} icon={<Zap />} />
              <StatCard title="Completed" value={missions.filter(m => m.status === 'completed').length} icon={<BarChart3 />} />
            </>
          ) : (
             <>
              <StatCard title="Total Missions" value={user?.total_missions || 0} icon={<Target />} />
              <StatCard title="Missions Won" value={user?.missions_won || 0} icon={<Trophy />} />
              <StatCard title="Win Rate" value={`${getWinRate()}%`} icon={<TrendingUp />} />
              <StatCard title="Available Missions" value={missions.filter(m => [MissionStatus.RECRUITING, MissionStatus.SCHEDULED].includes(m.status)).length} icon={<Play />} />
            </>
          )}
        </motion.section>

        <main>
            <div className="flex justify-between items-center mb-4 px-2">
                <h2 className="text-2xl font-bold text-primary-text flex items-center gap-2">
                    <Target className="w-6 h-6 text-accent" />
                    {isAdmin ? 'All Missions' : 'Mission Briefings'}
                </h2>
                 {isAdmin && <Button onClick={() => navigate('/admin/mission-hub')}><Eye className="w-4 h-4 mr-2" />Manage All Missions</Button>}
            </div>
              {missions.length === 0 ? (
                <Card className="text-center py-20 text-gray-400">
                    No missions available at this time.
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {missions.map(mission => {
                    const playerTeam = getPlayerTeam(mission.id);
                    return (
                    <motion.div
                      key={mission.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                    <Card className="p-6 h-full flex flex-col justify-between group">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(mission.status)}`}>
                            <div className="flex items-center gap-1.5">
                              {getStatusIcon(mission.status)}
                              <span className="capitalize">{mission.status}</span>
                            </div>
                          </span>
                          <div className="text-xs text-gray-400 font-mono">ID: {mission.id}</div>
                        </div>
                        <h3 className="text-xl font-semibold text-primary-text my-3">{mission.title}</h3>
                        <p className="text-gray-400 mb-4 text-sm">Target Company: <span className="text-accent font-medium">{mission.target_company}</span></p>
                        <div className="flex items-center gap-6 text-sm text-gray-400 border-t border-panel-border pt-4">
                          <div className="flex items-center gap-2"><Users className="w-4 h-4" /><span>{mission.max_players_per_team} per team</span></div>
                          <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>{mission.time_limit_minutes} minutes</span></div>
                           {mission.status === MissionStatus.SCHEDULED && mission.mission_start_time && (
                              <div className="flex items-center gap-2 text-yellow-400"><Calendar className="w-4 h-4" /><span>{new Date(mission.mission_start_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>
                           )}
                        </div>
                         {mission.status === MissionStatus.COMPLETED && (
                            <div className="mt-4 pt-4 border-t border-panel-border">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-semibold">Result</p>
                                        <p className={`text-lg font-bold ${mission.winner_team === 'alpha' ? 'text-team-alpha' : mission.winner_team === 'beta' ? 'text-team-beta' : 'text-gray-300'}`}>
                                            Team {mission.winner_team?.toUpperCase()} {mission.winner_team !== 'tie' ? 'Victory' : 'Stalemate'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400 uppercase font-semibold">Score</p>
                                        <p className="font-mono text-lg">
                                            <span className="text-team-alpha">{mission.team_alpha_score ?? 'N/A'}</span>
                                            <span> - </span>
                                            <span className="text-team-beta">{mission.team_beta_score ?? 'N/A'}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                      </div>
                      <div className="mt-6">
                        {isAdmin ? null : mission.status === MissionStatus.RECRUITING ? (
                          <Button onClick={() => navigate(`/lobby/${mission.id}`)} className="w-full">
                            Enter Staging Area <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"/>
                          </Button>
                        ) : mission.status === MissionStatus.ACTIVE && playerTeam ? (
                            <Button onClick={() => navigate(`/war-room/${mission.id}/${playerTeam}`)} className="w-full animate-subtle-pulse">
                                Re-enter War Room <Zap className="w-4 h-4 ml-2"/>
                            </Button>
                        ) : mission.status === MissionStatus.COMPLETED ? (
                            <Button onClick={() => navigate(`/mission-results/${mission.id}`)} variant="outline" className="w-full">
                                View Results <Eye className="w-4 h-4 ml-2"/>
                            </Button>
                        ) : null}
                      </div>
                    </Card>
                    </motion.div>
                  )})}
                </div>
              )}
        </main>
    </div>
  );
};

export default DashboardScreen;