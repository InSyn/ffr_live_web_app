<script>
import { countries } from '@/store/data/countries'

export default {
	name: 'CountrySelectControl',
	props: ['value'],
	computed: {
		countries() {
			return countries
		}
	},

	mounted() {
		this.$emit('input', this.countries[0].country_name)
	},
	methods: {
		onChange(event) {
			this.$emit('input', event.target.value)
		}
	}
}
</script>

<template>
	<select :value="value" class="countryControl" @change="onChange">
		<option v-for="country in countries" :key="country.country_code">
			{{ country.country_name }}
		</option>
	</select>
</template>

<style scoped lang="scss">
.countryControl {
	flex: 1 1 0;
	min-width: 0;
	width: 100%;
	max-width: 32ch;
	padding: 3px 6px;
	color: var(--color-text-primary);
	background-color: var(--color-bg-surface-secondary);
	border-radius: 2px;
	outline: transparent;
	transition: background-color var(--transition-duration-fast);
}
</style>
