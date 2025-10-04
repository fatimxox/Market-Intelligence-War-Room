import { createClient } from '@supabase/supabase-js';
import { User, Mission, Team, Report, MissionStatus } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const db = {
  getUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    return (data || []).map(user => ({
      id: user.id,
      displayName: user.display_name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatar_url,
      total_missions: user.total_missions,
      missions_won: user.missions_won,
      preferred_battle_role: user.preferred_battle_role,
    }));
  },

  getMissions: async (): Promise<Mission[]> => {
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching missions:', error);
      return [];
    }

    const now = new Date();
    const missionsToUpdate: Mission[] = [];

    const missions = (data || []).map(mission => {
      const mappedMission: Mission = {
        id: mission.id,
        title: mission.title,
        target_company: mission.target_company,
        description: mission.description,
        max_players_per_team: mission.max_players_per_team,
        time_limit_minutes: mission.time_limit_minutes,
        status: mission.status,
        created_by_admin: mission.created_by_admin,
        mission_start_time: mission.mission_start_time,
        winner_team: mission.winner_team,
        team_alpha_score: mission.team_alpha_score,
        team_beta_score: mission.team_beta_score,
        score_details: mission.score_details,
      };

      if (
        mappedMission.status === MissionStatus.SCHEDULED &&
        mappedMission.mission_start_time &&
        new Date(mappedMission.mission_start_time) <= now
      ) {
        mappedMission.status = MissionStatus.RECRUITING;
        missionsToUpdate.push(mappedMission);
      }

      return mappedMission;
    });

    for (const mission of missionsToUpdate) {
      await supabase
        .from('missions')
        .update({ status: mission.status })
        .eq('id', mission.id);
    }

    return missions;
  },

  getTeams: async (): Promise<Team[]> => {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching teams:', error);
      return [];
    }

    return (data || []).map(team => ({
      id: team.id,
      mission_id: team.mission_id,
      team_name: team.team_name,
      team_leader_email: team.team_leader_email,
      members: team.members,
      report_submitted: team.report_submitted,
      submission_timestamp: team.submission_timestamp,
    }));
  },

  getReports: async (): Promise<Report[]> => {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reports:', error);
      return [];
    }

    return (data || []).map(report => ({
      id: report.id,
      mission_id: report.mission_id,
      team_name: report.team_name,
      battle_data: report.battle_data,
    }));
  },

  addUser: async (user: User): Promise<void> => {
    const { error } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        display_name: user.displayName,
        role: user.role,
        avatar_url: user.avatarUrl,
        total_missions: user.total_missions || 0,
        missions_won: user.missions_won || 0,
        preferred_battle_role: user.preferred_battle_role,
      });

    if (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  },

  addMission: async (mission: Mission): Promise<void> => {
    const { error } = await supabase
      .from('missions')
      .insert({
        id: mission.id,
        title: mission.title,
        target_company: mission.target_company,
        description: mission.description,
        max_players_per_team: mission.max_players_per_team,
        time_limit_minutes: mission.time_limit_minutes,
        status: mission.status,
        created_by_admin: mission.created_by_admin,
        mission_start_time: mission.mission_start_time,
        winner_team: mission.winner_team,
        team_alpha_score: mission.team_alpha_score,
        team_beta_score: mission.team_beta_score,
        score_details: mission.score_details,
      });

    if (error) {
      console.error('Error adding mission:', error);
      throw error;
    }
  },

  addReport: async (report: Report): Promise<void> => {
    const { error } = await supabase
      .from('reports')
      .upsert({
        id: report.id,
        mission_id: report.mission_id,
        team_name: report.team_name,
        battle_data: report.battle_data,
      }, {
        onConflict: 'mission_id,team_name'
      });

    if (error) {
      console.error('Error adding report:', error);
      throw error;
    }
  },

  updateMissions: async (missions: Mission[]): Promise<void> => {
    for (const mission of missions) {
      const { error } = await supabase
        .from('missions')
        .update({
          title: mission.title,
          target_company: mission.target_company,
          description: mission.description,
          max_players_per_team: mission.max_players_per_team,
          time_limit_minutes: mission.time_limit_minutes,
          status: mission.status,
          created_by_admin: mission.created_by_admin,
          mission_start_time: mission.mission_start_time,
          winner_team: mission.winner_team,
          team_alpha_score: mission.team_alpha_score,
          team_beta_score: mission.team_beta_score,
          score_details: mission.score_details,
        })
        .eq('id', mission.id);

      if (error) {
        console.error('Error updating mission:', error);
        throw error;
      }
    }
  },

  updateTeams: async (teams: Team[]): Promise<void> => {
    for (const team of teams) {
      const { error } = await supabase
        .from('teams')
        .upsert({
          id: team.id,
          mission_id: team.mission_id,
          team_name: team.team_name,
          team_leader_email: team.team_leader_email,
          members: team.members,
          report_submitted: team.report_submitted,
          submission_timestamp: team.submission_timestamp,
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Error updating team:', error);
        throw error;
      }
    }
  },

  updateUser: async (updatedUser: User): Promise<void> => {
    const { error } = await supabase
      .from('users')
      .update({
        display_name: updatedUser.displayName,
        role: updatedUser.role,
        avatar_url: updatedUser.avatarUrl,
        total_missions: updatedUser.total_missions,
        missions_won: updatedUser.missions_won,
        preferred_battle_role: updatedUser.preferred_battle_role,
      })
      .eq('id', updatedUser.id);

    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },
};
