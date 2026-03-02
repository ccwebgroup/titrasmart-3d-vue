import { createRouter, createWebHistory } from "vue-router";
import { routes } from "./routes";
import { registerRouterGuards } from "./guards";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

registerRouterGuards(router);

export default router;
