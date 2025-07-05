<template>
	<div class="personPhoto__wrapper">
		<div class="imageBorder bg-blur">
			<img
				v-if="person.photo_url"
				class="athleteInfo__image"
				:src="getImageUrl(person.photo_url)"
				alt="img"
				loading="lazy"
			/>
			<athlete-photo-filler-icon v-else class="athletePhotoFiller__icon" :gender="person.gender" />
		</div>

		<div
			v-if="person.regions && person.regions.length"
			class="personRegionFlags__wrapper"
			:style="
				person.regions.length > 1 && {
					transform: `translate(-${2 * person.regions.length}px, -${person.regions.length * 4}px)`
				}
			"
		>
			<country-flag
				v-for="(region, idx) in person.regions"
				:key="idx"
				class="personRegionFlag"
				is-region-flag="true"
				:country-code="getCountryCode(person.country)"
				:region-code="getRegionCode(region)"
				width="calc(8px + 1rem)"
				rounding="2px"
				:style="{
					zIndex: -idx,
					transform: `translate(${4 * idx}px, ${6 * idx}px)`
				}"
			/>
		</div>
		<div v-else-if="person.region" class="personRegionFlags__wrapper">
			<country-flag
				class="personRegionFlag"
				is-region-flag="true"
				:country-code="getCountryCode(person.country)"
				:region-code="getRegionCode(person.region)"
				width="calc(8px + 1rem)"
				rounding="2px"
			/>
		</div>
	</div>
</template>

<script>
import CountryFlag from '@/components/ui-components/country-flag.vue'
import AthletePhotoFillerIcon from '@/assets/svg/athletePhotoFiller-icon.vue'
import { getRegionCode } from '@/store/data/russia-regions'
import { getCountryCode } from '@/store/data/countries'
import { getImageUrl } from '@/utils/url-helpers'

export default {
	name: 'PersonPhoto',
	components: { AthletePhotoFillerIcon, CountryFlag },
	props: {
		person: { type: Object, required: true },
		height: { type: String },
		width: { type: String }
	},
	methods: { getCountryCode, getRegionCode, getImageUrl }
}
</script>

<style scoped lang="scss">
.personPhoto__wrapper {
	--photo-height: 100px;
	--photo-width: 100px;

	position: relative;
	isolation: isolate;
	height: var(--photo-height);
	width: var(--photo-width);
	padding: 0.5rem;

	.imageBorder {
		display: flex;
		justify-content: center;
		align-items: flex-end;
		overflow: hidden;
		height: 100%;
		width: 100%;
		border-radius: 50%;
		box-shadow: 0 0 0 2px var(--border-photo);
		background-color: var(--color-bg-image);

		.athleteInfo__image {
			flex: 1 1 0;
			max-height: 100%;
			max-width: 100%;
		}

		.athletePhotoFiller__icon {
			flex: 1 1 0;
		}
	}

	.personRegionFlags__wrapper {
		position: absolute;
		right: -4px;
		bottom: 8px;

		.personRegionFlag {
			position: absolute;
			right: 0;
			bottom: 0;
			box-shadow: 2px 2px 4px 0 rgba(0, 0, 0, 0.32);
		}
	}

	@media screen and (max-width: 1200px) {
		height: 88px;
		width: 88px;
	}
	@media screen and (max-width: 900px) {
		height: 80px;
		width: 80px;
	}
	@media screen and (max-width: 640px) {
		height: 72px;
		width: 72px;
	}
}
</style>
