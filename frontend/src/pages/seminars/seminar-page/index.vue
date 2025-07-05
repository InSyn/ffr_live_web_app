<template>
	<div v-if="seminar" class="seminarPage__wrapper">
		<div class="seminarCard__wrapper">
			<div class="seminarPage__header">
				<div class="seminar__title__wrapper">
					<div class="seminar__title">
						{{ seminar.title }}
						<edit-button type="seminar" :code="seminar._id" />
					</div>
					<div class="seminar__title__disciplines">
						{{ getSeminarDisciplines() }}
					</div>
				</div>
				<div class="seminar__sport">
					{{ seminar.sport }}
					<country-flag
						class="countryFlag"
						:country-code="getCountryCode(seminar['country'])"
						height="1rem"
					/>
				</div>
			</div>
			<div class="seminarPage__body">
				<div class="seminarData__wrapper">
					<div v-if="seminar.region" class="seminar__region">
						<country-flag
							is-region-flag="true"
							country-code="RU"
							:region-code="getRegionCode(seminar.region)"
							width="calc(8px + 1rem)"
						/>
						&nbsp;
						{{ [seminar.region, seminar.location].join(', ') }}
					</div>
					<div v-if="seminar.date" class="seminar__date">
						{{ formatDate(seminar.date) }}
					</div>
					<div v-if="seminar.format" class="seminar__format">
						{{ `Формат: ${seminar.format}` }}
					</div>
				</div>
				<div v-if="seminar.participants.length" class="participants__wrapper">
					<div class="participants__title">Участники</div>
					<div class="seminarParticipant__list">
						<div
							v-for="(participant, idx) in seminar.participants"
							:key="idx"
							class="seminarParticipant__item"
						>
							{{ `${participant.fullname}${participant.role ? ' - ' + participant.role : ''}` }}
						</div>
					</div>
				</div>
				<div class="seminarFiles__wrapper">
					<div class="seminarFiles__title">Документы:</div>
					<div v-for="(document, idx) in seminar.documents" :key="idx" class="seminarFile__item">
						<a
							v-if="document?.file?.url"
							:href="getImageUrl(document.file.url)"
							target="_blank"
							class="seminarFile__item__link"
						>
							<file-icon class="seminarFile__item__icon" />
							{{ document.title }}
						</a>
					</div>
				</div>
				<div class="seminarContacts__wrapper">
					<div class="seminarContacts__title">Контакты:</div>
					<div v-for="(contact, idx) in seminar.contacts" :key="idx" class="seminarContact__item">
						{{ contact }}
					</div>
				</div>
			</div>
			<div v-if="isSecretary" class="seminarPage__actions">
				<v-btn color="var(--color-text-accent)" small text @click="openParticipantsControl">
					Добавить участников
				</v-btn>
			</div>
		</div>

		<seminar-participants-control
			v-if="showParticipantsControl"
			:seminar="seminar"
			@close-participants-control="showParticipantsControl = false"
		/>
	</div>
</template>

<script>
import axios from 'axios'
import { apiUrl } from '@/constants'
import CountryFlag from '@/components/ui-components/country-flag.vue'
import { getCountryCode } from '@/store/data/countries'
import FileIcon from '@/components/icons/file-icon.vue'
import { formatDate } from '@/utils/data-formaters'
import { getDisciplineCode } from '@/store/data/sports'
import EditButton from '@/components/ui-components/edit-button.vue'
import { mapGetters } from 'vuex'
import SeminarParticipantsControl from '@/pages/seminars/seminarParticipants-control/index.vue'
import { getRegionCode } from '@/store/data/russia-regions'
import { getImageUrl } from '@/utils/url-helpers'

export default {
	name: 'Index',
	components: { SeminarParticipantsControl, EditButton, FileIcon, CountryFlag },
	props: ['seminar_id'],
	data() {
		return {
			seminar: null,
			loading: true,

			showParticipantsControl: false
		}
	},
	computed: {
		...mapGetters('authorization', {
			isSecretary: 'isSecretary'
		})
	},

	mounted() {
		if (this.$route.params.seminar_id) {
			try {
				this.loading = true
				this.getSeminarById(this.$route.params.seminar_id)
			} catch (e) {
				this.loading = false
				throw new Error(e)
			}
		}
	},
	methods: {
		getRegionCode,
		getDisciplineCode,
		formatDate,
		getCountryCode,
		getImageUrl,
		async getSeminarById(id) {
			try {
				const data = await axios.get(`${apiUrl}/seminars/${id}`)
				if (data.status === 200) {
					const seminarData = data.data.seminar
					if (seminarData) this.seminar = { ...seminarData }
				}
			} catch (err) {
				if (err) {
					console.error(err)
				}
			} finally {
				this.loading = false
			}
		},
		getSeminarDisciplines() {
			if (!this.seminar.disciplines.length) return ''

			return this.seminar.disciplines.join(', ')
		},

		openParticipantsControl() {
			this.showParticipantsControl = true
		}
	}
}
</script>

<style scoped lang="scss">
.seminarPage__wrapper {
	display: flex;
	flex-direction: column;
	max-width: var(--desktop-small);
	width: 100%;
	margin: 0 auto;
	padding: var(--padd-page);

	.seminarCard__wrapper {
		flex: 0 0 auto;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		margin: 2rem;
		padding: 1.25rem 1.75rem;

		background-color: var(--color-bg-surface);
		border: 1px solid var(--color-border-primary);
		box-shadow: var(--surface-shadow-m);
		border-radius: 4px;

		.seminarPage__header {
			flex: 0 0 auto;
			display: flex;
			align-items: flex-start;

			.seminar__title__wrapper {
				display: flex;
				flex-direction: column;
				font-size: 1.4rem;
				font-weight: 500;

				.seminar__title {
					display: flex;
					align-items: center;
				}

				.seminar__title__disciplines {
					margin-top: 0.5rem;
					font-size: 1.2rem;
				}
			}

			.seminar__sport {
				display: flex;
				align-items: center;
				margin-left: auto;
				font-size: 1.4rem;

				.countryFlag {
					margin-left: 1rem;
				}
			}
		}

		.seminarPage__body {
			flex: 0 0 auto;
			display: flex;
			flex-wrap: wrap;
			gap: 0.75rem 1.25rem;

			.seminarData__wrapper {
				flex: 1 1 100%;
				display: flex;
				flex-wrap: wrap;
				align-items: center;
				gap: 0.75rem 1.25rem;
				margin-bottom: 2rem;

				.seminar__region {
					flex: 0 0 auto;
					display: flex;
					align-items: center;
					flex-wrap: wrap;
				}

				.seminar__format {
					margin-left: auto;
					font-size: 1rem;
					color: var(--color-text-secondary);
					text-align: end;
				}
			}

			.participants__wrapper {
				flex: 1 1 100%;
				display: flex;
				flex-direction: column;
				margin-bottom: 2rem;
				padding: 0 1rem;

				.participants__title {
					flex: 0 0 auto;
					margin-bottom: 0.5rem;
				}

				.seminarParticipant__list {
					flex: 0 0 auto;
					display: flex;
					flex-direction: column;
					gap: 2px;
				}
			}

			.seminarFiles__wrapper {
				flex: 0 0 auto;
				display: flex;
				flex-direction: column;
				gap: 4px;

				.seminarFiles__title {
					margin-left: 1.25rem;
				}

				.seminarFile__item {
					flex: 0 0 auto;

					.seminarFile__item__link {
						display: flex;
						align-items: center;
						color: var(--color-text-secondary);
						font-size: 1.1rem;

						.seminarFile__item__icon {
							color: var(--color-interactive-brand-default);
							height: 1.1rem;
							margin-right: 0.25rem;
						}
						&:hover {
							text-decoration: underline;
							.seminarFile__item__icon {
								opacity: 0.75;
							}
						}
					}
				}
			}

			.seminarContacts__wrapper {
				flex: 0 0 auto;
				display: flex;
				flex-direction: column;
				align-items: flex-end;
				gap: 4px;
				margin-left: auto;

				.seminarContact__item {
					color: var(--color-text-secondary);
				}
			}
		}

		.seminarPage__actions {
			flex: 0 0 auto;
			display: flex;
			justify-content: flex-end;
			margin-top: 1rem;
		}
	}

	@media screen and (max-width: 640px) {
		flex: 1 1 0;
		margin: 0;

		.seminarCard__wrapper {
			display: flex;
			flex-direction: column;
			overflow-y: auto;
			gap: 1.5rem;
			margin: 0;
			padding: 4rem 2rem;
			border-radius: 0;

			.seminarPage__header {
				margin-bottom: auto;

				.seminar__title__wrapper {
					font-size: 1.75rem;
				}

				.seminar__sport {
					font-size: 1.75rem;
				}
			}

			.seminarPage__body {
				flex: 1 1 0;
				gap: 1.2rem;
			}
		}
	}
}
</style>
