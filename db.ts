import { MOCK_DB } from './constants.tsx';
import { User, Mission, Team, Report, MissionStatus } from './types.ts';

const DB_KEY = 'intel_wars_db';

const getDb = () => {
  const dbString = localStorage.getItem(DB_KEY);
  if (dbString) {
    return JSON.parse(dbString);
  }
  // Initialize if not present and set mock passwords for login
  const initialDb = { ...MOCK_DB };
  // FIX: Remove explicit type annotation to avoid type mismatch on inferred object from MOCK_DB
  initialDb.users.forEach((user) => { user.password = 'password123'; });
  localStorage.setItem(DB_KEY, JSON.stringify(initialDb));
  return initialDb;
};

const saveDb = (db: any) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

export const db = {
  // READ
  getUsers: (): User[] => getDb().users,
  getMissions: (): Mission[] => {
    const currentDb = getDb();
    const now = new Date();
    let missionsUpdated = false;

    const updatedMissions = currentDb.missions.map((mission: Mission) => {
      if (mission.status === MissionStatus.SCHEDULED && mission.mission_start_time && new Date(mission.mission_start_time) <= now) {
        missionsUpdated = true;
        return { ...mission, status: MissionStatus.RECRUITING };
      }
      return mission;
    });

    if (missionsUpdated) {
      currentDb.missions = updatedMissions;
      saveDb(currentDb);
    }
    
    return updatedMissions;
  },
  getTeams: (): Team[] => getDb().teams,
  getReports: (): Report[] => getDb().reports || [],
  
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

  addReport: (report: Report) => {
    const currentDb = getDb();
    if (!currentDb.reports) {
      currentDb.reports = [];
    }
    currentDb.reports.push(report);
    saveDb(currentDb);
  },

  updateMissions: (missions: Mission[]) => {
      const currentDb = getDb();
      currentDb.missions = missions;
      saveDb(currentDb);
  },
  
  updateTeams: (teams: Team[]) => {
      const currentDb = getDb();
      currentDb.teams = teams;
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