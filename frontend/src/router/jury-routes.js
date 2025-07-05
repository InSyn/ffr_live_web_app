import createJuryPage from '@/pages/admin-pages/jury/createPage-jury.vue'
import allJuryPage from '@/pages/jury/index.vue'
import juryPage from '@/pages/jury/jury-page/index.vue'
import editJuryPage from '@/pages/admin-pages/jury/editPage-jury.vue'

export const juryRoutes = [
	{
		name: 'createJuryPage',
		path: 'new-jury',
		component: createJuryPage,
		meta: { requiresAuth: true }
	},
	{
		name: 'editJuryPage',
		path: 'edit-jury/:jury_code',
		component: editJuryPage,
		props: true,
		meta: { requiresAuth: true }
	},
	{
		name: 'juryListPage',
		path: 'jury',
		component: allJuryPage
	},
	{
		name: 'juryPage',
		path: 'jury-page/:jury_code',
		props: true,
		component: juryPage
	}
]
