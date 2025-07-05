<template>
	<select
		id="discipline"
		ref="selectInput"
		name="discipline"
		:class="['searchInput__control', !elemValue && 'empty']"
		@input="$emit('input', $event.target.value)"
	>
		<option :data-cancel-option="!!elemValue" value="">
			{{ elemValue ? 'Очистить' : 'Выбрать дисциплину...' }}
		</option>
		<option v-for="discipline in disciplinesList" :key="discipline" :value="discipline">
			{{ discipline }}
		</option>
	</select>
</template>

<script>
import { sports, getDisciplines } from '@/store/data/sports'

export default {
	name: 'DisciplineInput',
	computed: {
		disciplinesList() {
			const sportsList = sports.map(sportObj => sportObj.name_rus)

			const allDisciplines = new Set(
				sportsList.flatMap(sport =>
					getDisciplines(sport).map(disciplineObj => disciplineObj.name_rus)
				)
			)

			return Array.from(allDisciplines).sort((a, b) => a.localeCompare(b))
		},
		elemValue() {
			return this.$attrs.value
		}
	}
}
</script>
