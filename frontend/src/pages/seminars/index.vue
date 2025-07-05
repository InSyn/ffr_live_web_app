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

<script>
import Search from '@/components/ui-components/search/index.vue'
import MobileSearchTrigger from '@/components/ui-components/search/mobile-search-trigger.vue'
import SearchResults from '@/components/ui-components/search/search-results.vue'
import { mapActions, mapGetters } from 'vuex'

export default {
	name: 'SeminarsPage',
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
		this.setSearchMode('seminars')
		this.performSearch()
	},
	destroyed() {
		this.clearSearch()
	}
}
</script>

<style scoped lang="scss">
.seminarsPage__wrapper {
	display: flex;
	padding: var(--padd-page);

	.seminarsList__wrapper {
		flex: 1 1 0;
		display: flex;
		flex-direction: column;
		max-height: 100%;
		overflow-y: auto;

		.seminarsList {
			flex: 0 0 auto;
			display: flex;
			flex-direction: column;
			overflow-y: auto;
		}

		.emptySearchResults {
			padding: 2rem;
			text-align: center;
			color: var(--color-text-secondary);
		}

		.loading__spinner {
			align-self: center;
			margin: 2rem;
		}
	}
}
</style>
