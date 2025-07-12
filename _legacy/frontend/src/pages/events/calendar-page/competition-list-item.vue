<template>
	<router-link
		:key="event['event_id']"
		:class="[index % 2 > 0 && 'event_isOdd', dateMatch && 'calendarDate-match']"
		:to="{
			name: 'eventPage',
			params: { event_id: event['event_id'] }
		}"
		class="competition__link"
	>
		<div class="competitionImage__container">
			<img
				v-if="event['logo_image_url']"
				:src="uploadsFolderUrl + event['logo_image_url']"
				alt="Event Logo"
				class="competitionImage__image"
				loading="lazy"
			/>

			<competition-image-filler-icon v-else class="imageFiller"></competition-image-filler-icon>
		</div>

		<div class="competitionInfo__wrapper">
			<div class="competition__link__header">
				<div class="competition__link__header__title">
					{{ event['title'] }}
				</div>

				<div class="competition__link__header__sport">
					{{ event['sport'] }}&nbsp;
					<country-flag
						v-if="event.country"
						:country-code="getCountryCode(event.country)"
						class="countryFlag"
						width="1.4rem"
					></country-flag>
				</div>
			</div>

			<div class="competition__link__body">
				<div class="competition__link__body__discipline">
					{{ event['discipline'] }}
				</div>

				<div v-if="event['calendar_code']" class="competition__link__header__code">
					{{ 'ЕКП&nbsp;' + event['calendar_code'] }}
				</div>
			</div>

			<div class="competition__link__footer">
				<div class="competition__link__footer__info__location">
					<country-flag
						:country-code="getCountryCode(event.country)"
						:is-region-flag="!!getRegionCode(event.region)"
						:region-code="getRegionCode(event.region)"
						class="competitionImage__flag"
						rounding="2px"
						height="1rem"
					></country-flag>
					{{ event['region'] + ',&nbsp;' + event['location'] }}
				</div>
				<div class="competition__link__footer__info__date">
					{{ formatDate(event['start_at']) }}
				</div>
			</div>
		</div>
	</router-link>
</template>
<script>
import CountryFlag from '@/components/ui-components/country-flag.vue'
import CompetitionImageFillerIcon from '@/assets/svg/competitionImageFiller-icon.vue'
import { formatDate } from '@/utils/data-formaters'
import { getCountryCode } from '@/store/data/countries'
import { getRegionCode } from '@/store/data/russia-regions'
import { uploadsFolderUrl } from '@/store/constants'
import { getDisciplineCode } from '@/store/data/sports'

export default {
	name: 'competition-list-item',
	computed: {
		uploadsFolderUrl() {
			return uploadsFolderUrl
		}
	},
	methods: {
		getDisciplineCode,
		getRegionCode,
		getCountryCode,
		formatDate
	},
	components: { CompetitionImageFillerIcon, CountryFlag },
	props: {
		event: { type: Object, required: true },
		index: Number,
		dateMatch: Boolean
	}
}
</script>

<style lang="scss" scoped>
.competition__link {
	position: relative;
	flex: 0 0 auto;
	display: flex;
	flex-wrap: nowrap;
	color: var(--text-default);
	border-bottom: 1px solid var(--color-border-primary);
	cursor: pointer;
	transition: background-color 92ms;

	/*noinspection CssUnusedSymbol*/
	&.event_isOdd {
		background-color: var(--background--diff);
	}

	&.calendarDate-match {
		padding-left: 4px;
		border-left: 4px solid var(--accent);
	}

	&:hover {
		background-color: var(--background--primary-hover);
	}

	.competitionImage__container {
		position: relative;
		flex: 0 0 auto;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		height: 100px;
		aspect-ratio: 1;
		padding: 8px;

		.competitionImage__image {
			display: block;
			max-height: 100%;
			max-width: 100%;
		}

		.competitionImage__imageFiller__icon {
			height: 100%;
			width: 100%;
		}

		@media screen and (max-width: 1440px) {
			height: 85px;
		}
		@media screen and (max-width: 1200px) {
			height: 70px;
		}
		@media screen and (max-width: 900px) {
			height: 60px;
		}
	}

	.competitionInfo__wrapper {
		position: relative;
		flex: 1 1 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;

		.competition__link__header {
			flex: 0 0 auto;
			display: flex;
			flex-wrap: nowrap;
			align-items: flex-start;
			gap: 0.5rem 1.25rem;
			padding: 0.5rem 1rem 0 0;

			.competition__link__header__title {
				flex: 1 1 auto;
				font-weight: bold;
				text-wrap: balance;
			}

			.competition__link__header__sport {
				flex: 0 0 auto;
				display: flex;
				align-items: center;
				font-weight: bold;
				margin-left: auto;

				transition: background-color 112ms;

				.countryFlag {
					margin-left: 8px;
				}
			}
		}

		.competition__link__body {
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			gap: 0.5rem 1.25rem;
			padding-right: 1rem;

			.competition__link__body__discipline {
				flex: 0 1 auto;
				font-weight: bold;
			}

			.competition__link__header__code {
				flex: 0 1 auto;
				margin-left: auto;
				color: var(--text-muted);
				font-size: 0.9rem;
				white-space: nowrap;
			}
		}

		.competition__link__footer {
			flex: 0 0 auto;
			display: flex;
			flex-wrap: wrap;
			align-items: flex-end;
			gap: 0.5rem 1.25rem;
			margin-top: auto;
			padding: 0 1rem 0.5rem 0;

			.competition__link__footer__info__location {
				flex: 1 1 0;
				display: flex;
				align-items: center;
				color: var(--text-muted);
				text-wrap: balance;

				.competitionImage__flag {
					margin-right: 0.75rem;
				}
			}

			.competition__link__footer__info__date {
				flex: 0 0 auto;
				margin-left: auto;
			}
		}
	}
}
</style>
