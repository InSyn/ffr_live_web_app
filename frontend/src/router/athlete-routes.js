import createAthletePage from "@/pages/admin-pages/athletes/createPage-athlete.vue";
import editAthletePage from "@/pages/admin-pages/athletes/editPage-athlete.vue";
import allAthletesPage from "@/pages/athletes/index.vue";
import athletePage from "@/pages/athletes/athlete-page/index.vue";

export const athleteRoutes = [
  {
    name: "createAthletePage",
    path: "new_athlete",
    component: createAthletePage,
    meta: { requiresAuth: true },
  },
  {
    name: "editAthletePage",
    path: "edit_athlete/:athlete_code",
    component: editAthletePage,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    name: "allAthletes",
    path: "athletes",
    component: allAthletesPage,
  },
  {
    name: "athletePage",
    path: "athlete_info/:athlete_code",
    props: true,
    component: athletePage,
  },
];
