import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../ui/Card.tsx';
import Button from '../ui/Button.tsx';
import Input from '../ui/Input.tsx';
import Modal from '../ui/Modal.tsx';
import DateTimePicker from '../ui/DateTimePicker.tsx';
import { Mission, MissionStatus, User, Team } from '../../types.ts';
// FIX: Corrected icon import path
import { Crown, Plus, Target, Users, Clock, Trophy, Play, Pause, Eye, ArrowLeft, Calendar, Zap, AlertCircle } from '../../src/components/icons.tsx';
import { PREDEFINED_COMPANIES } from '../../constants.tsx';
// FIX: Corrected db import path
import { db } from '../../src/lib/db.ts';

const MissionHubScreen: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [missions, setMissions] = useState<Mission[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
    const [newMission, setNewMission] = useState({
        title: '',
        target_company: '',
        time_limit_minutes: 60,
    });
    const [newMissionStartTime, setNewMissionStartTime] = useState<Date | null>(new Date(Date.now() + 24 * 60 * 60 * 1000));

    useEffect(() => {
        const storedUser = localStorage.getItem('war-room-user');
        if (storedUser) setUser(JSON.parse(storedUser));
        
        setMissions(db.getMissions());
        setTeams(db.getTeams());
    }, []);

    const handleCreateMission = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const mission: Mission = {
            id: `mission-${Date.now()}`,
            title: newMission.title,
            target_company: newMission.target_company,
            description: 'Newly created mission.',
            max_players_per_team: 5,
            time_limit_minutes: newMission.time_limit_minutes,
            status: newMissionStartTime && newMissionStartTime > new Date() ? MissionStatus.SCHEDULED : MissionStatus.RECRUITING,
            created_by_admin: user?.email || 'admin',
            mission_start_time: newMissionStartTime ? newMissionStartTime.toISOString() : undefined,
        };
        db.addMission(mission);
        setMissions(db.getMissions());
        setCreateModalOpen(false);
        setNewMission({ title: '', target_company: '', time_limit_minutes: 60 });
        setNewMissionStartTime(new Date(Date.now() + 24 * 60 * 60 * 1000));
    };

    const updateMissionStatus = (missionId: string, status: MissionStatus) => {
        const updatedMissions = missions.map(m => m.id === missionId ? { ...m, status, mission_start_time: status === MissionStatus.ACTIVE ? new Date().toISOString() : m.mission_start_time } : m);
        db.updateMissions(updatedMissions);
        setMissions(updatedMissions);
        if (selectedMission?.id === missionId) {
            setSelectedMission(prev => prev ? { ...prev, status } : null);
        }
        if (status === MissionStatus.ACTIVE) {
            const launchedMission = updatedMissions.find(m => m.id === missionId);
            if (launchedMission) {
                setSelectedMission(launchedMission);
            }
        }
    };

    // FIX: Added explicit return type React.ReactElement<React.SVGProps<SVGSVGElement>> to help TypeScript infer props for React.cloneElement.
    const getStatusInfo = (status: MissionStatus): { color: string; icon: React.ReactElement<React.SVGProps<SVGSVGElement>> } => {
        switch (status) {
            case 'draft': return { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: <AlertCircle/> };
            case 'scheduled': return { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: <Calendar/> };
            case 'recruiting': return { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: <Users/> };
            case 'active': return { color: 'bg-accent/20 text-accent border-accent/30 animate-pulse', icon: <Zap/> };
            case 'evaluation': return { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: <Clock/> };
            case 'completed': return { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: <Trophy/> };
            default: return { color: '', icon: <Users/> };
        }
    }

    const MissionManager = () => {
        if (!selectedMission) return null;
        const alphaTeam = teams.find(t => t.mission_id === selectedMission.id && t.team_name === 'alpha');
        const betaTeam = teams.find(t => t.mission_id === selectedMission.id && t.team_name === 'beta');

        return (
            <Card className="bg-panel/50 border-panel-border">
                 <div className="p-6 flex flex-row items-center justify-between border-b border-panel-border">
                    <div>
                        <h2 className="text-xl font-bold text-primary-text">
                            Mission Monitor: <span className="text-accent">{selectedMission.title}</span>
                        </h2>
                        <p className="text-sm text-gray-400">Oversee team composition and status.</p>
                    </div>
                    <Button onClick={() => setSelectedMission(null)} variant="outline" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Missions
                    </Button>
                </div>
                <div className="p-6 pt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="border border-team-alpha/50 rounded-lg p-4 bg-secondary/30">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-team-alpha text-lg">Team Alpha ({alphaTeam?.members.length || 0} / {selectedMission.max_players_per_team})</h3>
                            {selectedMission.status === 'active' && (
                                <Link to={`/war-room/${selectedMission.id}/alpha`}>
                                    <Button variant="ghost" size="sm" className="text-primary-text hover:text-accent">
                                        <Eye className="w-4 h-4 mr-1" /> View Room
                                    </Button>
                                </Link>
                            )}
                        </div>
                        <div className="space-y-3">
                            {!alphaTeam || alphaTeam.members.length === 0 ? <p className="text-gray-500 text-sm">No players yet.</p> : alphaTeam.members.map(m => (
                                <div key={m.email} className="bg-secondary p-3 rounded-lg flex items-center gap-3">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.email}`} alt="avatar" className="w-8 h-8 rounded-full"/>
                                    <p className="font-medium">
                                        {m.display_name}
                                    </p>
                                    {/* FIX: Removed invalid 'title' prop from Crown component. */}
                                    {alphaTeam.team_leader_email === m.email && <Crown className="w-5 h-5 text-accent ml-auto" />}
                                </div>
                            ))}
                        </div>
                    </div>
                     <div className="border border-team-beta/50 rounded-lg p-4 bg-secondary/30">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-team-beta text-lg">Team Beta ({betaTeam?.members.length || 0} / {selectedMission.max_players_per_team})</h3>
                             {selectedMission.status === 'active' && (
                                <Link to={`/war-room/${selectedMission.id}/beta`}>
                                    <Button variant="ghost" size="sm" className="text-primary-text hover:text-accent">
                                        <Eye className="w-4 h-4 mr-1" /> View Room
                                    </Button>
                                </Link>
                            )}
                        </div>
                         <div className="space-y-3">
                           {!betaTeam || betaTeam.members.length === 0 ? <p className="text-gray-500 text-sm">No players yet.</p> : betaTeam.members.map(m => (
                                <div key={m.email} className="bg-secondary p-3 rounded-lg flex items-center gap-3">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.email}`} alt="avatar" className="w-8 h-8 rounded-full"/>
                                    <p className="font-medium">
                                        {m.display_name}
                                    </p>
                                    {/* FIX: Removed invalid 'title' prop from Crown component. */}
                                    {betaTeam.team_leader_email === m.email && <Crown className="w-5 h-5 text-accent ml-auto" />}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>
        )
    }

    return (
        <div className="min-h-screen bg-transparent text-primary-text p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold">Mission Hub</h1>
                    <p className="text-gray-400">Create, manage, and monitor intelligence operations.</p>
                </div>
                <Button onClick={() => setCreateModalOpen(true)}><Plus className="w-4 h-4 mr-2"/>Create Mission</Button>
            </header>

            {selectedMission ? <MissionManager/> : (
            <Card>
                <div className="p-6 border-b border-panel-border">
                    <h2 className="text-xl font-bold flex items-center gap-2"><Target className="w-5 h-5 text-accent"/>Mission Control</h2>
                </div>
                 <div className="p-6">
                     <div className="space-y-4">
                     {missions.map(m => {
                         const statusInfo = getStatusInfo(m.status);
                         return (
                         <div key={m.id} className="bg-secondary p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                             <div className="flex-1">
                                 <div className="flex items-center gap-3 mb-2">
                                     <h3 className="text-lg font-semibold">{m.title}</h3>
                                     <span className={`flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold rounded-full border ${statusInfo.color} capitalize`}>{React.cloneElement(statusInfo.icon, { className: 'w-3 h-3'})} {m.status}</span>
                                 </div>
                                 <p className="text-gray-400 mb-2 text-sm">Target: <span className="font-medium text-accent">{m.target_company}</span></p>
                                 <div className="flex items-center gap-4 text-xs text-gray-400">
                                    <span className="flex items-center gap-1"><Users/>{m.max_players_per_team} per team</span>
                                    <span className="flex items-center gap-1"><Clock/>{m.time_limit_minutes} min</span>
                                     {m.winner_team && <span className="flex items-center gap-1 text-accent"><Trophy/> Team {m.winner_team} Won</span>}
                                     {m.status === MissionStatus.SCHEDULED && m.mission_start_time && (
                                        <span className="flex items-center gap-1 text-yellow-400">
                                            <Calendar className="w-3 h-3"/>
                                            {new Date(m.mission_start_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    )}
                                 </div>
                             </div>
                             <div className="flex items-center gap-2 flex-shrink-0">
                                 {[MissionStatus.RECRUITING, MissionStatus.SCHEDULED].includes(m.status) && <Button onClick={() => updateMissionStatus(m.id, MissionStatus.ACTIVE)} size="sm"><Play className="w-4 h-4 mr-1"/>Launch</Button>}
                                 {m.status === 'active' && <Button onClick={() => updateMissionStatus(m.id, MissionStatus.EVALUATION)} size="sm" variant="outline" className="border-orange-500/30 text-orange-400 hover:bg-orange-500/20"><Pause className="w-4 h-4 mr-1"/>End</Button>}
                                 <Button onClick={() => setSelectedMission(m)} size="sm" variant="outline"><Eye className="w-4 h-4 mr-1"/>Manage</Button>
                             </div>
                         </div>
                     )})}
                     </div>
                 </div>
            </Card>
            )}

            <Modal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Mission">
                <form onSubmit={handleCreateMission} className="space-y-4">
                    <Input 
                        label="Mission Title" 
                        name="title" 
                        value={newMission.title} 
                        onChange={e => setNewMission({...newMission, title: e.target.value})} 
                        required 
                        placeholder="e.g., Operation Gold Rush"
                    />
                    <div>
                         <label htmlFor="target_company" className="block text-sm font-medium text-gray-300 mb-1">Target Company</label>
                         <input 
                            id="target_company"
                            name="target_company" 
                            value={newMission.target_company} 
                            onChange={e => setNewMission({...newMission, target_company: e.target.value})} 
                            required 
                            list="company-suggestions"
                            placeholder="e.g., Stripe"
                            className="w-full bg-secondary border border-panel-border rounded-md py-2 px-3 text-primary-text placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                         />
                         <datalist id="company-suggestions">
                             {PREDEFINED_COMPANIES.map(c => <option key={c} value={c} />)}
                         </datalist>
                    </div>
                     <Input 
                        label="Time Limit (minutes)" 
                        name="time_limit_minutes" 
                        type="number" 
                        value={newMission.time_limit_minutes} 
                        onChange={e => setNewMission({...newMission, time_limit_minutes: Number(e.target.value)})} 
                        required 
                    />
                    <DateTimePicker
                        label="Mission Start Time (Optional)"
                        selected={newMissionStartTime}
                        onChange={setNewMissionStartTime}
                    />
                    <div className="text-xs text-gray-400">If start time is in the future, mission will be 'Scheduled'. Otherwise, it will be open for 'Recruiting' immediately.</div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Create Mission</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default MissionHubScreen;