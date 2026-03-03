export interface ChemData {
  volume: number; // Volume of titrant added in mL
  ph: number; // pH value
  slope: number; // Rate of change of pH (dpH/dV)
  isEndEndpoint: boolean; // True if it's the equivalence point
}

export interface Log {
  id?: string;
  session_id: string;
  user_id: string; // From auth.users(id)
  vol_added_ml: number;
  ph_value: number;
  slope_value: number;
  created_at?: string;
}

export interface Session {
  id?: string;
  user_id: string;
  khp_mass_g: number;
  target_molarity_naoh: number;
  is_completed: boolean;
  created_at?: string;
}
