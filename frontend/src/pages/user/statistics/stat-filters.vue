<template>
	<form v-if="selectedFilter" class="statisticsFilter__wrapper" @submit.prevent="getFilteredStats">
		<div class="filters__section__header">Фильтры</div>
		<div class="filters__section__body">
			<div v-for="(_, key) in filters[selectedFilter]" :key="key" class="filterControl__wrapper">
				<sport-input v-if="key === 'sport'" v-model="filters[selectedFilter][key]" />
				<discipline-input v-else-if="key === 'discipline'" v-model="filters[selectedFilter][key]" />
				<gender-input v-else-if="key === 'gender'" v-model="filters[selectedFilter][key]" />
				<athlete-category-input
					v-else-if="key === 'category'"
					v-model="filters[selectedFilter][key]"
				/>
				<jury-category-input
					v-else-if="key === 'jury_category'"
					v-model="filters[selectedFilter][key]"
				/>

				<date-input v-else-if="key === 'date'" v-model="filters[selectedFilter][key]" />

				<input
					v-else
					:id="key"
					v-model="filters[selectedFilter][key]"
					class="searchControl__input"
					:name="key"
					:placeholder="translateField(key)"
				/>
			</div>
		</div>
		<div class="filters__section__actions">
			<div v-if="filterResults !== null" class="results__section">
				Найдено: {{ filterResults.length }}

				<v-btn icon @click="downloadFilteredStats()">
					<v-icon class="downloadStats__icon">
						{{ icons.mdiDownload }}
					</v-icon>
				</v-btn>
			</div>

			<v-btn type="submit" color="var(--color-text-accent)" text> Применить фильтр </v-btn>
		</div>
	</form>
</template>

<script>
import SportInput from '@/components/ui-components/search/search-inputs/sport-input.vue'
import GenderInput from '@/components/ui-components/search/search-inputs/gender-input.vue'
import DisciplineInput from '@/components/ui-components/search/search-inputs/discipline-input.vue'
import AthleteCategoryInput from '@/components/ui-components/search/search-inputs/athlete-category-input.vue'
import JuryCategoryInput from '@/components/ui-components/search/search-inputs/jury-category-input.vue'
import DateInput from '@/components/ui-components/search/search-inputs/date-input.vue'
import { translateField } from '@/utils/formFields-translator'
import axios from 'axios'
import { apiUrl } from '@/constants'
import { mdiDownload } from '@mdi/js'
import { saveExcelData } from '@/utils/excelData-saver'

export default {
	name: 'StatFilters',
	components: {
		DateInput,
		JuryCategoryInput,
		AthleteCategoryInput,
		DisciplineInput,
		GenderInput,
		SportInput
	},
	props: {
		selectedFilter: {
			type: String,
			default: ''
		}
	},
	data() {
		return {
			filterResults: null,
			filters: {
				events: {
					title: '',
					sport: '',
					discipline: '',
					season: '',
					date: '',
					location: '',
					calendar_code: ''
				},
				athletes: {
					ffr_id: '',
					sport: '',
					discipline: '',
					name: '',
					gender: '',
					year: '',
					category: '',
					region: ''
				},
				jury: {
					jury_code: '',
					name: '',
					sport: '',
					discipline: '',
					gender: '',
					age: '',
					jury_category: '',
					region: ''
				},
				trainers: {
					trainer_id: '',
					fullname: '',
					sport: '',
					discipline: '',
					gender: '',
					region: ''
				},
				organizations: {
					sport: '',
					title: '',
					region: ''
				},
				seminars: {
					sport: '',
					discipline: '',
					season: '',
					region: '',
					location: '',
					date: ''
				}
			},
			loading: false,

			icons: {
				mdiDownload
			}
		}
	},

	watch: {
		selectedFilter(val, newVal) {
			if (val !== newVal) this.filterResults = null
		}
	},
	methods: {
		translateField,

		async getFilteredStats() {
			try {
				const searchParams = new URLSearchParams()
				for (const [key, value] of Object.entries(this.filters[this.selectedFilter])) {
					if (value) {
						searchParams.append(key, value)
					}
				}
				const queryString = searchParams.toString()

				const response = await axios.get(
					`${apiUrl}/${this.selectedFilter}/find${queryString ? '?' + queryString : ''}`
				)
				if (response.status === 200) {
					this.filterResults = response.data[this.selectedFilter]
				}
			} catch (e) {
				if (e) {
					console.error('Error fetching events:', e.response?.data?.message || e.message)
				}
			}
		},
		async downloadFilteredStats() {
			saveExcelData(this.filterResults, this.selectedFilter)
		}
	}
}
</script>

<style scoped lang="scss">
.statisticsFilter__wrapper {
	flex: 0 0 auto;
	display: flex;
	flex-direction: column;
	margin-top: 1.25rem;
	padding-top: 1.25rem;
	border-top: 1px solid var(--color-text-secondary);

	.filters__section__header {
		flex: 0 0 auto;
		padding: 0 0.5rem 0.25rem;
		font-weight: bold;
	}

	.filters__section__body {
		flex: 0 0 auto;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		grid-gap: 0.5rem 0.75rem;

		.filterControl__wrapper {
			display: flex;

			input {
				flex: 1 1 0;
				padding: 4px 8px;
				color: var(--color-text-primary);
				background-color: var(--color-bg-surface-secondary);
				border-radius: 2px;
				outline: transparent;
				transition: background-color var(--transition-duration-fast);

				&:focus {
					background-color: var(--color-bg-surface-hover);
				}
			}
		}
	}

	.filters__section__actions {
		margin-top: 1.75rem;
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		padding: 0 1rem;

		.results__section {
			flex: 1 1 0;
			display: flex;
			align-items: center;
			font-weight: bold;
			font-size: 1.2rem;

			button {
				margin-left: 1rem;
				color: var(--color-text-secondary);

				&:hover {
					color: var(--color-text-accent);
				}
			}
		}

		button {
			margin-left: auto;
		}
	}
}
</style>
