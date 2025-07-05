<template>
	<select
		id="season"
		name="season"
		:class="['searchInput__control', !elemValue && 'empty']"
		@input="$emit('input', $event.target.value)"
	>
		<option :data-cancel-option="!!elemValue" value="">
			{{ elemValue ? 'Очистить' : 'Выбрать сезон...' }}
		</option>
		<option v-for="season in seasonsList" :key="season" :value="season">
			{{ season }}
		</option>
	</select>
</template>

<script>
export default {
	name: 'SeasonInput',
	computed: {
		seasonsList() {
			const currentYear = new Date().getFullYear()
			const seasonsList = []
			for (let i = 2020; i <= currentYear; i++) {
				seasonsList.push(i + '-' + (i + 1))
			}

			return seasonsList.reverse()
		},
		elemValue() {
			return this.$attrs.value
		}
	}
}
</script>
