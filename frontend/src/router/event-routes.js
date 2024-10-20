import createEventPage from "@/pages/admin-pages/events/createPage-event.vue";
import event_page from "@/pages/events/event-page/index.vue";
import editEventPage from "@/pages/admin-pages/events/editPage-event.vue";
import eventOnlineRegistration from "@/pages/admin-pages/event-online-registration/index.vue";

export const eventRoutes = [
  {
    name: "createEventPage",
    path: "new_event",
    component: createEventPage,
    meta: { requiresAuth: true },
  },
  {
    name: "editEventPage",
    path: "edit_event/:event_id",
    props: true,
    component: editEventPage,
    meta: { requiresAuth: true },
  },
  {
    name: "eventPage",
    path: "event_page/:event_id",
    props: true,
    component: event_page,
  },

  {
    name: "eventOnlineRegistration",
    path: "event_online_registration/:event_id",
    props: true,
    component: eventOnlineRegistration,
  },
];
