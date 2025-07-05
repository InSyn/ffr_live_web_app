<script>
import axios from 'axios'
import { apiUrl } from '@/constants'
import CompetitionListItem from '@/pages/events/competition-list-item.vue'

export default {
	name: 'RegistrationListPage',
	components: { CompetitionListItem },
	data() {
		return {
			events: []
		}
	},

	mounted() {
		this.loadEventsWithRegistration()
	},
	methods: {
		async loadEventsWithRegistration() {
			try {
				const response = await axios.get(apiUrl + '/events/opened-registration')
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

<template>
	<div class="registrationsList__wrapper">
		<div class="registrationsList__header">Заявки на регистрацию</div>

		<div class="registrationList__wrapper surface-card">
			<loader-spinner v-if="loading" />
			<div v-else-if="!loading && events.length > 0">
				<div class="registrationList__title">Список событий с открытой регистрацией</div>
				<div class="registrationList__list">
					<router-link
						v-for="(event, idx) in events"
						:key="event._id"
						:class="['registrationList__list__item', idx % 2 === 0 && 'even']"
						:to="{ name: 'eventOnlineRegistration', params: { event_id: event.event_id } }"
					>
						<competition-list-item :event="event" />
					</router-link>
				</div>
			</div>
			<div v-else>Нет событий с открытой регистрацией</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
.registrationsList__wrapper {
	padding: var(--padd-page);

	.registrationsList__header {
		font-size: 1.5rem;
		margin-bottom: 1rem;
		max-width: var(--desktop-small);
		margin: 0 auto 1rem;
	}

	.registrationList__wrapper {
		display: flex;
		flex-direction: column;
		flex: 1 1 0;

		max-width: var(--desktop-small);
		width: 100%;
		margin: 0 auto;

		.registrationList__title {
			flex: 0 0 auto;
			padding: 0.75rem 2.5rem;
			font-size: 1.2rem;
			font-weight: bold;
			border-bottom: 1px solid var(--color-border-primary);
		}
		.registrationList__list {
			flex: 1 1 300px;
			display: flex;
			flex-direction: column;
			overflow-y: auto;

			.registrationList__list__item {
				flex: 0 0 auto;
			}
		}
	}
}
</style>
