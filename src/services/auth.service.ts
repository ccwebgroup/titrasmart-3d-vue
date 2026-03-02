import { supabase } from "../api/supabase";

export class AuthService {
  /**
   * Returns the current session if it exists.
   */
  async getSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) {
      console.error("Auth check failed:", error);
      return null;
    }
    return session;
  }

  /**
   * Returns the currently authenticated user.
   */
  async getUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) {
      console.error("Failed to get user:", error);
      return null;
    }
    return user;
  }

  /**
   * Helper to check if a user is logged in.
   */
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return !!session;
  }

  /**
   * Signs the current user out.
   */
  async signOut() {
    return await supabase.auth.signOut();
  }
}

export const authService = new AuthService();
