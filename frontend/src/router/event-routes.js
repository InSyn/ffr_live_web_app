import createEventPage from '@/pages/admin-pages/events/createPage-event.vue';
import event_page from '@/pages/events/event-page/index.vue';
import editEventPage from '@/pages/admin-pages/events/editPage-event.vue';
import eventOnlineRegistration from '@/pages/admin-pages/online-registration/event-online-registration.vue';
import eventOnlineRegistrationApplication from '@/pages/admin-pages/online-registration/event-online-registration-application.vue';

export const eventRoutes = [
  {
    name: 'createEventPage',
    path: 'new-event',
    component: createEventPage,
    meta: { requiresAuth: true },
  },
  {
    name: 'editEventPage',
    path: 'edit-event/:event_id',
    props: true,
    component: editEventPage,
    meta: { requiresAuth: true },
  },
  {
    name: 'eventPage',
    path: 'event_page/:event_id',
    props: true,
    component: event_page,
  },

  {
    name: 'eventOnlineRegistration',
    path: 'event-online-registration-application/:event_id',
    props: true,
    component: eventOnlineRegistration,
  },
  {
    name: 'eventOnlineRegistrationApplication',
    path: 'event-online-registration/:event_id',
    props: true,
    component: eventOnlineRegistrationApplication,
  },
];
