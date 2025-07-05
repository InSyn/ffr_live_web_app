<script>
import { mapGetters } from 'vuex'

export default {
	name: 'CupStagesControl',
	props: {
		cupEvent: { type: Object, default: () => {} }
	},
	computed: {
		...mapGetters('events', {
			events: 'getEvents'
		})
	}
}
</script>

<template>
	<div class="cupStages__control__wrapper">
		stages list
		<div class="stagesList__wrapper">
			{{ cupEvent.sport }}
			{{ cupEvent.discipline }}
		</div>
	</div>
</template>

<style scoped lang="scss">
.cupStages__control__wrapper {
	flex: 1 1 0;
}
</style>
