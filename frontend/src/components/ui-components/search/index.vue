<template>
	<form class="search_wrapper surface-card rounded-lg" @submit.prevent="performSearch">
		<div class="search_body">
			<div
				v-for="(value, key) in searchQueryWithoutDates"
				:key="key"
				class="searchControl__wrapper"
			>
				<label :for="key" v-if="key !== 'date'" class="searchControl__label">
					{{ translateField(key) || key }}
				</label>

				<sport-input v-if="key === 'sport'" :value="value" @input="updateQuery(key, $event)" />
				<discipline-input
					v-else-if="key === 'discipline'"
					:value="value"
					:label="translateField(key) || key"
					@input="updateQuery(key, $event)"
				/>
				<gender-input
					v-else-if="key === 'gender'"
					:value="value"
					@input="updateQuery(key, $event)"
				/>
				<athlete-category-input
					v-else-if="key === 'category'"
					:value="value"
					@input="updateQuery(key, $event)"
				/>
				<jury-category-input
					v-else-if="key === 'jury_category'"
					:value="value"
					@input="updateQuery(key, $event)"
				/>
				<season-input
					v-else-if="key === 'season'"
					:value="value"
					@input="updateQuery(key, $event)"
				/>
				<input
					v-else
					:id="key"
					:value="value"
					:name="key"
					class="searchInput__control"
					@input="updateQuery(key, $event.target.value)"
				/>
			</div>

			<div
				v-if="searchMode === 'events' || searchMode === 'seminars'"
				class="searchControl__wrapper"
			>
				<label class="searchControl__label">Дата</label>
				<date-range-input
					:value="{ date_from: currentSearchQuery.date_from, date_to: currentSearchQuery.date_to }"
					name="date"
					@input="updateDateQuery"
				/>
			</div>
		</div>

		<div class="search_actions">
			<v-btn
				type="submit"
				class="search__button"
				color="var(--color-text-secondary)"
				:loading="isSearching"
			>
				Поиск
			</v-btn>
		</div>
	</form>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import { translateField } from '@/utils/formFields-translator'
import DisciplineInput from '@/components/ui-components/search/search-inputs/discipline-input.vue'
import SportInput from '@/components/ui-components/search/search-inputs/sport-input.vue'
import GenderInput from '@/components/ui-components/search/search-inputs/gender-input.vue'
import AthleteCategoryInput from '@/components/ui-components/search/search-inputs/athlete-category-input.vue'
import JuryCategoryInput from '@/components/ui-components/search/search-inputs/jury-category-input.vue'
import DateRangeInput from '@/components/ui-components/search/search-inputs/date-range-input.vue'
import SeasonInput from '@/components/ui-components/search/search-inputs/season-input.vue'

export default {
	name: 'Search',
	components: {
		SeasonInput,
		DateRangeInput,
		JuryCategoryInput,
		AthleteCategoryInput,
		GenderInput,
		SportInput,
		DisciplineInput
	},
	computed: {
		...mapState('search', ['searchMode']),
		...mapGetters('search', ['isSearching', 'currentSearchQuery']),

		searchQueryWithoutDates() {
			return Object.fromEntries(
				Object.entries(this.currentSearchQuery).filter(
					([key]) => !key.endsWith('_from') && !key.endsWith('_to') && key !== 'date'
				)
			)
		}
	},
	methods: {
		translateField,
		...mapActions('search', ['performSearch', 'setSearchQuery']),
		updateQuery(key, value) {
			const newQuery = { ...this.currentSearchQuery, [key]: value }
			this.setSearchQuery(newQuery)
		},
		updateDateQuery(dates) {
			const newQuery = {
				...this.currentSearchQuery,
				date_from: dates.date_from,
				date_to: dates.date_to
			}
			this.setSearchQuery(newQuery)
		}
	}
}
</script>

<style scoped lang="scss">
.search_wrapper {
	position: relative;
	align-self: flex-start;
	width: 368px;
	margin: 32px 16px auto 0;
	padding: 32px 16px 24px;

	@media screen and (max-width: 900px) {
		display: none;
	}

	.search_body {
		display: flex;
		flex-direction: column;
		gap: 8px;

		.searchControl__wrapper {
			display: flex;
			align-items: center;
			flex-wrap: nowrap;
			gap: var(--space-2);
			padding-bottom: var(--space-1);
			border-bottom: 1px solid var(--color-bg-surface-hover);
			transition: border-bottom-color var(--transition-duration-fast);

			&:focus-within {
				border-bottom: 1px solid var(--color-text-secondary);
			}

			.searchControl__label {
				flex: 1 1 0;

				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
				user-select: none;

				&:hover {
					overflow: visible;
				}
			}
		}
	}

	.search_actions {
		display: flex;
		justify-content: flex-end;
		margin-top: 1rem;

		.search__button {
			padding: 3px 1rem !important;
			font-size: 1rem;
			letter-spacing: 0;
			text-transform: capitalize;
		}
	}
}
</style>
