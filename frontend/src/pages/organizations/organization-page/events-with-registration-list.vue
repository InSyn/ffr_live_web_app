<script>
import CompetitionListItem from '@/pages/events/competition-list-item.vue';
import axios from 'axios';
import { apiUrl } from '@/constants';
import { mapGetters } from 'vuex';

export default {
  name: 'events-with-registration-list',
  components: { CompetitionListItem },
  data() {
    return {
      events: [],
    };
  },
  computed: {
    ...mapGetters('authorization', {
      userData: 'getUserData',
    }),
    getFilteredEvents() {
      const role = this.userData.role;
      if (role === 'regional_organization') {
        return this.events.filter((event) => event.allow_registration_by_organization);
      }
      if (role === 'trainer') {
        return this.events.filter((event) => event.allow_registration_by_trainer);
      }
      if (role === 'admin') {
        return this.events;
      }
      return [];
    },
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
  <div class="eventsWithRegistration__wrapper">
    <div class="eventsWithRegistration__list">
      <router-link
        :class="['eventsWithRegistration__list__item', idx % 2 === 0 && 'even']"
        v-for="(eventReg, idx) in getFilteredEvents"
        :key="eventReg._id"
        :to="{ name: 'eventOnlineRegistrationApplication', params: { event_id: eventReg.event_id } }"
      >
        <competition-list-item :event="eventReg"></competition-list-item>
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
  border: 1px solid var(--border-container);
  border-radius: 4px;

  .eventsWithRegistration__list {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
  }
}
</style>
