import React, { useState, useEffect } from 'react';
import Card from '../ui/Card.tsx';
import Button from '../ui/Button.tsx';
import Input from '../ui/Input.tsx';
import Modal from '../ui/Modal.tsx';
import { Mission, MissionStatus, User, PendingPlayer, Team } from '../../types.ts';
import { PREDEFINED_COMPANIES, Crown, Plus, Target, Users, Clock, Trophy, Play, Pause, Eye, ArrowLeft } from '../../constants.tsx';
import { db } from '../../db.ts';

const MissionHubScreen: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [missions, setMissions] = useState<Mission[]>([]);
    const [pendingPlayers, setPendingPlayers] = useState<PendingPlayer[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('war-room-user');
        if (storedUser) setUser(JSON.parse(storedUser));
        
        setMissions(db.getMissions());
        setPendingPlayers(db.getPendingPlayers());
        setTeams(db.getTeams());
    }, []);

    const handleCreateMission = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newMission: Mission = {
            id: `mission-${Date.now()}`,
            title: formData.get('title') as string,
            target_company: formData.get('target_company') as string,
            description: 'Newly created mission.',
            max_players_per_team: 5,
            time_limit_minutes: Number(formData.get('time_limit_minutes')),
            status: MissionStatus.RECRUITING,
            created_by_admin: user?.email || 'admin'
        };
        db.addMission(newMission);
        setMissions(db.getMissions());
        setCreateModalOpen(false);
    };

    const updateMissionStatus = (missionId: string, status: MissionStatus) => {
        const updatedMissions = missions.map(m => m.id === missionId ? { ...m, status, mission_start_time: status === MissionStatus.ACTIVE ? new Date().toISOString() : m.mission_start_time } : m);
        db.updateMissions(updatedMissions);
        setMissions(updatedMissions);
        if (selectedMission?.id === missionId) {
            setSelectedMission(prev => prev ? { ...prev, status } : null);
        }
    };
    
    const assignPlayerToTeam = (pendingPlayerId: string, missionId: string, teamName: 'alpha' | 'beta') => {
        const player = pendingPlayers.find(p => p.id === pendingPlayerId);
        if(!player) return;

        const updatedPendingPlayers = pendingPlayers.filter(p => p.id !== pendingPlayerId);
        db.updatePendingPlayers(updatedPendingPlayers);
        setPendingPlayers(updatedPendingPlayers);

        let teamFound = false;
        const updatedTeams = teams.map(t => {
            if (t.mission_id === missionId && t.team_name === teamName) {
                teamFound = true;
                return { ...t, members: [...t.members, { email: player.player_email, display_name: player.player_name, battle_role: null }] };
            }
            return t;
        });
        
        if (teamFound) {
             db.updateTeams(updatedTeams);
             setTeams(updatedTeams);
        } else {
            const newTeam: Team = {
                id: `team-${teamName}-${missionId}`, mission_id: missionId, team_name: teamName,
                team_leader_email: player.player_email,
                members: [{ email: player.player_email, display_name: player.player_name, battle_role: null }]
            };
            const finalTeams = [...teams, newTeam];
            db.updateTeams(finalTeams);
            setTeams(finalTeams);
        }
    };

    const setTeamLeader = (teamId: string, leaderEmail: string) => {
        const updatedTeams = teams.map(t => t.id === teamId ? { ...t, team_leader_email: leaderEmail } : t);
        db.updateTeams(updatedTeams);
        setTeams(updatedTeams);
    };

    const getStatusColor = (status: MissionStatus) => {
        switch (status) {
            case 'draft': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
            case 'recruiting': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'active': return 'bg-accent/20 text-accent border-accent/30';
            case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
            default: return '';
        }
    }

    const MissionManager = () => {
        if (!selectedMission) return null;
        const alphaTeam = teams.find(t => t.mission_id === selectedMission.id && t.team_name === 'alpha');
        const betaTeam = teams.find(t => t.mission_id === selectedMission.id && t.team_name === 'beta');
        const missionPendingPlayers = pendingPlayers.filter(p => p.mission_id === selectedMission.id);

        return (
            <Card className="bg-panel border-panel-border">
                 <div className="p-6 flex flex-row items-center justify-between">
                    <h2 className="text-xl font-bold text-primary-text flex items-center gap-2">
                        <Users className="w-5 h-5 text-accent" />
                        Management: {selectedMission.title}
                    </h2>
                    <Button onClick={() => setSelectedMission(null)} variant="outline" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Missions
                    </Button>
                </div>
                <div className="p-6 pt-0 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div>
                        <h3 className="font-semibold mb-4">Pending Players ({missionPendingPlayers.length})</h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                           {missionPendingPlayers.length > 0 ? missionPendingPlayers.map(p => (
                               <div key={p.id} className="bg-secondary p-4 rounded-lg">
                                   <p className="font-medium">{p.player_name}</p>
                                   <div className="flex gap-2 mt-2">
                                       <Button onClick={() => assignPlayerToTeam(p.id, selectedMission.id, 'alpha')} size="sm" className="bg-blue-600 hover:bg-blue-700 w-full">→ Alpha</Button>
                                       <Button onClick={() => assignPlayerToTeam(p.id, selectedMission.id, 'beta')} size="sm" className="bg-red-600 hover:bg-red-700 w-full">→ Beta</Button>
                                   </div>
                               </div>
                           )) : <p className="text-gray-500 text-sm">No players have requested to join.</p>}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-blue-400 mb-4">Team Alpha ({alphaTeam?.members.length || 0})</h3>
                        <div className="space-y-3">
                            {alphaTeam?.members.map(m => (
                                <div key={m.email} className="bg-secondary p-3 rounded-lg flex items-center justify-between">
                                    <p className="flex items-center gap-2">
                                        {alphaTeam.team_leader_email === m.email && <Crown className="w-4 h-4 text-accent" />}
                                        {m.display_name}
                                    </p>
                                    {alphaTeam.team_leader_email !== m.email && 
                                        <Button variant="ghost" size="icon" onClick={() => setTeamLeader(alphaTeam.id, m.email)} title="Make leader"><Crown className="w-4 h-4 text-gray-500 hover:text-accent"/></Button>
                                    }
                                </div>
                            ))}
                        </div>
                    </div>
                     <div>
                        <h3 className="font-semibold text-red-400 mb-4">Team Beta ({betaTeam?.members.length || 0})</h3>
                         <div className="space-y-3">
                            {betaTeam?.members.map(m => (
                                <div key={m.email} className="bg-secondary p-3 rounded-lg flex items-center justify-between">
                                    <p className="flex items-center gap-2">
                                        {betaTeam.team_leader_email === m.email && <Crown className="w-4 h-4 text-accent" />}
                                        {m.display_name}
                                    </p>
                                    {betaTeam.team_leader_email !== m.email && 
                                        <Button variant="ghost" size="icon" onClick={() => setTeamLeader(betaTeam.id, m.email)} title="Make leader"><Crown className="w-4 h-4 text-gray-500 hover:text-accent"/></Button>
                                    }
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>
        )
    }

    return (
        <div className="min-h-screen bg-background text-primary-text p-6">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Mission Hub</h1>
                    <p className="text-gray-400">Create, manage, and monitor intelligence operations.</p>
                </div>
                <Button onClick={() => setCreateModalOpen(true)}><Plus className="w-4 h-4 mr-2"/>Create Mission</Button>
            </header>

            {selectedMission ? <MissionManager/> : (
            <Card className="bg-panel border-panel-border">
                <div className="p-6">
                    <h2 className="text-xl font-bold flex items-center gap-2"><Target className="w-5 h-5 text-accent"/>Mission Control</h2>
                </div>
                 <div className="p-6 pt-0">
                     <div className="grid gap-4">
                     {missions.map(m => (
                         <div key={m.id} className="bg-secondary p-6 rounded-lg flex flex-col md:flex-row justify-between items-start gap-4">
                             <div className="flex-1">
                                 <div className="flex items-center gap-3 mb-2">
                                     <h3 className="text-lg font-semibold">{m.title}</h3>
                                     <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusColor(m.status)}`}>{m.status}</span>
                                 </div>
                                 <p className="text-gray-400 mb-2">Target: <span className="font-medium text-accent">{m.target_company}</span></p>
                                 <div className="flex items-center gap-4 text-xs text-gray-400">
                                    <span className="flex items-center gap-1"><Users/>{m.max_players_per_team} per team</span>
                                    <span className="flex items-center gap-1"><Clock/>{m.time_limit_minutes} min</span>
                                     {m.winner_team && <span className="flex items-center gap-1 text-accent"><Trophy/> Team {m.winner_team} Won</span>}
                                 </div>
                             </div>
                             <div className="flex gap-2">
                                 {m.status === 'recruiting' && <Button onClick={() => updateMissionStatus(m.id, MissionStatus.ACTIVE)} size="sm"><Play className="w-4 h-4 mr-1"/>Launch Mission</Button>}
                                 {m.status === 'active' && <Button onClick={() => updateMissionStatus(m.id, MissionStatus.EVALUATION)} size="sm" variant="outline" className="border-orange-500/30 text-orange-400 hover:bg-orange-500/20"><Pause className="w-4 h-4 mr-1"/>End Mission</Button>}
                                 <Button onClick={() => setSelectedMission(m)} size="sm" variant="outline"><Eye className="w-4 h-4 mr-1"/>Manage</Button>
                             </div>
                         </div>
                     ))}
                     </div>
                 </div>
            </Card>
            )}

            <Modal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Mission">
                <form onSubmit={handleCreateMission} className="space-y-4">
                    <Input id="title" name="title" label="Mission Title" type="text" placeholder="Operation Codename" required />
                    <div>
                        <label htmlFor="target_company" className="block text-sm font-medium mb-1">Target Company</label>
                        <select id="target_company" name="target_company" className="w-full bg-background border border-panel-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent">
                            {PREDEFINED_COMPANIES.map(company => <option key={company} value={company}>{company}</option>)}
                        </select>
                    </div>
                    <Input id="time_limit_minutes" name="time_limit_minutes" label="Time Limit (minutes)" type="number" defaultValue="60" required />
                    <Button type="submit" className="w-full">Create Mission</Button>
                </form>
            </Modal>
        </div>
    );
};

export default MissionHubScreen;