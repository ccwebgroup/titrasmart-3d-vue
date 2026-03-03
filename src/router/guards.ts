import type { Router, RouteLocationNormalized } from "vue-router";
import { useAuthState } from "../store/authState";

/**
 * Global Navigation Guard: Checks for `requiresAuth` metadata on routes.
 * If authentication is missing, redirects to the login view.
 */
export async function setupAuthGuard(to: RouteLocationNormalized, from: RouteLocationNormalized) {
  const authState = useAuthState();

  // Failsafe: if navigation happens while initializing, wait for it
  if (authState.isLoading) {
    console.log(`[Router] Auth still initializing, waiting for ${to.path}...`);
    // This is rare since we wait in main.ts, but safe to have
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const isGuestOnly = to.matched.some((record) => record.meta.isGuestOnly);
  const isAuthenticated = !!authState.session;

  console.log(
    `[Router] Guard: ${to.path} | Auth: ${isAuthenticated} | User: ${authState.user?.email || "none"}`,
  );

  // 1. If the route requires authentication and the user is NOT authenticated
  if (requiresAuth && !isAuthenticated) {
    console.warn(`[Router] Denied ${to.path}. Path requires auth. Redirecting to /login.`);
    return { name: "login" };
  }

  // 2. If the user is authenticated and tries to visit a guest-only page (Login/Register)
  if (isAuthenticated && isGuestOnly) {
    console.info(
      `[Router] User already authenticated. Skipping guest-only ${to.path}. Redirecting to /lab.`,
    );
    return { path: "/lab" };
  }

  // 3. Proceed as normal
  return true;
}

/**
 * Helper to initialize the router instance with all necessary guards.
 */
export function registerRouterGuards(router: Router) {
  router.beforeEach(setupAuthGuard);
}
