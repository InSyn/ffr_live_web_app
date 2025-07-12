<template>
	<router-link
		:to="{
			name: 'eventPage',
			params: { event_id: event['event_id'] }
		}"
		class="athleteCompetition__item"
		:class="!(index % 2) && 'isOddItem'"
	>
		<div class="athleteCompetition__item__image__container">
			<lazy-image
				:src="event['logo_image_url'] ? uploadsFolderUrl() + event['logo_image_url'] : ''"
				:alt="event.title || 'Event logo'"
				variant="list"
				entity-type="event"
				:entity-data="event"
			/>
		</div>

		<div class="athleteCompetition__item__competitionInfo">
			<div class="athleteCompetition__item__title">
				{{ event['title'] }}
			</div>

			<div class="athleteCompetition__item__sportInfo">
				<country-flag
					v-if="event.country_code"
					class="countryFlag"
					:country-code="getCountryCode(event.country)"
					width="1.25rem"
				/>
				<div class="athleteCompetition__item__sportInfo__sport">
					{{ event['sport'] || '-' }}
				</div>

				<div class="athleteCompetition__item__sportInfo__discipline">
					{{ event['discipline'] || '-' }}
				</div>
			</div>

			<div class="athleteCompetition__item__info">
				<div class="athleteCompetition__item__sportInfo__date">
					{{ formatDate(event['start_at']) || '-' }}
				</div>

				<div class="athleteCompetition__item__sportInfo__region">
					{{ event['region'] || '-' }}
				</div>
				<div class="athleteCompetition__item__sportInfo__location">
					{{ event['location'] || '-' }}
				</div>
			</div>
		</div>

		<div class="eventResults__wrapper">
			<div
				v-for="result in getEventResults(event['event_id']).filter(totalResult => !!totalResult)"
				:key="result['id']"
				class="eventResults__item"
			>
				<div class="competitionResult__wrapper__info">
					{{ result['competition']['stage'] }}
				</div>
				<div class="competitionResult__wrapper__result">
					Место:&nbsp;
					<b>{{ result['rank'] || '-' }} </b>
				</div>
			</div>
		</div>
	</router-link>
</template>

<script>
import { formatDate } from '@/utils/data-formaters'
import { backendRootUrl } from '@/constants'
import CountryFlag from '@/components/ui-components/country-flag.vue'
import { getCountryCode } from '@/store/data/countries'
import LazyImage from '@/components/ui-components/LazyImage.vue'

export default {
	name: 'AthleteEventItem',
	components: { CountryFlag, LazyImage },
	props: ['athlete_code', 'event', 'competitions', 'index'],
	methods: {
		getCountryCode,
		uploadsFolderUrl() {
			return backendRootUrl
		},
		formatDate,
		getEventResults(event_id) {
			const event = this.competitions.find(event => event.event_id === event_id)
			if (!event) return []

			const athleteResults = event.competitions.map(competition => {
				return competition.total_results.find(result => {
					if (!result) return

					const athleteLocalObj = competition.competitors.find(
						competitor => competitor.ffr_id === this.athlete_code
					)
					if (!athleteLocalObj) return

					result.competitor = athleteLocalObj
					result.competition = { stage: competition.stage }
					return result.competitor_id === athleteLocalObj.local_id
				})
			})

			return athleteResults
		}
	}
}
</script>

<style scoped lang="scss">
.athleteCompetition__item {
	position: relative;
	flex: 0 0 auto;
	display: flex;

	color: var(--color-text-primary);

	transition: background-color var(--transition-duration-fast);

	&.isOddItem {
		background-color: var(--color-bg-tertiary);
	}

	&:hover,
	&:focus {
		background-color: var(--color-bg-primary-hovered);
		backdrop-filter: blur(4px);
	}

	.athleteCompetition__item__image__container {
		flex: 0 0 auto;
		display: flex;
		justify-content: center;
		height: 80px;
		aspect-ratio: 1;
		padding: 8px;

		@media screen and (max-width: 720px) {
			height: 60px;
		}
	}

	.athleteCompetition__item__competitionInfo {
		flex: 1 1 0;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 4px;

		.athleteCompetition__item__title {
			flex: 0 0 auto;
			padding: 3px 6px;
			font-weight: bold;
			font-size: 0.9rem;
		}

		.athleteCompetition__item__sportInfo {
			flex: 0 0 auto;
			display: flex;
			align-items: center;
			flex-wrap: wrap;
			gap: 4px 8px;
			padding: 3px 6px;
			font-size: 0.8rem;

			.countryFlag {
				display: block;
			}
		}

		.athleteCompetition__item__info {
			flex: 0 0 auto;
			display: flex;
			align-content: center;
			flex-wrap: wrap;
			gap: 4px 8px;
			padding: 3px 6px;
			font-size: 0.8rem;
		}
	}

	.eventResults__wrapper {
		flex: 0 0 auto;
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		align-items: flex-end;
		gap: 12px;
		font-size: 0.8rem;

		.eventResults__item {
			display: flex;
			flex-direction: column;
			gap: 6px;
			padding: 8px;
		}
	}

	@media screen and (max-width: 720px) {
		flex-wrap: wrap;
	}
}
</style>
