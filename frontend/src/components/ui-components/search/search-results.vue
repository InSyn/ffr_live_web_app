<template>
	<div class="search-results__wrapper">
		<v-overlay :value="isSearching" absolute class="search-results__overlay">
			<template #activator="{ isActive }" />
			<div v-if="isSearching" class="search-results__overlay-content">
				<v-progress-circular indeterminate size="64" />
			</div>
		</v-overlay>

		<div v-if="searchError" class="search-results__message--error">
			<v-icon color="error" class="mr-2"> mdi-alert-circle-outline </v-icon>
			<span>Ошибка поиска: {{ searchError }}</span>
		</div>

		<div
			v-if="!isSearching && searchResults.length === 0 && !searchError"
			class="search-results__message--empty"
		>
			<v-icon size="64" color="var(--text-disabled)"> mdi-text-box-search-outline </v-icon>
			<p class="mt-4 text-secondary">Результаты не найдены или поиск еще не выполнялся.</p>
		</div>

		<!-- Алфавитная группировка для Athletes, Jury, Trainers -->
		<div
			v-if="searchResults.length > 0 && shouldUseAlphabetGrouping"
			class="search-results__alphabet-container"
		>
			<div class="search-results__alphabet-list">
				<div v-for="char in alphabetGroups" :key="char" class="alphabetCharSection">
					<span class="alphabetChar">&nbsp;-&nbsp;{{ char }}</span>
					<component
						:is="resolveResultComponent"
						v-for="item in getItemsByLetter(char)"
						:key="item.id || item._id"
						:item="item"
						class="search-result-item"
					/>
				</div>
			</div>
		</div>
		<!-- Обычный список для Events, Organizations, Seminars -->
		<div
			v-if="searchResults.length > 0 && !shouldUseAlphabetGrouping"
			class="search-results__regular-container"
		>
			<component
				:is="resolveResultComponent"
				v-for="(item, index) in searchResults"
				:key="item.id || item._id"
				:item="item"
				:index="index"
				class="search-result-item"
			/>
		</div>

		<!-- ✅ КАСТОМНАЯ ПАГИНАЦИЯ -->
		<div v-if="searchResults.length > 0 && totalPages > 1" class="search-results__pagination">
			<!-- Стрелка назад -->
			<button
				class="pagination-arrow"
				:class="{ disabled: currentPage === 1 }"
				:disabled="currentPage === 1"
				@click="goToPreviousPage"
			>
				<arrow-left-icon :width="16" :height="16" />
			</button>

			<!-- Номера страниц -->
			<div class="pagination-numbers">
				<button
					v-for="page in visiblePages"
					:key="page"
					class="pagination-number"
					:class="{ active: page === currentPage }"
					@click="onPageChange(page)"
				>
					{{ page }}
				</button>
			</div>

			<!-- Стрелка вперед -->
			<button
				class="pagination-arrow"
				:class="{ disabled: currentPage === totalPages }"
				:disabled="currentPage === totalPages"
				@click="goToNextPage"
			>
				<arrow-right-icon :width="16" :height="16" />
			</button>
		</div>
	</div>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex'
import CompetitionListItem from '@/pages/events/competition-list-item.vue'
import AthleteListItem from '@/pages/athletes/athlete-listItem.vue'
import JuryListItem from '@/pages/jury/jury-list-item.vue'
import TrainerListItem from '@/pages/trainers/trainer-list-item.vue'
import OrganizationListItem from '@/pages/organizations/organization-list-item.vue'
import SeminarListItem from '@/pages/seminars/seminar-list-item.vue'
import ArrowLeftIcon from '@/components/icons/arrow-left.vue'
import ArrowRightIcon from '@/components/icons/arrow-right.vue'
import { getAlphabetList } from '@/utils/alphabet-generator'

export default {
	name: 'SearchResults',
	components: {
		CompetitionListItem,
		AthleteListItem,
		JuryListItem,
		TrainerListItem,
		OrganizationListItem,
		SeminarListItem,
		ArrowLeftIcon,
		ArrowRightIcon
	},
	computed: {
		...mapGetters('search', [
			'isSearching',
			'searchResults',
			'searchError',
			'totalPages',
			'currentPage'
		]),
		...mapState('search', ['searchMode']),

		visiblePages() {
			const totalVisible = 7
			const pages = []
			const startPage = Math.max(1, this.currentPage - Math.floor(totalVisible / 2))
			const endPage = Math.min(this.totalPages, startPage + totalVisible - 1)

			for (let i = startPage; i <= endPage; i++) {
				pages.push(i)
			}
			return pages
		},

		resolveResultComponent() {
			switch (this.searchMode) {
				case 'events':
					return 'CompetitionListItem'
				case 'athletes':
					return 'AthleteListItem'
				case 'jury':
					return 'JuryListItem'
				case 'trainers':
					return 'TrainerListItem'
				case 'organizations':
					return 'OrganizationListItem'
				case 'seminars':
					return 'SeminarListItem'
				default:
					return null
			}
		},

		shouldUseAlphabetGrouping() {
			return ['athletes', 'jury', 'trainers'].includes(this.searchMode)
		},

		alphabetGroups() {
			if (!this.shouldUseAlphabetGrouping || !this.searchResults.length) return []

			const keyField = this.getAlphabetKeyField()
			return getAlphabetList(this.searchResults, keyField) || []
		}
	},
	methods: {
		...mapActions('search', ['changePage']),

		getAlphabetKeyField() {
			switch (this.searchMode) {
				case 'athletes':
				case 'jury':
					return 'lastname'
				case 'trainers':
					return 'fullname'
				default:
					return 'lastname'
			}
		},

		getItemsByLetter(letter) {
			const keyField = this.getAlphabetKeyField()
			return this.searchResults.filter(
				item => item[keyField] && item[keyField][0].toUpperCase() === letter
			)
		},

		onPageChange(page) {
			this.changePage(page)
		},

		goToPreviousPage() {
			if (this.currentPage > 1) {
				this.changePage(this.currentPage - 1)
			}
		},

		goToNextPage() {
			if (this.currentPage < this.totalPages) {
				this.changePage(this.currentPage + 1)
			}
		}
	}
}
</script>

<style scoped lang="scss">
.search-results__wrapper {
	position: relative;
	flex: 1 1 0;
	display: flex;
	flex-direction: column;
	min-height: 200px;
	background-color: var(--color-bg-surface);
	box-shadow: var(--surface-shadow-m);
}

.search-results__overlay {
	z-index: 5;
	&.v-overlay--active {
		background-color: color-mix(in srgb, var(--color-bg-surface) 10%, transparent 100%) !important;
		backdrop-filter: blur(2px);
		-webkit-backdrop-filter: blur(2px);
	}
}

.search-results__overlay-content {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
	width: 100%;
}

.search-results__message--error,
.search-results__message--empty {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	text-align: center;
	padding: var(--space-8);
	height: 100%;
	width: 100%;
}

/* Алфавитная группировка для Athletes, Jury, Trainers */
.search-results__alphabet-container {
	flex: 1 1 0;
	overflow-y: auto;
	width: 100%;
}

.search-results__alphabet-list {
	display: flex;
	flex-direction: column;

	.alphabetCharSection {
		display: flex;
		flex-direction: column;

		.alphabetChar {
			display: block;
			padding: var(--space-1);
			background-color: var(--color-bg-surface);
			font-weight: bold;
			font-size: 1.2rem;
			position: sticky;
			top: 0;
			z-index: 2;
		}
	}
}

/* Обычный список для Events, Organizations, Seminars */
.search-results__regular-container {
	flex: 1 1 0;
	overflow-y: auto;
	width: 100%;
}

.search-results__regular-list {
	display: flex;
	flex-direction: column;
	padding: var(--space-2);
}

.search-result-item {
	cursor: pointer;
	transition: background-color var(--transition-duration-fast) ease;

	&:hover {
		background-color: var(--color-bg-surface-hover);
	}
}

/* Animation for the regular list */
.list-enter-active,
.list-leave-active {
	transition: all 0.5s ease;
}
.list-enter,
.list-leave-to {
	opacity: 0;
	transform: translateY(30px);
}

.search-results__pagination {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: var(--space-2);
	background-color: color-mix(in srgb, var(--color-bg-surface) 85%, transparent);
	backdrop-filter: blur(8px);
	-webkit-backdrop-filter: blur(8px);
	border-radius: var(--border-radius-l);
	box-shadow: var(--surface-shadow-s);
	transition: all var(--transition-duration-normal) ease;

	&:hover {
		background-color: color-mix(in srgb, var(--color-bg-surface) 90%, transparent);
		box-shadow: var(--surface-shadow-m);
	}
}

.pagination-arrow {
	display: flex;
	align-items: center;
	justify-content: center;
	background: none;
	border: none;
	padding: var(--space-2);
	margin: 0 var(--space-1);
	border-radius: var(--border-radius-s);
	cursor: pointer;
	color: var(--color-text-primary);
	transition: all var(--transition-duration-fast) ease;

	&:hover:not(.disabled) {
		background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
		color: var(--color-primary);
	}

	&.disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	svg {
		width: 16px;
		height: 16px;
	}
}

.pagination-numbers {
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 0 var(--space-2);
	gap: var(--space-1);
}

.pagination-number {
	display: flex;
	align-items: center;
	justify-content: center;
	background: none;
	border: none;
	padding: var(--space-2) var(--space-3);
	margin: 0;
	border-radius: var(--border-radius-s);
	cursor: pointer;
	color: var(--color-text-primary);
	font-size: 14px;
	font-weight: normal;
	min-width: 32px;
	height: 32px;
	transition: all var(--transition-duration-fast) ease;

	&:hover:not(.active) {
		background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
		color: var(--color-text-secondary);
		font-weight: bold;
	}

	&.active {
		color: var(--color-text-accent);
		font-weight: bold;
	}
}
</style>
