<template>
	<div class="search-advanced-filters">
		<div v-for="(value, key) in currentFilters" :key="key" class="filter-row">
			<label :for="key" class="filter-row__label">
				{{ translateField(key) }}
			</label>

			<sport-input
				v-if="key === 'sport'"
				:value="currentSearchQuery[key]"
				@input="updateQuery(key, $event)"
			/>
			<discipline-input
				v-else-if="key === 'discipline'"
				:value="currentSearchQuery[key]"
				@input="updateQuery(key, $event)"
			/>
			<gender-input
				v-else-if="key === 'gender'"
				:value="currentSearchQuery[key]"
				@input="updateQuery(key, $event)"
			/>
			<athlete-category-input
				v-else-if="key === 'category'"
				:value="currentSearchQuery[key]"
				@input="updateQuery(key, $event)"
			/>
			<jury-category-input
				v-else-if="key === 'jury_category'"
				:value="currentSearchQuery[key]"
				@input="updateQuery(key, $event)"
			/>
			<date-input
				v-else-if="key === 'date' || key === 'date_from' || key === 'date_to'"
				:value="currentSearchQuery[key]"
				@input="updateQuery(key, $event)"
			/>
			<season-input
				v-else-if="key === 'season'"
				:value="currentSearchQuery[key]"
				@input="updateQuery(key, $event)"
			/>

			<v-text-field
				v-else
				:id="key"
				:value="currentSearchQuery[key]"
				class="filter-row__input"
				solo
				flat
				hide-details
				@input="updateQuery(key, $event)"
			/>
		</div>
	</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { translateField } from '@/utils/formFields-translator'
import DisciplineInput from '@/components/ui-components/search/search-inputs/discipline-input.vue'
import SportInput from '@/components/ui-components/search/search-inputs/sport-input.vue'
import GenderInput from '@/components/ui-components/search/search-inputs/gender-input.vue'
import AthleteCategoryInput from '@/components/ui-components/search/search-inputs/athlete-category-input.vue'
import JuryCategoryInput from '@/components/ui-components/search/search-inputs/jury-category-input.vue'
import DateInput from '@/components/ui-components/search/search-inputs/date-input.vue'
import SeasonInput from '@/components/ui-components/search/search-inputs/season-input.vue'

export default {
	name: 'SearchAdvancedFilters',
	components: {
		DisciplineInput,
		SportInput,
		GenderInput,
		AthleteCategoryInput,
		JuryCategoryInput,
		DateInput,
		SeasonInput
	},
	computed: {
		...mapGetters('search', ['currentSearchMode', 'currentSearchQuery']),
		currentFilters() {
			// ✅ ИСПРАВЛЕНО: Используем только Vuex state, убираем дублирование
			return this.currentSearchQuery || {}
		}
	},
	methods: {
		...mapActions('search', ['setSearchQuery']),
		translateField,
		updateQuery(key, value) {
			// ✅ ИСПРАВЛЕНО: Обновляем конкретное поле, сохраняя остальные
			const updatedQuery = { ...this.currentSearchQuery, [key]: value }
			this.setSearchQuery(updatedQuery)
		}
	}
}
</script>

<style scoped lang="scss">
.search-advanced-filters {
	display: flex;
	flex-direction: column;
	gap: var(--space-4);
	padding: var(--space-4);
}

.filter-row {
	display: flex;
	flex-direction: column;
	gap: var(--space-2);

	&__label {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: var(--space-1);
	}

	.v-text-field {
		background-color: var(--color-bg-surface-hover);
		border: 1px solid var(--border-color);
		border-radius: var(--radius-md);
	}
}
</style>
