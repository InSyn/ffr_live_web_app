<template>
	<div class="juryCompetitions__list__wrapper">
		<div class="juryCompetitions__list">
			<router-link
				v-for="(event, idx) in events"
				:key="event._id"
				:class="['juryCompetitions__list__item', idx % 2 === 0 && 'even']"
				:to="{ name: 'eventPage', params: { event_id: event.event_id } }"
			>
				<jury-competition-list-item :event="event" :item="event" :jury_code="jury_code" />
			</router-link>
		</div>
	</div>
</template>

<script>
import axios from 'axios'
import { apiUrl } from '@/constants'
import { formatDate } from '@/utils/data-formaters'
import JuryCompetitionListItem from '@/pages/jury/jury-page/jury-competition-list-item.vue'

export default {
	name: 'JuryCompetitionsList',
	components: { JuryCompetitionListItem },
	props: {
		jury_code: String
	},
	data() {
		return {
			events: []
		}
	},

	mounted() {
		this.getJuryCompetitions()
	},
	methods: {
		formatDate,
		async getJuryCompetitions() {
			try {
				const response = await axios.get(apiUrl + `/jury/${this.jury_code}/competitions`)
				if (response.status === 200) {
					this.events = response.data.events
				}
			} catch (e) {
				if (e) {
					console.log(e?.response?.data?.message)
				}
			}
		}
	}
}
</script>

<style scoped lang="scss">
.juryCompetitions__list__wrapper {
	flex: 1 1 0;
	display: flex;
	flex-direction: column;
	overflow-y: auto;

	.juryCompetitions__list {
		display: flex;
		flex-direction: column;

		.juryCompetitions__list__item {
			flex: 0 0 auto;
			display: flex;
			flex-direction: column;
			padding: 0.75rem 1.25rem;

			&.even {
				background-color: var(--color-bg-surface-secondary);
			}

			&:hover {
				background-color: var(--color-bg-surface-hover);
			}

			.juryCompetitions__list__item__header {
				flex: 0 0 auto;
				display: flex;
				align-items: center;
				margin-bottom: 0.5rem;
			}

			.juryCompetitions__list__item__footer {
				flex: 0 0 auto;
				display: flex;
				align-items: center;
				gap: 2rem;
			}
		}
	}
}
</style>
