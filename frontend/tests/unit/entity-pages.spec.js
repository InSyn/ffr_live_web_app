import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import JuryPage from '@/pages/jury/jury-page/index.vue'
import TrainerPage from '@/pages/trainers/trainer-page/index.vue'
import OrganizationPage from '@/pages/organizations/organization-page/index.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

const globalStubs = {
	'loader-spinner': true,
	'edit-button': true,
	'athlete-photo-filler-icon': true,
	'jury-competitions-list': true,
	'jury-seminars-list': true,
	'trainer-seminars-list': true,
	'competition-image-filler-icon': true,
	'country-flag': true,
	'person-photo': true,
	'lazy-image': true
}

describe('Entity Pages (Jury, Trainer, Organization)', () => {
	it('shows error if jury_code param is missing', async () => {
		const wrapper = shallowMount(JuryPage, {
			localVue,
			stubs: globalStubs,
			mocks: { $route: { params: {} } },
			propsData: {}
		})
		await wrapper.vm.$nextTick()
		expect(wrapper.text()).toContain('отсутствует код судьи')
	})

	it('shows error if trainer_id param is missing', async () => {
		const wrapper = shallowMount(TrainerPage, {
			localVue,
			stubs: globalStubs,
			mocks: { $route: { params: {} } },
			propsData: {}
		})
		await wrapper.vm.$nextTick()
		expect(wrapper.text()).toContain('отсутствует ID тренера')
	})

	it('shows error if org_id param is missing', async () => {
		const wrapper = shallowMount(OrganizationPage, {
			localVue,
			stubs: globalStubs,
			mocks: { $route: { params: {} } },
			propsData: {}
		})
		await wrapper.vm.$nextTick()
		expect(wrapper.text()).toContain('отсутствует ID организации')
	})

	it('shows loading spinner when loadingState is true (jury)', () => {
		const wrapper = shallowMount(JuryPage, {
			localVue,
			stubs: globalStubs,
			mocks: { $route: { params: { jury_code: '123' } } },
			data() {
				return { loadingState: true }
			}
		})
		expect(wrapper.html()).toContain('loader-spinner')
	})

	it('shows loading spinner when loadingState is true (trainer)', () => {
		const wrapper = shallowMount(TrainerPage, {
			localVue,
			stubs: globalStubs,
			mocks: { $route: { params: { trainer_id: '123' } } },
			data() {
				return { loadingState: true }
			}
		})
		expect(wrapper.html()).toContain('loader-spinner')
	})

	it('shows loading spinner when loadingState is true (organization)', () => {
		const stubs = { ...globalStubs }
		delete stubs['loader-spinner']

		const wrapper = shallowMount(OrganizationPage, {
			localVue,
			stubs,
			mocks: { $route: { params: { org_id: '123' } } },
			data() {
				return { loadingState: true }
			}
		})
		expect(wrapper.findComponent({ name: 'LoaderSpinner' }).exists()).toBe(true)
	})

	it('shows entity data if present (jury)', () => {
		const wrapper = shallowMount(JuryPage, {
			localVue,
			stubs: globalStubs,
			mocks: { $route: { params: { jury_code: '123' } } },
			data() {
				return {
					jury: { jury_code: '123', lastname: 'Ivanov', name: 'Ivan', photo_url: 'test.jpg' }
				}
			}
		})
		expect(wrapper.text()).toContain('Ivanov')
	})

	it('shows entity data if present (trainer)', () => {
		const store = new Vuex.Store({
			modules: {
				authorization: {
					namespaced: true,
					getters: {
						getUserData: () => ({ region: 'test-region', ffr_id: 'user-1' })
					}
				}
			}
		})
		const wrapper = shallowMount(TrainerPage, {
			localVue,
			store,
			stubs: globalStubs,
			mocks: { $route: { params: { trainer_id: '123' } } },
			data() {
				return {
					trainer: {
						trainer_id: '123',
						fullname: 'Ivan Ivanov',
						photo_url: 'test.jpg',
						rank: [],
						position: [],
						disciplines: [],
						team: [],
						seminars: [],
						events_with_registration: [],
						vk: '',
						phone: '',
						email: '',
						gender: ''
					},
					team: [],
					seminars: [],
					events_with_registration: []
				}
			}
		})
		expect(wrapper.text()).toContain('Ivan Ivanov')
	})

	it('shows entity data if present (organization)', () => {
		const store = new Vuex.Store({
			getters: {
				userData: () => ({ region: 'test-region', ffr_id: 'user-1' }),
				'authorization/getUserData': () => ({ region: 'test-region', ffr_id: 'user-1' })
			},
			modules: {
				authorization: {
					namespaced: true,
					getters: {
						userData: () => ({ region: 'test-region', ffr_id: 'user-1' }),
						getUserData: () => ({ region: 'test-region', ffr_id: 'user-1' })
					}
				}
			}
		})
		const wrapper = shallowMount(OrganizationPage, {
			localVue,
			store,
			stubs: globalStubs,
			mocks: { $route: { params: { org_id: '123' } } },
			data() {
				return {
					organization: {
						_id: '123',
						title: 'Test Org',
						logo_url: 'test.jpg',
						socials: {},
						region: 'test-region'
					},
					team: []
				}
			}
		})
		expect(wrapper.text()).toContain('Test Org')
	})
})
