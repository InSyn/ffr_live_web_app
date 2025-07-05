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
      registeredApplications: [],
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

          await this.loadRegisteredApplications();
        }
      } catch (e) {
        if (e) {
          console.log(e?.response?.data?.message);
        }
      }
    },
    async loadRegisteredApplications() {
      try {
        const response = await axios.get(`${apiUrl}/event-online-registration/registered-applications`, {
          headers: {
            authorization: `Bearer ${this.userData.token}`,
          },
        });

        if (response.status === 200) {
          const { registrations } = response.data;
          if (!registrations.length) return;

          this.registeredApplications = registrations;
        }
      } catch (e) {
        console.error(e?.response?.data?.message);
      }
    },
    checkRegisteredApplication(eventId) {
      const registeredApplication = this.registeredApplications.find((application) => application.event_id === eventId);
      if (!registeredApplication) return false;

      return registeredApplication._id;
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
      <div :class="['eventsWithRegistration__list__item', idx % 2 === 0 && 'even']" v-for="(eventReg, idx) in getFilteredEvents" :key="eventReg._id">
        <competition-list-item :event="eventReg"></competition-list-item>
        <div class="registration__actions">
          <router-link
            :to="{
              name: 'eventOnlineRegistrationApplication',
              params: { event_id: eventReg.event_id, application_id: checkRegisteredApplication(eventReg._id) || null },
            }"
          >
            <button v-if="!checkRegisteredApplication(eventReg._id)" class="actionButton" type="button">Подать заявку</button>
            <button v-else class="actionButton" type="button">Редактировать</button>
          </router-link>
        </div>
      </div>
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

    .eventsWithRegistration__list__item {
      flex: 0 0 auto;
      display: flex;
      flex-wrap: nowrap;

      & > *:first-child {
        flex: 1 1 0;
        pointer-events: none;
      }
      .registration__actions {
        flex: 0 0 auto;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 0.5rem;

        margin: 1rem 0;
        padding: 0.5rem 0.75rem;
        border-left: 1px solid var(--border-container);
      }
    }
  }
}
</style>
