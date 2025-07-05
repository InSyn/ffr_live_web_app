<template>
	<div class="search-mobile-trigger">
		<button class="search-mobile-trigger__button" aria-label="Открыть поиск" @click="openSearch">
			<v-icon size="20" color="var(--color-text-primary)">
				{{ searchIcon }}
			</v-icon>
			<span class="trigger-text">Поиск</span>
		</button>
	</div>
</template>

<script>
import { mdiMagnify } from '@mdi/js'
import { mapActions } from 'vuex'

export default {
	name: 'SearchMobileTrigger',

	data() {
		return {
			searchIcon: mdiMagnify
		}
	},

	methods: {
		...mapActions('search', ['openMobileSearch']),
		openSearch() {
			this.openMobileSearch()
		}
	}
}
</script>

<style lang="scss" scoped>
.search-mobile-trigger {
	display: none; // Hidden by default

	// Show only on mobile screens
	@media screen and (max-width: 900px) {
		display: flex;
	}

	&__button {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-2) var(--space-3);
		background: transparent;
		border: 1px solid var(--border-color);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: var(--font-size-sm);
		white-space: nowrap;

		&:hover {
			background-color: var(--color-bg-surface-hover);
			border-color: var(--color-accent);
		}

		.trigger-text {
			font-size: var(--font-size-xs);
		}

		@media screen and (max-width: 480px) {
			.trigger-text {
				display: none; // Hide text on very small screens, only show icon
			}
		}
	}
}
</style>
