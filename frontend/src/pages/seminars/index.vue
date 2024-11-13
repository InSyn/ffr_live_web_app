<template>
  <div class="seminarsPage__wrapper">
    <search @search-loading="setLoadingState" @search-results-loaded="showSearchResults" mode="seminars"></search>

    <div class="seminars__list__wrapper">
      <calendar-carousel @set-calendar-date="setCalendarDate" :calendar-date-prop="calendarDate" :events="seminarsList"></calendar-carousel>

      <span class="emptySearchResults" v-if="getSeminarsList.length === 0 && !loading"> Семинары не найдены </span>
      <loader-spinner v-if="loading" class="loading__spinner"></loader-spinner>

      <div class="seminars__list">
        <router-link v-for="(seminar, idx) in getSeminarsList" :key="seminar._id" :to="{ name: 'seminarPage', params: { seminar_id: seminar._id } }">
          <div :class="['seminar__item__wrapper', idx % 2 === 0 && 'isEven', matchCalendarDate(seminar.date) && 'calendarDate-match']">
            <div class="seminar__item__header">
              <div class="seminar__item title">
                {{ seminar['title'] }}
              </div>
              <div class="seminar__item sport">
                {{ seminar['sport'] }}

                <country-flag class="countryFlag" :country-code="getCountryCode(seminar['country'])" height="1rem"></country-flag>
              </div>
            </div>

            <div class="seminar__item__footer">
              <div class="seminar__item region">
                <country-flag is-region-flag="true" country-code="RU" :region-code="getRegionCode(seminar.region)" width="calc(4px + 1rem)"></country-flag>
                {{ seminar['region'] }}
              </div>
              <div class="seminar__item date">
                {{ formatDate(seminar['date']) }}
              </div>
              <div class="seminar__item disciplines">
                {{ seminar.disciplines.join(', ') }}
              </div>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import Search from '@/components/ui-components/search/index.vue';
import { getDisciplineCode } from '@/store/data/sports';
import { getRegionCode } from '@/store/data/russia-regions';
import { formatDate } from '@/utils/data-formaters';
import CountryFlag from '@/components/ui-components/country-flag.vue';
import { getCountryCode } from '@/store/data/countries';
import { mapActions, mapGetters } from 'vuex';
import LoaderSpinner from '@/components/ui-components/loader-spinner.vue';
import CalendarCarousel from '@/components/ui-components/calendar-carousel.vue';
import axios from 'axios';
import { apiUrl } from '@/constants';

export default {
  name: 'seminarsPage',
  components: {
    CalendarCarousel,
    LoaderSpinner,
    CountryFlag,
    Search,
  },
  data() {
    return {
      calendarDate: new Date().toISOString().substring(0, 10),
      searchResults: null,
      loading: false,
    };
  },
  computed: {
    ...mapGetters('seminars', {
      seminarsList: 'getSeminars',
    }),
    getSeminarsList() {
      return this.searchResults === null ? this.seminarsList : this.searchResults;
    },
  },
  methods: {
    ...mapActions('seminars', {
      fetchSeminars: 'LOAD_SEMINARS',
      setSeminars: 'SET_SEMINARS',
    }),
    getCountryCode,
    formatDate,
    getRegionCode,
    getDisciplineCode,

    async loadSeminars() {
      if (this.seminarsList.length) return;

      this.setLoadingState(true);
      try {
        await this.fetchSeminars();
      } catch (e) {
        setTimeout(this.loadSeminars, 2000);
      } finally {
        this.setLoadingState(false);
      }
    },
    async loadSeminarsByCalendarDate(date) {
      if (!date) return;
      this.setLoadingState(true);

      try {
        const response = await axios.get(apiUrl + '/seminars/date-search/' + date);
        if (response.status === 200) {
          this.searchResults = [...response.data.seminars];
          this.setLoadingState(false);
        }
      } catch (e) {
        if (e) {
          console.error('Error fetching events:', e.response?.data?.message || e.message);
        }
      } finally {
        this.setLoadingState(false);
      }
    },
    showSearchResults(searchResults) {
      this.searchResults = searchResults;
    },
    setCalendarDate(date) {
      this.calendarDate = date;

      this.loadSeminarsByCalendarDate(date);
    },
    matchCalendarDate(date) {
      const seminarDate = new Date(date),
        calendarDate = new Date(this.calendarDate);

      return seminarDate.getDate() === calendarDate.getDate();
    },

    setLoadingState(state) {
      this.loading = state;
    },
  },

  mounted() {
    this.loadSeminars();
  },
};
</script>

<style scoped lang="scss">
.seminarsPage__wrapper {
  flex: 1 1 0;
  display: flex;
  flex-wrap: nowrap;
  height: 100%;
  width: 100%;
  max-width: var(--desktop-small);
  margin: 0 auto;
  padding: var(--padd-page);

  .seminars__list__wrapper {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;

    background-color: var(--background--card);
    box-shadow: var(--container-shadow-l);
    border: 1px solid var(--border-container);
    border-radius: 4px;

    .seminars__list {
      flex: 1 1 200px;
      display: flex;
      flex-direction: column;
      overflow-y: auto;

      .seminar__item__wrapper {
        display: flex;
        flex-direction: column;
        gap: 0.75rem 1.5rem;

        &.isEven {
          background-color: var(--background--diff);
        }

        &.calendarDate-match {
          padding-left: 6px;
          border-left: 4px solid var(--text-muted);
        }

        &:hover {
          background-color: var(--background--card-hover);
        }

        .seminar__item__header {
          flex: 0 0 auto;
          display: flex;
          flex-wrap: nowrap;
          align-items: flex-start;
          gap: 0.5rem 1rem;
          font-size: 1.15rem;

          .seminar__item.title {
            flex: 1 1 0;
            font-weight: bold;
          }

          .seminar__item.sport {
            flex: 0 0 auto;

            .countryFlag {
              margin-left: 0.5rem;
            }
          }
        }

        .seminar__item__footer {
          flex: 0 0 auto;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem 1rem;

          .seminar__item.region {
            flex: 0 0 auto;
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }

          .seminar__item.date {
            flex: 0 0 auto;
          }

          .seminar__item.disciplines {
            display: flex;
            justify-content: flex-end;
            flex-wrap: wrap;
            margin-left: auto;
          }
        }

        .seminar__item {
          display: flex;
          align-items: center;
          padding: 8px;
        }
      }
    }

    .emptySearchResults {
      align-self: center;
      display: inline-block;
      padding: 8px;
      font-size: 1.2rem;
      font-weight: bold;
      color: var(--text-muted);
    }
  }
}
</style>
