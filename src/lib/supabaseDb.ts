import { supabase } from './supabase';
import { User, Mission, Team, Report, MissionStatus, ChatMessage } from '../types';

export const supabaseDb = {
  // USER OPERATIONS
  getUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    return data.map(user => ({
      id: user.id,
      displayName: user.display_name,
      email: user.email,
      password: user.password,
      role: user.role,
      avatarUrl: user.avatar_url,
      total_missions: user.total_missions,
      missions_won: user.missions_won,
      preferred_battle_role: user.preferred_battle_role
    }));
  },

  addUser: async (user: User): Promise<void> => {
    const { error } = await supabase
      .from('users')
      .insert({
        id: user.id,
        display_name: user.displayName,
        email: user.email,
        password: user.password,
        role: user.role,
        avatar_url: user.avatarUrl,
        total_missions: user.total_missions || 0,
        missions_won: user.missions_won || 0,
        preferred_battle_role: user.preferred_battle_role
      });

    if (error) {
      console.error('Error adding user:', error);
      throw error;
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
        updated_at: new Date().toISOString()
      })
      .eq('id', updatedUser.id);

    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  getUserByEmail: async (email: string, password: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      displayName: data.display_name,
      email: data.email,
      password: data.password,
      role: data.role,
      avatarUrl: data.avatar_url,
      total_missions: data.total_missions,
      missions_won: data.missions_won,
      preferred_battle_role: data.preferred_battle_role
    };
  },

  // MISSION OPERATIONS
  getMissions: async (): Promise<Mission[]> => {
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching missions:', error);
      return [];
    }

    return data.map(mission => ({
      id: mission.id,
      title: mission.title,
      target_company: mission.target_company,
      description: mission.description,
      max_players_per_team: mission.max_players_per_team,
      time_limit_minutes: mission.time_limit_minutes,
      status: mission.status as MissionStatus,
      created_by_admin: mission.created_by_admin,
      mission_start_time: mission.mission_start_time,
      winner_team: mission.winner_team,
      team_alpha_score: mission.team_alpha_score,
      team_beta_score: mission.team_beta_score,
      score_details: mission.score_details
    }));
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
        mission_start_time: mission.mission_start_time
      });

    if (error) {
      console.error('Error adding mission:', error);
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
          mission_start_time: mission.mission_start_time,
          winner_team: mission.winner_team,
          team_alpha_score: mission.team_alpha_score,
          team_beta_score: mission.team_beta_score,
          score_details: mission.score_details,
          updated_at: new Date().toISOString()
        })
        .eq('id', mission.id);

      if (error) {
        console.error('Error updating mission:', error);
      }
    }
  },

  // TEAM OPERATIONS
  getTeams: async (): Promise<Team[]> => {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching teams:', error);
      return [];
    }

    return data.map(team => ({
      id: team.id,
      mission_id: team.mission_id,
      team_name: team.team_name,
      team_leader_email: team.team_leader_email,
      members: team.members,
      report_submitted: team.report_submitted,
      submission_timestamp: team.submission_timestamp
    }));
  },

  updateTeams: async (teams: Team[]): Promise<void> => {
    for (const team of teams) {
      const { error } = await supabase
        .from('teams')
        .update({
          team_leader_email: team.team_leader_email,
          members: team.members,
          report_submitted: team.report_submitted,
          submission_timestamp: team.submission_timestamp,
          updated_at: new Date().toISOString()
        })
        .eq('id', team.id);

      if (error) {
        console.error('Error updating team:', error);
      }
    }
  },

  addTeam: async (team: Team): Promise<void> => {
    const { error } = await supabase
      .from('teams')
      .insert({
        id: team.id,
        mission_id: team.mission_id,
        team_name: team.team_name,
        team_leader_email: team.team_leader_email,
        members: team.members,
        report_submitted: team.report_submitted || false
      });

    if (error) {
      console.error('Error adding team:', error);
      throw error;
    }
  },

  // REPORT OPERATIONS
  getReports: async (): Promise<Report[]> => {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reports:', error);
      return [];
    }

    return data.map(report => ({
      id: report.id,
      mission_id: report.mission_id,
      team_name: report.team_name,
      battle_data: report.battle_data
    }));
  },

  addReport: async (report: Report): Promise<void> => {
    const { error } = await supabase
      .from('reports')
      .upsert({
        id: report.id,
        mission_id: report.mission_id,
        team_name: report.team_name,
        battle_data: report.battle_data
      }, {
        onConflict: 'mission_id,team_name'
      });

    if (error) {
      console.error('Error adding report:', error);
      throw error;
    }
  },

  // CHAT OPERATIONS
  getChatMessages: async (missionId: string, teamName: string): Promise<ChatMessage[]> => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('mission_id', missionId)
      .eq('team_name', teamName)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching chat messages:', error);
      return [];
    }

    return data.map(msg => ({
      id: msg.id,
      userId: msg.user_id,
      userDisplayName: msg.user_display_name,
      message: msg.message,
      timestamp: msg.timestamp
    }));
  },

  addChatMessage: async (missionId: string, teamName: string, message: ChatMessage): Promise<void> => {
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        id: message.id,
        mission_id: missionId,
        team_name: teamName,
        user_id: message.userId,
        user_display_name: message.userDisplayName,
        message: message.message,
        timestamp: message.timestamp
      });

    if (error) {
      console.error('Error adding chat message:', error);
    }
  }
};
