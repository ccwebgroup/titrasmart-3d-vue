import type { RouteRecordRaw } from "vue-router";
import AuthLayout from "../layouts/AuthLayout.vue";
import LoginView from "../views/auth/LoginView.vue";

export const routes: RouteRecordRaw[] = [
  {
    path: "/auth",
    component: AuthLayout,
    redirect: "/login",
    children: [
      {
        path: "/login",
        name: "login",
        component: LoginView,
        meta: { isGuestOnly: true },
      },
      {
        path: "/register",
        name: "register",
        component: () => import("../views/auth/RegisterView.vue"),
        meta: { isGuestOnly: true },
      },
      {
        path: "/forgot-password",
        name: "forgot-password",
        component: () => import("../views/auth/ForgotPasswordView.vue"),
        meta: { isGuestOnly: true },
      },
    ],
  },
  {
    path: "/lab",
    name: "lab",
    component: () => import("../views/auth/LoginView.vue"), // Placeholder for now
    meta: { requiresAuth: true },
  },
  {
    path: "/",
    redirect: "/lab",
  },
];
