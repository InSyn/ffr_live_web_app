<template>
	<div v-if="error" class="error-message">
		{{ error }}
	</div>
	<div v-else-if="loadingState">
		<loader-spinner v-if="loadingState" />
	</div>
	<div v-else-if="jury" class="juryPage__wrapper">
		<div class="juryPage__top">
			<bg-mountains class="mountains_bg" />

			<div class="juryCard__wrapper">
				<div class="juryCard__content bg-frozen-glass">
					<div class="juryCard__mainInfo">
						<div class="juryPhoto__wrapper bg-blur">
							<lazy-image
								:src="getImageUrl(jury['photo_url']) || ''"
								:alt="jury.lastname + ' ' + jury.name || 'Jury photo'"
								rounding="50%"
								variant="page"
								entity-type="jury"
								:entity-data="jury"
							/>

							<edit-button class="edit__button" type="jury" :code="jury_code" />
						</div>

						<div class="juryInfo__wrapper">
							<div class="juryInfo__header">
								<div class="federation__wrapper">
									<img src="../../../assets/logo/FFR_logo_mini.png" alt="FFR_logo" />
									<span>Федерация фристайла России</span>
								</div>

								<div class="jurySport">
									{{ jury.sport }}

									<country-flag
										class="countryFlag"
										:country-code="getCountryCode(jury.country)"
										height="1.25rem"
									/>
								</div>
							</div>

							<div class="juryInfo__nameLine">
								<div class="juryName">
									{{ jury.lastname + ' ' + jury.name }}
								</div>
								<div v-if="jury.juryCategory" class="juryCategory">
									{{ jury.juryCategory }}
								</div>
							</div>

							<div v-if="jury.region" class="juryInfo__footer">
								<div class="juryRegionInfo__wrapper">
									<country-flag
										class="regionFlag"
										is-region-flag="true"
										:country-code="getCountryCode(jury.country)"
										:region-code="getRegionCode(jury.region)"
										height="1.1rem"
									/>
									<span class="juryRegion">
										{{ jury.region }}
									</span>
								</div>

								<div v-if="jury.birthDate" class="juryAge__wrapper">
									Возраст
									<div class="juryAge">
										{{ getAgeFromBirthdate(jury.birthDate) }}
									</div>
								</div>

								<div v-if="jury.disciplines.length" class="juryDisciplines__wrapper">
									<span> Дисциплины: </span>
									<div class="disciplines__wrapper">
										{{
											jury.disciplines
												.map(disciplineName => getDisciplineCode(disciplineName) || disciplineName)
												.join(', ')
										}}
									</div>
								</div>
							</div>
						</div>
					</div>

					<div class="juryAdditionalInfo__wrapper">
						<div v-if="jury.jury_code" class="juryAdditionalInfo__group">
							<b> FFR-ID: </b>
							<span> {{ jury.jury_code }}</span>
						</div>
						<div v-if="jury.socials" class="socials">
							<a
								v-if="jury.socials.vk"
								class="socials__link"
								:href="jury.socials.vk"
								target="_blank"
							>
								<socials-vk-icon class="socials__link__icon" />
							</a>
							<a
								v-if="jury.socials.telegram"
								class="socials__link"
								:href="jury.socials.telegram"
								target="_blank"
							>
								<socials-telegram-icon class="socials__link__icon" />
							</a>
						</div>
					</div>
					<div class="jury__menu">
						<button class="jury__menu__item" type="button" @click="bottomMenu = 'competitions'">
							Соревнования
						</button>
						<button class="jury__menu__item" type="button" @click="bottomMenu = 'seminars'">
							Семинары
						</button>
						<button class="jury__menu__item" type="button" disabled>Статистика</button>
					</div>
				</div>
			</div>
		</div>

		<div class="juryPage__bottom">
			<div v-if="bottomMenu === 'competitions'" class="juryBottomSection__wrapper">
				<div class="juryBottomSection__title">Соревнования</div>
				<jury-competitions-list :jury_code="jury_code" />
			</div>
			<div v-else-if="bottomMenu === 'seminars'" class="juryBottomSection__wrapper">
				<div class="juryBottomSection__title">Семинары</div>
				<jury-seminars-list :jury_code="jury_code" />
			</div>
		</div>
	</div>
</template>

<script>
import EditButton from '@/components/ui-components/edit-button.vue'
import CountryFlag from '@/components/ui-components/country-flag.vue'
import axios from 'axios'
import { apiUrl } from '@/constants'
import { getRegionCode } from '@/store/data/russia-regions'
import { getDisciplineCode } from '@/store/data/sports'
import { mdiImage } from '@mdi/js'
import SocialsVkIcon from '@/components/icons/socials-vk-icon.vue'
import SocialsTelegramIcon from '@/components/icons/socials-telegram-icon.vue'
import { getCountryCode } from '@/store/data/countries'
import { getAgeFromBirthdate } from '@/utils/data-formaters'
import JurySeminarsList from '@/pages/jury/jury-page/jurySeminars-list.vue'
import JuryCompetitionsList from '@/pages/jury/jury-page/juryCompetitions-list.vue'
import BgMountains from '@/assets/riv/bg-mountains.vue'
import LazyImage from '@/components/ui-components/LazyImage.vue'
import LoaderSpinner from '@/components/ui-components/loader-spinner.vue'
import { getImageUrl } from '@/utils/url-helpers'

export default {
	name: 'Index',
	components: {
		BgMountains,
		JuryCompetitionsList,
		JurySeminarsList,
		SocialsTelegramIcon,
		SocialsVkIcon,
		CountryFlag,
		EditButton,
		LazyImage,
		LoaderSpinner
	},
	props: ['jury_code'],
	data() {
		return {
			jury: null,
			error: null,
			loadingState: false,
			updateTimeoutId: null,
			bottomMenu: 'competitions',
			imageFillerIcon: mdiImage
		}
	},

	mounted() {
		const jury_code = this.$route.params.jury_code
		if (!jury_code) {
			this.error = 'Некорректная ссылка: отсутствует код судьи.'
			return
		}
		this.loadingState = true
		this.getJuryByCode(jury_code)
	},
	methods: {
		getAgeFromBirthdate,
		getCountryCode,
		getDisciplineCode,
		getRegionCode,
		getImageUrl,
		async getJuryByCode(jury_code) {
			try {
				const data = await axios.get(apiUrl + '/jury/' + jury_code)
				if (data.status === 200 && data.data.jury) {
					this.jury = { ...data.data.jury }
					this.error = null
				} else {
					this.error = 'Судья не найден.'
				}
			} catch (err) {
				this.error = 'Ошибка загрузки данных судьи.'
			} finally {
				this.loadingState = false
			}
		}
	}
}
</script>

<style scoped lang="scss">
.juryPage__wrapper {
	position: relative;
	flex: 1 1 0;
	display: flex;
	flex-direction: column;

	.juryPage__top {
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

		.juryCard__wrapper {
			position: relative;
			z-index: 2;
			display: flex;
			flex-wrap: wrap;
			max-width: var(--desktop-small);
			width: 100%;
			margin: 16px 16px;
			color: var(--color-text-secondary);

			.juryCard__content {
				position: relative;
				flex: 1 1 0;
				display: flex;
				flex-direction: column;
				padding: var(--padd-entityPage-card);

				.juryCard__mainInfo {
					flex: 1 1 auto;
					position: relative;
					display: flex;
					flex-wrap: wrap;
					gap: 0.5rem 1rem;
					padding: 1rem;
					border-bottom: 1px solid var(--color-text-secondary);

					.juryPhoto__wrapper {
						--bg-radius: 50%;
						position: relative;
						flex: 0 0 auto;
						display: flex;
						align-items: center;
						justify-content: center;

						aspect-ratio: 1;
						background-color: var(--color-bg-image);
						border: 2px solid var(--color-text-secondary);
						border-radius: 50%;

						.juryPhoto {
							flex: 1 1 0;
							max-width: 100%;
							max-height: 100%;
							border-radius: 50%;
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

					.juryInfo__wrapper {
						flex: 1 1 0;
						display: flex;
						flex-direction: column;
						gap: 2rem 1.75rem;

						.juryInfo__header {
							flex: 0 0 auto;
							display: flex;
							align-items: center;
							flex-wrap: wrap;
							gap: 0.5rem 1rem;

							.federation__wrapper {
								flex: 1 1 0;
								display: flex;
								align-items: center;
								font-size: 1.1rem;

								img {
									height: 2rem;
									margin-right: 1rem;
								}
							}

							.jurySport {
								flex: 0 0 auto;
								display: flex;
								align-items: center;
								margin-left: auto;
								font-size: 1.2rem;

								.countryFlag {
									margin-left: 12px;
								}
							}
						}

						.juryInfo__nameLine {
							flex: 0 0 auto;
							display: flex;
							align-items: center;
							flex-wrap: wrap;
							gap: 0.5rem 0.75rem;
							margin-left: 0.75rem;

							.juryName {
								flex: 1 1 auto;
								font-size: 1.5rem;
								font-weight: bold;
							}

							.juryCategory {
								flex: 0 1 auto;
								font-size: 1.25rem;
								font-weight: 300;
							}
						}

						.juryInfo__footer {
							flex: 0 0 auto;
							display: flex;
							align-items: center;
							flex-wrap: wrap;
							gap: 0.5rem 1.25rem;
							margin-top: auto;
							font-size: 1.1rem;

							.juryRegionInfo__wrapper {
								flex: 0 0 auto;
								display: flex;
								align-items: center;
								margin-right: 0.5rem;

								.regionFlag {
									margin-right: 0.5rem;
								}

								.juryRegion {
									display: flex;
									flex-wrap: wrap;
									gap: 4px;
								}
							}

							.juryAge__wrapper {
								flex: 0 0 auto;
								display: flex;

								.juryAge {
									margin-left: 1rem;
								}
							}

							.juryDisciplines__wrapper {
								display: flex;
								margin-left: auto;

								.disciplines__wrapper {
									margin-left: 1rem;
								}
							}

							@media screen and (max-width: 480px) {
								.juryAge__wrapper {
									justify-content: flex-end;
								}

								.juryDisciplines__wrapper {
									flex: 1 1 100%;
									justify-content: flex-end;
								}
							}
						}
					}
				}

				.juryAdditionalInfo__wrapper {
					display: flex;
					gap: 1rem;
					padding: 1rem;
					font-size: 0.9rem;

					.juryAdditionalInfo__group {
						flex: 0 0 auto;
						display: flex;
						gap: 8px;
						flex-wrap: nowrap;

						b {
							display: inline-block;
							white-space: nowrap;
							overflow: hidden;
						}

						span {
							display: inline-block;
							flex: 1 1 0;
							white-space: nowrap;
						}

						.disciplines__wrapper {
							flex: 1 1 0;
							display: flex;
							gap: 8px;

							span {
								flex: 0 0 auto;
							}
						}
					}

					.socials {
						display: flex;
						align-items: center;
						gap: 8px;
						margin-left: auto;
						padding-left: 1rem;

						.socials__link {
							display: flex;
							align-items: center;

							.socials__link__icon {
								height: 2rem;
								color: var(--color-text-secondary);
							}
						}
					}

					@media screen and (max-width: 900px) {
						max-height: none;
					}
				}

				.jury__menu {
					display: flex;
					justify-content: space-between;
					gap: 2rem;
					padding: 8px;
					border-top: 1px solid var(--color-text-secondary);

					button {
						font-size: 1.1rem;
						color: var(--color-text-secondary);
						opacity: 0.8;
						transition: opacity 120ms;

						&:hover {
							opacity: 1;
						}
					}

					button[disabled] {
						font-weight: 300;
						color: var(--color-text-secondary);
					}
				}
			}

			@media screen and (max-width: 640px) {
				margin: 0;
				width: 100%;
				backdrop-filter: blur(12px);

				&::before {
					border-radius: 0;
					border: none;
					box-shadow: none;
				}
			}
		}
	}

	.juryPage__bottom {
		flex: 1 1 300px;
		display: flex;
		flex-direction: column;
		max-width: var(--desktop-small);
		width: 100%;
		margin: 0.75rem auto 0.5rem;
		padding: 0 2rem;

		.juryBottomSection__wrapper {
			display: flex;
			flex-direction: column;
			overflow-y: auto;
			height: 100%;
			background-color: var(--color-bg-surface);
			backdrop-filter: blur(3px);
			border-radius: 4px;

			.juryBottomSection__title {
				flex: 0 0 auto;
				padding: 8px 12px;
				font-size: 1.1rem;
				font-weight: bold;
			}

			.juryCompetitions__list {
				flex: 1 1 200px;
				display: flex;
				flex-direction: column;
				overflow-y: auto;
				border-radius: 2px;
			}
		}

		@media screen and (max-width: 720px) {
			margin: 0;
			padding: 0;

			.juryBottomSection__wrapper {
				border-radius: 0;
			}
		}
	}
}
</style>
