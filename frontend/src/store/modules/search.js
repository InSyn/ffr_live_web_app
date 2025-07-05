import axios from 'axios'
import { apiUrl } from '@/constants'
import { searchFilters } from '@/store/data/search-filters'

const state = {
	isMobileSearchVisible: false,
	searchMode: 'events',
	searchQuery: {},
	searchResults: [],
	isSearching: false,
	searchError: null,
	totalPages: 0,
	currentPage: 1,
	calendarEvents: []
}

const mutations = {
	SET_MOBILE_SEARCH_VISIBLE: (state, isVisible) => {
		state.isMobileSearchVisible = isVisible
	},
	SET_SEARCH_MODE: (state, mode) => {
		state.searchMode = mode
		// ✅ ИСПРАВЛЕНО: Сохраняем существующие значения, добавляем только отсутствующие поля
		const defaultFilters = searchFilters[mode] || {}
		const mergedQuery = { ...defaultFilters }

		// Сохраняем существующие значения, если они есть
		Object.keys(state.searchQuery).forEach(key => {
			if (defaultFilters.hasOwnProperty(key)) {
				mergedQuery[key] = state.searchQuery[key]
			}
		})

		state.searchQuery = mergedQuery
	},
	SET_SEARCH_QUERY: (state, query) => {
		// ✅ ИСПРАВЛЕНО: Объединяем с существующими полями вместо полной замены
		state.searchQuery = { ...state.searchQuery, ...query }
	},
	UPDATE_SEARCH_FILTERS: (state, filters) => {
		state.searchQuery = { ...state.searchQuery, ...filters }
	},
	SET_SEARCH_RESULTS: (state, { docs, totalPages, page }) => {
		state.searchResults = docs
		state.totalPages = totalPages
		state.currentPage = page
	},
	SET_CALENDAR_EVENTS: (state, events) => {
		state.calendarEvents = events
	},
	SET_IS_SEARCHING: (state, isSearching) => {
		state.isSearching = isSearching
	},
	SET_SEARCH_ERROR: (state, error) => {
		state.searchError = error
	},
	CLEAR_SEARCH_RESULTS: state => {
		state.searchResults = []
		state.searchError = null
		state.totalPages = 0
		state.currentPage = 1
	},
	SET_CURRENT_PAGE: (state, page) => {
		state.currentPage = page
	}
}

const actions = {
	openMobileSearch: ({ commit }) => commit('SET_MOBILE_SEARCH_VISIBLE', true),
	closeMobileSearch: ({ commit }) => commit('SET_MOBILE_SEARCH_VISIBLE', false),
	setSearchMode: ({ commit }, mode) => {
		commit('SET_SEARCH_MODE', mode)
		commit('CLEAR_SEARCH_RESULTS')
		commit('SET_CURRENT_PAGE', 1)
	},
	setSearchQuery: ({ commit }, query) => commit('SET_SEARCH_QUERY', query),

	updateFilters: ({ commit, dispatch }, filters) => {
		commit('UPDATE_SEARCH_FILTERS', filters)
		commit('SET_CURRENT_PAGE', 1)
		dispatch('performSearch')
	},

	clearSearch: ({ commit, dispatch, state }) => {
		// ✅ ИСПРАВЛЕНО: Очищаем только ЗАПОЛНЕННЫЕ поля, не удаляем незадействованные
		const clearedQuery = {}
		Object.keys(state.searchQuery).forEach(key => {
			clearedQuery[key] = '' // Очищаем только существующие поля
		})
		commit('SET_SEARCH_QUERY', clearedQuery)

		const isCalendarPage =
			state.searchMode === 'events' && window.location.pathname.includes('/calendar')
		if (isCalendarPage) {
			dispatch('loadCalendarEvents', new Date().toISOString())
		}
	},

	async loadCalendarEvents({ commit, state }, date) {
		if (state.searchMode !== 'events') return
		try {
			// ✅ ИСПРАВЛЕНО: Используем стандартную пагинацию для всех случаев
			if (!date) {
				// Загружаем все события с правильной пагинацией
				const url = `${apiUrl}/events/find?format=paginated&page=${state.currentPage}&limit=20`
				const response = await axios.get(url)
				const events = response.data.docs || []
				commit('SET_CALENDAR_EVENTS', events)
				commit('SET_SEARCH_RESULTS', {
					docs: events,
					totalPages: response.data.totalPages || 1,
					page: response.data.page || 1
				})
			} else {
				// Загружаем события для конкретного месяца
				const targetDate = date
				const url = `${apiUrl}/events/date-search/${targetDate}`
				const response = await axios.get(url)
				const events = response.data.events || []
				commit('SET_CALENDAR_EVENTS', events)
				commit('SET_SEARCH_RESULTS', { docs: events, totalPages: 1, page: 1 })
			}
		} catch (e) {
			commit('SET_SEARCH_ERROR', e.response?.data?.message || e.message)
		}
	},

	async performSearch({ commit, state }) {
		commit('SET_IS_SEARCHING', true)
		commit('SET_SEARCH_ERROR', null)

		try {
			const searchParams = new URLSearchParams()
			for (const [key, value] of Object.entries(state.searchQuery)) {
				if (value) {
					// Отправляем только непустые значения
					const valueToAppend =
						key === 'date_from' || key === 'date_to' || key === 'date'
							? new Date(value).toISOString().split('T')[0]
							: value
					searchParams.append(key, valueToAppend)
				}
			}

			// ✅ ИСПРАВЛЕНО: Форсирование пагинированного формата для всех режимов кроме events
			if (state.searchMode !== 'events') {
				searchParams.append('format', 'paginated')
			}

			// ✅ ДОБАВЛЕНО: Добавление параметров пагинации
			searchParams.append('page', state.currentPage)
			searchParams.append('limit', 20) // Стандартный лимит

			const queryString = searchParams.toString()

			// ✅ ИСПРАВЛЕНИЕ: Обработка пустых запросов в зависимости от режима
			if (
				!queryString ||
				queryString === 'page=1&limit=20' ||
				queryString === 'format=paginated&page=1&limit=20'
			) {
				// Для календаря событий - показать календарные события
				const isCalendarPage =
					state.searchMode === 'events' && window.location.pathname.includes('/calendar')
				if (isCalendarPage) {
					commit('SET_SEARCH_RESULTS', { docs: state.calendarEvents, totalPages: 1, page: 1 })
					commit('SET_IS_SEARCHING', false)
					return
				}

				// Для всех остальных режимов (athletes, jury, trainers, etc.) - показать все результаты
				// НЕ очищаем результаты, а выполняем запрос без параметров
			}

			const url = `${apiUrl}/${state.searchMode}/find?${queryString}`
			const response = await axios.get(url)

			commit('SET_SEARCH_RESULTS', {
				docs: response.data.docs || [],
				totalPages: response.data.totalPages || 1,
				page: response.data.page || 1
			})
		} catch (e) {
			commit('SET_SEARCH_ERROR', e.response?.data?.message || e.message)
			commit('CLEAR_SEARCH_RESULTS')
		} finally {
			commit('SET_IS_SEARCHING', false)
		}
	},

	// ✅ ДОБАВЛЕНО: Action для смены страницы
	async changePage({ commit, dispatch, state }, page) {
		commit('SET_CURRENT_PAGE', page)

		// ✅ ИСПРАВЛЕНО: Для календарной страницы используем loadCalendarEvents
		const isCalendarPage =
			state.searchMode === 'events' && window.location.pathname.includes('/calendar')

		if (isCalendarPage) {
			await dispatch('loadCalendarEvents')
		} else {
			await dispatch('performSearch')
		}
	}
}

const getters = {
	isMobileSearchVisible: state => state.isMobileSearchVisible,
	currentSearchMode: state => state.searchMode,
	searchResults: state => state.searchResults,
	isSearching: state => state.isSearching,
	searchError: state => state.searchError,
	currentSearchQuery: state => state.searchQuery,
	calendarEvents: state => state.calendarEvents,
	// ✅ ДОБАВЛЕНО: Getters для пагинации
	totalPages: state => state.totalPages,
	currentPage: state => state.currentPage
}

export default {
	namespaced: true,
	state,
	mutations,
	actions,
	getters
}
