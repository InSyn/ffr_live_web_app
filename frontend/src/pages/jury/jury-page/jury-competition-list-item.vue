<template>
	<div class="juryEvent__item__wrapper">
		<div class="event__image__wrapper">
			<lazy-image
				:src="getImageUrl(event['logo_image_url']) || ''"
				:alt="event.title || 'Event logo'"
				variant="list"
				entity-type="event"
				:entity-data="event"
			/>
			<country-flag
				class="juryEvent_regionFlag"
				width="1.5rem"
				is-region-flag="true"
				:country-code="getCountryCode(event.country)"
				:region-code="getRegionCode(event.region)"
				rounding="2px"
			/>
		</div>
		<div class="juryEvent__item__body">
			<div class="juryEvent__item__topSection">
				<div class="juryEvent__title">
					{{ event.title }}
				</div>
				<div class="juryEvent__sport">
					{{ event.sport }}
					<country-flag
						class="juryEvent_countryFlag"
						height="1rem"
						:country-code="getCountryCode(event.country)"
					/>
				</div>
			</div>
			<div class="juryEvent__item__middleSection">
				<div class="juryEvent__date">
					{{ formatDate(event.start_at) }}
				</div>
				<div class="juryEvent__discipline">
					{{ event.discipline }}
				</div>
			</div>
			<div class="juryEvent__item__bottomSection">
				<div class="juryEvent__region">
					{{ event.region }}
				</div>
				<div class="juryEvent__location">
					{{ event.location }}
				</div>

				<div class="juryEvent__role">
					{{ `Позиция:&nbsp;&nbsp;${role}` }}
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import CountryFlag from '@/components/ui-components/country-flag.vue'
import { getCountryCode } from '@/store/data/countries'
import { getRegionCode } from '@/store/data/russia-regions'
import { formatDate } from '@/utils/data-formaters'
import LazyImage from '@/components/ui-components/LazyImage.vue'
import { getImageUrl } from '@/utils/url-helpers'

export default {
	name: 'JuryCompetitionListItem',
	components: { CountryFlag, LazyImage },
	props: {
		event: { type: Object, default: () => ({}) },
		item: { type: Object, default: () => ({}) },
		jury_code: { type: String, default: '' }
	},
	data() {
		return {
			role: ''
		}
	},

	mounted() {
		this.getJuryCompetitionRole()
	},
	methods: {
		formatDate,
		getRegionCode,
		getCountryCode,
		getImageUrl,
		getJuryCompetitionRole() {
			if (!this.item.jury) return '-'

			return this.item.role || '-'
		}
	}
}
</script>

<style scoped lang="scss">
.juryEvent__item__wrapper {
	display: flex;
	flex-wrap: nowrap;

	.event__image__wrapper {
		position: relative;
		flex: 0 0 auto;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 72px;
		aspect-ratio: 1;

		.juryEvent_regionFlag {
			position: absolute;
			bottom: 0;
			right: -0.75rem;
		}

		@media screen and (max-width: 920px) {
			height: 60px;
		}
		@media screen and (max-width: 640px) {
			height: 48px;
		}
	}

	.juryEvent__item__body {
		flex: 1 1 0;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-left: 1.25rem;

		.juryEvent__item__topSection {
			flex: 0 0 auto;
			display: flex;
			flex-wrap: nowrap;

			.juryEvent__title {
				font-size: 1.1rem;
				font-weight: bold;
			}

			.juryEvent__sport {
				display: flex;
				align-items: center;
				margin-left: auto;
				font-size: 1.1rem;

				.juryEvent_countryFlag {
					margin-left: 0.5rem;
				}
			}
		}

		.juryEvent__item__middleSection {
			flex: 0 0 auto;
			display: flex;
			align-items: center;

			.juryEvent__date {
				color: var(--color-text-secondary);
			}

			.juryEvent__discipline {
				margin-left: auto;
			}
		}

		.juryEvent__item__bottomSection {
			flex: 0 0 auto;
			display: flex;
			align-items: center;
			flex-wrap: wrap;
			gap: 1rem;
			margin-top: auto;

			.juryEvent__region {
				margin-left: 0.5rem;
				color: var(--color-text-secondary);
			}

			.juryEvent__location {
				color: var(--color-text-secondary);
			}

			.juryEvent__role {
				margin-left: auto;
			}
		}
	}
}
</style>
