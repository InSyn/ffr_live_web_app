<template>
	<v-dialog
		v-model="isMobileSearchVisible"
		fullscreen
		hide-overlay
		transition="slide-y-reverse-transition"
		:retain-focus="false"
		content-class="search-modal__wrapper"
		@keydown.esc="close"
	>
		<header class="search-modal__header">
			<div class="search-modal__header-title">
				{{ headerTitle }}
			</div>
			<v-btn icon class="ml-auto" @click="close">
				<v-icon color="red">mdi-close</v-icon>
			</v-btn>
		</header>

		<div class="search-modal__content">
			<search-advanced-filters />

			<div class="search-modal__actions">
				<v-btn block outlined color="secondary" class="mb-3" @click="clearSearchAndClose">
					<v-icon left>mdi-refresh</v-icon>
					Сбросить фильтры
				</v-btn>

				<v-btn block x-large color="primary" @click="performSearchAndClose">
					<v-icon left>mdi-magnify</v-icon>
					Выполнить поиск
				</v-btn>
			</div>
		</div>
	</v-dialog>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import SearchAdvancedFilters from './search-advanced-filters.vue'

export default {
	name: 'SearchMobile',
	components: {
		SearchAdvancedFilters
	},
	computed: {
		...mapState('search', ['isMobileSearchVisible']),
		...mapGetters('search', ['currentSearchMode']),
		headerTitle() {
			const titles = {
				events: 'Поиск Событий',
				athletes: 'Поиск Спортсменов',
				jury: 'Поиск Судей',
				trainers: 'Поиск Тренеров',
				organizations: 'Поиск Организаций',
				seminars: 'Поиск Семинаров'
			}
			return titles[this.currentSearchMode] || 'Поиск'
		}
	},
	methods: {
		...mapActions('search', ['closeMobileSearch', 'performSearch', 'clearSearch']),
		close() {
			this.closeMobileSearch()
		},
		async performSearchAndClose() {
			await this.performSearch()
			this.closeMobileSearch()
		},
		async clearSearchAndClose() {
			await this.clearSearch()
			this.closeMobileSearch()
		}
	}
}
</script>

<style lang="scss">
.search-modal__wrapper.v-dialog--fullscreen {
	background-color: var(--color-bg-surface);
	backdrop-filter: blur(2px);
	display: flex;
	flex-direction: column;
	height: 100dvh;
}
</style>

<style scoped lang="scss">
.search-modal__header {
	display: flex;
	align-items: center;
	gap: var(--space-2);
	padding: var(--space-3) var(--space-4);
	border-bottom: 1px solid var(--border-color);
	z-index: 10;
	background-color: var(--color-bg-surface);

	.search-modal__header-title {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-primary);
	}
}

.search-modal__content {
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow-y: auto;
}

.search-modal__actions {
	padding: var(--space-4);
	margin-top: auto;
	background-color: var(--color-bg-surface);
	border-top: 1px solid var(--border-color);
}
</style>
