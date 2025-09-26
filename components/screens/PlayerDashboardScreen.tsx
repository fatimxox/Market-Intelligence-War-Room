import React, { useState, useEffect } from 'react';
import Card from '../ui/Card.tsx';
import Button from '../ui/Button.tsx';
import { Mission, MissionStatus, User, UserRole } from '../../types.ts';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Target, Users, Clock, Trophy, Zap, AlertCircle, Play, Eye, Crown, Shield, BarChart3 } from '../../constants.tsx';
import { db } from '../../db.ts';

const DashboardScreen: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [requestedMissions, setRequestedMissions] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('war-room-user');
    if (storedUser) {
      const parsedUser: User = JSON.parse(storedUser);
      setUser(parsedUser);
      
      const allMissions = db.getMissions();
      const allDbUsers = db.getUsers();

      if (parsedUser.role === UserRole.ADMIN) {
        setMissions(allMissions);
        setAllUsers(allDbUsers);
      } else {
        setMissions(allMissions.filter(m => m.status === MissionStatus.RECRUITING));
        const pending = db.getPendingPlayers().filter(p => p.player_email === parsedUser.email);
        setRequestedMissions(new Set(pending.map(p => p.mission_id)));
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const isAdmin = user?.role === UserRole.ADMIN;

  const getStatusColor = (status: MissionStatus) => {
    switch (status) {
      case MissionStatus.RECRUITING: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case MissionStatus.ACTIVE: return 'bg-accent/20 text-accent border-accent/30';
      case MissionStatus.EVALUATION: return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case MissionStatus.COMPLETED: return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: MissionStatus) => {
    switch (status) {
      case MissionStatus.RECRUITING: return <Users className="w-4 h-4" />;
      case MissionStatus.ACTIVE: return <Play className="w-4 h-4" />;
      case MissionStatus.EVALUATION: return <Clock className="w-4 h-4" />;
      case MissionStatus.COMPLETED: return <Trophy className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleRequestJoin = (missionId: string) => {
    if (!user) return;
    setRequestedMissions(prev => new Set(prev).add(missionId));
    db.addPendingPlayer({
      id: `pp-${Date.now()}`,
      mission_id: missionId,
      player_email: user.email,
      player_name: user.displayName,
      joined_at: new Date().toISOString(),
      assigned_to_team: false,
    });
  };

  const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <Card className="bg-panel border-panel-border">
      <div className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 font-medium">{title}</p>
          <p className="text-2xl font-bold text-primary-text">{value}</p>
        </div>
        <div className="text-accent">{icon}</div>
      </div>
    </Card>
  );

  const getWinRate = () => {
    if (!user?.total_missions) return 0;
    return Math.round(((user.missions_won || 0) / user.total_missions) * 100);
  }

  return (
    <div className="min-h-screen bg-background p-6">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {isAdmin ? <Crown className="w-8 h-8 text-accent" /> : <Shield className="w-8 h-8 text-accent" />}
              <h1 className="text-3xl font-bold text-primary-text">{isAdmin ? 'Game Master Control Center' : 'Operative Dashboard'}</h1>
            </div>
            <p className="text-gray-400">Welcome, {user?.displayName}. {isAdmin ? 'Create and manage missions.' : 'Join missions and compete.'}</p>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isAdmin ? (
            <>
              <StatCard title="Total Missions" value={missions.length} icon={<Target className="w-8 h-8" />} />
              <StatCard title="Active Players" value={allUsers.length} icon={<Users className="w-8 h-8" />} />
              <StatCard title="Live Missions" value={missions.filter(m => m.status === 'active').length} icon={<Zap className="w-8 h-8" />} />
              <StatCard title="Completed" value={missions.filter(m => m.status === 'completed').length} icon={<BarChart3 className="w-8 h-8" />} />
            </>
          ) : (
             <>
              <StatCard title="Total Missions" value={user?.total_missions || 0} icon={<Target className="w-8 h-8" />} />
              <StatCard title="Missions Won" value={user?.missions_won || 0} icon={<Trophy className="w-8 h-8" />} />
              <StatCard title="Win Rate" value={`${getWinRate()}%`} icon={<Trophy className="w-8 h-8" />} />
              <StatCard title="Available Missions" value={missions.length} icon={<Zap className="w-8 h-8" />} />
            </>
          )}
        </section>

        <main>
          <Card className="bg-panel border-panel-border">
            <div className="p-6">
              <h2 className="text-xl font-bold text-primary-text flex items-center gap-2">
                <Target className="w-5 h-5 text-accent" />
                {isAdmin ? 'All Missions' : 'Available Missions'}
              </h2>
            </div>
            <div className="p-6 pt-0">
              {missions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No missions available at this time.</div>
              ) : (
                <div className="grid gap-4">
                  {missions.map(mission => (
                    <div key={mission.id} className="bg-secondary rounded-lg p-6 hover:bg-secondary-hover transition-colors duration-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-primary-text">{mission.title}</h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(mission.status)}`}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(mission.status)}
                              <span className="capitalize">{mission.status}</span>
                            </div>
                          </span>
                        </div>
                        <p className="text-gray-400 mb-2">Target: <span className="text-accent font-medium">{mission.target_company}</span></p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <div className="flex items-center gap-1"><Users className="w-4 h-4" /><span>{mission.max_players_per_team} per team</span></div>
                          <div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span>{mission.time_limit_minutes} minutes</span></div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {isAdmin ? (
                          <Link to="/admin/mission-hub"><Button variant="outline" size="sm"><Eye className="w-4 h-4 mr-2" />Manage</Button></Link>
                        ) : (
                          <Button 
                            onClick={() => handleRequestJoin(mission.id)} 
                            disabled={requestedMissions.has(mission.id)}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            {requestedMissions.has(mission.id) ? 'Request Sent' : 'Request to Join'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </main>
    </div>
  );
};

export default DashboardScreen;