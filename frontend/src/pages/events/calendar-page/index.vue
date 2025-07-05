<template>
	<div class="page-wrapper content-wrapper">
		<aside class="page-sidebar">
			<search />
		</aside>
		<div class="page-content surface-card">
			<calendar-carousel
				:events="calendarEvents"
				:calendar-date-prop="calendarDate"
				@set-calendar-date="handleSetCalendarDate"
			/>
			<mobile-search-trigger />
			<search-results />
		</div>
	</div>
</template>

<script>
import Search from '@/components/ui-components/search/index.vue'
import MobileSearchTrigger from '@/components/ui-components/search/mobile-search-trigger.vue'
import SearchResults from '@/components/ui-components/search/search-results.vue'
import CalendarCarousel from '@/components/ui-components/calendar-carousel.vue'
import { mapActions, mapGetters } from 'vuex'
import { formatDateForAPI, toUTCDate } from '../../../utils/date-utils'

export default {
	name: 'CalendarPage',
	components: {
		Search,
		MobileSearchTrigger,
		SearchResults,
		CalendarCarousel
	},
	data() {
		return {
			calendarDate: new Date().toISOString().split('T')[0]
		}
	},
	computed: {
		...mapGetters('search', ['searchResults', 'isSearching', 'calendarEvents'])
	},
	methods: {
		...mapActions('search', [
			'setSearchMode',
			'clearSearch',
			'performSearch',
			'updateFilters',
			'loadCalendarEvents'
		]),

		handleSetCalendarDate(newDate) {
			console.log('🗓️ handleSetCalendarDate called:', newDate)
			const oldDate = toUTCDate(this.calendarDate)
			this.calendarDate = newDate
			const selectedDate = toUTCDate(newDate)

			const monthChanged =
				oldDate.getUTCMonth() !== selectedDate.getUTCMonth() ||
				oldDate.getUTCFullYear() !== selectedDate.getUTCFullYear()

			if (monthChanged) {
				console.log('🗓️ Month changed - loading calendar events and clearing date filter')
				this.loadCalendarEvents(newDate)
				this.updateFilters({ date: null })
			} else {
				console.log('🗓️ Same month - setting date filter')
				this.updateFilters({ date: formatDateForAPI(selectedDate) })
			}
		}
	},
	created() {
		this.setSearchMode('events')
		// ✅ ИСПРАВЛЕНО: Загружаем ВСЕ события по умолчанию (без передачи даты)
		this.loadCalendarEvents()
	},
	destroyed() {
		this.clearSearch()
	}
}
</script>

<style scoped lang="scss">
// ✅ ПРАВИЛЬНО: Никаких custom стилей, все через utility classes
// Календарный компонент интегрирован в unified layout без переопределений
</style>
