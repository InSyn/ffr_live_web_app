import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import CalendarPage from '@/pages/events/calendar-page/index.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('CalendarPage.vue', () => {
	let actions
	let store

	beforeEach(() => {
		actions = {
			setSearchMode: jest.fn(),
			performSearch: jest.fn(),
			clearSearch: jest.fn()
		}
		store = new Vuex.Store({
			modules: {
				search: {
					namespaced: true,
					actions
				}
			}
		})
	})

	it('calls setSearchMode and performSearch on created', () => {
		shallowMount(CalendarPage, {
			store,
			localVue,
			stubs: ['search', 'mobile-search-trigger', 'search-results']
		})
		expect(actions.setSearchMode).toHaveBeenCalledWith(expect.any(Object), 'events')
		expect(actions.performSearch).toHaveBeenCalled()
	})

	it('calls clearSearch on destroyed', () => {
		const wrapper = shallowMount(CalendarPage, {
			store,
			localVue,
			stubs: ['search', 'mobile-search-trigger', 'search-results']
		})
		wrapper.destroy()
		expect(actions.clearSearch).toHaveBeenCalled()
	})

	it('renders the Search, MobileSearchTrigger, and SearchResults components', () => {
		const wrapper = shallowMount(CalendarPage, {
			store,
			localVue,
			stubs: ['search', 'mobile-search-trigger', 'search-results']
		})
		expect(wrapper.find('search-stub').exists()).toBe(true)
		expect(wrapper.find('mobile-search-trigger-stub').exists()).toBe(true)
		expect(wrapper.find('search-results-stub').exists()).toBe(true)
	})
})
