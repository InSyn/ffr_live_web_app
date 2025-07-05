import createSeminarPage from '@/pages/admin-pages/seminars/createPage-seminar.vue';
import seminarsPage from '@/pages/seminars/index.vue';
import seminarPage from '@/pages/seminars/seminar-page/index.vue';
import editSeminarPage from '@/pages/admin-pages/seminars/editPage-seminar.vue';

export const seminarsRoutes = [
  {
    name: 'createSeminarPage',
    path: 'new-seminar',
    component: createSeminarPage,
    meta: { requiresAuth: true },
  },
  {
    name: 'editSeminarPage',
    path: 'edit-seminar/:seminar_id',
    component: editSeminarPage,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    name: 'seminarsPage',
    path: 'seminars',
    component: seminarsPage,
  },
  {
    name: 'seminarPage',
    path: 'seminar-page/:seminar_id',
    props: true,
    component: seminarPage,
  },
];
