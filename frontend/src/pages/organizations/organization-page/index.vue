<template>
	<div>
		<div v-if="error" class="error-message">
			{{ error }}
		</div>
		<div v-else-if="loadingState">
			<loader-spinner />
		</div>
		<div v-else-if="organization" class="organizationPage__wrapper d-flex flex-col">
			<div class="organizationCard__top__wrapper d-flex justify-center">
				<bg-mountains class="mountains_bg" />

				<div class="organizationCard__top__content">
					<div class="organizationInfo__wrapper d-flex flex-col">
						<div
							class="organizationInfo__header flex-auto relative d-flex gap-6 p-4 border-b-contrast"
						>
							<div class="organizationImage__wrapper">
								<lazy-image
									v-if="organization['logo_url']"
									:src="getImageUrl(organization['logo_url'])"
									:alt="organization.title || 'Organization logo'"
									img-class="organizationImage"
									variant="page"
								/>
								<competition-image-filler-icon v-else class="imageFiller__icon" />

								<edit-button class="editOrganization__button" type="organization" :code="org_id" />
							</div>

							<div class="organizationMainInfo__wrapper d-flex flex-col gap-6">
								<div class="organizationMainInfo__top d-flex items-start">
									<div class="organizationName text-md font-bold">
										{{ organization.title }}
									</div>
									<div class="organizationSport d-flex items-center ml-auto text-md">
										{{ organization.sport }}
										<country-flag
											class="countryFlag ml-2"
											:country-code="getCountryCode(organization.country)"
											height="1.25rem"
										/>
									</div>
								</div>

								<div class="organizationTitle__wrapper" />

								<div
									class="organizationInfo__secondLine d-flex flex-wrap items-start gap-4 mt-auto p-2"
								>
									<div class="organizationRegionInfo__wrapper d-flex items-center text-lg">
										<country-flag
											class="regionFlag mr-2"
											is-region-flag="true"
											:country-code="getCountryCode(organization.country)"
											:region-code="getRegionCode(organization.region)"
											height="1.25rem"
										/>
										{{ organization.region }}
									</div>
									<div
										v-if="Array.isArray(organization.contacts)"
										class="organizationContacts__wrapper d-flex flex-col ml-auto"
									>
										<div
											v-for="(contact, idx) in organization.contacts"
											:key="idx"
											class="organizationContacts__item flex-none font-light"
										>
											{{ contact }}
										</div>
									</div>
								</div>
							</div>
						</div>

						<div class="organizationAdditionalInfo__wrapper d-flex items-center gap-4 p-4">
							<div
								v-if="organization.socials"
								class="socials d-flex items-center gap-2 ml-auto text-base font-light"
							>
								<span>Социальные сети:</span>
								<a
									v-if="organization.socials.vk"
									class="socials__link d-flex items-center"
									:href="organization.socials.vk"
									target="_blank"
								>
									<socials-vk-icon class="socials__link__icon" />
								</a>
								<a
									v-if="organization.socials.telegram"
									class="socials__link d-flex items-center"
									:href="organization.socials.telegram"
									target="_blank"
								>
									<socials-telegram-icon class="socials__link__icon" />
								</a>
							</div>
						</div>
						<div class="organization__menu d-flex gap-8 p-2">
							<button
								v-for="page in subPages"
								:key="page.name"
								class="organization__menu__item mx-auto text-base"
								type="button"
								:disabled="page.authCheck ? !getRegistrationAccess : false"
								@click.prevent="bottomPage = page.name"
							>
								{{ translateField(page.title) }}
							</button>
						</div>
					</div>
				</div>
			</div>

			<div class="organizationCard__bottom d-flex flex-col mx-auto my-2 w-full">
				<organization-team-list v-if="bottomPage === 'team'" :team="team" />
				<reports-list
					v-if="bottomPage === 'reports'"
					:organization-id="organization._id"
					:organization-region="organization.region"
				/>
				<events-with-registration-list v-if="bottomPage === 'eventsWithRegistration'" />
			</div>
		</div>
	</div>
</template>

<script>
import axios from 'axios'
import { apiUrl } from '@/constants'
import { formatBirthDate, getAgeFromBirthdate, getAthleteName } from '@/utils/data-formaters'
import { getCountryCode } from '@/store/data/countries'
import { getDisciplineCode } from '@/store/data/sports'
import { getRegionCode } from '@/store/data/russia-regions'
import { mapGetters } from 'vuex'
import SocialsVkIcon from '@/components/icons/socials-vk-icon.vue'
import CountryFlag from '@/components/ui-components/country-flag.vue'
import SocialsTelegramIcon from '@/components/icons/socials-telegram-icon.vue'
import EditButton from '@/components/ui-components/edit-button.vue'
import { mdiImage } from '@mdi/js'
import CompetitionImageFillerIcon from '@/assets/svg/competitionImageFiller-icon.vue'
import BgMountains from '@/assets/riv/bg-mountains.vue'
import EventsWithRegistrationList from '@/pages/organizations/organization-page/events-with-registration-list.vue'
import OrganizationTeamList from '@/pages/organizations/organization-page/organization-team-list.vue'
import ReportsList from '@/pages/organizations/organization-page/reports-list.vue'
import { translateField } from '@/utils/formFields-translator'
import LazyImage from '@/components/ui-components/LazyImage.vue'
import LoaderSpinner from '@/components/ui-components/loader-spinner.vue'
import { getImageUrl } from '@/utils/url-helpers'

export default {
	name: 'Index',
	components: {
		ReportsList,
		OrganizationTeamList,
		EventsWithRegistrationList,
		BgMountains,
		CompetitionImageFillerIcon,
		EditButton,
		SocialsTelegramIcon,
		CountryFlag,
		SocialsVkIcon,
		LazyImage,
		LoaderSpinner
	},
	props: ['org_id'],
	data() {
		return {
			organization: null,
			team: [],
			error: null,
			loadingState: false,
			subPages: [
				{ name: 'team', title: 'Команда', authCheck: false },
				{ name: 'reports', title: 'Отчёты', authCheck: false },
				{ name: 'eventsWithRegistration', title: 'Заявки', authCheck: true }
			],
			bottomPage: 'team',
			imageFillerIcon: mdiImage
		}
	},
	computed: {
		...mapGetters('authorization', {
			userData: 'getUserData'
		}),

		getRegistrationAccess() {
			return this.organization.region === this.userData?.region
		}
	},

	mounted() {
		const org_id = this.$route.params.org_id
		if (!org_id) {
			this.error = 'Некорректная ссылка: отсутствует ID организации.'
			return
		}
		this.loadingState = true
		this.getOrganizationById(org_id)
	},
	methods: {
		translateField,
		getAthleteName,
		formatBirthDate,
		getAgeFromBirthdate,
		getCountryCode,
		getDisciplineCode,
		getRegionCode,
		getImageUrl,
		async getOrganizationById(org_id) {
			try {
				const response = await axios.get(`${apiUrl}/organizations/${org_id}`)
				if (response.status === 200 && response.data.organization) {
					this.organization = { ...response.data.organization }
					this.error = null
				} else {
					this.error = 'Организация не найдена.'
				}
				this.loadingState = false
				await this.getOrganizationTeam(org_id)
			} catch (err) {
				this.error = 'Ошибка загрузки данных организации.'
				this.loadingState = false
			}
		},
		async getOrganizationTeam(org_id) {
			try {
				const response = await axios.get(`${apiUrl}/organizations/${org_id}/athletes`)

				if (response.status === 200) {
					const organizationTeam = response.data.athletes
					if (organizationTeam.length) this.team = [...organizationTeam]
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
.organizationPage__wrapper {
	position: relative;
	flex: 1 1 0;

	.organizationCard__top__wrapper {
		position: relative;
		isolation: isolate;
		flex: 0 0 400px;
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

		.organizationCard__top__content {
			position: relative;
			z-index: 2;
			max-width: var(--desktop-small);
			width: 100%;
			margin: 16px 16px;
			color: var(--color-text-secondary);

			&::before {
				position: absolute;
				top: 0;
				width: 100%;
				height: 100%;
				content: '';
				background-color: rgba(2, 2, 6, 0.6);
				backdrop-filter: blur(5px);
				border: 1px solid rgb(255, 255, 255);
				box-shadow:
					0 0 6px -2px rgb(255, 255, 255) inset,
					0 16px 32px 0 rgba(12, 14, 46, 0.48),
					-4px -8px 24px 0 rgba(255, 255, 255, 0.14) inset;
				border-radius: var(--radius-lg);
			}

			.organizationInfo__wrapper {
				padding: var(--padd-entityPage-card);
			}

			.organizationImage__wrapper {
				position: relative;
				flex: 0 0 auto;
				/* Using classes for layout, but need to keep for sizing */
				display: flex;
				align-items: flex-start;
				justify-content: center;
				width: 180px;
				/* Base size */
				height: 180px;

				.organizationImage {
					max-width: 100%;
					max-height: 100%;
					object-fit: contain;
				}

				.imageFiller__icon {
					width: 192px;
					color: var(--color-text-primary);
				}

				.editOrganization__button {
					position: absolute;
					bottom: 0;
					right: 0;
				}

				/* Brittle, but kept for now as per legacy structure */
				@media screen and (max-width: 1200px) {
					width: 148px;
					height: 148px;
				}

				@media screen and (max-width: 900px) {
					width: 120px;
					height: 120px;
				}

				@media screen and (max-width: 720px) {
					width: 98px;
					height: 98px;
				}

				@media screen and (max-width: 480px) {
					width: 86px;
					height: 86px;
				}
			}

			.organizationName {
				text-wrap: balance;
			}

			.socials__link__icon {
				height: 2rem;
				color: var(--color-text-secondary);
			}

			.organization__menu {
				border-top: 1px solid var(--color-text-secondary);

				button {
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

	.organizationCard__bottom {
		flex: 1 1 300px;
		max-width: var(--desktop-small);
		padding: 0 2rem;

		@media screen and (max-width: 720px) {
			margin: 0;
			padding: 0;
		}
	}
}
</style>
