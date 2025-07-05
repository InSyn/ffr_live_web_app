<script>
import axios from 'axios'
import { apiUrl } from '@/constants'

export default {
	name: 'CompetitionSelectControl',
	data() {
		return {
			competitions: [],

			is_loading: false
		}
	},
	mounted() {
		this.loadCompetitionList()
	},
	methods: {
		async loadCompetitionList() {
			this.is_loading = true

			try {
				const response = await axios.get(`${apiUrl}/events/`)
				if (response.status === 200) {
					this.competitions = response.data.events
				}
			} catch (e) {
				console.error('Error fetching events:', e.response?.data?.message || e.message)
			} finally {
				this.is_loading = false
			}
		}
	}
}
</script>

<template>
	<div class="competitionSelect__wrapper">
		<div class="competitions__list">
			<div v-if="is_loading" class="loadingFiller">События загружаются...</div>
			<template v-else>
				<div
					v-for="competition in competitions"
					:key="competition.id"
					class="competitions__list__item"
				>
					{{ competition.title }}
				</div>
			</template>
		</div>
	</div>
</template>

<style scoped lang="scss">
.competitionSelect__wrapper {
	flex: 1 1 12rem;
	display: flex;
	flex-direction: column;

	.competitions__list {
		flex: 1 1 0;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		border-radius: 4px;
		background-color: var(--color-bg-surface-secondary);

		.competitions__list__item {
			flex: 0 0 auto;
			padding: 4px 8px;
			cursor: pointer;

			&:nth-child(even) {
				background-color: var(--color-bg-primary-hovered);
			}
			&:hover {
				background-color: var(--color-bg-surface-hover);
			}
		}
	}
}

.loadingFiller {
	padding: 8px;
	margin: 0 auto;
}
</style>
