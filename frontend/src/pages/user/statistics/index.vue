<template>
	<div class="statistics__wrapper">
		<div class="statistics__header">Статистика базы данных</div>

		<div v-if="!loading" class="statistics__body">
			<div class="statistics__list">
				<div
					v-for="(_, key) in stats_overall"
					:key="key"
					:class="['statistics__item', selectedFilter === key ? 'activeFilter' : '']"
					@click="selectFilters(key)"
				>
					<div class="statistics__item__name">
						{{ menuTranslationMap[key] }}
					</div>
					<div class="statistics__item__count">
						{{ stats_overall[key] ? stats_overall[key] : '' }}
					</div>

					<v-btn class="downloadStats__button" small icon @click.stop="downloadStats(key)">
						<v-icon class="downloadStats__icon">
							{{ icons.mdiDownload }}
						</v-icon>
					</v-btn>
				</div>
			</div>

			<stat-filters :selected-filter="selectedFilter" />
		</div>
		<loader-spinner v-else-if="loading" />
	</div>
</template>

<script>
import axios from 'axios'
import { mdiDownload } from '@mdi/js'
import { apiUrl } from '@/constants'
import LoaderSpinner from '@/components/ui-components/loader-spinner.vue'
import { saveExcelData } from '@/utils/excelData-saver'
import StatFilters from '@/pages/user/statistics/stat-filters.vue'

export default {
	name: 'Statistics',
	components: { StatFilters, LoaderSpinner },
	data() {
		return {
			menuTranslationMap: {
				events: 'События',
				athletes: 'Спортсмены',
				jury: 'Судьи',
				trainers: 'Тренеры',
				organizations: 'Организации',
				seminars: 'Семинары'
			},
			stats_overall: {
				events: null,
				athletes: null,
				jury: null,
				trainers: null,
				organizations: null,
				seminars: null
			},
			selectedFilter: '',
			filters: {
				events: {},
				athletes: {},
				jury: {},
				trainers: {},
				organizations: {},
				seminars: {}
			},

			loading: false,
			icons: {
				mdiDownload
			}
		}
	},

	mounted() {
		this.loadStatistics()
	},
	methods: {
		async loadStatistics() {
			this.loading = true

			try {
				const response = await axios.get(apiUrl + '/stats/overall')
				if (response.status === 200) {
					const stats = response.data.statistics

					for (const statsKey in stats) {
						if (statsKey in this.stats_overall) {
							this.stats_overall[statsKey] = stats[statsKey]
						}
					}
				}
			} catch (err) {
				if (err) {
					console.error(err?.data?.message)
				}
			} finally {
				this.loading = false
			}
		},
		selectFilters(filter) {
			if (filter === this.selectedFilter) this.selectedFilter = ''
			else this.selectedFilter = filter
		},
		async downloadStats(dataKey) {
			try {
				const response = await axios.get(apiUrl + `/${dataKey}`)
				if (response.status === 200) {
					const statsData = response.data[dataKey]
					saveExcelData(statsData, dataKey)
				}
			} catch (err) {
				if (err) {
					console.error(err?.data?.message)
				}
			}
		}
	}
}
</script>

<style scoped lang="scss">
.statistics__wrapper {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	padding: 1rem 2rem 2rem;

	background-color: var(--color-bg-surface);
	box-shadow: var(--surface-shadow-s);
	border: 1px solid var(--color-border-primary);
	border-radius: 4px;

	.statistics__header {
		font-size: 1.2rem;
	}

	.statistics__body {
		display: flex;
		flex-direction: column;

		.statistics__list {
			flex: 0 0 auto;
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
			grid-gap: 0.5rem 0.75rem;

			.statistics__item {
				display: flex;
				align-items: center;
				gap: 0.75rem;
				padding: 0.5rem 1rem;

				background-color: var(--color-bg-surface-secondary);
				border: 2px solid var(--color-text-secondary);
				border-radius: 2px;
				font-size: 1.1rem;

				user-select: none;
				cursor: pointer;
				transition:
					background-color var(--transition-duration-fast),
					border-color var(--transition-duration-fast);

				&:hover {
					border-color: var(--text-hovered);
					background-color: var(--color-bg-surface-hover);
				}

				&.activeFilter {
					background-color: var(--color-bg-surface-hover);
					border-color: var(--color-text-accent);
				}

				.statistics__item__count {
					flex: 0 0 auto;
					font-weight: bold;
				}

				.statistics__item__name {
					flex: 0 0 auto;
				}

				.downloadStats__button {
					margin-left: auto;
					color: var(--color-text-secondary);

					&:hover {
						color: var(--color-text-success);
					}
				}
			}
		}
	}
}
</style>
