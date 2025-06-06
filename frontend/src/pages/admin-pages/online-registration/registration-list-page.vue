<script>
import axios from 'axios';
import { apiUrl } from '@/constants';
import CompetitionListItem from '@/pages/events/competition-list-item.vue';

export default {
  name: 'registration-list-page',
  components: { CompetitionListItem },
  data() {
    return {
      events: [],
    };
  },
  methods: {
    async loadEventsWithRegistration() {
      try {
        const response = await axios.get(apiUrl + '/events/opened-registration');
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
  <div class="registrationListPage__wrapper">
    <div class="registrationList__wrapper">
      <div class="registrationList__title">Список событий с открытой регистрацией</div>
      <div class="registrationList__list">
        <router-link
          :class="['registrationList__list__item', idx % 2 === 0 && 'even']"
          v-for="(event, idx) in events"
          :key="event._id"
          :to="{ name: 'eventOnlineRegistration', params: { event_id: event.event_id } }"
        >
          <competition-list-item :event="event"></competition-list-item>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.registrationListPage__wrapper {
  flex: 1 1 0;
  display: flex;
  max-width: var(--desktop-small);
  margin: 0 auto;
  padding: var(--padd-page);

  .registrationList__wrapper {
    display: flex;
    flex-direction: column;
    flex: 1 1 0;

    max-width: var(--desktop-small);
    width: 100%;
    margin: 0 auto;

    background-color: var(--background--card);
    box-shadow: var(--container-shadow-l);
    border: 1px solid var(--border-container);
    border-radius: 4px;

    .registrationList__title {
      flex: 0 0 auto;
      padding: 0.75rem 2.5rem;
      font-size: 1.2rem;
      font-weight: bold;
      border-bottom: 1px solid var(--border-container);
    }
    .registrationList__list {
      flex: 1 1 300px;
      display: flex;
      flex-direction: column;
      overflow-y: auto;

      .registrationList__list__item {
        flex: 0 0 auto;
      }
    }
  }
}
</style>
