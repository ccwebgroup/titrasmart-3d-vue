export interface ChemData {
  volume: number; // Volume of titrant added in mL
  ph: number; // pH value
  slope: number; // Rate of change of pH (dpH/dV)
  isEndEndpoint: boolean; // True if it's the equivalence point
}

export interface Log {
  id?: string;
  session_id: string;
  user_id: string;
  volume: number;
  ph: number;
  slope: number;
  ai_action: string;
  created_at?: string;
}

export interface Session {
  id?: string;
  user_id: string;
  experiment_type: string;
  status: "active" | "completed" | "failed";
  lab_state: any; // Dynamic JSON state
  created_at?: string;
  updated_at?: string;
}
