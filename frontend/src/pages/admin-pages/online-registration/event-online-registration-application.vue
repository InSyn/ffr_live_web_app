<script>
import { mapActions, mapGetters } from 'vuex'
import { apiUrl } from '@/constants'
import { formatDate } from '@/utils/data-formaters'
import CountryFlag from '@/components/ui-components/country-flag.vue'
import { getRegionCode } from '@/store/data/russia-regions'
import { getCountryCode } from '@/store/data/countries'
import axios from 'axios'
import DocumentsSelectControl from '@/components/ui-components/custom-controls/documents-select-control.vue'
import MessageContainer from '@/components/ui-components/message-container.vue'
import LoaderSpinner from '@/components/ui-components/loader-spinner.vue'
import { addDocumentsToFormData } from '@/utils/formData-helpers'
import { getImageUrl } from '@/utils/url-helpers'

export default {
	name: 'Index',
	components: { LoaderSpinner, MessageContainer, DocumentsSelectControl, CountryFlag },
	props: {
		event_id: { type: String, required: true },
		application_id: { type: String, default: null }
	},
	computed: {
		...mapGetters('authorization', {
			userData: 'getUserData'
		}),
		getAvailableAthletes() {
			const { role, ffr_id, region } = this.userData

			let associatedAthletes = []
			if (role === 'regional_organization') {
				associatedAthletes = this.dbAthletes.filter(athlete => {
					return athlete.regions.includes(region)
				})
			}
			if (role === 'trainer') {
				associatedAthletes = this.dbAthletes.filter(athlete => {
					return athlete?.trainer?.trainer_id === ffr_id
				})
			}

			return associatedAthletes.filter(athlete => {
				return !this.registeredAthletes.some(
					registeredAthlete => registeredAthlete.athlete._id === athlete._id
				)
			})
		}
	},
	data() {
		return {
			event: null,

			dbAthletes: [],

			editAthlete: null,
			registeredAthletes: [],

			registrationDocuments: [],

			messages: [],
			errors: [],

			loading: false,
			isSubmitting: false
		}
	},
	methods: {
		getImageUrl,
		getCountryCode,
		getRegionCode,
		formatDate,
		...mapActions('events', {
			loadEvent: 'LOAD_EVENT_BY_ID'
		}),
		async loadEventData() {
			this.loading = true
			try {
				const eventData = await this.loadEvent(this.event_id)
				if (eventData) {
					this.event = eventData
				}
				if (this.application_id) await this.loadApplicationData()

				await this.getDBAthletes()
			} catch (e) {
				console.error(e)
			} finally {
				this.loading = false
			}
		},
		async loadApplicationData() {
			try {
				const response = await axios.get(
					`${apiUrl}/event-online-registration/registered-applications/${this.application_id}`,
					{
						headers: {
							authorization: `Bearer ${this.userData.token}`
						}
					}
				)
				if (response.status === 200) {
					const { athletes, documents } = response.data.registration

					this.registeredAthletes = athletes
					this.registrationDocuments = documents
				}
			} catch (e) {
				console.error(e?.response?.data?.message)
			}
		},
		async getDBAthletes() {
			try {
				const response = await axios.get(`${apiUrl}/athletes`)

				if (response.status === 200) {
					this.dbAthletes = response.data.athletes
				}
			} catch (err) {
				if (err) {
					console.error(err)
				}
			}
		},
		getAthletesByGroup(group) {
			return this.registeredAthletes.filter(registeredAthlete => registeredAthlete.group === group)
		},
		selectAthleteToAdd(athlete) {
			if (this.editAthlete === athlete) {
				this.editAthlete = null
				return
			}
			this.editAthlete = athlete
		},
		addAthleteToGroup(athlete, group) {
			this.registeredAthletes.push({ athlete, group })
		},
		removeAthleteFromGroup(athlete) {
			this.registeredAthletes = this.registeredAthletes.filter(
				registeredAthlete => registeredAthlete.athlete._id !== athlete.athlete._id
			)
		},

		updateDocuments(documents) {
			this.registrationDocuments = [...documents]
		},

		async submitRegistration() {
			this.isSubmitting = true

			const registeredAthletes = this.registeredAthletes.map(athlete => {
				return { athlete: athlete.athlete._id, group: athlete.group }
			})

			const registrationData = {
				event_id: this.event._id,
				creator_role: this.userData.role,
				creator_username: this.userData.username,
				athletes: registeredAthletes,
				athletes_groups: this.event.athletes_groups
			}

			const formData = new FormData()
			formData.append('registration_data', JSON.stringify(registrationData))

			addDocumentsToFormData(formData, this.registrationDocuments)

			try {
				const response = await axios.post(`${apiUrl}/event-online-registration`, formData, {
					headers: {
						'Content-Type': 'application/json',
						authorization: `Bearer ${this.userData.token}`
					}
				})

				if (response.status === 200) {
					this.messages.push('Регистрация заявки прошла успешно')
				}
			} catch (e) {
				console.error(e?.response?.data?.message)
				this.errors.push(`Ошибка регистрации заявки: ${e?.response?.data?.message}`)
			} finally {
				setTimeout(() => {
					if (this.$route.name === 'eventOnlineRegistrationApplication') {
						this.$router.push({ name: 'userPage' })
					}
				}, 1280)
			}
		},
		async updateRegistration() {
			const registeredAthletes = this.registeredAthletes.map(athlete => {
				return { athlete: athlete.athlete._id, group: athlete.group }
			})

			const registrationData = {
				athletes: registeredAthletes
			}

			const formData = new FormData()
			formData.append('registration_data', JSON.stringify(registrationData))

			addDocumentsToFormData(formData, this.registrationDocuments)

			try {
				const response = await axios.put(
					`${apiUrl}/event-online-registration/registered-applications/${this.application_id}`,
					formData,
					{
						headers: {
							'Content-Type': 'application/json',
							authorization: `Bearer ${this.userData.token}`
						}
					}
				)

				if (response.status === 200) {
					this.messages.push('Данные заявки были успешно обновлены')
				}
			} catch (e) {
				console.error(e)
				this.errors.push(`Ошибка обновления заявки: ${e?.response?.data?.message}`)
			} finally {
				setTimeout(() => {
					if (this.$route.name === 'eventOnlineRegistrationApplication') {
						this.$router.push({ name: 'userPage' })
					}
				}, 1280)
			}
		},
		async deleteRegistration() {
			if (!confirm('Удалить заявку?')) return

			try {
				const response = await axios.delete(
					`${apiUrl}/event-online-registration/registered-applications/${this.application_id}`,
					{
						headers: {
							authorization: `Bearer ${this.userData.token}`
						}
					}
				)

				if (response.status === 200) {
					this.messages.push('Заявка была успешно удалена')
				}
			} catch (e) {
				console.error(e)
				this.errors.push(`Ошибка удаления заявки: ${e?.response?.data?.message}`)
			} finally {
				setTimeout(() => {
					if (this.$route.name === 'eventOnlineRegistrationApplication') {
						this.$router.push({ name: 'userPage' })
					}
				}, 1280)
			}
		}
	},

	mounted() {
		this.loadEventData()
	}
}
</script>

<template>
	<div class="eventOnlineRegistration__page">
		<div v-if="event" class="eventOnlineRegistration__wrapper">
			<h3 class="eventOnlineRegistration__title">
				Онлайн заявка <span v-if="userData.region"> {{ userData.region }}</span>
			</h3>
			<div class="eventOnlineRegistration__body">
				<div class="eventData__wrapper">
					<div class="eventImage__wrapper">
						<img :src="getImageUrl(event.logo_image_url)" alt="EVENT_IMG" height="80px" />
					</div>
					<div class="eventInfo__wrapper">
						<div class="eventInfo__top">
							<div class="eventInfo__title">
								{{ event.title }}
							</div>
							<div class="eventInfo__sport">
								<country-flag
									:country-code="getCountryCode(event.country)"
									:region-code="getRegionCode(event.region)"
									height="1rem"
									rounding="2px"
								/>
								{{ event.sport }}
							</div>
						</div>
						<div class="eventInfo__middle">
							<div class="eventInfo__discipline">
								{{ event.discipline }}
							</div>
							<div class="eventInfo__code">
								{{ event.calendar_code }}
							</div>
						</div>
						<div class="eventInfo__bottom">
							<div class="eventInfo__region">
								{{ [event.region, event.location].join(', ') }}
							</div>
							<div class="eventInfo__date">
								{{ formatDate(event.start_at) }}
							</div>
						</div>
					</div>
				</div>
				<div class="registrationAthletes__wrapper">
					<div class="registrationAthletes__groups__wrapper">
						<div class="registrationAthletes__groups__title">Группы</div>
						<div class="registrationAthletes__groups__body">
							<div class="registrationAthletes__groups__list">
								<div
									v-for="group in event.athletes_groups"
									:key="group"
									class="registrationAthletes__groups__list__item"
								>
									<div class="athletesGroup__title">Группа:&nbsp;{{ group }}</div>
									<div class="athletesGroup__athletes">
										<div
											v-for="athlete in getAthletesByGroup(group)"
											:key="athlete.athlete._id"
											class="athletesGroup__athletes__item"
											@click="removeAthleteFromGroup(athlete, group)"
										>
											<span>{{ `${athlete.athlete.lastname} ${athlete.athlete.name}` }}</span>
											<span>{{ `${athlete.athlete.ffr_id}` }}</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="registrationAthletes__availableAthletes__wrapper">
						<div class="registrationAthletes__availableAthletes__title">Спортсмены</div>
						<div class="registrationAthletes__availableAthletes__body">
							<div class="registrationAthletes__availableAthletes__list">
								<div
									v-for="athlete in getAvailableAthletes"
									:key="athlete._id"
									:class="[
										'registrationAthletes__availableAthletes__list__item',
										athlete._id === editAthlete && 'edit'
									]"
									@click="selectAthleteToAdd(athlete._id)"
								>
									<div class="registrationAthletes__availableAthletes__list__item__data">
										{{ athlete.ffr_id + ' - ' + athlete.lastname + ' ' + athlete.name }}
									</div>
									<div class="editingAthlete__groups">
										<span
											v-for="group in event.athletes_groups"
											:key="group"
											@click.stop="addAthleteToGroup(athlete, group)"
											>{{ group }}</span
										>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="attachedDocuments__wrapper">
					<div class="attachedDocuments__title">Документы</div>
					<div class="attachedDocuments__body">
						<documents-select-control
							class="attachedDocuments__control"
							:initial-documents="registrationDocuments"
							:horizontal="true"
							@update:documents="updateDocuments"
						/>
					</div>
				</div>
				<div class="registrationApplicationStats__wrapper">
					<div class="registrationApplicationStats__item">
						Заявлено спортсменов: {{ registeredAthletes.length }}
					</div>
					<div class="registrationApplicationStats__item">
						Прикреплено документов: {{ registrationDocuments.length }}
					</div>
				</div>
				<div class="eventOnlineRegistration__actions">
					<button
						v-if="!application_id"
						type="button"
						class="actionButton"
						:disabled="isSubmitting"
						@click.prevent="submitRegistration"
					>
						{{ isSubmitting ? 'Отправка...' : 'Подать заявку' }}
					</button>
					<button v-else type="button" class="actionButton" @click.prevent="updateRegistration">
						Сохранить изменения
					</button>
					<button
						v-if="application_id"
						type="button"
						class="actionButton action-delete"
						@click.prevent="deleteRegistration"
					>
						{{ 'Удалить' }}
					</button>
				</div>
			</div>
		</div>
		<loader-spinner v-else-if="loading" />
		<message-container :messages="messages" :errors="errors" />
	</div>
</template>

<style lang="scss" scoped>
.eventOnlineRegistration__page {
	flex: 1 1 0;
	display: flex;
	flex-direction: column;
	overflow-y: auto;
	padding: var(--padd-page);

	.eventOnlineRegistration__wrapper {
		flex: 1 1 300px;
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: var(--tablet-default);
		margin: 2rem auto;
		padding: var(--padd-entityPage-card);

		background-color: var(--color-bg-surface);
		box-shadow: var(--surface-shadow-m);
		border: 1px solid var(--color-border-primary);
		border-radius: 4px;

		.eventOnlineRegistration__title {
			flex: 0 0 auto;

			span {
				display: inline-block;
				margin-left: auto;
			}
		}
		.eventOnlineRegistration__body {
			flex: 1 1 0;
			display: flex;
			flex-direction: column;
			padding: 0.25rem;
			border-top: 1px solid var(--color-border-primary);

			.eventData__wrapper {
				flex: 0 0 auto;
				display: flex;
				flex-wrap: nowrap;
				gap: 0 1.25rem;
				margin-bottom: 1.25rem;
				padding: 0.75rem 0.25rem;

				.eventImage__wrapper {
					display: flex;
					align-items: flex-start;
					justify-content: center;
					padding: 4px;
					height: 80px;

					img {
						display: block;
						max-height: 100%;
						max-width: 100%;
					}
				}

				.eventInfo__wrapper {
					flex: 1 1 200px;
					display: flex;
					flex-direction: column;
					gap: 0.5rem;

					.eventInfo__top {
						flex: 0 0 auto;
						display: flex;
						gap: 1.25rem;
						flex-wrap: nowrap;
						font-weight: bold;

						.eventInfo__title {
							flex: 1 1 0;
						}
						.eventInfo__sport {
							flex: 0 0 auto;
							display: flex;
							flex-wrap: nowrap;
							gap: 0.5rem;
						}
					}
					.eventInfo__middle {
						display: flex;

						.eventInfo__discipline {
							flex: 1 0 0;
						}
						.eventInfo__code {
							flex: 0 0 auto;
						}
					}

					.eventInfo__bottom {
						display: flex;

						.eventInfo__region {
							flex: 1 0 0;
						}
						.eventInfo__date {
							flex: 0 0 auto;
						}
					}
				}
			}

			.registrationAthletes__wrapper {
				flex: 1 1 200px;
				display: flex;
				flex-wrap: wrap;
				gap: 1.25rem 0.75rem;
				padding: 0.5rem;

				.registrationAthletes__groups__wrapper {
					flex: 1 1 150px;
					display: flex;
					flex-direction: column;

					.registrationAthletes__groups__title {
						flex: 0 0 auto;
						margin: 0 0.75rem 0.5rem;
					}
					.registrationAthletes__groups__body {
						flex: 1 1 0;
						overflow-y: auto;
						padding: 0.5rem;

						.registrationAthletes__groups__list {
							display: flex;
							flex-direction: column;
							gap: 1.25rem;

							.registrationAthletes__groups__list__item {
								flex: 0 0 auto;
								display: flex;
								flex-direction: column;

								.athletesGroup__title {
									flex: 0 0 auto;
								}
								.athletesGroup__athletes {
									flex: 0 0 auto;
									display: flex;
									flex-direction: column;
									overflow-y: auto;

									.athletesGroup__athletes__item {
										flex: 0 0 auto;
										display: flex;
										align-items: center;
										padding: 0.5rem;
										font-size: 0.8rem;
										cursor: pointer;
										transition: color var(--transition-duration-instant);

										& > * {
											display: inline-block;

											&:nth-child(2) {
												margin-left: auto;
											}
										}
										&:hover {
											color: var(--color-text-error);
										}
									}
								}
							}
						}
					}
				}

				.registrationAthletes__availableAthletes__wrapper {
					flex: 1 1 150px;
					display: flex;
					flex-direction: column;
					border-left: 1px solid var(--color-border-primary);

					.registrationAthletes__availableAthletes__title {
						flex: 0 0 auto;
						margin: 0 0.75rem 0.5rem;
					}
					.registrationAthletes__availableAthletes__body {
						flex: 1 1 0;
						overflow-y: auto;

						.registrationAthletes__availableAthletes__list {
							display: flex;
							flex-direction: column;
							gap: 0.25rem;
							padding: 0.5rem;

							.registrationAthletes__availableAthletes__list__item {
								flex: 0 0 auto;
								display: flex;
								flex-direction: column;
								border-radius: 2px;
								cursor: pointer;

								.registrationAthletes__availableAthletes__list__item__data {
									flex: 0 0 auto;
									text-wrap: nowrap;
									padding: 0.25rem 0.5rem;
								}
								.editingAthlete__groups {
									display: none;
									flex: 0 0 auto;
									flex-wrap: wrap;
									gap: 0.25rem 0.75rem;
									padding: 0.25rem 0.5rem;
								}
								&.edit {
									border: 1px solid var(--color-interactive-brand-default);

									.editingAthlete__groups {
										display: flex;

										span {
											display: inline-block;
											padding: 0.25rem 1.25rem;
											background-color: var(--color-bg-surface-hover);
											border-radius: 1rem;
											transition: color var(--transition-duration-fast);
											cursor: pointer;

											&:hover {
												color: var(--color-interactive-brand-default);
											}
										}
									}
								}
							}
						}
					}
				}
			}

			.attachedDocuments__wrapper {
				flex: 1 1 100px;
				display: flex;
				flex-direction: column;
				padding: 0.25rem;
				border-top: 1px solid var(--color-border-primary);

				.attachedDocuments__title {
					flex: 0 0 auto;
					padding: 0.25rem 0.75rem;
				}
				.attachedDocuments__body {
					flex: 1 1 200px;
					overflow-y: auto;
					padding: 0.5rem 1rem;
				}
			}

			.registrationApplicationStats__wrapper {
				flex: 0 0 auto;
				padding: 0.25rem;
				border-top: 1px solid var(--color-border-primary);

				.registrationApplicationStats__item {
					padding: 0.25rem 0.75rem;
				}
			}
			.eventOnlineRegistration__actions {
				display: flex;
				justify-content: flex-end;
				gap: 0.75rem;
				padding: 0.5rem 1.25rem 0.25rem;
				border-top: 1px solid var(--color-border-primary);
			}
		}
	}
}
</style>
