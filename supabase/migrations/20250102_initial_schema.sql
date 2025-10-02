/*
  # Market Intelligence War Room - Initial Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `display_name` (text)
      - `email` (text, unique)
      - `password` (text, hashed)
      - `role` (text)
      - `avatar_url` (text, nullable)
      - `total_missions` (integer, default 0)
      - `missions_won` (integer, default 0)
      - `preferred_battle_role` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `missions`
      - `id` (uuid, primary key)
      - `title` (text)
      - `target_company` (text)
      - `description` (text)
      - `max_players_per_team` (integer)
      - `time_limit_minutes` (integer)
      - `status` (text)
      - `created_by_admin` (text)
      - `mission_start_time` (timestamptz, nullable)
      - `winner_team` (text, nullable)
      - `team_alpha_score` (integer, nullable)
      - `team_beta_score` (integer, nullable)
      - `score_details` (jsonb, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `teams`
      - `id` (uuid, primary key)
      - `mission_id` (uuid, foreign key)
      - `team_name` (text)
      - `team_leader_email` (text)
      - `members` (jsonb)
      - `report_submitted` (boolean, default false)
      - `submission_timestamp` (timestamptz, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `reports`
      - `id` (uuid, primary key)
      - `mission_id` (uuid, foreign key)
      - `team_name` (text)
      - `battle_data` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `chat_messages`
      - `id` (uuid, primary key)
      - `mission_id` (uuid, foreign key)
      - `team_name` (text)
      - `user_id` (text)
      - `user_display_name` (text)
      - `message` (text)
      - `timestamp` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read/write their own data
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  role text NOT NULL DEFAULT 'Player',
  avatar_url text,
  total_missions integer DEFAULT 0,
  missions_won integer DEFAULT 0,
  preferred_battle_role text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (email = current_setting('app.current_user_email', true))
  WITH CHECK (email = current_setting('app.current_user_email', true));

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
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read missions"
  ON missions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert missions"
  ON missions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update missions"
  ON missions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid REFERENCES missions(id) ON DELETE CASCADE,
  team_name text NOT NULL CHECK (team_name IN ('alpha', 'beta')),
  team_leader_email text NOT NULL,
  members jsonb NOT NULL DEFAULT '[]'::jsonb,
  report_submitted boolean DEFAULT false,
  submission_timestamp timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(mission_id, team_name)
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read teams"
  ON teams FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Team members can update their team"
  ON teams FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can insert teams"
  ON teams FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid REFERENCES missions(id) ON DELETE CASCADE,
  team_name text NOT NULL CHECK (team_name IN ('alpha', 'beta')),
  battle_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(mission_id, team_name)
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reports"
  ON reports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Team members can insert reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid REFERENCES missions(id) ON DELETE CASCADE,
  team_name text NOT NULL CHECK (team_name IN ('alpha', 'beta')),
  user_id text NOT NULL,
  user_display_name text NOT NULL,
  message text NOT NULL,
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can read their team chat"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Team members can insert chat messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teams_mission_id ON teams(mission_id);
CREATE INDEX IF NOT EXISTS idx_reports_mission_id ON reports(mission_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_mission_team ON chat_messages(mission_id, team_name);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Insert initial admin user
INSERT INTO users (display_name, email, password, role, total_missions, missions_won)
VALUES ('Game Master', 'ateffatim@gmail.com', '123', 'Admin', 5, 4)
ON CONFLICT (email) DO NOTHING;

-- Insert sample players
INSERT INTO users (display_name, email, password, role, total_missions, missions_won, preferred_battle_role)
VALUES
  ('Alice', 'alice@example.com', '123', 'Player', 3, 2, 'arsenal_ranger'),
  ('Bob', 'bob@example.com', '123', 'Player', 4, 1, 'capital_quartermaster'),
  ('Charlie', 'charlie@example.com', '123', 'Player', 2, 2, 'market_commander'),
  ('Diana', 'diana@example.com', '123', 'Player', 5, 3, 'customer_analyst'),
  ('Ethan', 'ethan@example.com', '123', 'Player', 1, 0, 'alliance_broker')
ON CONFLICT (email) DO NOTHING;
