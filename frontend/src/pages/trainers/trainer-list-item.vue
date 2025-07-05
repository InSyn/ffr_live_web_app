<template>
	<router-link :to="{ name: 'trainerPage', params: { trainer_id: item.trainer_id } }">
		<div class="trainersList__item__wrapper">
			<div class="trainerPhoto">
				<lazy-image
					v-if="item['photo_url']"
					:src="getImageUrl(item['photo_url'])"
					:alt="item.fullname || 'Trainer photo'"
					img-class="trainerPhoto"
					rounding="50%"
					variant="list"
				/>
				<person-photo v-else :person="item" />
			</div>

			<div class="trainerInfo__top">
				<span class="trainerInfo__name">
					{{ item.fullname }}
				</span>

				<span class="trainerInfo__code">
					<b>FFR-ID:&nbsp; {{ item.trainer_id }}</b>
					<country-flag
						class="countryFlag"
						:country-code="getCountryCode(item.country)"
						height="1.2rem"
						rounding="2px"
					/>
				</span>
			</div>

			<div class="trainerInfo__bottom">
				<div class="trainerPersonalInfo__wrapper">
					<div v-if="item.birth_date" class="trainerPersonalInfo__item__wrapper">
						<div class="trainerCategory">
							{{ item.trainer_category }}
						</div>
					</div>

					<div class="trainerPersonalInfo__item__wrapper">
						{{ item.region }}
					</div>
				</div>

				<div class="trainerSport__wrapper">
					<div class="sport">
						{{ item.sport }}
					</div>
					<div class="disciplines__wrapper">
						<div v-for="(dsc, idx) in item.disciplines" :key="idx" class="discipline__item">
							{{ getDisciplineCode(dsc) }}
						</div>
					</div>
				</div>
			</div>
		</div>
	</router-link>
</template>

<script>
import CountryFlag from '@/components/ui-components/country-flag.vue'
import { getDisciplineCode } from '@/store/data/sports'
import PersonPhoto from '@/components/ui-components/person-photo.vue'
import { getCountryCode } from '@/store/data/countries'
import LazyImage from '@/components/ui-components/LazyImage.vue'
import { getImageUrl } from '@/utils/url-helpers'

export default {
	name: 'TrainerListItem',
	components: {
		PersonPhoto,
		CountryFlag,
		LazyImage
	},
	props: {
		item: {
			type: Object,
			required: true
		}
	},
	methods: {
		getCountryCode,
		getDisciplineCode,
		getImageUrl
	}
}
</script>

<style scoped lang="scss">
.trainersList__item__wrapper {
	display: grid;
	grid-template-areas:
		'image top'
		'image bottom';
	grid-template-columns: 96px auto;
	grid-template-rows: auto 1fr;
	grid-gap: 0.5rem 1rem;
	border-bottom: 1px solid var(--color-bg-primary);
	transition: background-color var(--transition-duration-fast);

	&:first-child {
		border-top: 1px solid var(--color-bg-primary);
	}

	&:hover {
		background-color: var(--color-bg-surface-hover);
	}

	.trainerPhoto {
		place-self: start center;
		grid-area: image;
	}

	.trainerInfo__top {
		grid-area: top;
		display: flex;
		flex-wrap: nowrap;
		align-items: flex-start;
		padding: 0.5rem 1rem 0 0;

		.trainerInfo__name {
			position: relative;
			font-weight: bold;
		}

		.trainerInfo__code {
			display: flex;
			align-items: center;
			gap: 0.5rem;
			margin-left: auto;

			.countryFlag {
				box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.25);
			}
		}
	}

	.trainerInfo__bottom {
		grid-area: bottom;
		display: flex;
		align-items: flex-end;
		flex-wrap: wrap;
		gap: 0.25rem;
		padding: 0 1rem 0.5rem 0;
		color: var(--color-text-secondary);

		.trainerPersonalInfo__wrapper {
			flex: 1 1 0;
			display: flex;
			flex-direction: column;
			gap: 0.25rem;
		}

		.trainerSport__wrapper {
			flex: 0 0 auto;
			display: flex;
			flex-direction: column;
			justify-content: flex-end;
			gap: 0.25rem;
			margin-left: auto;

			.sport {
				flex: 0 0 auto;
			}

			.disciplines__wrapper {
				flex: 0 0 auto;
				display: flex;
				flex-wrap: wrap;
				justify-content: flex-end;
				gap: 8px;
			}
		}
	}
}
</style>
