<template>
	<router-link
		:to="{ name: 'organizationPage', params: { org_id: item._id } }"
		custom
		v-slot="{ navigate }"
	>
		<div
			:class="['organizationsList__item__wrapper', index % 2 === 0 && 'isEven']"
			@click="navigate"
		>
			<div class="organizationImage__wrapper">
				<lazy-image
					:src="getImageUrl(item['logo_url']) || ''"
					:alt="item.title || 'Organization logo'"
					variant="list"
					entity-type="organization"
					:entity-data="item"
				/>
			</div>
			<div class="organizationInfo__top">
				<span class="organizationInfo__title">
					{{ item.title }}
				</span>

				<span class="organizationInfo__sport">
					<span>{{ item.sport }} </span>
					<country-flag
						class="countryFlag"
						:country-code="getCountryCode(item['country'])"
						height="1rem"
					/>
				</span>
			</div>

			<div class="organizationInfo__bottom">
				<div v-if="item['region']" class="organizationInfo__region">
					<country-flag
						class="countryFlag"
						is-region-flag="true"
						:country-code="getCountryCode(item.country)"
						:region-code="getRegionCode(item.region)"
						width="calc(8px + 1.2rem)"
						rounding="2px"
					/>
					{{ item['region'] }}
				</div>
			</div>
		</div>
	</router-link>
</template>

<script>
import CountryFlag from '@/components/ui-components/country-flag.vue'
import { getRegionCode } from '@/store/data/russia-regions'
import { getCountryCode } from '@/store/data/countries'
import LazyImage from '@/components/ui-components/LazyImage.vue'
import { getImageUrl } from '@/utils/url-helpers'
export default {
	name: 'OrganizationListItem',
	components: {
		CountryFlag,
		LazyImage
	},
	props: {
		item: {
			type: Object,
			required: true
		},
		index: {
			type: Number,
			required: true
		}
	},
	methods: {
		getCountryCode,
		getRegionCode,
		getImageUrl
	}
}
</script>

<style scoped lang="scss">
.organizationsList__item__wrapper {
	flex: 0 0 auto;
	display: grid;
	grid-template-areas:
		'image top'
		'image bottom';
	grid-template-columns: auto 1fr;
	grid-gap: 0.5rem 1rem;
	padding: 0.25rem 1.25rem 0.25rem 0.5rem;
	border-bottom: 1px solid var(--color-border-primary);
	cursor: pointer;

	&.isEven {
		background-color: var(--color-bg-tertiary);
	}

	&:hover {
		background-color: var(--color-bg-surface-hover);
	}

	.organizationImage__wrapper {
		position: relative;
		isolation: isolate;
		place-self: flex-start center;
		grid-area: image;
		align-self: start;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100px;
		aspect-ratio: 1;
		padding: 0.5rem;
	}

	.organizationInfo__top {
		grid-area: top;
		display: flex;
		align-items: center;
		flex-wrap: nowrap;
		gap: 1.25rem;
		font-size: 1.15rem;

		.organizationInfo__title {
			flex: 1 1 0;
			font-weight: bold;
		}

		.organizationInfo__sport {
			flex: 0 0 auto;
			display: flex;
			align-items: center;
			gap: 0.5rem;
		}
	}
	.organizationInfo__bottom {
		grid-area: bottom;
		display: flex;
		align-items: center;
		color: var(--color-text-secondary);

		.organizationInfo__region {
			display: flex;
			align-items: center;
			gap: 0.75rem;
		}
	}
}
</style>
