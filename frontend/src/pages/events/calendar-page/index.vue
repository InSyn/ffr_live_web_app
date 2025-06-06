<template>
  <div class="eventsPage__wrapper">
    <search mode="events" @search-loading="setLoadingState" @search-results-loaded="showSearchResults"></search>
    <search-mobile mode="events" @search-loading="setLoadingState" @search-results-loaded="showSearchResults"> </search-mobile>

    <div class="eventsList__wrapper">
      <calendar-carousel @set-calendar-date="setCalendarDate" :calendar-date-prop="calendarDate" :events="eventsList"></calendar-carousel>

      <span class="emptySearchResults" v-if="getFilteredEvents.length === 0 && !loading"> События не найдены </span>
      <loader-spinner v-if="loading" class="loading__spinner"></loader-spinner>

      <div class="eventsList__list">
        <router-link
          v-for="(event, idx) in getFilteredEvents"
          :key="event._id"
          :to="{
            name: 'eventPage',
            params: { event_id: event['event_id'] },
          }"
        >
          <competition-list-item :event="event" :index="idx" :date-match="matchEventDate(event['start_at'])"></competition-list-item
        ></router-link>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { mapActions, mapGetters } from 'vuex';
import Search from '@/components/ui-components/search/index.vue';
import LoaderSpinner from '@/components/ui-components/loader-spinner.vue';
import { apiUrl, backendRootUrl } from '@/constants';
import { mdiImage } from '@mdi/js';
import CalendarCarousel from '@/components/ui-components/calendar-carousel.vue';
import CompetitionListItem from '@/pages/events/competition-list-item.vue';
import SearchMobile from '@/components/ui-components/search/search-mobile.vue';

export default {
  name: 'calendarPage',
  data() {
    return {
      calendarDate: new Date().toISOString().substring(0, 10),
      calendarDateFilter: null,
      searchResults: null,

      loading: false,

      imageFillerIcon: mdiImage,
    };
  },
  computed: {
    ...mapGetters('events', {
      eventsList: 'getEvents',
    }),
    uploadsFolderUrl() {
      return backendRootUrl;
    },

    getFilteredEvents() {
      const events = this.searchResults === null ? this.eventsList : this.searchResults;

      return events.sort((a, b) => {
        const aMatch = this.matchEventDate(a.start_at);
        const bMatch = this.matchEventDate(b.start_at);

        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      });
    },
  },
  methods: {
    ...mapActions('events', {
      fetchEvents: 'SET_EVENTS',
    }),
    setCalendarDate(date) {
      this.calendarDate = date;

      this.loadEventsByCalendarDate(date);
    },
    async loadAllEvents() {
      if (this.eventsList.length) return;

      this.setLoadingState(true);
      try {
        await this.fetchEvents();
      } catch (e) {
        setTimeout(this.loadAllEvents, 2000);
      } finally {
        this.setLoadingState(false);
      }
    },
    async loadEventsByCalendarDate(date) {
      if (!date) return;
      this.setLoadingState(true);

      try {
        const response = await axios.get(apiUrl + '/events/date-search/' + date);
        if (response.status === 200) {
          this.searchResults = [...response.data.events];
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
    matchEventDate(eDate) {
      const evtDate = new Date(eDate),
        calDate = new Date(this.calendarDate);

      return evtDate.getDate() === calDate.getDate();
    },

    setLoadingState(state) {
      this.loading = state;
    },
    showSearchResults(searchResults) {
      this.searchResults = searchResults;
    },
  },
  components: {
    SearchMobile,
    CompetitionListItem,
    CalendarCarousel,
    LoaderSpinner,
    Search,
  },

  mounted() {
    this.loadAllEvents();
  },
};
</script>

<style scoped lang="scss">
.loading__spinner {
  margin: auto;
}

.eventsPage__wrapper {
  flex: 1 1 0;
  display: flex;
  flex-wrap: nowrap;
  height: 100%;
  width: 100%;
  max-width: var(--desktop-small);
  margin: 0 auto;
  padding: var(--padd-page);
}

.eventsList__wrapper {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;

  background-color: var(--background--card);
  box-shadow: var(--container-shadow-l);
  border: 1px solid var(--border-container);
  border-radius: 4px;

  .eventsList__list {
    flex: 1 1 200px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
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
</style>
