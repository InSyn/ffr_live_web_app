<script>
import CountryFlag from '@/components/ui-components/country-flag.vue'
import { getRegionCode } from '@/store/data/russia-regions'
import { getCountryCode } from '@/store/data/countries'
import { isLoggedIn } from '@/utils/auth-helpers'
import { getDMOHeatCompetitorColor } from '@/utils/competition-utils'

export default {
	name: 'ResultsTableDMO',
	components: { CountryFlag },
	props: ['competition', 'selectedStage'],
	data() {
		return {
			raceFilter: {
				type: null,
				target: null
			}
		}
	},

	watch: {
		selectedStage: function (val, oldVal) {
			if (val === oldVal) return

			if (this.competition.races.length > 0) {
				this.setResultsFilter(`race-results:${this.competition.races[0].race_id}`)
				return
			}
			this.raceFilter = 'overall'
		}
	},
	mounted() {
		if (this.competition.races.length > 0) {
			this.setResultsFilter(`race-results:${this.competition.races[0].race_id}`)
			return
		}
		this.raceFilter.type = 'overall'
	},
	methods: {
		getDMOHeatCompetitorColor,
		getRegionCode,
		getCountryCode,
		isLoggedIn,
		getAthlete(competitor_id) {
			const athlete = this.competition.competitors.find(
				athlete => athlete.local_id === competitor_id
			)
			return athlete || null
		},
		getHeats(race_id) {
			const race = this.competition.races.find(race => race.race_id === race_id)
			if (!race || !race.heats) return []

			return race.heats.map(heat => {
				const competitors = heat.competitors.map((competitor_id, index) => {
					const athlete = this.getAthlete(competitor_id)
					return {
						...athlete,
						result: heat.results[index] || '',
						position: index + 1
					}
				})

				return { competitors, title: heat.title || `Heat ${heat._id}` }
			})
		},
		setResultsFilter(filter) {
			const [type, target] = filter.split(':')
			this.raceFilter.type = type
			this.raceFilter.target = target || null
		},
		getHeatTitle(heatIdx) {
			const race = this.competition.races.find(race => race.race_id === this.raceFilter.target)
			return `${race.title} - Заезд ${heatIdx + 1}`
		},
		navigateToAthletePage(athlete_code) {
			if (!athlete_code) return

			this.$router.push(`/athlete-info/${athlete_code}`)
		},
		isOddOrFinal(competition, selectedStageFilter) {
			if (!selectedStageFilter || !selectedStageFilter.target) return false
			const indexOfSelectedStage = competition.races.findIndex(
				race => race.race_id === selectedStageFilter.target
			)

			if (!competition || !competition.races[indexOfSelectedStage]) return false

			if (
				indexOfSelectedStage === competition.races.length - 1 ||
				indexOfSelectedStage === competition.races.length - 2
			) {
				return true
			}

			return (competition.races.length - 1 - indexOfSelectedStage) % 2 === 1
		},
		getCompetitorScore(competitor, raceFilter) {
			if (!competitor || !raceFilter.target) return '-'

			const selectedRace = this.competition.races.find(race => race.race_id === raceFilter.target)
			if (!selectedRace || !selectedRace.results) return '-'

			const stageScore = selectedRace.results.find(
				stageScore => stageScore.competitor_id === competitor.local_id
			)
			if (!stageScore || (!stageScore.value && !stageScore.status)) return '-'

			return stageScore.status ? stageScore.status : stageScore.value || '-'
		}
	}
}
</script>

<template>
	<div v-if="competition" class="competitionResults__wrapper">
		<div v-if="competition.races.length > 0" class="raceSelect__wrapper">
			<div class="raceFilters__group raceResultsFilters__wrapper">
				<button
					v-for="race in competition.races"
					:key="`RFilter_${race._id}`"
					:class="[
						'raceSelect__button',
						'raceResults',
						{
							isSelectedFilter:
								raceFilter.type === 'race-results' && raceFilter.target === race.race_id
						}
					]"
					@click="setResultsFilter(`race-results:${race.race_id}`)"
				>
					{{ race.title }}
				</button>
			</div>
		</div>

		<div class="resultsTable__wrapper">
			<div class="resultsTable__header">
				<div class="resultsTable__tableValue" data-header-value="position">Ст. №</div>
				<div class="resultsTable__tableValue" data-header-value="bib">Н/Н</div>
				<div class="resultsTable__tableValue" data-header-value="name">Фамилия, имя</div>
				<div class="resultsTable__tableValue" data-header-value="heatScore">Балл</div>
				<div class="resultsTable__tableValue" data-header-value="overallResult">Место</div>
			</div>

			<div class="resultsSheet__body">
				<div
					v-for="(heat, heat_idx) in getHeats(raceFilter.target)"
					:key="heat.title"
					class="heatResults__wrapper"
				>
					<div class="heatResults__header">
						{{ getHeatTitle(heat_idx) }}
					</div>
					<div
						class="heatResults__competitors"
						:class="{
							isOddOrFinalStage: isOddOrFinal(competition, raceFilter)
						}"
					>
						<div
							v-for="(competitor, competitor_idx) in heat.competitors"
							:key="competitor_idx"
							class="resultsSheet__competitorResult"
						>
							<div class="resultsTable__tableValue" data-header-value="position">
								<div
									class="sx-color-wrapper"
									:style="{
										backgroundColor: `var(${getDMOHeatCompetitorColor(competitor_idx + 1)})`
									}"
								>
									{{ competitor && competitor.bib ? competitor.bib : '-' }}
								</div>
							</div>
							<div
								class="resultsTable__tableValue"
								data-header-value="name"
								@click="navigateToAthletePage(competitor.ffr_id)"
							>
								<div v-if="competitor.region || competitor.country" class="athleteFlags__wrapper">
									<country-flag
										v-for="(athleteRegion, rIdx) in competitor.region
											? competitor.region.split(',')
											: competitor.country
												? [competitor.country]
												: []"
										:key="rIdx"
										:is-region-flag="!!getRegionCode(athleteRegion)"
										:country-code="getCountryCode(competitor.country || 'Россия')"
										:region-code="getRegionCode(athleteRegion)"
										height="1rem"
										rounding="2px"
									/>
								</div>
								<span v-if="competitor.lastname">{{ competitor.lastname + '&nbsp;' }}</span>
								<span>{{ competitor.name }}</span>
							</div>
							<div class="resultsTable__tableValue" data-header-value="heatScore">
								{{ getCompetitorScore(competitor, raceFilter) }}
							</div>
							<div class="resultsTable__tableValue" data-header-value="overallResult">
								{{ competitor.result || '-' }}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<style lang="scss" scoped>
.competitionResults__wrapper {
	flex: 1 0 auto;
	display: flex;
	flex-direction: column;
}

.raceSelect__wrapper {
	display: flex;
	flex-wrap: wrap;
	gap: 8px 12px;
	margin-bottom: 8px;
}

.raceFilters__group {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.overallResultFilter__wrapper {
	margin-left: auto;
}

.raceSelect__button {
	flex: 0 0 auto;
	padding: 0.4rem 1rem;

	background-color: var(--color-bg-surface);
	color: var(--color-text-primary);
	border-radius: 2px;
	transition:
		background-color var(--transition-duration-fast),
		color var(--transition-duration-fast),
		transform var(--transition-duration-instant) ease-in;
}

.raceSelect__button:hover,
.raceSelect__button:focus {
	background-color: var(--color-interactive-brand-default);
	color: var(--color-text-secondary);
}

.raceSelect__button.overallResult {
	font-weight: bold;
}

/*noinspection CssUnusedSymbol*/
.isSelectedFilter {
	background-color: var(--color-interactive-brand-default);
	color: var(--color-text-secondary);
	transform: translateY(4px);
}

.resultsTable__wrapper {
	flex: 1 1 200px;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	background-color: var(--color-bg-surface);
	box-shadow: var(--surface-shadow-m);
	border: 1px solid var(--color-border-primary);
	border-radius: 4px;
}

.resultsTable__header {
	flex: 0 0 auto;
	display: flex;
	flex-wrap: nowrap;
	font-weight: bold;
}

.resultsTable__tableValue {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 2px 4px;
	text-align: center;
	white-space: nowrap;

	.sx-color-wrapper {
		flex: 1 1 0;
		border-radius: 2px;
	}
}

.resultsTable__tableValue[data-header-value='position'] {
	flex: 2 0 0;
	min-width: 2rem;
	max-width: 3.75rem;
	color: white;
}
.resultsTable__tableValue[data-header-value='bib'] {
	flex: 2 0 0;
	min-width: 3rem;
	max-width: 5rem;
	font-weight: bold;
}
.resultsTable__tableValue[data-header-value='name'] {
	position: relative;
	flex: 8 0 0;
	justify-content: flex-start;
	min-width: 12rem;
	max-width: 32rem;
	margin-right: auto;

	text-align: left;
	cursor: pointer;
}
.resultsTable__tableValue[data-header-value='name']:hover {
	font-weight: bold;
}

.athleteFlags__wrapper {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 3px;
	height: 100%;
	max-width: 36px;
	margin-right: 0.5rem;
	padding: 2px 4px;
}

.athleteFlags__wrapper img {
	max-height: 100%;
	min-width: 100%;
}

.resultsTable__tableValue[data-header-value='heatScore'] {
	flex: 2 0 0;
	min-width: 3rem;
	max-width: 3.75rem;
	font-weight: bold;
}
.resultsTable__tableValue[data-header-value='overallResult'] {
	flex: 2 0 0;
	min-width: 3rem;
	max-width: 4rem;
}

.resultsSheet__body {
	flex: 1 1 0;
	display: flex;
	flex-direction: column;
	flex-wrap: nowrap;
	overflow-y: auto;
}

@media screen and (orientation: landscape) {
	.resultsSheet__body {
		flex-basis: 200px;
	}
}

.resultsSheet__competitorResult {
	flex: 0 0 auto;
	display: flex;
	flex-wrap: nowrap;
	transition: background-color var(--transition-duration-fast);
}

.resultsSheet__competitorResult:hover,
.resultsSheet__competitorResult:focus {
	background-color: var(--color-bg-surface-hover) !important;
}

/*noinspection CssUnusedSymbol*/
.resultsSheet__competitorResult.isOddCompetitor {
	background-color: var(--color-bg-surface-secondary);
}

/* finals updates */
.heatResults__wrapper {
	margin-bottom: 0.75rem;
}

.heatResults__header {
	font-weight: bold;
	margin-bottom: 0.5rem;
	padding: 0.25rem 0.75rem;
}

.heatResults__competitors {
	display: flex;
	flex-direction: column;

	&.isOddOrFinalStage {
		flex-direction: column-reverse;
	}
}

.resultsTable__tableValue {
	padding: 2px 4px;
	border-bottom: 1px solid var(--border-color);
}

.resultsTable__tableValue[data-header-value='position'] {
	font-weight: bold;
}
</style>
