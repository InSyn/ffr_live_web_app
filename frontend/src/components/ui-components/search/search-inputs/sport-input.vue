<template>
	<select
		id="sport"
		name="sport"
		class="searchInput__control"
		@input="$emit('input', $event.target.value)"
	>
		<option :value="sportsList[0]" selected>
			{{ sportsList[0] }}
		</option>
		<option :value="sportsList[0]">
			{{ sportsList[1] }}
		</option>
	</select>
</template>

<script>
import { sports } from '@/store/data/sports'

export default {
	name: 'SportInput',
	computed: {
		sportsList() {
			return sports.map(sport => sport.name_rus)
		}
	}
}
</script>
