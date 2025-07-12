<template>
	<router-link :to="{ name: 'juryPage', params: { jury_code: item.jury_code } }">
		<div class="juryList__item__wrapper">
			<lazy-image
				class="juryPhoto"
				:src="getImageUrl(item['photo_url']) || ''"
				:alt="getAthleteName(item) || 'Jury photo'"
				rounding="50%"
				variant="list"
				entity-type="jury"
				:entity-data="item"
			/>

			<div class="juryInfo__top">
				<span class="juryInfo__name">
					{{ getAthleteName(item) }}
				</span>

				<span class="juryInfo__code">
					<b>FFR-ID:&nbsp; {{ item.jury_code }}</b>
					<country-flag
						class="countryFlag"
						:country-code="getCountryCode(item.country)"
						height="1.2rem"
						rounding="2px"
					/>
				</span>
			</div>

			<div class="juryInfo__bottom">
				<div class="personalInfo__wrapper">
					<div class="juryCategory">
						{{ item.jury_category }}
					</div>
					<div class="juryRegion">
						{{ item.region }}
					</div>
				</div>

				<div class="jurySport__wrapper">
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
import { getAthleteName } from '@/utils/data-formaters'
import { getCountryCode } from '@/store/data/countries'
import LazyImage from '@/components/ui-components/LazyImage.vue'
import { getImageUrl } from '@/utils/url-helpers'

export default {
	name: 'JuryListItem',
	components: {
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
		getAthleteName,
		getCountryCode,
		getDisciplineCode,
		getImageUrl
	}
}
</script>

<style scoped lang="scss">
.juryList__item__wrapper {
	display: grid;
	grid-template-areas:
		'image top'
		'image bottom';
	grid-template-columns: 96px auto;
	grid-template-rows: auto 1fr;
	grid-gap: 0.5rem 1.25rem;
	border-bottom: 1px solid var(--color-bg-primary);
	transition: background-color var(--transition-duration-fast);

	&:first-child {
		border-top: 1px solid var(--color-bg-primary);
	}

	&:hover {
		background-color: var(--color-bg-surface-hover);
	}

	.juryPhoto {
		place-self: start center;
		grid-area: image;
	}

	.juryInfo__top {
		grid-area: top;
		display: flex;
		padding: 0.5rem 1rem 0 0;

		.juryInfo__name {
			font-weight: bold;
		}

		.juryInfo__code {
			display: flex;
			align-items: center;
			gap: 0.5rem;
			margin-left: auto;

			.countryFlag {
				box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.25);
			}
		}
	}

	.juryInfo__bottom {
		grid-area: bottom;
		display: flex;
		align-items: flex-end;
		flex-wrap: wrap;
		gap: 0.25rem;
		padding: 0 1rem 0.5rem 0;
		color: var(--color-text-secondary);

		.personalInfo__wrapper {
			flex: 1 1 0;
			display: flex;
			flex-direction: column;
			gap: 0.25rem;
		}

		.jurySport__wrapper {
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
