-- 0. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create a table for the overall lab session
CREATE TABLE lab_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  khp_mass_g DECIMAL NOT NULL,
  target_molarity_naoh DECIMAL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_completed BOOLEAN DEFAULT FALSE
);

-- 2. Create a table for the high-frequency titration logs
CREATE TABLE titration_logs (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID REFERENCES lab_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vol_added_ml DECIMAL NOT NULL,
  ph_value DECIMAL NOT NULL,
  slope_value DECIMAL NOT NULL, -- This is your delta pH / delta V
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Real-time (Crucial for the 2026 digital twin feel)
ALTER PUBLICATION supabase_realtime ADD TABLE titration_logs;

-- 4. Enable Row-Level Security (RLS)
ALTER TABLE lab_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE titration_logs ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies for lab_sessions
-- Users can only see their own sessions
CREATE POLICY "Users can view their own lab sessions"
  ON lab_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own sessions
CREATE POLICY "Users can insert their own lab sessions"
  ON lab_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 6. Create Policies for titration_logs
-- Users can only see logs for their own sessions
CREATE POLICY "Users can view logs for their own sessions"
  ON titration_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lab_sessions
      WHERE lab_sessions.id = titration_logs.session_id
      AND lab_sessions.user_id = auth.uid()
    )
  );

-- Users can only insert logs for their own sessions
CREATE POLICY "Users can insert logs for their own sessions"
  ON titration_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lab_sessions
      WHERE lab_sessions.id = titration_logs.session_id
      AND lab_sessions.user_id = auth.uid()
    )
  );