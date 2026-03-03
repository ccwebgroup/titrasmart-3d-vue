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
  vol_added_ml DECIMAL NOT NULL,
  ph_value DECIMAL NOT NULL,
  slope_value DECIMAL NOT NULL, -- This is your delta pH / delta V
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Real-time (Crucial for the 2026 digital twin feel)
ALTER PUBLICATION supabase_realtime ADD TABLE titration_logs;