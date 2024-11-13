import createOrganizationPage from '@/pages/admin-pages/organizations/createPage-organization.vue';
import organizationsPage from '@/pages/organizations/index.vue';
import organizationPage from '@/pages/organizations/organization-page/index.vue';
import editOrganizationPage from '@/pages/admin-pages/organizations/editPage-organization.vue';
import reportPage from '@/pages/organizations/report-page/index.vue';
import createOrganizationReportPage from '@/pages/admin-pages/organizations/createOrganizationReport-page.vue';

export const organizationsRoutes = [
  {
    name: 'createOrganizationPage',
    path: 'new-organization',
    component: createOrganizationPage,
    meta: { requiresAuth: true },
  },
  {
    name: 'editOrganizationPage',
    path: 'edit-organization/:org_id',
    component: editOrganizationPage,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    name: 'organizationsPage',
    path: 'organizations',
    component: organizationsPage,
  },
  {
    name: 'createReportPage',
    path: 'create-organization-report',
    component: createOrganizationReportPage,
    meta: { requiresAuth: true },
  },
  {
    name: 'organizationPage',
    path: 'organizations/:org_id',
    props: true,
    component: organizationPage,
  },
  {
    name: 'reportPage',
    props: true,
    path: 'organizations/:org_id/report-page/:report_id',
    component: reportPage,
  },
];
