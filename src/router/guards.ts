import type { Router, RouteLocationNormalized } from "vue-router";
import { authService } from "../services/auth.service";

/**
 * Global Navigation Guard: Checks for `requiresAuth` metadata on routes.
 * If authentication is missing, redirects to the login view.
 */
export async function setupAuthGuard(to: RouteLocationNormalized, from: RouteLocationNormalized) {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const isGuestOnly = to.matched.some((record) => record.meta.isGuestOnly);

  const isAuthenticated = await authService.isAuthenticated();

  // 1. If the route requires authentication and the user is NOT authenticated
  if (requiresAuth && !isAuthenticated) {
    console.warn(`[Router] Access denied to ${to.path}. Redirecting to /login.`);
    return { name: "login" };
  }

  // 2. If the user is authenticated and tries to visit a guest-only page (Login/Register)
  if (isAuthenticated && isGuestOnly) {
    console.info(`[Router] User already authenticated. Skipping ${to.path}.`);
    return { path: "/" };
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
