import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import Vuetify from 'vuetify'
import SearchResults from '@/components/ui-components/search/search-results.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('Component - SearchResults.vue', () => {
	let store
	let getters
	let vuetify

	beforeEach(() => {
		vuetify = new Vuetify()
		getters = {
			isSearching: () => false,
			searchResults: () => [],
			searchError: () => null
		}

		store = new Vuex.Store({
			modules: {
				search: {
					namespaced: true,
					getters
				}
			}
		})
	})

	it('renders the empty message when there are no results and not searching', () => {
		const wrapper = shallowMount(SearchResults, { store, localVue, vuetify })
		expect(wrapper.find('.search-results__message--empty').exists()).toBe(true)
		const overlay = wrapper.find('.v-overlay')
		expect(overlay.attributes('style')).toContain('display: none')
		expect(wrapper.find('.search-results__list').exists()).toBe(false)
	})

	it('renders the loading overlay when searching', () => {
		getters.isSearching = () => true
		const wrapper = shallowMount(SearchResults, { store, localVue, vuetify })
		const overlay = wrapper.find('.v-overlay')
		expect(overlay.attributes('style')).not.toContain('display: none')
	})

	it('renders the error message when an error is present', () => {
		const error = 'Something went wrong'
		getters.searchError = () => error
		const wrapper = shallowMount(SearchResults, { store, localVue, vuetify })
		const errorWrapper = wrapper.find('.search-results__message--error')
		expect(errorWrapper.exists()).toBe(true)
		expect(errorWrapper.text()).toContain(error)
	})

	it('renders the results list when results are available', () => {
		const results = [
			{ _id: '1', name: 'Result 1' },
			{ _id: '2', title: 'Result 2' }
		]
		getters.searchResults = () => results
		const wrapper = shallowMount(SearchResults, { store, localVue, vuetify })
		expect(wrapper.find('.search-results__list').exists()).toBe(true)
		const items = wrapper.findAll('.search-result-item')
		expect(items.length).toBe(2)
		expect(items.at(0).text()).toContain('Result 1')
		expect(items.at(1).text()).toContain('Result 2')
	})
})
