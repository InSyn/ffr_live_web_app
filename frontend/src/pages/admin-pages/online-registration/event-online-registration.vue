<script>
import CountryFlag from '@/components/ui-components/country-flag.vue';
import { mapActions } from 'vuex';
import { apiUrl, backendRootUrl } from '@/constants';
import { getCountryCode } from '@/store/data/countries';
import { getRegionCode } from '@/store/data/russia-regions';
import { formatDate } from '@/utils/data-formaters';
import LoaderSpinner from '@/components/ui-components/loader-spinner.vue';
import axios from 'axios';
import { exportRegistrationApplicationAthletesToExcel } from '@/utils/excelData-saver';
import { mdiDownload } from '@mdi/js';
import FileIcon from '@/components/icons/file-icon.vue';

export default {
  name: 'event-online-registration',
  props: {
    event_id: String,
  },
  components: { FileIcon, LoaderSpinner, CountryFlag },
  data() {
    return {
      event: null,

      registeredEventApplications: [],
      selectedApplication: null,

      loading: false,

      downloadIcon: mdiDownload,
    };
  },
  computed: {
    backendRootUrl() {
      return backendRootUrl;
    },
    uploadsFolderUrl() {
      return backendRootUrl;
    },
    getRegisteredApplications() {
      return this.registeredEventApplications.filter(Boolean);
    },
  },
  methods: {
    exportRegistrationApplicationAthletesToExcel,
    formatDate,
    getRegionCode,
    getCountryCode,
    ...mapActions('events', {
      loadEvent: 'LOAD_EVENT_BY_ID',
    }),
    async loadEventData() {
      this.loading = true;
      try {
        const eventData = await this.loadEvent(this.event_id);
        if (eventData) {
          this.event = eventData;

          await this.loadRegisteredEventApplications();
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    async loadRegisteredEventApplications() {
      try {
        const response = await axios.get(`${apiUrl}/event-online-registration/${this.event._id}`);

        if (response.status === 200) {
          this.registeredEventApplications = response.data.registrations;
        }
      } catch (e) {
        console.error(e);
      }
    },
    getRegisteredAthletesCount(group) {
      if (group) {
        return this.registeredEventApplications.reduce((acc, item) => acc + item.athletes.filter((athlete) => athlete.group === group).length, 0);
      }
      return this.registeredEventApplications.reduce((acc, item) => acc + item.athletes.length, 0);
    },
    selectApplication(application) {
      if (this.selectedApplication === application) {
        this.selectedApplication = null;
        return;
      }
      this.selectedApplication = application;
    },
    getApplicationAthletes(application, group) {
      return application.athletes.filter((athlete) => !!athlete && athlete.group === group).map((athlete) => athlete.athlete || {});
    },
  },

  mounted() {
    this.loadEventData();
  },
};
</script>

<template>
  <div class="onlineRegistration__page">
    <div v-if="event" class="onlineRegistration__wrapper">
      <h3 class="onlineRegistration__title">Онлайн регистрация события</h3>
      <div class="eventData__wrapper">
        <div class="eventImage__wrapper">
          <img :src="uploadsFolderUrl + event.logo_image_url" alt="EVENT_IMG" height="80px" />
        </div>
        <div class="eventInfo__wrapper">
          <div class="eventInfo__top">
            <div class="eventInfo__title">{{ event.title }}</div>
            <div class="eventInfo__sport">
              <country-flag
                :country-code="getCountryCode(event.country)"
                :region-code="getRegionCode(event.region)"
                height="1rem"
                rounding="2px"
              ></country-flag>
              {{ event.sport }}
            </div>
          </div>
          <div class="eventInfo__middle">
            <div class="eventInfo__discipline">{{ event.discipline }}</div>
            <div class="eventInfo__code">{{ event.calendar_code }}</div>
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
      <div v-if="!selectedApplication" class="registrationInfo__full__wrapper">
        <div class="registrationStats__wrapper">
          <div class="registeredApplicationsOverall">Заявок: {{ registeredEventApplications.length }}</div>
          <div class="registeredAthletesOverall">
            <span>Заявлено спортсменов: {{ getRegisteredAthletesCount() }}</span>
            <button class="downloadButton" type="button" @click.prevent="exportRegistrationApplicationAthletesToExcel(registeredEventApplications, true)">
              Скачать список <v-icon>{{ downloadIcon }}</v-icon>
            </button>
          </div>
          <div class="registeredEventGroups__wrapper">
            <div class="registeredEventGroups__item" v-for="group in event.athletes_groups" :key="group">
              <span>Группа:&nbsp;{{ group }}</span>
              <span>Заявлено спортсменов - {{ getRegisteredAthletesCount(group) }}</span>
            </div>
          </div>
        </div>
        <div class="registeredApplications__wrapper">
          <h4 class="registeredApplications__title">Зарегистрированные заявки</h4>
          <div class="registeredApplications__body">
            <div class="registeredApplications__list">
              <div class="registeredApplications__list__item" v-for="application in getRegisteredApplications" :key="application._id">
                <div class="registeredApplications__list__item__info">
                  <span> {{ application.creator_username }}</span
                  ><span> {{ formatDate(application.created_at, { full: true }) }}</span>
                </div>
                <button class="registeredApplications__list__item__action actionButton" type="button" @click.prevent="selectApplication(application)">
                  Открыть
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="registrationInfo__application__wrapper">
        <div class="registrationInfo__application__header">
          <div class="registrationInfo__application__header__title">
            <button class="actionButton" type="button" @click.prevent="selectedApplication = null">Назад</button>
            <span>Заявка</span>
            <button class="downloadButton" type="button" @click.prevent="exportRegistrationApplicationAthletesToExcel(selectedApplication)">
              Скачать список
              <v-icon class="downloadStats__icon">
                {{ downloadIcon }}
              </v-icon>
            </button>
          </div>
          <div class="registrationInfo__application__header__body">
            <div class="registrationInfo__application__region">{{ selectedApplication.region }}</div>
            <div class="registrationInfo__application__date">{{ formatDate(selectedApplication.created_at, { full: true }) }}</div>
          </div>
        </div>
        <div class="registrationInfo__application__athletesGroups">
          <div class="registrationInfo__application__athletesGroups__item" v-for="group in event.athletes_groups" :key="group">
            <div class="registrationInfo__application__athletesGroups__item__title">Группа: {{ group }} {{ getRegisteredAthletesCount(group) }}</div>
            <ol class="registrationInfo__application__athletesGroups__item__athletes">
              <li
                class="registrationInfo__application__athletesGroups__item__athletes__item"
                v-for="athlete in getApplicationAthletes(selectedApplication, group)"
                :key="athlete._id"
              >
                <span>{{ `${athlete.lastname} ${athlete.name}` }}</span>
                <span>{{ ` - ${athlete.ffr_id}` }}</span>
              </li>
            </ol>
          </div>
        </div>
        <div class="registrationInfo__application__documents">
          <div class="registrationInfo__application__documents__title">Документы</div>
          <div class="registrationInfo__application__documents__list">
            <a
              class="registrationInfo__application__documents__list__item"
              v-for="document in selectedApplication.documents.filter(Boolean)"
              :key="document._id"
              :href="backendRootUrl + `${document.file.url}`"
            >
              <file-icon class="document__icon"></file-icon>
              {{ document.title }}
            </a>
          </div>
        </div>
      </div>
    </div>
    <loader-spinner v-else></loader-spinner>
  </div>
</template>

<style scoped lang="scss">
.onlineRegistration__page {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: var(--padd-page);

  .onlineRegistration__wrapper {
    flex: 1 1 200px;
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: var(--tablet-default);
    margin: 2rem auto;
    padding: var(--padd-entityPage-card);

    background-color: var(--background--card);
    box-shadow: var(--container-shadow-m);
    border: 1px solid var(--border-container);
    border-radius: 4px;

    .onlineRegistration__title {
      padding-bottom: 1.25rem;
      border-bottom: 1px solid var(--border-container);
    }
    .eventData__wrapper {
      flex: 0 0 auto;
      display: flex;
      flex-wrap: nowrap;
      gap: 0 1.25rem;
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
    .registrationInfo__full__wrapper {
      flex: 1 1 0;
      display: flex;
      flex-direction: column;

      .registrationStats__wrapper {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding: 0.5rem;
        font-size: 0.9rem;

        .registeredApplicationsOverall {
          flex: 0 0 auto;
          font-size: 1.1rem;
        }
        .registeredAthletesOverall {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 1.1rem;
        }
        .registeredEventGroups__wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;

          .registeredEventGroups__item {
            display: flex;
            gap: 0 0.75rem;

            & > * {
              display: inline-block;
              &:nth-child(1) {
                padding: 0 0.25rem 0.25rem;
              }
            }
          }
        }
      }
      .registeredApplications__wrapper {
        flex: 1 1 200px;
        display: flex;
        flex-direction: column;
        margin-top: 1.25rem;
        padding: 0.5rem;

        .registeredApplications__title {
          flex: 0 0 auto;
          padding: 0 1.25rem 0.75rem;
        }
        .registeredApplications__body {
          flex: 1 1 0;
          overflow-y: auto;
          border-top: 1px solid var(--border-container);
          border-bottom: 1px solid var(--border-container);

          .registeredApplications__list {
            flex: 0 0 auto;
            display: flex;
            flex-direction: column;

            .registeredApplications__list__item {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 0.5rem 1rem;
              font-size: 0.9rem;
              transition: background-color 92ms;

              &:hover {
                background-color: var(--background--card-hover);
              }
              .registeredApplications__list__item__info {
                flex: 1 1 0;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1.25rem;
                margin-right: 2rem;

                & > * {
                  display: inline-block;
                }
              }
            }
          }
        }
      }
    }
    .registrationInfo__application__wrapper {
      display: flex;
      flex-direction: column;
      .registrationInfo__application__header {
        flex: 0 0 auto;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 0.5rem;
        border-top: 1px solid var(--border-container);
        border-bottom: 1px solid var(--border-container);

        .registrationInfo__application__header__title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 1.1rem;
        }
        .registrationInfo__application__header__body {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
          .registrationInfo__application__date {
            font-size: 0.9rem;
            color: var(--text-depressed);
          }
        }
      }
      .registrationInfo__application__documents {
        padding: 0.5rem;

        .registrationInfo__application__documents__title {
          margin-bottom: 0.5rem;
        }
        .registrationInfo__application__documents__list {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.25rem 0.75rem;

          .registrationInfo__application__documents__list__item {
            flex: 0 0 auto;
            display: flex;
            align-items: center;
            gap: 0.25rem;
            text-decoration: underline;

            .document__icon {
              height: 1rem;
              color: var(--accent);
            }
            &:hover {
              text-decoration: none;
            }
          }
        }
      }
      .registrationInfo__application__athletesGroups {
        .registrationInfo__application__athletesGroups__item {
          padding: 0.5rem;
          border-bottom: 1px solid var(--border-container);
          .registrationInfo__application__athletesGroups__item__title {
            margin-bottom: 0.5rem;
          }
          .registrationInfo__application__athletesGroups__item__athletes {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            .registrationInfo__application__athletesGroups__item__athletes__item {
              color: var(--text-depressed);
              font-size: 0.9rem;
            }
          }
        }
      }
    }
  }
}
</style>
