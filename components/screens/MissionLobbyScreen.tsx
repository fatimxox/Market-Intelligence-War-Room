import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Team, Mission, PlayerAssignment } from '../../types.ts';
import Card from '../ui/Card.tsx';
import Button from '../ui/Button.tsx';
// FIX: Corrected icon import path
import { Crown, Users, ChevronRight } from '../../src/components/icons.tsx';
// FIX: Corrected db import path
import { db } from '../../src/lib/db.ts';

const MissionLobbyScreen: React.FC = () => {
    const { missionId } = useParams<{ missionId: string }>();
    const navigate = useNavigate();

    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [mission, setMission] = useState<Mission | null>(null);
    const [teamAlpha, setTeamAlpha] = useState<Team | null>(null);
    const [teamBeta, setTeamBeta] = useState<Team | null>(null);
    const [lastUpdated, setLastUpdated] = useState(Date.now());

    const refreshData = useCallback(() => {
        if (!missionId) return;
        const user = JSON.parse(localStorage.getItem('war-room-user') || '{}');
        setCurrentUser(user);
        
        const foundMission = db.getMissions().find(m => m.id === missionId);
        setMission(foundMission || null);

        const allTeams = db.getTeams();
        setTeamAlpha(allTeams.find(t => t.mission_id === missionId && t.team_name === 'alpha') || null);
        setTeamBeta(allTeams.find(t => t.mission_id === missionId && t.team_name === 'beta') || null);
    }, [missionId]);

    useEffect(() => {
        refreshData();
    }, [missionId, lastUpdated, refreshData]);
    
    const handleTeamAction = (teamName: 'alpha' | 'beta', action: 'join' | 'leader') => {
        if (!currentUser || !mission) return;

        let allTeams = [...db.getTeams()];

        if (action === 'join') {
            // When joining, first remove the user from any team they might be on for this mission.
            allTeams = allTeams.map(t => {
                if (t.mission_id === mission.id) {
                    return { ...t, members: t.members.filter(m => m.email !== currentUser.email) };
                }
                return t;
            });

            let targetTeam = allTeams.find(t => t.mission_id === mission.id && t.team_name === teamName);
            const newMember: PlayerAssignment = {
                email: currentUser.email,
                display_name: currentUser.displayName,
                battle_role: null
            };

            if (targetTeam) {
                if (targetTeam.members.length < mission.max_players_per_team) {
                    targetTeam.members.push(newMember);
                }
            } else {
                // Create the team if it doesn't exist yet
                targetTeam = {
                    id: `team-${teamName}-${mission.id}`,
                    mission_id: mission.id,
                    team_name: teamName,
                    team_leader_email: '',
                    members: [newMember]
                };
                allTeams.push(targetTeam);
            }
        } else if (action === 'leader') {
            // To become a leader, the user must already be on the team. This action only sets the leader email.
            const targetTeamIndex = allTeams.findIndex(t => t.mission_id === mission.id && t.team_name === teamName);
            if (targetTeamIndex !== -1) {
                const targetTeam = allTeams[targetTeamIndex];
                if (!targetTeam.team_leader_email && targetTeam.members.some(m => m.email === currentUser.email)) {
                    allTeams[targetTeamIndex] = { ...targetTeam, team_leader_email: currentUser.email };
                }
            }
        }

        db.updateTeams(allTeams);
        setLastUpdated(Date.now());
    };
    
    if (!mission || !currentUser) return <div className="p-6 text-center">Loading Staging Area...</div>;

    const userTeam = teamAlpha?.members.some(m => m.email === currentUser.email) ? 'alpha' : teamBeta?.members.some(m => m.email === currentUser.email) ? 'beta' : null;

    const TeamColumn: React.FC<{ team: Team | null, teamName: 'alpha' | 'beta' }> = ({ team, teamName }) => {
        const isLeader = currentUser.email === team?.team_leader_email;
        const canBecomeLeader = userTeam === teamName && !team?.team_leader_email;
        const color = teamName === 'alpha' ? 'text-team-alpha' : 'text-team-beta';
        const accentColor = teamName === 'alpha' ? 'border-team-alpha' : 'border-team-beta';
        
        return (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: teamName === 'alpha' ? 0.1 : 0.2 }}>
                <Card className={`bg-panel border-2 ${isLeader ? accentColor : 'border-panel-border'} h-full flex flex-col`}>
                    <div className="p-6">
                        <h2 className={`text-2xl font-bold ${color}`}>Team {teamName.toUpperCase()}</h2>
                        <p className="text-gray-400 text-sm">({team?.members.length || 0} / {mission.max_players_per_team}) Operatives</p>
                    </div>
                    <div className="p-6 pt-0 space-y-3 flex-grow">
                        {team?.members.map(member => (
                            <div key={member.email} className="bg-secondary p-3 rounded-lg flex items-center gap-3">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.email}`} alt="avatar" className="w-8 h-8 rounded-full bg-accent/20"/>
                                <span className="font-medium">{member.display_name}</span>
                                {/* FIX: Removed invalid 'title' prop from Crown component. */}
                                {team.team_leader_email === member.email && <Crown className={`w-5 h-5 ml-auto ${color}`}/>}
                            </div>
                        ))}
                    </div>
                    <div className="p-6 mt-auto border-t border-panel-border space-y-2">
                        {isLeader && (
                             <Button onClick={() => navigate(`/strategy/${missionId}/${teamName}`)} className="w-full">
                                Proceed to Strategy <ChevronRight className="w-4 h-4 ml-2"/>
                            </Button>
                        )}
                        {canBecomeLeader && (
                            <Button onClick={() => handleTeamAction(teamName, 'leader')} variant="outline" className="w-full">
                                <Crown className="w-4 h-4 mr-2"/> Become Leader
                            </Button>
                        )}
                        {!userTeam && (
                            <Button onClick={() => handleTeamAction(teamName, 'join')} variant="secondary" className="w-full">Join Team</Button>
                        )}
                        {userTeam === teamName && !isLeader && <p className="text-center text-sm text-gray-400">Waiting for leader...</p>}
                    </div>
                </Card>
            </motion.div>
        );
    }

    return (
        <div className="p-6">
            <header className="text-center mb-8">
                <h1 className="text-3xl font-bold">Staging Area</h1>
                <p className="text-gray-400">Mission: <span className="text-accent font-medium">{mission.title}</span></p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                <TeamColumn team={teamAlpha} teamName="alpha" />
                <TeamColumn team={teamBeta} teamName="beta" />
            </div>
        </div>
    );
};

export default MissionLobbyScreen;