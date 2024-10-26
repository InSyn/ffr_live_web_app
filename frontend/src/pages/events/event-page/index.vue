<template>
  <div class="eventPage__wrapper">
    <div v-if="event" class="event__container">
      <div class="stagesList__wrapper">
        <button
          @click="selectStage(stage)"
          v-for="stage in eventStages"
          :key="stage['competition_id']"
          :class="['stage__button', selectedStage && stage['competition_id'] === selectedStage && 'isSelectedStage']"
        >
          {{ stage['stage'] }}
        </button>
      </div>

      <div :class="['event__header', !showHeader && 'minimized']">
        <div class="event__header__leftSection">
          <div class="competitionImage__container">
            <img v-if="event['logo_image_url']" :src="uploadsFolderUrl + event['logo_image_url']" alt="Event Logo" />
            <competition-image-filler-icon v-else class="competitionImage__imageFiller__icon"></competition-image-filler-icon>
          </div>

          <div v-if="event['translation_url']" v-show="showHeader" class="eventTranslation__wrapper">
            <a class="eventTranslation__link" :href="event['translation_url']" target="_blank">
              <event-translation-icon class="eventTranslation__icon"></event-translation-icon>
              <span>Трансляция</span>
            </a>
          </div>
        </div>

        <div class="eventInfo__wrapper">
          <div class="competitionInfo__header">
            <div class="event__header__titleSection">
              <div class="event__header__titleSection__title">
                {{ event['title'] }}
                <edit-button type="event" :code="event.event_id"></edit-button>
              </div>
              <div v-show="showHeader && event['calendar_code']" class="event__header__titleSection__calendarCode">
                {{ 'ЕКП:&nbsp;' + event['calendar_code'] }}
              </div>
            </div>

            <div class="event__header__sportSection">
              <span>{{ event['sport'] }}</span>
              <country-flag v-if="event.country" class="eventImage__countryFlag" :country-code="getCountryCode(event.country)" width="1.75rem"></country-flag>
            </div>
          </div>

          <div class="competitionInfo__infoSection">
            <div class="competitionInfo__infoSection__mainData">
              <div class="event__header__infoSection__discipline">
                {{ event['discipline'] }}
                <span v-show="!showHeader">{{ '&nbsp;' + formatDate(event['start_at'], { full: true }) }}</span>
              </div>

              <div v-show="showHeader" class="competitionInfo__infoSection__location">
                <country-flag
                  class="competitionImage__regionFlag"
                  :country-code="getCountryCode(event.country)"
                  :region-code="getRegionCode(event.region)"
                  :is-region-flag="true"
                  height="1.25rem"
                  rounding="2px"
                ></country-flag>
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
                <div @click="toggleAdditionalSection('pedestal')" class="headerAction__wrapper">
                  <medal-icon class="headerAction__icon"></medal-icon>
                  <span>Пъедестал</span>
                </div>
                <div @click="toggleAdditionalSection('technical')" class="headerAction__wrapper">
                  <info-icon class="headerAction__icon"></info-icon>
                  <span>Техническая информация</span>
                </div>
                <div @click="toggleAdditionalSection('files')" class="headerAction__wrapper">
                  <file-icon class="headerAction__icon"></file-icon>
                  <span>Файлы</span>
                </div>
              </div>
            </div>

            <div class="competitionInfo__infoSection__trackInfo">
              <div v-show="showHeader" class="trackImage__container">
                <img v-if="event['track_image_url']" :src="uploadsFolderUrl + `${event['track_image_url']}`" alt="Track Image" />
                <span class="disciplineCode" v-if="event['discipline']">
                  {{ getDisciplineCode(event['discipline']) }}
                </span>
              </div>
              <div @click="toggleHeader()" class="headerSwitch">
                <span v-if="showHeader">Скрыть шапку</span>
                <span v-else>Показать шапку</span>
              </div>
            </div>
          </div>
        </div>

        <div :class="['eventAdditionalInfo__section', additionalSection && 'opened']">
          <event-pedestal v-if="additionalSection === 'pedestal'" :competition="competition"></event-pedestal>

          <div v-else-if="additionalSection === 'technical'" class="additionalSection__content">
            <div class="juryList__wrapper">
              <div class="juryItem" v-for="(jury, idx) in juryList" :key="idx">
                <span class="role">{{ jury.role }}</span>
                <span class="name">{{ `${jury.lastname} ${jury.name}` }}</span>
                <span class="category">{{ jury.category }}</span>
              </div>
            </div>
            <div class="technicalInfo__wrapper">
              <div class="trackParameters__wrapper">
                <div class="trackParameters__item" v-for="(parameter, idx) in event['track_info']" :key="idx">
                  <span class="trackParameters__item__value" v-for="(val, idx) in parameter.split('@')" :key="idx">
                    {{ val }}
                  </span>
                </div>
              </div>
              <div class="conditions__wrapper">
                <div class="conditions__item" v-for="(parameter, idx) in event['conditions']" :key="idx">
                  <span class="conditions__item__value" v-for="(val, idx) in parameter.split('@')" :key="idx">
                    {{ val }}
                  </span>
                </div>
              </div>
            </div>
            <div class="forerunners__wrapper" v-if="event['forerunners'].length">
              <div class="forerunners__header">Открывающие</div>
              <div class="forerunners__body">
                <div class="forerunners__item" v-for="(forerunner, idx) in event['forerunners']" :key="idx">
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
                  <a v-if="document?.file?.url" :href="`${uploadsFolderUrl}${document.file.url}`" target="_blank" class="eventFile__item__link">
                    <file-icon class="eventFile__item__icon"></file-icon>
                    {{ document.title }}
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="additionalSection__content">&nbsp;</div>
        </div>
      </div>

      <div class="event_emptyData" v-if="event && event['competitions'] && event['competitions'].length < 1">Результаты события ещё не добавлены</div>

      <results-table v-if="competition && competition['races'].length > 0" :competition="competition" :selectedStage="selectedStage"></results-table>
    </div>

    <div v-if="!event && !eventIsLoading" class="status__container">Такого события не существует</div>
    <loader-spinner v-if="!event && eventIsLoading" class="loader__spinner"></loader-spinner>
  </div>
</template>

<script>
import axios from 'axios';
import ResultsTable from '@/pages/events/event-page/resultsTable.vue';
import { formatDate } from '@/utils/data-formaters';
import LoaderSpinner from '@/components/ui-components/loader-spinner.vue';
import { databaseUrl, uploadsFolderUrl } from '@/store/constants';
import { mdiImage } from '@mdi/js';
import CompetitionImageFillerIcon from '@/assets/svg/competitionImageFiller-icon.vue';
import CountryFlag from '@/components/ui-components/country-flag.vue';
import EventTranslationIcon from '@/components/icons/eventTranslation-icon.vue';
import InfoIcon from '@/components/icons/info-icon.vue';
import FileIcon from '@/components/icons/file-icon.vue';
import { getDisciplineCode, sports } from '@/store/data/sports';
import EventPedestal from '@/pages/events/event-page/eventPedestal.vue';
import MedalIcon from '@/components/icons/medal-icon.vue';
import EditButton from '@/components/ui-components/edit-button.vue';
import { getCountryCode } from '@/store/data/countries';
import { getRegionCode } from '@/store/data/russia-regions';

export default {
  components: {
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
  },
  props: ['event_id'],
  name: 'result',
  data() {
    return {
      event: null,
      selectedStage: null,

      updateTimeoutId: null,
      eventIsLoading: false,

      showHeader: true,
      additionalSection: null,

      imageFillerIcon: mdiImage,
    };
  },
  computed: {
    uploadsFolderUrl() {
      return uploadsFolderUrl;
    },
    sports() {
      return sports;
    },

    eventStages() {
      return this.event['competitions'] || [];
    },
    competition() {
      if (!this.event['competitions']) return;

      const stage = this.event['competitions'].find((competition) => competition['competition_id'] === this.selectedStage);
      if (!stage) return null;

      return stage;
    },
    juryList() {
      const juryArr = this.event['jury'] || [],
        judgesArr = this.event['judges'] || [];

      return juryArr.concat(judgesArr);
    },
  },
  methods: {
    getRegionCode,
    getCountryCode,
    getDisciplineCode,
    formatDate,

    async getEventById() {
      this.eventIsLoading = true;

      try {
        const response = await axios.get(databaseUrl + '/events/' + this.$route.params.event_id);
        if (response.status === 200) {
          const eventData = response.data.event;
          if (eventData.event_id === this.$route.params.event_id) this.event = eventData;

          this.setupStage();
          this.updateTimeoutId = setTimeout(() => this.getEventById(), 2000);
        }
      } catch (e) {
        if (e) {
          throw new Error(`Unable to load event data. ${e?.response?.data?.message || e.message}`);
        }
      } finally {
        this.eventIsLoading = false;
      }
    },

    selectStage(stage) {
      this.selectedStage = stage['competition_id'];
    },
    setupStage() {
      if (!this.selectedStage && this.event && this.event['competitions'].length > 0) this.selectStage(this.event['competitions'][0]);
    },

    toggleHeader() {
      this.showHeader = !this.showHeader;
    },
    toggleAdditionalSection(section) {
      if (this.additionalSection && this.additionalSection === section) {
        this.additionalSection = null;
        return;
      }

      this.additionalSection = section;
    },
  },

  watch: {
    additionalSection(newVal) {
      if (newVal === 'pedestal') {
        this.showHeader = false;
      }
    },
  },

  mounted() {
    this.getEventById();
  },
  beforeDestroy() {
    clearTimeout(this.updateTimeoutId);
  },
};
</script>

<style scoped lang="scss">
.eventPage__wrapper {
  flex: 1 1 auto;
  display: flex;

  .event__container {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    height: 100%;
    max-width: var(--desktop-small);
    margin: 0 auto;
    padding: 4rem 64px 2rem;
    position: relative;

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
        background-color: var(--background--card);
        border-radius: 2px;
        cursor: pointer;
        transition: background-color 92ms, color 92ms;

        &:hover,
        &:focus {
          color: var(--text-contrast);
          background-color: var(--ffr-brand);
        }
      }

      .isSelectedStage {
        color: var(--text-contrast);
        background-color: var(--ffr-brand);
        font-weight: bold;
      }
    }

    .event__header {
      flex: 0 0 auto;
      display: flex;
      flex-wrap: wrap;
      margin-bottom: 16px;
      padding: 1.25rem 0.75rem 0.75rem;

      border-radius: 4px;
      background-color: var(--background--card);
      box-shadow: var(--container-shadow-m);
      border: 1px solid var(--border-container);

      &.minimized > .event__header__leftSection > .competitionImage__container {
        height: 96px;
        padding: 0.5rem;

        @media screen and (max-width: 1200px) {
          height: 80px;
        }
        @media screen and (max-width: 900px) {
          height: 60px;
        }
      }

      .event__header__leftSection {
        flex: 0 0 auto;
        display: flex;
        flex-direction: column;

        .competitionImage__container {
          position: relative;
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 128px;
          aspect-ratio: 1;
          padding: 0.75rem;

          img {
            flex: 1 1 0;
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
          margin-top: auto;
          padding: 8px;

          .eventTranslation__link {
            display: flex;
            flex-direction: column;
            justify-content: center;
            color: var(--text-default);

            &:hover {
              color: var(--text-hovered);
            }

            span {
              display: inline-block;
              margin-top: 4px;
              font-size: 0.85rem;
            }

            .eventTranslation__icon {
              height: 1.5rem;
            }
          }
        }
      }

      .eventInfo__wrapper {
        flex: 1 1 0;
        display: flex;
        flex-direction: column;
        margin-left: 4px;

        .competitionInfo__header {
          flex: 0 0 auto;
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;

          .event__header__titleSection {
            flex: 1 1 0;
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding: 8px;

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
            margin-left: auto;
            padding: 8px 12px;
            font-size: 1.25rem;

            .eventImage__countryFlag {
              margin-left: 12px;
            }
          }
        }

        .competitionInfo__infoSection {
          flex: 0 0 auto;
          display: flex;
          margin-top: auto;
          padding: 8px;

          .competitionInfo__infoSection__mainData {
            flex: 1 1 0;
            display: flex;
            flex-direction: column;
            gap: 8px;

            .event__header__infoSection__discipline {
              flex: 0 0 auto;
              font-size: 1.1rem;
            }

            .event__header__infoSection__calendarCode {
              flex: 0 0 auto;
              color: var(--text-muted);
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
              flex-wrap: nowrap;
              gap: 1.5rem;
              margin-top: auto;
              padding: 8px 0 4px;

              .headerAction__wrapper {
                display: flex;
                align-items: center;
                color: var(--text-default);
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
        transition: grid-template-rows 92ms;

        &.opened {
          grid-template-rows: 1fr;
        }

        .additionalSection__content {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          overflow: hidden;
          font-size: 0.85rem;
          color: var(--text-muted);

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
            flex: 0 0 auto;
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding: 8px;

            .eventFiles__title {
              margin-left: 1.25rem;
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
                  color: var(--text-muted);
                  font-size: 1.15rem;
                  transition: color 64ms;

                  .eventFile__item__icon {
                    height: 1.15rem;
                    margin-right: 0.25rem;
                  }

                  &:hover {
                    color: var(--accent);
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
      background: var(--background--card);
      box-shadow: var(--container-shadow-m);
      border: 1px solid var(--border-container);
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
  background: var(--background--card);
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
