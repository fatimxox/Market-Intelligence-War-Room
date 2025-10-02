import { supabaseDb } from './supabaseDb';
import { MOCK_DB } from '../constants';
import { User, Mission, Team, Report, MissionStatus } from '../types';

const DB_KEY = 'intel_wars_db';
const USE_SUPABASE = true;

const getDb = () => {
  try {
    const dbString = localStorage.getItem(DB_KEY);
    if (dbString) {
      const parsed = JSON.parse(dbString);
      if (parsed.users && parsed.missions && parsed.teams) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to parse DB from localStorage, resetting.", e);
    localStorage.removeItem(DB_KEY);
  }

  const initialDb = { ...MOCK_DB };
  initialDb.users.forEach(user => { user.password = '123'; });
  localStorage.setItem(DB_KEY, JSON.stringify(initialDb));
  return initialDb;
};

const saveDb = (db: any) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

export const db = {
  getUsers: (): User[] => {
    if (!USE_SUPABASE) return getDb().users;

    const cached = sessionStorage.getItem('cached_users');
    if (cached) {
      return JSON.parse(cached);
    }

    supabaseDb.getUsers().then(users => {
      sessionStorage.setItem('cached_users', JSON.stringify(users));
    });

    return JSON.parse(sessionStorage.getItem('cached_users') || '[]');
  },

  getMissions: (): Mission[] => {
    if (!USE_SUPABASE) {
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
    }

    const cached = sessionStorage.getItem('cached_missions');
    if (cached) {
      return JSON.parse(cached);
    }

    supabaseDb.getMissions().then(missions => {
      sessionStorage.setItem('cached_missions', JSON.stringify(missions));
    });

    return JSON.parse(sessionStorage.getItem('cached_missions') || '[]');
  },

  getTeams: (): Team[] => {
    if (!USE_SUPABASE) return getDb().teams;

    const cached = sessionStorage.getItem('cached_teams');
    if (cached) {
      return JSON.parse(cached);
    }

    supabaseDb.getTeams().then(teams => {
      sessionStorage.setItem('cached_teams', JSON.stringify(teams));
    });

    return JSON.parse(sessionStorage.getItem('cached_teams') || '[]');
  },

  getReports: (): Report[] => {
    if (!USE_SUPABASE) return getDb().reports || [];

    const cached = sessionStorage.getItem('cached_reports');
    if (cached) {
      return JSON.parse(cached);
    }

    supabaseDb.getReports().then(reports => {
      sessionStorage.setItem('cached_reports', JSON.stringify(reports));
    });

    return JSON.parse(sessionStorage.getItem('cached_reports') || '[]');
  },

  addUser: (user: User) => {
    if (!USE_SUPABASE) {
      const currentDb = getDb();
      currentDb.users.push(user);
      saveDb(currentDb);
      return;
    }

    supabaseDb.addUser(user).then(() => {
      sessionStorage.removeItem('cached_users');
    });
  },

  addMission: (mission: Mission) => {
    if (!USE_SUPABASE) {
      const currentDb = getDb();
      currentDb.missions.unshift(mission);
      saveDb(currentDb);
      return;
    }

    supabaseDb.addMission(mission).then(() => {
      sessionStorage.removeItem('cached_missions');
    });
  },

  addReport: (report: Report) => {
    if (!USE_SUPABASE) {
      const currentDb = getDb();
      if (!currentDb.reports) {
        currentDb.reports = [];
      }
      currentDb.reports.push(report);
      saveDb(currentDb);
      return;
    }

    supabaseDb.addReport(report).then(() => {
      sessionStorage.removeItem('cached_reports');
    });
  },

  updateMissions: (missions: Mission[]) => {
    if (!USE_SUPABASE) {
      const currentDb = getDb();
      currentDb.missions = missions;
      saveDb(currentDb);
      return;
    }

    supabaseDb.updateMissions(missions).then(() => {
      sessionStorage.removeItem('cached_missions');
    });
  },

  updateTeams: (teams: Team[]) => {
    if (!USE_SUPABASE) {
      const currentDb = getDb();
      currentDb.teams = teams;
      saveDb(currentDb);
      return;
    }

    supabaseDb.updateTeams(teams).then(() => {
      sessionStorage.removeItem('cached_teams');
    });
  },

  updateUser: (updatedUser: User) => {
    if (!USE_SUPABASE) {
      const currentDb = getDb();
      const index = currentDb.users.findIndex((u: User) => u.id === updatedUser.id);
      if (index !== -1) {
        currentDb.users[index] = { ...currentDb.users[index], ...updatedUser };
        saveDb(currentDb);
      }
      return;
    }

    supabaseDb.updateUser(updatedUser).then(() => {
      sessionStorage.removeItem('cached_users');
    });
  },

  getUserByEmail: async (email: string, password: string): Promise<User | null> => {
    if (!USE_SUPABASE) {
      const users = getDb().users;
      return users.find((u: User) => u.email === email && u.password === password) || null;
    }

    return await supabaseDb.getUserByEmail(email, password);
  },

  addTeam: (team: Team) => {
    if (!USE_SUPABASE) {
      const currentDb = getDb();
      if (!currentDb.teams) {
        currentDb.teams = [];
      }
      currentDb.teams.push(team);
      saveDb(currentDb);
      return;
    }

    supabaseDb.addTeam(team).then(() => {
      sessionStorage.removeItem('cached_teams');
    });
  },

  getChatMessages: async (missionId: string, teamName: string) => {
    if (!USE_SUPABASE) return [];
    return await supabaseDb.getChatMessages(missionId, teamName);
  },

  addChatMessage: async (missionId: string, teamName: string, message: any) => {
    if (!USE_SUPABASE) return;
    await supabaseDb.addChatMessage(missionId, teamName, message);
  },

  refreshCache: () => {
    if (USE_SUPABASE) {
      sessionStorage.removeItem('cached_users');
      sessionStorage.removeItem('cached_missions');
      sessionStorage.removeItem('cached_teams');
      sessionStorage.removeItem('cached_reports');
    }
  }
};
