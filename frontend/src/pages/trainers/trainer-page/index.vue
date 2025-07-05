<template>
	<div v-if="error" class="error-message">
		{{ error }}
	</div>
	<div v-else-if="loadingState">
		<loader-spinner v-if="loadingState" />
	</div>
	<div v-else-if="trainer" class="trainerPage__wrapper">
		<div class="trainerCard__top__wrapper">
			<bg-mountains class="mountains_bg" />
			<div class="trainerCard__top__content">
				<div class="trainerInfo__wrapper">
					<div class="trainerCard__mainInfo">
						<div class="trainerPhoto__wrapper bg-blur">
							<lazy-image
								v-if="trainer['photo_url']"
								:src="getImageUrl(trainer['photo_url'])"
								:alt="trainer.fullname || 'Trainer photo'"
								img-class="trainerPhoto"
								variant="page"
							/>
							<athlete-photo-filler-icon
								v-else
								class="trainerPhotoFiller__icon"
								:gender="trainer.gender"
							/>

							<edit-button class="edit__button" type="trainer" :code="trainer_id" />
						</div>

						<div class="trainerMainInfo__wrapper">
							<div class="trainerMainInfo__header">
								<div class="federation__wrapper">
									<img src="../../../assets/logo/FFR_logo_mini.png" alt="FFR_logo" />
									<span>Федерация фристайла России</span>
								</div>

								<div class="trainerSport">
									{{ trainer.sport }}
									<country-flag
										class="countryFlag"
										:country-code="getCountryCode(trainer.country)"
										height="1.25rem"
									/>
								</div>
							</div>

							<div class="trainerMainInfo__nameLine">
								<div class="trainerName__wrapper">
									<div class="trainerName">
										{{ trainer.fullname }}
									</div>
									<div class="trainerPosition">
										{{ trainer.trainerCategory }}
									</div>
									<div class="trainerRank">
										{{ concatStringsWithComma(trainer.rank) }}
									</div>
								</div>

								<div class="trainerPosition__wrapper">
									<div v-if="trainer.isNationalTeam" class="nationalTeamLogo__wrapper">
										Сборная России
										<img
											class="nationalTeamLogo"
											src="../../../assets/logo/okr.png"
											alt="NT_Logo"
										/>
									</div>

									<div v-if="Array.isArray(trainer.position)" class="trainerPositions">
										<div
											v-for="(position, idx) in trainer.position"
											:key="idx"
											class="trainerPosition__item"
										>
											{{ position }}
										</div>
									</div>
								</div>
							</div>

							<div class="trainerMainInfo__bottom">
								<div class="trainerRegionInfo__wrapper">
									<country-flag
										class="regionFlag"
										is-region-flag="true"
										:country-code="getCountryCode(trainer.country)"
										:region-code="getRegionCode(trainer.region)"
										width="1.5rem"
									/>
									<span class="trainerRegion">
										{{ trainer.region }}
									</span>
								</div>

								<div class="trainerAge__wrapper">
									Возраст:&nbsp;{{ getAgeFromBirthdate(trainer.birthDate) }}
								</div>

								<div v-if="trainer.disciplines.length" class="trainerDisciplines__wrapper">
									Дисциплины:&nbsp;
									{{
										trainer.disciplines
											.map(disciplineName => getDisciplineCode(disciplineName) || disciplineName)
											.join(', ')
									}}
								</div>
							</div>
						</div>
					</div>

					<div class="trainerAdditionalInfo__wrapper">
						<div v-if="trainer.trainer_id" class="trainerAdditionalInfo__group">
							<b> FFR-ID: </b>
							<span> {{ trainer.trainer_id }}</span>
						</div>
						<div v-if="trainer.socials" class="socials">
							<a
								v-if="trainer.socials.vk"
								class="socials__link"
								:href="trainer.socials.vk"
								target="_blank"
							>
								<socials-vk-icon class="socials__link__icon" />
							</a>
							<a
								v-if="trainer.socials.telegram"
								class="socials__link"
								:href="trainer.socials.telegram"
								target="_blank"
							>
								<socials-telegram-icon class="socials__link__icon" />
							</a>
						</div>
					</div>

					<div class="trainer__menu">
						<button class="trainer__menu__item" type="button" @click="bottomMenu = 'team'">
							Команда
						</button>
						<button class="trainer__menu__item" type="button" @click="bottomMenu = 'seminars'">
							Семинары
						</button>
						<button
							class="trainer__menu__item"
							type="button"
							:disabled="!getRegistrationAccess"
							@click.prevent="bottomMenu = 'eventsWithRegistration'"
						>
							Заявки
						</button>
					</div>
				</div>
			</div>
		</div>

		<div class="trainerPage__bottom">
			<div v-if="bottomMenu === 'team'" class="trainerBottomSection__wrapper">
				<div class="trainerTeam__header">Команда</div>

				<div class="trainerTeam__list">
					<athlete-list-item
						v-for="(athlete, idx) in team"
						:key="athlete.ffr_id"
						:athlete="athlete"
						:idx="idx"
					/>
				</div>
			</div>
			<div v-if="bottomMenu === 'seminars'" class="trainerBottomSection__wrapper">
				<div class="trainerTeam__header">Семинары</div>

				<trainer-seminars-list :trainer_id="trainer_id" />
			</div>
			<events-with-registration-list v-if="bottomMenu === 'eventsWithRegistration'" />
		</div>
	</div>
</template>

<script>
import SocialsVkIcon from '@/components/icons/socials-vk-icon.vue'
import AthletePhotoFillerIcon from '@/assets/svg/athletePhotoFiller-icon.vue'
import CountryFlag from '@/components/ui-components/country-flag.vue'
import SocialsTelegramIcon from '@/components/icons/socials-telegram-icon.vue'
import EditButton from '@/components/ui-components/edit-button.vue'
import { mdiImage } from '@mdi/js'
import {
	concatStringsWithComma,
	formatBirthDate,
	getAgeFromBirthdate,
	getAthleteName
} from '@/utils/data-formaters'
import { getCountryCode } from '@/store/data/countries'
import { getDisciplineCode, sports } from '@/store/data/sports'
import { getRegionCode } from '@/store/data/russia-regions'
import axios from 'axios'
import { apiUrl } from '@/constants'
import AthleteListItem from '@/pages/athletes/athlete-listItem.vue'
import TrainerSeminarsList from '@/pages/trainers/trainer-page/trainerSeminars-list.vue'
import { capitalizeString } from '@/utils/capitalizeString'
import BgMountains from '@/assets/riv/bg-mountains.vue'
import EventsWithRegistrationList from '@/pages/organizations/organization-page/events-with-registration-list.vue'
import { mapGetters } from 'vuex'
import LazyImage from '@/components/ui-components/LazyImage.vue'
import LoaderSpinner from '@/components/ui-components/loader-spinner.vue'
import { getImageUrl } from '@/utils/url-helpers'

export default {
	name: 'Index',
	components: {
		EventsWithRegistrationList,
		BgMountains,
		TrainerSeminarsList,
		AthleteListItem,
		EditButton,
		SocialsTelegramIcon,
		CountryFlag,
		AthletePhotoFillerIcon,
		SocialsVkIcon,
		LazyImage,
		LoaderSpinner
	},
	props: {
		trainer_id: {
			type: String,
			default: ''
		}
	},
	data() {
		return {
			trainer: null,
			team: [],
			error: null,
			loadingState: false,
			updateTimeoutId: null,
			bottomMenu: 'team',
			imageFillerIcon: mdiImage
		}
	},
	computed: {
		...mapGetters('authorization', {
			userData: 'getUserData'
		}),
		sports() {
			return sports
		},

		getRegistrationAccess() {
			return this.trainer.trainer_id === this.userData?.ffr_id
		}
	},

	mounted() {
		const trainer_id = this.$route.params.trainer_id
		if (!trainer_id) {
			this.error = 'Некорректная ссылка: отсутствует ID тренера.'
			return
		}
		this.loadingState = true
		this.getTrainerByCode(trainer_id)
	},
	methods: {
		concatStringsWithComma,
		capitalizeString,
		getAthleteName,
		formatBirthDate,
		getAgeFromBirthdate,
		getCountryCode,
		getDisciplineCode,
		getRegionCode,
		getImageUrl,
		async getTrainerByCode(trainer_id) {
			try {
				const response = await axios.get(`${apiUrl}/trainers/${trainer_id}`)
				if (response.status === 200 && response.data.trainer) {
					this.trainer = { ...response.data.trainer }
					this.error = null
				} else {
					this.error = 'Тренер не найден.'
				}
				this.loadingState = false
				await this.getTrainerTeam(trainer_id)
			} catch (err) {
				this.error = 'Ошибка загрузки данных тренера.'
				this.loadingState = false
			}
		},
		async getTrainerTeam(trainer_id) {
			try {
				const response = await axios.get(`${apiUrl}/trainers/${trainer_id}/athletes`)

				if (response.status === 200) {
					const trainerTeam = response.data.athletes
					if (trainerTeam.length) this.team = [...trainerTeam]
				}
			} catch (err) {
				if (err) {
					console.error(err)
				}
			}
		}
	}
}
</script>

<style scoped lang="scss">
.trainerPage__wrapper {
	position: relative;
	flex: 1 1 0;
	display: flex;
	flex-direction: column;
	padding-bottom: 2rem;

	.trainerCard__top__wrapper {
		position: relative;
		isolation: isolate;
		flex: 0 0 400px;
		display: flex;
		justify-content: center;
		padding: var(--padd-entityPage-top);

		@media screen and (max-width: 640px) {
			flex-basis: auto;
		}

		.mountains_bg {
			position: absolute;
			z-index: 1;
			top: 0;
			width: 100%;
			height: 100%;
		}

		.trainerCard__top__content {
			z-index: 2;
			position: relative;
			display: flex;
			flex-wrap: wrap;
			max-width: var(--desktop-small);
			width: 100%;
			margin: 16px 16px;
			color: var(--color-text-secondary);
			&::before {
				position: absolute;
				top: 0;
				width: 100%;
				height: 100%;
				background-color: rgba(2, 2, 6, 0.6);
				backdrop-filter: blur(5px);
				border: 1px solid rgb(255, 255, 255);
				box-shadow:
					0 0 6px -2px rgb(255, 255, 255) inset,
					0 16px 32px 0 rgba(12, 14, 46, 0.48),
					-4px -8px 24px 0 rgba(255, 255, 255, 0.14) inset;
				border-radius: 12px;
				content: '';
			}
			.trainerInfo__wrapper {
				position: relative;
				flex: 1 1 0;
				display: flex;
				flex-direction: column;
				padding: var(--padd-entityPage-card);
				.trainerCard__mainInfo {
					display: flex;
					justify-content: space-between;
					gap: 2rem;

					@media screen and (max-width: 900px) {
						flex-direction: column;
						gap: 1.5rem;
					}

					.trainerPhoto__wrapper {
						position: relative;
						flex: 0 0 auto;
						display: flex;
						flex-wrap: wrap;
						align-items: center;
						justify-content: center;
						aspect-ratio: 1;
						background-color: var(--color-bg-image);
						border: 2px solid var(--color-text-secondary);
						border-radius: 50%;
						.trainerPhoto {
							flex: 1 1 0;
							max-width: 100%;
							max-height: 100%;
							border-radius: 50%;
						}
						.trainerPhotoFiller__icon {
							height: 100%;
							aspect-ratio: 1;
							color: var(--color-text-primary);
						}
						.edit__button {
							position: absolute;
							bottom: 0;
							right: 0;
						}
						@media screen and (max-width: 1200px) {
							width: 144px;
							height: 144px;
						}
						@media screen and (max-width: 900px) {
							width: 122px;
							height: 122px;
						}
						@media screen and (max-width: 720px) {
							width: 108px;
							height: 108px;
						}
						@media screen and (max-width: 480px) {
							width: 96px;
							height: 96px;
						}
					}

					.trainerMainInfo__wrapper {
						display: flex;
						flex-direction: column;
						width: 100%;
						gap: 1rem;

						.trainerMainInfo__header {
							display: flex;
							align-items: center;
							justify-content: space-between;

							.federation__wrapper {
								display: flex;
								align-items: center;
								gap: 8px;
								font-size: 0.9rem;
								color: var(--color-text-soft);

								img {
									height: 24px;
									width: 24px;
								}
							}

							.trainerSport {
								font-size: 1.25rem;
								font-weight: 500;
								display: flex;
								align-items: center;
								gap: 1rem;
							}
						}

						.trainerMainInfo__nameLine {
							display: flex;
							align-items: center;
							justify-content: space-between;

							@media screen and (max-width: 900px) {
								flex-direction: column;
								align-items: flex-start;
								gap: 1rem;
							}

							.trainerName__wrapper {
								display: flex;
								flex-direction: column;
								gap: 4px;
								margin-top: 1rem;

								.trainerName {
									font-weight: 600;
									font-size: 2rem;
									word-break: break-word;
								}

								.trainerPosition {
									font-weight: 600;
									font-size: 1.1rem;
									color: var(--color-text-soft);
								}

								.trainerRank {
									margin-top: 0.5rem;
								}
							}

							.trainerPosition__wrapper {
								display: flex;
								flex-direction: column;
								justify-content: flex-end;
								text-align: right;
								gap: 0.5rem;

								.nationalTeamLogo__wrapper {
									display: flex;
									align-items: center;
									font-size: 1.25rem;
									font-weight: 600;
									gap: 0.5rem;

									.nationalTeamLogo {
										height: 48px;
									}
								}

								.trainerPositions {
									display: flex;
									flex-direction: column;
									gap: 0.25rem;

									.trainerPosition__item {
										font-size: 1rem;
										color: var(--color-text);
									}
								}
							}
						}

						.trainerMainInfo__bottom {
							display: flex;
							flex-direction: column;
							gap: 0.5rem;
							margin-top: auto;

							.trainerRegionInfo__wrapper {
								display: flex;
								align-items: center;
								gap: 8px;

								.trainerRegion {
									font-size: 1rem;
								}
							}

							.trainerAge__wrapper {
								font-size: 1rem;
								color: var(--color-text-soft);
							}

							.trainerDisciplines__wrapper {
								font-size: 1rem;
								color: var(--color-text);
							}
						}
					}
				}

				.trainerAdditionalInfo__wrapper {
					display: flex;
					gap: 1.5rem;
					align-items: center;

					.trainerAdditionalInfo__group {
						display: flex;
						gap: 8px;
						align-items: center;
					}

					.socials {
						display: flex;
						gap: 0.5rem;

						.socials__link {
							height: 24px;
							width: 24px;
							color: var(--color-text);
							display: flex;
							align-items: center;
							justify-content: center;
						}
					}
				}

				.trainer__menu {
					display: flex;
					gap: 1rem;
					border-top: 2px solid var(--color-background);
					padding-top: 1.5rem;

					.trainer__menu__item {
						color: var(--color-text);
						font-size: 1.1rem;
						font-weight: 600;
						background: none;
						border: none;
						padding: 0.5rem 1.2rem;
						border-radius: 4px;
						cursor: pointer;
						transition: background 0.15s;

						&:hover:not(:disabled) {
							background: var(--color-background-mute);
						}

						&:disabled {
							color: var(--color-text-soft);
							cursor: default;
							background: none;
						}
					}
				}
			}
		}
	}

	.trainerPage__bottom {
		flex: 1 1 300px;
		display: flex;
		flex-direction: column;
		max-width: var(--desktop-small);
		width: 100%;
		margin: 0.75rem auto 0.5rem;
		padding: 0 2rem;

		.trainerBottomSection__wrapper {
			flex: 1 1 0;
			display: flex;
			flex-direction: column;
			overflow-y: auto;
			background-color: var(--color-bg-surface);
			border: 1px solid var(--color-border-primary);
			box-shadow: var(--surface-shadow-m);
			border-radius: 4px;

			@media screen and (max-width: 1200px) {
				max-width: 90%;
				width: 100%;
			}

			@media screen and (max-width: 1024px) {
				width: 100%;
				max-width: 100%;
				padding: 0 1rem;
			}

			.trainerTeam__header {
				font-size: 1.5rem;
				font-weight: 600;
			}

			.trainerTeam__list {
				display: flex;
				flex-direction: column;
				gap: 0.5rem;
			}
		}
	}
}

.error-message {
	color: #d32f2f;
	background: #fff0f0;
	border: 1px solid #d32f2f;
	border-radius: 4px;
	padding: 1rem;
	margin: 1rem 0;
	text-align: center;
	font-weight: 500;
}
</style>
