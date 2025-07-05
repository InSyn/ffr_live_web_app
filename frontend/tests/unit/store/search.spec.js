import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import searchModule from '@/store/modules/search.js'
import axios from 'axios'

// Mock axios
jest.mock('axios')

const localVue = createLocalVue()
localVue.use(Vuex)

describe('Vuex - Search Module', () => {
	let store

	beforeEach(() => {
		// Re-create the module each time to ensure clean state and functions
		store = new Vuex.Store({
			modules: {
				search: {
					namespaced: true,
					state: { ...searchModule.state },
					mutations: searchModule.mutations,
					actions: searchModule.actions,
					getters: searchModule.getters
				}
			}
		})
		axios.get.mockClear()
	})

	describe('Actions', () => {
		it('`setSearchMode` clears query and results', () => {
			// Setup initial state
			store.commit('search/SET_SEARCH_QUERY', { name: 'test' })
			store.commit('search/SET_SEARCH_RESULTS', [{ id: 1 }])

			// Dispatch action
			store.dispatch('search/setSearchMode', 'athletes')

			// Assertions
			expect(store.state.search.searchMode).toBe('athletes')
			expect(store.state.search.searchQuery).toEqual({})
			expect(store.state.search.searchResults).toEqual([])
		})

		it('`performSearch` successfully fetches and commits results', async () => {
			const mockResults = [{ id: 1, name: 'Test Athlete' }]
			const mockResponse = { status: 200, data: { athletes: mockResults } }
			axios.get.mockResolvedValue(mockResponse)

			store.commit('search/SET_SEARCH_MODE', 'athletes')
			store.commit('search/SET_SEARCH_QUERY', { name: 'Test' })

			await store.dispatch('search/performSearch')

			expect(store.state.search.isSearching).toBe(false)
			expect(store.state.search.searchResults).toEqual(mockResults)
			expect(store.state.search.searchError).toBeNull()
			expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/athletes/find?name=Test'))
		})

		it('`performSearch` handles API errors and commits error state', async () => {
			const mockError = { response: { data: { message: 'Server Error' } } }
			axios.get.mockRejectedValue(mockError)

			store.commit('search/SET_SEARCH_MODE', 'events')
			store.commit('search/SET_SEARCH_QUERY', { title: 'Broken Event' })

			await store.dispatch('search/performSearch')

			expect(store.state.search.isSearching).toBe(false)
			expect(store.state.search.searchResults).toEqual([])
			expect(store.state.search.searchError).toBe('Server Error')
		})

		it('`clearSearch` clears both query and results', () => {
			store.commit('search/SET_SEARCH_QUERY', { name: 'test' })
			store.commit('search/SET_SEARCH_RESULTS', [{ id: 1 }])
			store.commit('search/SET_SEARCH_ERROR', 'An error')

			store.dispatch('search/clearSearch')

			expect(store.state.search.searchQuery).toEqual({})
			expect(store.state.search.searchResults).toEqual([])
			expect(store.state.search.searchError).toBeNull()
		})
	})

	describe('Mutations', () => {
		it('`SET_SEARCH_QUERY` correctly updates the search query', () => {
			store.commit('search/SET_SEARCH_QUERY', { name: 'John' })
			expect(store.state.search.searchQuery.name).toBe('John')

			store.commit('search/SET_SEARCH_QUERY', { region: 'North' })
			expect(store.state.search.searchQuery.name).toBe('John') // Should still exist
			expect(store.state.search.searchQuery.region).toBe('North') // Should be added
		})

		it('`SET_SEARCH_RESULTS` correctly updates the results', () => {
			const results = [{ id: 1 }]
			store.commit('search/SET_SEARCH_RESULTS', results)
			expect(store.state.search.searchResults).toEqual(results)
		})
	})
})
