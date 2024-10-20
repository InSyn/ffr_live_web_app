import createTrainerPage from "@/pages/admin-pages/trainers/createPage-trainer.vue";
import trainersPage from "@/pages/trainers/index.vue";
import trainerPage from "@/pages/trainers/trainer-page/index.vue";
import editTrainerPage from "@/pages/admin-pages/trainers/editPage-trainer.vue";

export const trainersRoutes = [
  {
    name: "createTrainerPage",
    path: "new_trainer",
    component: createTrainerPage,
    meta: { requiresAuth: true },
  },
  {
    name: "editTrainerPage",
    path: "edit_trainer/:trainer_id",
    component: editTrainerPage,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    name: "trainersPage",
    path: "trainers",
    component: trainersPage,
  },
  {
    name: "trainerPage",
    path: "trainer_page/:trainer_id",
    props: true,
    component: trainerPage,
  },
];
