<template>
	<router-link :to="`/event-page/${item.event_id}`" class="competition__wrapper-link">
		<div
			:class="[index % 2 > 0 && 'event_isOdd', dateMatch && 'calendarDate-match']"
			class="competition__wrapper"
		>
			<div class="competitionImage__container">
				<lazy-image
					v-if="item['logo_image_url']"
					:src="getImageUrl(item['logo_image_url'])"
					alt="Event Logo"
					class="competitionImage__image"
					variant="list"
				/>

				<competition-image-filler-icon v-else class="imageFiller" />
			</div>

			<div class="competitionInfo__wrapper">
				<div class="competition__link__header">
					<div class="competition__link__header__title">
						{{ item['title'] }}
					</div>

					<div class="competition__link__header__sport">
						{{ item['sport'] }}&nbsp;
						<country-flag
							v-if="item.country"
							:country-code="getCountryCode(item.country)"
							class="countryFlag"
							width="1.4rem"
						/>
					</div>
				</div>

				<div class="competition__link__body">
					<div class="competition__link__body__discipline">
						{{ item['discipline'] }}
					</div>

					<div v-if="item['calendar_code']" class="competition__link__header__code">
						{{ 'ЕКП&nbsp;' + item['calendar_code'] }}
					</div>
				</div>

				<div class="competition__link__footer">
					<div class="competition__link__footer__info__location">
						<country-flag
							:country-code="getCountryCode(item.country)"
							:is-region-flag="!!getRegionCode(item.region)"
							:region-code="getRegionCode(item.region)"
							class="competitionImage__flag"
							rounding="2px"
							height="1rem"
						/>
						{{ concatStringsWithComma([item.region, item.location]) }}
					</div>
					<div class="competition__link__footer__info__date">
						<span v-if="!dateMatch">
							{{ formatDate(item['start_at']) }}
						</span>
						<b v-else>
							{{ formatDate(item['start_at']) }}
						</b>
					</div>
				</div>
			</div>
		</div>
	</router-link>
</template>
<script>
import CountryFlag from '@/components/ui-components/country-flag.vue'
import CompetitionImageFillerIcon from '@/assets/svg/competitionImageFiller-icon.vue'
import { concatStringsWithComma, formatDate } from '@/utils/data-formaters'
import { getCountryCode } from '@/store/data/countries'
import { getRegionCode } from '@/store/data/russia-regions'
import { getDisciplineCode } from '@/store/data/sports'
import { getImageUrl } from '@/utils/url-helpers'
import LazyImage from '@/components/ui-components/LazyImage.vue'

export default {
	name: 'CompetitionListItem',
	components: { LazyImage, CompetitionImageFillerIcon, CountryFlag },
	props: {
		item: { type: Object, required: true },
		index: Number,
		dateMatch: Boolean
	},
	methods: {
		concatStringsWithComma,
		getDisciplineCode,
		getRegionCode,
		getCountryCode,
		formatDate,
		getImageUrl
	}
}
</script>

<style lang="scss" scoped>
.competition__wrapper-link {
	display: block;
	text-decoration: none;
	color: inherit;
}

.competition__wrapper {
	position: relative;
	flex: 0 0 auto;
	display: flex;
	flex-wrap: nowrap;

	color: var(--color-text-primary);
	cursor: pointer;
	transition: background-color var(--transition-duration-fast);

	/*noinspection CssUnusedSymbol*/
	&.event_isOdd {
		background-color: var(--color-bg-tertiary);
	}

	&.calendarDate-match {
		padding-left: 4px;
		border-left: 4px solid var(--color-text-accent);
	}

	&:hover {
		background-color: var(--color-bg-primary-hovered);
	}

	.competitionImage__container {
		position: relative;
		flex: 0 0 auto;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		height: 100px;
		aspect-ratio: 1;
		padding: var(--space-2);

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
		gap: var(--space-2);
		margin-left: var(--space-3);

		.competition__link__header {
			flex: 0 0 auto;
			display: flex;
			flex-wrap: nowrap;
			align-items: flex-start;
			gap: var(--space-2) var(--space-5);
			padding: var(--space-2) var(--space-4) 0 0;

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
					margin-left: var(--space-2);
				}
			}
		}

		.competition__link__body {
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			gap: var(--space-2) var(--space-5);
			margin-top: var(--space-1);
			padding-right: var(--space-4);

			.competition__link__body__discipline {
				flex: 0 1 auto;
				font-weight: bold;
			}

			.competition__link__header__code {
				flex: 0 1 auto;
				margin-left: auto;
				color: var(--color-text-secondary);
				font-size: 0.9rem;
				white-space: nowrap;
			}
		}

		.competition__link__footer {
			flex: 0 0 auto;
			display: flex;
			flex-wrap: wrap;
			align-items: flex-end;
			gap: var(--space-2) var(--space-5);
			margin-top: auto;
			padding: var(--space-2) var(--space-4) var(--space-2) 0;

			.competition__link__footer__info__location {
				flex: 1 1 0;
				display: flex;
				align-items: center;
				color: var(--color-text-secondary);
				text-wrap: balance;

				.competitionImage__flag {
					margin-right: var(--space-3);
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
