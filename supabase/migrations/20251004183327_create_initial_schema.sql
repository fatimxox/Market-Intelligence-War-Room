/*
  # Market Intelligence War Room - Initial Schema

  ## Overview
  This migration creates the complete database schema for the Market Intelligence War Room application.
  It replaces the localStorage-based mock database with a proper Supabase PostgreSQL database.

  ## New Tables

  ### 1. users
  Stores user accounts with authentication and role information
  - `id` (uuid, primary key) - Unique user identifier
  - `email` (text, unique) - User email address
  - `display_name` (text) - User's display name
  - `role` (text) - User role: 'Admin', 'Team Leader', or 'Player'
  - `avatar_url` (text, optional) - Profile avatar URL
  - `total_missions` (integer) - Total missions participated in
  - `missions_won` (integer) - Total missions won
  - `preferred_battle_role` (text, optional) - Preferred battle role
  - `created_at` (timestamptz) - Account creation timestamp

  ### 2. missions
  Stores mission/game information
  - `id` (uuid, primary key) - Unique mission identifier
  - `title` (text) - Mission title
  - `target_company` (text) - Company being researched
  - `description` (text) - Mission description
  - `max_players_per_team` (integer) - Maximum players per team
  - `time_limit_minutes` (integer) - Mission time limit
  - `status` (text) - Mission status: 'draft', 'scheduled', 'recruiting', 'active', 'evaluation', 'completed'
  - `created_by_admin` (text) - Admin email who created mission
  - `mission_start_time` (timestamptz, optional) - Scheduled start time
  - `winner_team` (text, optional) - Winning team: 'alpha', 'beta', or 'tie'
  - `team_alpha_score` (integer, optional) - Team Alpha's final score
  - `team_beta_score` (integer, optional) - Team Beta's final score
  - `score_details` (jsonb, optional) - Detailed AI scoring results
  - `created_at` (timestamptz) - Mission creation timestamp

  ### 3. teams
  Stores team information for each mission
  - `id` (uuid, primary key) - Unique team identifier
  - `mission_id` (uuid, foreign key) - Associated mission
  - `team_name` (text) - Team name: 'alpha' or 'beta'
  - `team_leader_email` (text) - Team leader's email
  - `members` (jsonb) - Array of team member assignments
  - `report_submitted` (boolean) - Whether report was submitted
  - `submission_timestamp` (timestamptz, optional) - Report submission time
  - `created_at` (timestamptz) - Team creation timestamp

  ### 4. reports
  Stores intelligence reports submitted by teams
  - `id` (uuid, primary key) - Unique report identifier
  - `mission_id` (uuid, foreign key) - Associated mission
  - `team_name` (text) - Team name: 'alpha' or 'beta'
  - `battle_data` (jsonb) - Complete intelligence data structure
  - `created_at` (timestamptz) - Report creation timestamp

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Authenticated users can read all data
  - Only admins can create/modify missions
  - Team leaders and members can update their team's data
  - Users can update their own profile

  ## Important Notes
  - This schema supports the complete game workflow from mission creation to scoring
  - JSONB columns store complex nested data structures for flexibility
  - All timestamps use timestamptz for proper timezone handling
  - Foreign key constraints ensure data integrity
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  display_name text NOT NULL,
  role text NOT NULL DEFAULT 'Player',
  avatar_url text,
  total_missions integer DEFAULT 0,
  missions_won integer DEFAULT 0,
  preferred_battle_role text,
  created_at timestamptz DEFAULT now()
);

-- Create missions table
CREATE TABLE IF NOT EXISTS missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  target_company text NOT NULL,
  description text NOT NULL,
  max_players_per_team integer NOT NULL DEFAULT 5,
  time_limit_minutes integer NOT NULL DEFAULT 60,
  status text NOT NULL DEFAULT 'draft',
  created_by_admin text NOT NULL,
  mission_start_time timestamptz,
  winner_team text,
  team_alpha_score integer,
  team_beta_score integer,
  score_details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  team_name text NOT NULL,
  team_leader_email text NOT NULL,
  members jsonb NOT NULL DEFAULT '[]'::jsonb,
  report_submitted boolean DEFAULT false,
  submission_timestamp timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(mission_id, team_name)
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  team_name text NOT NULL,
  battle_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(mission_id, team_name)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view all profiles"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' = email)
  WITH CHECK (auth.jwt() ->> 'email' = email);

CREATE POLICY "Admins can insert users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE email = auth.jwt() ->> 'email'
      AND role = 'Admin'
    )
  );

-- RLS Policies for missions table
CREATE POLICY "Users can view all missions"
  ON missions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert missions"
  ON missions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE email = auth.jwt() ->> 'email'
      AND role = 'Admin'
    )
  );

CREATE POLICY "Admins can update missions"
  ON missions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE email = auth.jwt() ->> 'email'
      AND role = 'Admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE email = auth.jwt() ->> 'email'
      AND role = 'Admin'
    )
  );

-- RLS Policies for teams table
CREATE POLICY "Users can view all teams"
  ON teams FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert teams"
  ON teams FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE email = auth.jwt() ->> 'email'
      AND role = 'Admin'
    )
  );

CREATE POLICY "Team leaders and admins can update teams"
  ON teams FOR UPDATE
  TO authenticated
  USING (
    team_leader_email = auth.jwt() ->> 'email'
    OR EXISTS (
      SELECT 1 FROM users
      WHERE email = auth.jwt() ->> 'email'
      AND role = 'Admin'
    )
  )
  WITH CHECK (
    team_leader_email = auth.jwt() ->> 'email'
    OR EXISTS (
      SELECT 1 FROM users
      WHERE email = auth.jwt() ->> 'email'
      AND role = 'Admin'
    )
  );

-- RLS Policies for reports table
CREATE POLICY "Users can view all reports"
  ON reports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Team members can insert reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.mission_id = reports.mission_id
      AND teams.team_name = reports.team_name
      AND (
        teams.team_leader_email = auth.jwt() ->> 'email'
        OR teams.members @> jsonb_build_array(jsonb_build_object('email', auth.jwt() ->> 'email'))
      )
    )
  );

CREATE POLICY "Team members can update reports"
  ON reports FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.mission_id = reports.mission_id
      AND teams.team_name = reports.team_name
      AND (
        teams.team_leader_email = auth.jwt() ->> 'email'
        OR teams.members @> jsonb_build_array(jsonb_build_object('email', auth.jwt() ->> 'email'))
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.mission_id = reports.mission_id
      AND teams.team_name = reports.team_name
      AND (
        teams.team_leader_email = auth.jwt() ->> 'email'
        OR teams.members @> jsonb_build_array(jsonb_build_object('email', auth.jwt() ->> 'email'))
      )
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_missions_created_by ON missions(created_by_admin);
CREATE INDEX IF NOT EXISTS idx_teams_mission_id ON teams(mission_id);
CREATE INDEX IF NOT EXISTS idx_reports_mission_id ON reports(mission_id);