<template>
	<div v-if="countryCode" class="countryFlag__wrapper">
		<img
			v-show="getImage(countryCode, regionCode)"
			class="countryFlag__image"
			:src="getImage(countryCode, regionCode)"
			:alt="isRegionFlag ? countryCode + '_' + regionCode : countryCode"
			loading="lazy"
		/>
	</div>
</template>

<script>
export default {
	name: 'CountryFlag',
	props: ['countryCode', 'regionCode', 'isRegionFlag', 'width', 'height', 'rounding'],
	watch: {
		width: function (val, newVal) {
			if (val !== newVal) this.adjustWidth()
		}
	},

	mounted() {
		this.$nextTick(() => {
			this.adjustWidth()
		})
	},
	methods: {
		adjustWidth() {
			if (!this.$el.style) return
			this.$el.style.setProperty('--flag-width', this.width)
			this.$el.style.setProperty('--flag-height', this.height || 'auto')
			this.$el.style.setProperty('--flag-bRadius', this.rounding || '0')
		},
		getImage(countryCode, regionCode) {
			let imagePath

			try {
				imagePath = this.isRegionFlag
					? require(`@/assets/flags/region_ru/${countryCode.toUpperCase()}_${regionCode}.png`)
					: require(`@/assets/flags/world/${countryCode.toLowerCase()}.png`)
			} catch (err) {
				if (err) return
			}

			return imagePath
		}
	}
}
</script>

<style scoped>
.countryFlag__wrapper {
	--flag-width: 12px;
	--flag-height: auto;
	--flag-bRadius: 0;
	display: flex;
	align-items: center;
	justify-content: center;
}

.countryFlag__image {
	display: block;
	height: var(--flag-height);
	width: var(--flag-width);
	border-radius: var(--flag-bRadius);
}
</style>
