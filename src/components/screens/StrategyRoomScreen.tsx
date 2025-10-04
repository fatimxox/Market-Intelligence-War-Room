import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, BattleRole, PlayerAssignment, Team, Mission } from '../../types.ts';
import Card from '../ui/Card.tsx';
import Button from '../ui/Button.tsx';
import { ROLE_BATTLE_MAP, BATTLE_CONFIGS } from '../../constants.ts';
import { ChevronRight } from '../icons.tsx';
import { db } from '../../lib/db.ts';

interface PlayerCardProps {
    member: PlayerAssignment;
    isDraggable: boolean;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, member: PlayerAssignment) => void;
    onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ member, isDraggable, onDragStart, onDragEnd }) => (
    <div
        draggable={isDraggable}
        onDragStart={(e) => onDragStart(e, member)}
        onDragEnd={onDragEnd}
        className={`p-4 rounded-xl flex items-center gap-3 transition-all duration-200 ${isDraggable ? 'cursor-move bg-secondary hover:bg-secondary-hover' : 'bg-gray-700 opacity-80 cursor-not-allowed'}`}
    >
        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.email}`} alt="avatar" className="w-10 h-10 rounded-full bg-accent/20"/>
        <div>
            <h4 className="font-medium text-primary-text">{member.display_name}</h4>
            <p className="text-xs text-gray-400">Ready for assignment</p>
        </div>
    </div>
);

const StrategyRoomScreen: React.FC = () => {
    const { missionId, teamName } = useParams();
    const navigate = useNavigate();
    
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [mission, setMission] = useState<Mission | null>(null);
    const [team, setTeam] = useState<Team | null>(null);
    
    const [roleAssignments, setRoleAssignments] = useState<Record<string, PlayerAssignment>>({});
    const [availableMembers, setAvailableMembers] = useState<PlayerAssignment[]>([]);
    
    const [draggedMember, setDraggedMember] = useState<PlayerAssignment | null>(null);
    const [dropTarget, setDropTarget] = useState<string | null>(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('war-room-user') || '{}');
        setCurrentUser(user);

        const foundMission = db.getMissions().find(m => m.id === missionId);
        const foundTeam = db.getTeams().find(t => t.mission_id === missionId && t.team_name === teamName);

        setMission(foundMission || null);
        setTeam(foundTeam || null);

        if (foundTeam) {
            const initialAssignments: Record<string, PlayerAssignment> = {};
            let unassignedMembers: PlayerAssignment[] = [];

            foundTeam.members.forEach(member => {
                if (member.battle_role) {
                    initialAssignments[member.battle_role] = member;
                } else {
                    unassignedMembers.push(member);
                }
            });
            setRoleAssignments(initialAssignments);
            setAvailableMembers(unassignedMembers);
        }
    }, [missionId, teamName]);

    const isLeader = currentUser?.email === team?.team_leader_email;

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, member: PlayerAssignment) => {
        if (!isLeader) return;
        setDraggedMember(member);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnd = () => {
        setDraggedMember(null);
        setDropTarget(null);
    };

    const handleDrop = (roleId: BattleRole) => {
        if (!isLeader || !draggedMember) return;

        const newAssignments = { ...roleAssignments };
        let newAvailable = [...availableMembers];

        // Find and remove from previous assignment if exists
        const prevRole = Object.keys(newAssignments).find(key => newAssignments[key].email === draggedMember.email);
        if (prevRole) delete newAssignments[prevRole];
        
        // If target slot is occupied, move its player to available
        if (newAssignments[roleId]) {
            newAvailable.push(newAssignments[roleId]);
        }
        
        // Assign to new role
        newAssignments[roleId] = draggedMember;

        // Remove from available list
        newAvailable = newAvailable.filter(m => m.email !== draggedMember.email);
        
        setRoleAssignments(newAssignments);
        setAvailableMembers(newAvailable);
        setDraggedMember(null);
        setDropTarget(null);
    };
    
    const launchMission = () => {
        if (!isLeader || !team) return;
        // Save assignments to the DB
        const updatedMembers = team.members.map(m => {
            const assignedRole = Object.keys(roleAssignments).find(role => roleAssignments[role].email === m.email);
            return { ...m, battle_role: (assignedRole as BattleRole) || null };
        });
        const updatedTeam = { ...team, members: updatedMembers };
        const allTeams = db.getTeams();
        const finalTeams = allTeams.map(t => t.id === updatedTeam.id ? updatedTeam : t);
        db.updateTeams(finalTeams);

        navigate(`/war-room/${missionId}/${teamName}`);
    };

    if (!mission || !team) return <div className="flex items-center justify-center h-full">Loading or invalid link...</div>;

    const BattleRoleSlot: React.FC<{ role: any }> = ({ role }) => {
        const assignedMember = roleAssignments[role.id as BattleRole];
        const IconComponent = role.icon;
        return (
             <div
                className={`bg-secondary p-6 rounded-xl transition-all duration-200 h-full flex flex-col ${dropTarget === role.id && isLeader ? 'bg-accent/20 ring-2 ring-accent' : ''}`}
                onDragOver={(e) => { e.preventDefault(); if (isLeader) setDropTarget(role.id as BattleRole); }}
                onDragLeave={() => setDropTarget(null)}
                onDrop={() => handleDrop(role.id as BattleRole)}
            >
                 <div className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-lg flex items-center justify-center`}>
                        <IconComponent className={`w-8 h-8 ${BATTLE_CONFIGS[ROLE_BATTLE_MAP[role.id as BattleRole]].color}`} />
                    </div>
                    <h3 className="text-lg font-bold">{role.name}</h3>
                    <p className="text-sm text-gray-400 mb-4">{role.description}</p>
                    {assignedMember ? (
                         <PlayerCard member={assignedMember} isDraggable={isLeader} onDragStart={handleDragStart} onDragEnd={handleDragEnd} />
                    ) : (
                        <div className="py-8 border-2 border-dashed border-panel-border rounded-lg text-gray-500">
                            Drop Player Here
                        </div>
                    )}
                 </div>
            </div>
        );
    }

    const battleRoles = Object.entries(ROLE_BATTLE_MAP).map(([id, battleKey]) => ({
        id: id as BattleRole,
        name: BATTLE_CONFIGS[battleKey].name.split(':')[1].trim().split('&')[0].trim(),
        description: BATTLE_CONFIGS[battleKey].name.split(':')[0],
        icon: BATTLE_CONFIGS[battleKey].icon,
    }));
    
    const allRolesAssigned = team.members.length > 0 && team.members.length === Object.keys(roleAssignments).length;

    return (
        <div className="p-6">
                <header className="text-center mb-8">
                    <h1 className="text-3xl font-bold">Team {team.team_name.toUpperCase()} - Mission Briefing</h1>
                    <p className="text-gray-400">Target: <span className="text-accent font-medium">{mission.title}</span></p>
                    {!isLeader && <p className="mt-2 text-sm text-accent">Waiting for team leader to assign roles...</p>}
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-10 gap-8">
                    <div className="xl:col-span-7">
                        <Card className="bg-panel border-panel-border">
                            <div className="p-6">
                                <h2 className="text-xl font-bold mb-4">Battle Role Assignments</h2>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {battleRoles.map(role => <BattleRoleSlot key={role.id} role={role} />)}
                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="xl:col-span-3">
                        <Card className="bg-panel border-panel-border">
                             <div className="p-6">
                                <h2 className="text-xl font-bold mb-4">Unassigned Players</h2>
                                <div className="space-y-4">
                                    {availableMembers.length > 0 ? availableMembers.map(member => (
                                        <PlayerCard key={member.email} member={member} isDraggable={isLeader} onDragStart={handleDragStart} onDragEnd={handleDragEnd} />
                                    )) : <p className="text-sm text-gray-500 text-center">All players assigned.</p>}
                                    {isLeader && (
                                        <div className="pt-6 border-t border-panel-border">
                                            <Button onClick={launchMission} className="w-full py-4 text-lg" disabled={!allRolesAssigned}>
                                                {allRolesAssigned ? 'Launch Mission' : 'Assign All Roles'} <ChevronRight className="w-5 h-5 ml-2"/>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
        </div>
    );
};

export default StrategyRoomScreen;