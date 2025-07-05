<script>
import { getCountryCode } from '@/store/data/countries'
import { getSortedRegions } from '@/store/data/russia-regions'

export default {
	name: 'RegionSelectControl',
	props: {
		value: String,
		country: String
	},
	methods: {
		getSortedRegions,
		getCountryCode,
		onChange(event) {
			this.$emit('input', event.target.value)
		}
	}
}
</script>

<template>
	<div class="regionControl__wrapper">
		<input
			v-if="getCountryCode(country) !== 'RU'"
			class="control"
			name="region"
			:value="value"
			@change="onChange"
		/>
		<div v-else class="selectControl__wrapper">
			<select class="control" :value="value" @change="onChange">
				<option selected disabled value="">Выберите регион</option>
				<option v-for="region in getSortedRegions()" :key="region.code">
					{{ region.fullname }}
				</option>
			</select>
		</div>
	</div>
</template>

<style scoped lang="scss">
.regionControl__wrapper {
	flex: 1 1 0;
	display: flex;
	flex-direction: column;
	gap: 8px;

	.selectControl__wrapper {
		position: relative;
		display: flex;
		align-items: center;

		span {
			width: 4rem;
			margin-right: 8px;
		}
	}
}
.control {
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

	&[type='checkbox'] {
		flex: 0 0 auto;
	}

	&:focus-visible {
		background-color: var(--color-bg-surface-hover);
	}

	&[name='international'] {
		align-self: center;
		width: auto;
	}
}
</style>
