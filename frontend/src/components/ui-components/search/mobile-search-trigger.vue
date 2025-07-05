<template>
	<div class="mobile-search-trigger__wrapper d-flex d-md-none">
		<v-btn block x-large outlined color="primary" @click="openMobileSearch">
			<v-icon left> mdi-magnify </v-icon>
			Поиск
		</v-btn>
	</div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
	name: 'MobileSearchTrigger',
	methods: {
		...mapActions('search', ['openMobileSearch'])
	}
}
</script>

<style scoped lang="scss">
.mobile-search-trigger__wrapper {
	padding: var(--space-4);
	background-color: var(--background-default);
	border-bottom: 1px solid var(--border-color);
}
</style>
