<template>
	<div class="jurySeminars__list__wrapper">
		<div class="jurySeminars__list">
			<router-link
				v-for="(seminar, idx) in seminars"
				:key="seminar._id"
				:class="['jurySeminars__list__item', idx % 2 === 0 && 'even']"
				:to="{ name: 'seminarPage', params: { seminar_id: seminar._id } }"
			>
				<div class="jurySeminars__list__item__header">
					<div class="seminarTitle">
						{{ seminar.title }}
					</div>
					<div class="seminarSport">
						{{ seminar.sport }}
						<country-flag height="1.1rem" :country-code="getCountryCode(seminar.country)" />
					</div>
				</div>
				<div class="jurySeminars__list__item__footer">
					<div class="seminarRegion">
						{{ seminar.region }}
					</div>
					<div class="seminarDate">
						{{ formatDate(seminar.date) }}
					</div>
					<div v-if="seminar.disciplines.length" class="seminarDisciplines">
						{{ seminar.disciplines.join(', ') }}
					</div>
				</div>
			</router-link>
		</div>
	</div>
</template>

<script>
import axios from 'axios'
import { apiUrl } from '@/constants'
import { formatDate } from '@/utils/data-formaters'
import CountryFlag from '@/components/ui-components/country-flag.vue'
import { getCountryCode } from '@/store/data/countries'

export default {
	name: 'JurySeminarsList',
	components: { CountryFlag },
	props: {
		jury_code: String
	},
	data() {
		return {
			seminars: []
		}
	},

	mounted() {
		this.getJurySeminars()
	},
	methods: {
		getCountryCode,
		formatDate,
		async getJurySeminars() {
			try {
				const response = await axios.get(apiUrl + `/jury/${this.jury_code}/seminars`)
				if (response.status === 200) {
					this.seminars = response.data.seminars
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
.jurySeminars__list__wrapper {
	flex: 1 1 0;
	display: flex;
	flex-direction: column;
	overflow-y: auto;

	.jurySeminars__list {
		display: flex;
		flex-direction: column;

		.jurySeminars__list__item {
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

			.jurySeminars__list__item__header {
				flex: 0 0 auto;
				display: flex;
				align-items: center;
				margin-bottom: 0.5rem;
				font-size: 1.1rem;

				.seminarTitle {
					flex: 1 1 0;
					font-weight: bold;
				}

				.seminarSport {
					flex: 0 0 auto;
					display: flex;
					align-items: center;
					gap: 1rem;
					margin-left: 1rem;
				}
			}

			.jurySeminars__list__item__footer {
				flex: 0 0 auto;
				display: flex;
				align-items: center;
				gap: 2rem;

				.seminarRegion {
					color: var(--color-text-secondary);
				}

				.seminarDate {
					color: var(--color-text-secondary);
				}

				.seminarDisciplines {
					margin-left: auto;
				}
			}
		}
	}
}
</style>
