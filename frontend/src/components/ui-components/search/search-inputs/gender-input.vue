<template>
	<select
		id="gender"
		name="gender"
		:class="['searchInput__control', !elemValue && 'empty']"
		@input="$emit('input', $event.target.value)"
	>
		<option :data-cancel-option="!!elemValue" value="">
			{{ elemValue ? 'Очистить' : 'Выбрать пол...' }}
		</option>
		<option v-for="gender in gendersList" :key="gender" :value="gender">
			{{ gender }}
		</option>
	</select>
</template>

<script>
export default {
	name: 'GenderInput',
	computed: {
		gendersList() {
			return ['М', 'Ж']
		},
		elemValue() {
			return this.$attrs.value
		}
	}
}
</script>
