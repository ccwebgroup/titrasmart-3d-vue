import type { RouteRecordRaw } from "vue-router";
import AuthLayout from "../layouts/AuthLayout.vue";
import LoginView from "../views/auth/LoginView.vue";
import LabStageView from "../views/lab/LabStageView.vue";

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
      {
        path: "/auth/callback",
        name: "auth-callback",
        component: () => import("../views/auth/AuthCallbackView.vue"),
        meta: { isGuestOnly: true },
      },
    ],
  },
  {
    path: "/lab",
    name: "lab",
    component: LabStageView,
    meta: { requiresAuth: true },
  },
  {
    path: "/v2",
    name: "lab-v2",
    component: () => import("../views/lab/BabylonLabView.vue"),
  },
  {
    path: "/",
    redirect: "/lab",
  },
];
