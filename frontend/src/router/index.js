import Vue from "vue";
import VueRouter from "vue-router";

import { isLoggedIn } from "@/utils/auth-helpers";

import Main from "@/views/Main.vue";

import results from "@/pages/events/calendar-page/index.vue";
import authPage from "@/pages/auth/index.vue";
import userPage from "@/pages/user/index.vue";
import connectedParticles from "@/components/extra/connected-particles.vue";
import { athleteRoutes } from "@/router/athlete-routes";
import { eventRoutes } from "@/router/event-routes";
import { juryRoutes } from "@/router/jury-routes";
import { trainersRoutes } from "@/router/trainers-routes";
import { organizationsRoutes } from "@/router/organizations-routes";
import { seminarsRoutes } from "@/router/seminars-routes";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Main",
    component: Main,
    children: [
      {
        name: "results",
        path: "calendar",
        component: results,
      },
      ...eventRoutes,
      ...athleteRoutes,
      ...juryRoutes,
      ...trainersRoutes,
      ...organizationsRoutes,
      ...seminarsRoutes,

      {
        name: "auth",
        path: "auth",
        component: authPage,
      },
      {
        name: "user-page",
        path: "user_page",
        component: userPage,
        meta: { requiresAuth: true },
      },

      {
        name: "particles",
        path: "chill",
        component: connectedParticles,
      },
    ],
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta["requiresAuth"])) {
    if (!isLoggedIn()) {
      next({ name: "auth" });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
