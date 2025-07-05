<template>
	<div class="eventPage__wrapper">
		<div v-if="event" class="event__container">
			<div class="stagesList__wrapper">
				<button
					v-for="stage in eventStages"
					:key="stage['competition_id']"
					:class="[
						'stage__button',
						selectedStage && stage['competition_id'] === selectedStage && 'isSelectedStage'
					]"
					@click="selectStage(stage)"
				>
					{{ stage['stage'] }}
				</button>
			</div>

			<div :class="['event__header', !showHeader && 'minimized']">
				<div class="eventInfo__wrapper">
					<div class="competitionInfo__header">
						<div class="event__header__titleSection">
							<div class="event__header__titleSection__title">
								{{ event['title'] }}
								<edit-button type="event" :code="event.event_id" />
							</div>
							<div
								v-show="showHeader && event['calendar_code']"
								class="event__header__titleSection__calendarCode"
							>
								{{ 'ЕКП:&nbsp;' + event['calendar_code'] }}
							</div>
						</div>

						<div class="event__header__sportSection">
							<span>{{ event['sport'] }}</span>
							<country-flag
								v-if="event.country"
								class="eventImage__countryFlag"
								:country-code="getCountryCode(event.country)"
								width="1.75rem"
							/>
						</div>
					</div>

					<div class="competitionInfo__infoSection">
						<div class="event__header__imageSection">
							<div class="competitionImage__container">
								<lazy-image
									v-if="event['logo_image_url']"
									:src="getImageUrl(event['logo_image_url'])"
									alt="Event Logo"
									img-class="competitionImage img-thumbnail"
									rounding="var(--radius-md)"
								/>
								<competition-image-filler-icon v-else class="competitionImage__imageFiller__icon" />
							</div>

							<div
								v-if="event['translation_url']"
								v-show="showHeader"
								class="eventTranslation__wrapper"
							>
								<a class="eventTranslation__link" :href="event['translation_url']" target="_blank">
									<event-translation-icon class="eventTranslation__icon" />
									<span>Трансляция</span>
								</a>
							</div>
						</div>

						<div class="competitionInfo__infoSection__mainData">
							<div class="event__header__infoSection__discipline">
								{{ event['discipline'] }}
								<span v-show="!showHeader">{{
									'&nbsp;' + formatDate(event['start_at'], { full: true })
								}}</span>
							</div>

							<div v-show="showHeader" class="competitionInfo__infoSection__location">
								<country-flag
									class="competitionImage__regionFlag"
									:country-code="getCountryCode(event.country)"
									:region-code="getRegionCode(event.region)"
									:is-region-flag="!!getRegionCode(event.region)"
									height="1.25rem"
									rounding="2px"
								/>
								<span v-show="event['region']">
									{{ event['region'] + ',&nbsp;' }}
								</span>

								<span v-show="event['location']">
									{{ event['location'] }}
								</span>
							</div>

							<div v-show="showHeader" class="competitionInfo__infoSection__date">
								<span>{{ formatDate(event['start_at'], { full: true }) }}</span>
							</div>

							<div class="event__header__actions">
								<div class="headerAction__wrapper" @click="toggleAdditionalSection('pedestal')">
									<medal-icon class="headerAction__icon" />
									<span>Пъедестал</span>
								</div>
								<div class="headerAction__wrapper" @click="toggleAdditionalSection('technical')">
									<info-icon class="headerAction__icon" />
									<span>Техническая информация</span>
								</div>
								<div class="headerAction__wrapper" @click="toggleAdditionalSection('files')">
									<file-icon class="headerAction__icon" />
									<span>Файлы</span>
								</div>
							</div>
						</div>

						<div class="competitionInfo__infoSection__trackInfo">
							<div v-show="showHeader" class="trackImage__container">
								<lazy-image
									v-if="event['track_image_url']"
									:src="getImageUrl(event['track_image_url'])"
									alt="Track Image"
									img-class="trackImage img-thumbnail"
									rounding="var(--radius-md)"
								/>
								<span v-if="event['discipline']" class="disciplineCode">
									{{ getDisciplineCode(event['discipline']) }}
								</span>
							</div>
							<div class="headerSwitch" @click="toggleHeader()">
								<span v-if="showHeader">Скрыть шапку</span>
								<span v-else>Показать шапку</span>
							</div>
						</div>
					</div>
				</div>

				<div :class="['eventAdditionalInfo__section', additionalSection && 'opened']">
					<event-pedestal v-if="additionalSection === 'pedestal'" :competition="competition" />

					<div v-else-if="additionalSection === 'technical'" class="additionalSection__content">
						<div class="juryList__wrapper">
							<div v-for="(jury, idx) in juryList" :key="idx" class="juryItem">
								<span class="role">{{ jury.role }}</span>
								<span class="name">{{ `${jury.lastname} ${jury.name}` }}</span>
								<span class="category">{{ jury.category }}</span>
							</div>
						</div>
						<div class="technicalInfo__wrapper">
							<div class="trackParameters__wrapper">
								<div
									v-for="(parameter, idx) in event['track_info']"
									:key="idx"
									class="trackParameters__item"
								>
									<span
										v-for="(val, idx) in parameter.split('@')"
										:key="idx"
										class="trackParameters__item__value"
									>
										{{ val }}
									</span>
								</div>
							</div>
							<div class="conditions__wrapper">
								<div
									v-for="(parameter, idx) in event['conditions']"
									:key="idx"
									class="conditions__item"
								>
									<span
										v-for="(val, idx) in parameter.split('@')"
										:key="idx"
										class="conditions__item__value"
									>
										{{ val }}
									</span>
								</div>
							</div>
						</div>
						<div v-if="event['forerunners'].length" class="forerunners__wrapper">
							<div class="forerunners__header">Открывающие</div>
							<div class="forerunners__body">
								<div
									v-for="(forerunner, idx) in event['forerunners']"
									:key="idx"
									class="forerunners__item"
								>
									{{ `${forerunner.number} ${forerunner.name}` }}
								</div>
							</div>
						</div>
					</div>

					<div v-else-if="additionalSection === 'files'" class="additionalSection__content">
						<div class="eventFiles__wrapper">
							<div class="eventFiles__title">Документы:</div>
							<div class="eventFiles__list">
								<div v-for="(document, idx) in event.documents" :key="idx" class="eventFile__item">
									<a
										v-if="document?.file?.url"
										class="eventFile__item__link"
										:href="getImageUrl(document.file.url)"
										target="_blank"
										:title="document.title"
									>
										<file-icon class="eventFile__item__icon" />
										{{ document.title }}
									</a>
								</div>
							</div>
						</div>
					</div>
					<div v-else class="additionalSection__content">&nbsp;</div>
				</div>
			</div>

			<div
				v-if="event && event['competitions'] && event['competitions'].length < 1"
				class="event_emptyData"
			>
				Результаты события ещё не добавлены
			</div>

			<div
				v-if="competition && competition.competition_id && selectedStage"
				class="competition-id-display"
			>
				{{ competition.competition_id }}||{{ selectedStage }}
			</div>
			<results-table-s-x-qual
				v-if="competition && isSXQual(competition)"
				:competition="competition"
				:selected-stage="selectedStage"
			/>
			<results-table-s-x-final
				v-else-if="competition && isSXFinal(competition)"
				:competition="competition"
				:selected-stage="selectedStage"
			/>
			<results-table-d-m-o
				v-else-if="competition && isFinalOfDisciplines(competition, ['DM'])"
				:competition="competition"
				:selected-stage="selectedStage"
			/>
			<results-table
				v-else-if="competition && competition.races && competition.races.length > 0"
				:competition="competition"
				:selected-stage="selectedStage"
			/>
		</div>

		<div v-if="!event && !eventIsLoading" class="status__container">
			Такого события не существует
		</div>
		<loader-spinner v-if="!event && eventIsLoading" class="loader__spinner" />
	</div>
</template>

<script>
import axios from 'axios'
import ResultsTable from '@/pages/events/event-page/resultsTable.vue'
import { formatDate } from '@/utils/data-formaters'
import LoaderSpinner from '@/components/ui-components/loader-spinner.vue'
import { apiUrl } from '@/constants'
import { mdiImage } from '@mdi/js'
import CompetitionImageFillerIcon from '@/assets/svg/competitionImageFiller-icon.vue'
import CountryFlag from '@/components/ui-components/country-flag.vue'
import EventTranslationIcon from '@/components/icons/eventTranslation-icon.vue'
import InfoIcon from '@/components/icons/info-icon.vue'
import FileIcon from '@/components/icons/file-icon.vue'
import {
	checkCompetitionDiscipline,
	getDisciplineCode,
	isFinal,
	isFinalOfDisciplines,
	sports
} from '@/store/data/sports'
import EventPedestal from '@/pages/events/event-page/eventPedestal.vue'
import MedalIcon from '@/components/icons/medal-icon.vue'
import EditButton from '@/components/ui-components/edit-button.vue'
import { getCountryCode } from '@/store/data/countries'
import { getRegionCode } from '@/store/data/russia-regions'
import { mapGetters } from 'vuex'
import ResultsTableSXQual from '@/pages/events/event-page/resultsTable-SX-qual.vue'
import ResultsTableSXFinal from '@/pages/events/event-page/resultsTable-SX-final.vue'
import ResultsTableDMO from '@/pages/events/event-page/resultsTable-DMO.vue'
import { getImageUrl } from '@/utils/url-helpers'
import LazyImage from '@/components/ui-components/LazyImage.vue'

export default {
	name: 'Result',
	components: {
		ResultsTableDMO,
		ResultsTableSXFinal,
		ResultsTableSXQual,
		EditButton,
		MedalIcon,
		EventPedestal,
		FileIcon,
		InfoIcon,
		EventTranslationIcon,
		CountryFlag,
		CompetitionImageFillerIcon,
		LoaderSpinner,
		ResultsTable,
		LazyImage
	},
	props: ['event_id'],
	data() {
		return {
			event: null,
			selectedStage: null,

			updateTimeoutId: null,
			eventIsLoading: false,

			showHeader: true,
			additionalSection: null,

			imageFillerIcon: mdiImage
		}
	},
	computed: {
		...mapGetters('authorization', {
			isSecretary: 'isSecretary'
		}),
		sports() {
			return sports
		},

		eventStages() {
			return this.event.competitions || []
		},
		competition() {
			if (!this.event.competitions) return

			const stage = this.event.competitions.find(
				competition => competition.competition_id === this.selectedStage
			)
			if (!stage) return null

			return stage
		},
		juryList() {
			const juryArr = this.event.jury || []
			const judgesArr = this.event.judges || []

			return juryArr.concat(judgesArr)
		}
	},

	watch: {
		additionalSection(newVal) {
			if (newVal === 'pedestal') {
				this.showHeader = false
			}
		}
	},

	mounted() {
		this.getEventById()
	},
	beforeDestroy() {
		clearTimeout(this.updateTimeoutId)
	},
	methods: {
		isFinal,
		isFinalOfDisciplines,
		checkCompetitionDiscipline,
		getRegionCode,
		getCountryCode,
		getDisciplineCode,
		formatDate,
		getImageUrl,
		async getEventById() {
			this.eventIsLoading = true

			try {
				const response = await axios.get(apiUrl + '/events/' + this.$route.params.event_id)

				if (response.status === 200) {
					const eventData = response.data.event
					if (eventData.event_id === this.$route.params.event_id) this.event = eventData

					this.setupStage()
					this.updateTimeoutId = setTimeout(() => this.getEventById(), 2000)
				}
			} catch (e) {
				if (e) {
					throw new Error(`Unable to load event data. ${e?.response?.data?.message || e.message}`)
				}
			} finally {
				this.eventIsLoading = false
			}
		},

		selectStage(stage) {
			this.selectedStage = stage.competition_id
		},
		setupStage() {
			if (!this.selectedStage && this.event && this.event.competitions.length > 0) {
				this.selectStage(this.event.competitions[0])
			}
		},

		toggleHeader() {
			this.showHeader = !this.showHeader
		},
		toggleAdditionalSection(section) {
			if (this.additionalSection && this.additionalSection === section) {
				this.additionalSection = null
				return
			}

			this.additionalSection = section
		},

		isSXQual(competition) {
			if (
				!competition ||
				!competition.races.length ||
				!competition.stage ||
				!competition.discipline_code
			) {
				return false
			}

			return (
				competition.discipline_code === 'SX' &&
				competition.stage.split(' ')[0] &&
				competition.stage.split(' ')[0].trim().toLowerCase() === 'квалификация'
			)
		},
		isSXFinal(competition) {
			if (
				!competition ||
				!competition.races.length ||
				!competition.stage ||
				!competition.discipline_code
			) {
				return false
			}

			return (
				competition.discipline_code === 'SX' &&
				competition.stage.split(' ')[0] &&
				competition.stage.split(' ')[0].trim().toLowerCase() === 'финал'
			)
		},
		isDMO(competition) {
			if (!competition || !competition.races.length || !competition.discipline_code) return false
			return competition.discipline_code === 'MO'
		}
	}
}
</script>

<style scoped lang="scss">
.eventPage__wrapper {
	flex: 1 1 0;
	overflow-y: auto;

	.event__container {
		position: relative;
		flex: 1 0 auto;
		display: flex;
		flex-direction: column;
		height: 100%;

		max-width: var(--desktop-small);
		margin: 0 auto;
		padding: 4rem 64px 2rem;

		@media screen and (max-width: 1100px) {
			padding: 4rem 4rem 2rem;
		}
		@media screen and (max-width: 720px) {
			padding: 4rem 2rem 1rem;
		}

		.stagesList__wrapper {
			flex: 0 0 auto;
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			justify-content: flex-end;
			gap: 8px;
			margin-bottom: 8px;

			.stage__button {
				flex: 0 0 auto;
				padding: 6px 1rem;
				background-color: var(--color-bg-surface);
				border-radius: 2px;
				cursor: pointer;
				transition:
					background-color var(--transition-duration-fast),
					color var(--transition-duration-fast);

				&:hover,
				&:focus {
					color: var(--color-text-secondary);
					background-color: var(--color-interactive-brand-default);
				}
			}

			.isSelectedStage {
				color: var(--color-text-secondary);
				background-color: var(--color-interactive-brand-default);
				font-weight: bold;
			}
		}

		.event__header {
			flex: 0 0 auto;
			display: flex;
			margin-bottom: 16px;
			border-radius: 4px;
			background-color: var(--color-bg-surface);
			box-shadow: var(--surface-shadow-m);
			border: 1px solid var(--color-border-primary);

			// Mobile-first: Compact vertical layout - mimic legacy density
			flex-direction: column;
			padding: var(--space-3); // Reduced from space-4
			gap: var(--space-2); // Reduced from space-3

			// Tablet and up: Horizontal layout (preserve desktop design)
			@media screen and (min-width: 768px) {
				flex-direction: row;
				flex-wrap: wrap;
				padding: 1.25rem 0.75rem 0.75rem;
				gap: 0;
			}

			&.minimized
				.competitionInfo__infoSection
				.event__header__imageSection
				.competitionImage__container {
				// Mobile minimized: Ultra compact for condensed view
				height: 40px; // Even smaller
				padding: var(--space-1);

				// Desktop minimized: Preserve responsive scaling
				@media screen and (min-width: 768px) {
					height: 96px;
					padding: 0.5rem;
				}

				@media screen and (max-width: 1200px) and (min-width: 768px) {
					height: 80px;
				}
				@media screen and (max-width: 900px) and (min-width: 768px) {
					height: 60px;
				}
			}

			.eventInfo__wrapper {
				flex: 1 1 0;
				display: flex;
				flex-direction: column;

				// Mobile: Remove side margin, use gap from parent
				margin-left: 0;

				// Desktop: Restore original spacing
				@media screen and (min-width: 768px) {
					margin-left: 4px;
				}

				.competitionInfo__header {
					flex: 0 0 auto;
					display: flex;
					align-items: flex-start;

					// Mobile: Compact vertical stack - legacy style
					flex-direction: column;
					gap: var(--space-1); // Minimal gap for tighter spacing

					// Desktop: Preserve horizontal layout
					@media screen and (min-width: 768px) {
						flex-direction: row;
						flex-wrap: wrap;
						gap: 0;
					}

					.event__header__titleSection {
						flex: 1 1 0;
						display: flex;
						flex-direction: column;
						gap: 2px; // Tighter spacing
						padding: 4px 8px; // Reduced vertical padding

						.event__header__titleSection__title {
							flex: 0 0 auto;
							display: flex;
							align-items: center;
							font-size: 1.25rem;
							font-weight: bold;
						}

						.event__header__titleSection__calendarCode {
							flex: 0 0 auto;
							font-size: 0.9rem;
						}
					}

					.event__header__sportSection {
						display: flex;
						align-items: center;
						flex-wrap: nowrap;
						padding: 4px 8px; // Reduced padding for compactness
						font-size: 1.1rem; // Slightly smaller for mobile

						// Mobile: Integrated with title area
						margin-left: 0;

						// Desktop: Restore auto margin for right alignment
						@media screen and (min-width: 768px) {
							margin-left: auto;
							font-size: 1.25rem; // Restore desktop size
							padding: 8px 12px; // Restore desktop padding
						}

						.eventImage__countryFlag {
							margin-left: 12px;
						}
					}
				}

				.competitionInfo__infoSection {
					flex: 0 0 auto;
					display: flex;
					margin-top: auto;
					padding: 4px 8px; // Reduced padding

					// Mobile: Horizontal layout like legacy - image and content side by side
					flex-direction: row;
					gap: var(--space-2); // Compact gap
					align-items: flex-start;

					// Desktop: Preserve horizontal layout
					@media screen and (min-width: 768px) {
						flex-direction: row;
						gap: 1.75rem 0.75rem;
						padding: 8px; // Restore desktop padding
					}

					.event__header__imageSection {
						flex: 0 0 auto;
						display: flex;
						gap: 0.5rem; // Reduced gap

						// Mobile: Compact vertical layout like legacy
						flex-direction: column;
						align-items: center;
						justify-content: flex-start;

						// Desktop: Preserve vertical layout
						@media screen and (min-width: 768px) {
							flex-direction: column;
							align-items: stretch;
							justify-content: flex-start;
							gap: 0.75rem; // Restore desktop gap
						}

						.competitionImage__container {
							position: relative;
							flex: 0 0 auto;
							display: flex;
							align-items: center;
							justify-content: center;
							aspect-ratio: 1;

							// Mobile: Compact size matching legacy density
							height: 64px; // Smaller than before

							// Desktop: Preserve original sizing with responsive adjustments
							@media screen and (min-width: 768px) {
								height: 128px;
							}

							img {
								max-width: 100%;
								max-height: 100%;
							}

							.competitionImage__imageFiller__icon {
								height: 100%;
								width: 100%;
							}

							@media screen and (max-width: 1200px) {
								height: 92px;
							}
							@media screen and (max-width: 900px) {
								height: 80px;
							}
						}

						.eventTranslation__wrapper {
							flex: 0 0 auto;
							display: flex;
							align-items: center;
							justify-content: center;
							padding: 4px; // Reduced padding

							.eventTranslation__link {
								display: flex;
								align-items: center;
								gap: 0.25rem; // Reduced gap
								color: var(--color-text-primary);

								&:hover {
									color: var(--text-hovered);
								}

								span {
									display: inline-block;
									margin-top: 2px; // Reduced margin
									font-size: 0.75rem; // Smaller font size
								}

								.eventTranslation__icon {
									height: 1.2rem;
								}
							}
						}
					}
					.competitionInfo__infoSection__mainData {
						flex: 1 1 0;
						display: flex;
						flex-direction: column;
						gap: 3px; // Much tighter spacing like legacy

						.event__header__infoSection__discipline {
							flex: 0 0 auto;
							font-size: 1.1rem;
						}

						.event__header__infoSection__calendarCode {
							flex: 0 0 auto;
							color: var(--color-text-secondary);
						}

						.competitionInfo__infoSection__location {
							flex: 0 0 auto;
							display: flex;
							align-items: center;
							gap: 0.5rem;
						}

						.competitionInfo__infoSection__date {
							flex: 0 0 auto;
						}

						.event__header__actions {
							display: flex;
							align-items: center;
							margin-top: 4px; // Reduced margin
							padding: 4px 0 2px; // Reduced padding

							// Mobile: Compact horizontal layout - no wrapping
							flex-wrap: nowrap;
							gap: var(--space-2); // Smaller gaps

							// Desktop: Preserve nowrap with larger gaps
							@media screen and (min-width: 768px) {
								flex-wrap: nowrap;
								gap: 1.5rem;
								margin-top: auto; // Restore auto margin
								padding: 8px 0 4px; // Restore desktop padding
							}

							.headerAction__wrapper {
								display: flex;
								align-items: center;
								color: var(--color-text-primary);
								cursor: pointer;
								user-select: none;

								&:hover {
									color: var(--text-hovered);
								}

								.headerAction__icon {
									height: 1rem;
									margin-right: 0.4rem;
								}

								span {
									font-size: 0.9rem;
									line-height: 0.9rem;
								}
							}
						}
					}

					.competitionInfo__infoSection__trackInfo {
						display: flex;
						flex-direction: column;
						margin-left: auto;

						.trackImage__container {
							position: relative;
							flex: 1 1 140px;
							display: flex;
							align-items: center;
							justify-content: center;
							width: 140px;

							.disciplineCode {
								position: absolute;
								top: 8px;
								left: 8px;

								font-size: 1.75rem;
								font-weight: bold;
								line-height: 1;
								content: '';
							}

							@media screen and (max-width: 1200px) {
								flex-basis: 100px;
								width: 100px;
							}
							@media screen and (max-width: 900px) {
								flex-basis: 80px;
								width: 80px;
							}

							img {
								max-height: 100%;
								max-width: 100%;
							}
						}

						.headerSwitch {
							flex: 0 0 auto;
							padding: 8px 0 4px;
							margin-top: auto;
							margin-left: auto;
							cursor: pointer;
						}
					}
				}
			}

			.eventAdditionalInfo__section {
				flex: 1 0 100%;
				display: grid;
				grid-template-rows: 0fr;
				transition: grid-template-rows var(--transition-duration-fast);

				&.opened {
					grid-template-rows: 1fr;
				}

				.additionalSection__content {
					display: flex;
					flex-wrap: wrap;
					gap: 8px;
					font-size: 0.85rem;
					color: var(--color-text-secondary);

					.juryList__wrapper {
						flex: 0 0 auto;
						display: table;
						border-spacing: 8px 4px;

						.juryItem {
							display: table-row;

							span {
								display: table-cell;
								white-space: nowrap;
							}

							.role {
							}

							.name {
							}

							.category {
							}
						}
					}

					.technicalInfo__wrapper {
						flex: 0 0 auto;
						display: flex;
						align-items: flex-start;
						gap: 8px;
						margin-left: auto;

						@media screen and (max-width: 720px) {
							margin-left: 0;
						}

						.trackParameters__wrapper {
							flex: 0 0 auto;
							display: table;
							border-spacing: 8px 4px;

							.trackParameters__item {
								display: table-row;

								.trackParameters__item__value {
									display: table-cell;
								}
							}
						}

						.conditions__wrapper {
							flex: 0 0 auto;
							display: table;
							border-spacing: 8px 4px;

							.conditions__item {
								display: table-row;

								.conditions__item__value {
									display: table-cell;
								}
							}
						}
					}

					.forerunners__wrapper {
						flex: 0 1 100%;
						padding: 8px;

						.forerunners__header {
							margin-bottom: 4px;
						}

						.forerunners__body {
							display: flex;
							flex-wrap: wrap;
							align-items: center;
							gap: 12px;

							.forerunners__item {
							}
						}
					}

					.eventFiles__wrapper {
						flex: 1 1 0;
						display: flex;
						flex-direction: column;
						gap: 4px;
						padding: 8px;

						.eventFiles__title {
							margin: 0 auto 0.75rem 1.25rem;
						}

						.eventFiles__list {
							display: flex;
							align-items: center;
							flex-wrap: wrap;
							gap: 0.75rem;

							.eventFile__item {
								flex: 0 0 auto;

								.eventFile__item__link {
									display: flex;
									align-items: center;
									color: var(--color-text-secondary);
									font-size: 0.9rem;
									transition: color var(--transition-duration-instant);

									.eventFile__item__icon {
										height: 1.15rem;
										margin-right: 0.25rem;
									}

									&:hover {
										color: var(--color-text-accent);
									}
								}
							}
						}
					}
				}
			}
		}

		.event_emptyData {
			display: flex;
			justify-content: center;
			padding: 8px;

			font-size: 1.25rem;
			background: var(--color-bg-surface);
			box-shadow: var(--surface-shadow-m);
			border: 1px solid var(--color-border-primary);
			border-radius: 4px;
		}
	}
}

.status__container {
	display: flex;
	justify-content: center;
	align-items: center;
	margin: auto;
	padding: 2rem 3rem;
	background: var(--color-bg-surface);
	backdrop-filter: blur(8px);
	color: white;
	border-radius: 4px;

	.eventLoadError {
		display: flex;
		justify-content: center;
		margin: auto;
		padding: 1rem;
		font-size: 1.1rem;
		font-weight: bold;
	}
}
</style>
