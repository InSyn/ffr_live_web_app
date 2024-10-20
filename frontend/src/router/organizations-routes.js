import createOrganizationPage from "@/pages/admin-pages/organizations/createPage-organization.vue";
import organizationsPage from "@/pages/organizations/index.vue";
import organizationPage from "@/pages/organizations/organization-page/index.vue";
import editOrganizationPage from "@/pages/admin-pages/organizations/editPage-organization.vue";

export const organizationsRoutes = [
  {
    name: "createOrganizationPage",
    path: "new_organization",
    component: createOrganizationPage,
    meta: { requiresAuth: true },
  },
  {
    name: "editOrganizationPage",
    path: "edit_organization/:org_id",
    component: editOrganizationPage,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    name: "organizationsPage",
    path: "organizations",
    component: organizationsPage,
  },
  {
    name: "organizationPage",
    path: "organizations/:org_id",
    props: true,
    component: organizationPage,
  },
];
