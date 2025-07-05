<script>
import Search from '@/components/ui-components/search/index.vue'
import MobileSearchTrigger from '@/components/ui-components/search/mobile-search-trigger.vue'
import SearchResults from '@/components/ui-components/search/search-results.vue'
import { mapActions, mapGetters } from 'vuex'

export default {
	name: 'JuryPage',
	components: {
		Search,
		MobileSearchTrigger,
		SearchResults
	},
	computed: {
		...mapGetters('search', ['searchResults', 'isSearching'])
	},
	methods: {
		...mapActions('search', ['setSearchMode', 'clearSearch', 'performSearch'])
	},
	created() {
		this.setSearchMode('jury')
		this.performSearch()
	},
	destroyed() {
		this.clearSearch()
	}
}
</script>

<template>
	<div class="page-wrapper content-wrapper">
		<aside class="page-sidebar">
			<search />
		</aside>
		<div class="page-content surface-card">
			<mobile-search-trigger />
			<search-results />
		</div>
	</div>
</template>

<style scoped lang="scss">
// ✅ ПРАВИЛЬНО: Используются только utility классы
// Никаких custom стилей с hardcoded values - все через design system
</style>
