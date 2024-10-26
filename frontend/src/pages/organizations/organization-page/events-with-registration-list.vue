<script>
import CompetitionListItem from '@/pages/events/calendar-page/competition-list-item.vue';
import axios from 'axios';
import { databaseUrl } from '@/store/constants';

export default {
  name: 'events-with-registration-list',
  components: { CompetitionListItem },
  data() {
    return {
      events: [],
    };
  },
  methods: {
    async loadEventsWithRegistration() {
      try {
        const response = await axios.get(databaseUrl + '/events/opened-registration');
        if (response.status === 200) {
          this.events = response.data.events;
        }
      } catch (e) {
        if (e) {
          console.log(e?.response?.data?.message);
        }
      }
    },
  },

  mounted() {
    this.loadEventsWithRegistration();
  },
};
</script>

<template>
  <div class="eventsWithRegistration__wrapper">
    <div class="eventsWithRegistration__list">
      <router-link
        :class="['eventsWithRegistration__list__item', idx % 2 === 0 && 'even']"
        v-for="(event, idx) in events"
        :key="event._id"
        :to="{ name: 'eventOnlineRegistrationApplication', params: { event_id: event.event_id } }"
      >
        <competition-list-item :event="event"></competition-list-item>
      </router-link>
    </div>
  </div>
</template>

<style scoped lang="scss">
.eventsWithRegistration__wrapper {
  flex: 1 1 200px;
  overflow-y: auto;
  background-color: var(--background--card);
  box-shadow: var(--container-shadow-m);
  border: var(--border-container);
  border-radius: 4px;

  .eventsWithRegistration__list {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
  }
}
</style>
