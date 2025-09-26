import { MOCK_DB } from './constants.tsx';
import { User, Mission, Team, PendingPlayer } from './types.ts';

const DB_KEY = 'intel_wars_db';

const getDb = () => {
  const dbString = localStorage.getItem(DB_KEY);
  if (dbString) {
    return JSON.parse(dbString);
  }
  // Initialize if not present and set mock passwords for login
  const initialDb = { ...MOCK_DB };
  initialDb.users.forEach((user: User) => { user.password = 'password123'; });
  localStorage.setItem(DB_KEY, JSON.stringify(initialDb));
  return initialDb;
};

const saveDb = (db: any) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

export const db = {
  // READ
  getUsers: (): User[] => getDb().users,
  getMissions: (): Mission[] => getDb().missions,
  getTeams: (): Team[] => getDb().teams,
  getPendingPlayers: (): PendingPlayer[] => getDb().pendingPlayers,
  
  // WRITE
  addUser: (user: User) => {
    const currentDb = getDb();
    currentDb.users.push(user);
    saveDb(currentDb);
  },
  
  addMission: (mission: Mission) => {
    const currentDb = getDb();
    currentDb.missions.unshift(mission); // Add to top
    saveDb(currentDb);
  },

  updateMissions: (missions: Mission[]) => {
      const currentDb = getDb();
      currentDb.missions = missions;
      saveDb(currentDb);
  },

  addPendingPlayer: (pendingPlayer: PendingPlayer) => {
     const currentDb = getDb();
     if(!currentDb.pendingPlayers.some((p: PendingPlayer) => p.mission_id === pendingPlayer.mission_id && p.player_email === pendingPlayer.player_email)) {
       currentDb.pendingPlayers.push(pendingPlayer);
       saveDb(currentDb);
     }
  },
  
  updateTeams: (teams: Team[]) => {
      const currentDb = getDb();
      currentDb.teams = teams;
      saveDb(currentDb);
  },

  updatePendingPlayers: (players: PendingPlayer[]) => {
      const currentDb = getDb();
      currentDb.pendingPlayers = players;
      saveDb(currentDb);
  },

  updateUser: (updatedUser: User) => {
    const currentDb = getDb();
    const index = currentDb.users.findIndex((u: User) => u.id === updatedUser.id);
    if (index !== -1) {
      currentDb.users[index] = { ...currentDb.users[index], ...updatedUser };
      saveDb(currentDb);
    }
  }
};