<template>
  <div class="editEventPage__wrapper">
    <v-fade-transition mode="out-in">
      <online-registration-section
        v-if="showRegistrationSection"
        :registration-data="registration_data"
        @save-online-registration-data="saveOnlineRegistrationData"
        @close-online-registration="showRegistrationSection = false"
      ></online-registration-section>
      <event-form
        v-else
        :event="event"
        :event-images="eventImages"
        action="update"
        @update-event="updateEvent"
        @delete-event="deleteEvent"
        @open-online-registration="showRegistrationSection = true"
      >
      </event-form>
    </v-fade-transition>
    <message-container :errors="errors" :messages="messages"></message-container>
  </div>
</template>

<script>
import axios from 'axios';
import { apiUrl } from '@/constants';
import { mapActions, mapGetters } from 'vuex';
import MessageContainer from '@/components/ui-components/message-container.vue';
import EventForm from '@/pages/admin-pages/events/form-event.vue';
import { formatDate } from '@/utils/data-formaters';
import OnlineRegistrationSection from '@/pages/admin-pages/events/onlineRegistrationSettingsSection.vue';

export default {
  name: 'editEventPage',
  components: { OnlineRegistrationSection, EventForm, MessageContainer },
  props: {
    event_id: String,
  },
  data() {
    return {
      event: {
        title: '',
        start_at: '',
        sport: '',
        discipline: '',
        country: '',
        country_code: '',
        region: '',
        region_code: '',
        location: '',
        organization: '',
        calendar_code: '',
        timing_provider: '',
        translation_url: '',
        international: false,
        documents: [],
        is_public: true,
      },
      eventImages: {
        logo_image_url: '',
        track_image_url: '',
        organization_logo: '',
      },
      registration_data: null,

      messages: [],
      errors: [],

      showRegistrationSection: false,
    };
  },
  computed: {
    ...mapGetters('authorization', {
      userData: 'getUserData',
    }),
  },
  methods: {
    ...mapActions('events', {
      fetchEvents: 'SET_EVENTS',
    }),
    async loadEventData() {
      try {
        const response = await axios.get(`${apiUrl}/events/${this.event_id}`);
        if (response.status === 200) {
          const eventData = response.data.event;
          Object.keys(this.event).forEach((key) => {
            if (key in eventData) {
              if (key === 'start_at') {
                if (eventData[key]) {
                  this.event[key] = formatDate(eventData[key], {
                    toInputFormat: true,
                  });
                }
                return;
              }
              this.event[key] = eventData[key];
            }
          });

          this.eventImages = {
            logo_image_url: eventData.logo_image_url,
            track_image_url: eventData.track_image_url,
            organization_logo: eventData.organization_logo,
          };
          this.registration_data = {
            registrationStatus: eventData.registration_status,
            allowTrainers: eventData.allow_registration_by_trainer,
            allowOrganizations: eventData.allow_registration_by_organization,
            allowedSecretaries: eventData.allowed_secretaries,
            registrationGroups: eventData.athletes_groups,
          };
        }
      } catch (err) {
        if (err) {
          this.errors.push(err.response?.data?.message || err.message);
        }
      }
    },
    async updateEvent(selectedFile) {
      const formData = new FormData();

      Object.keys(this.event).forEach((key) => {
        const value = this.event[key];

        if (key === 'documents') return;

        if (Array.isArray(value) || typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          if (key === 'start_at') {
            formData.append(key, new Date(value).toISOString());
            return;
          }
          formData.append(key, value);
        }
      });

      if (this.event.documents.length) {
        const documents = this.event.documents.filter((doc) => doc.file);

        const filteredDocuments = documents.filter((doc) => doc.file?.url || doc.file?.newFile);

        formData.append(
          'documents',
          JSON.stringify(
            filteredDocuments.map((doc) => {
              const file = doc.file?.newFile ? {} : doc.file;
              return {
                title: doc.title,
                created_at: doc.created_at,
                file: file,
              };
            })
          )
        );

        filteredDocuments.forEach((doc, index) => {
          if (doc.file?.newFile) {
            formData.append(`document${index}`, doc.file?.newFile);
          }
        });
      }

      for (const imageKey in selectedFile) {
        formData.append(imageKey, selectedFile[imageKey]);
      }

      try {
        const response = await axios.put(`${apiUrl}/events/${this.event_id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            authorization: `Bearer ${this.userData.token}`,
          },
        });

        if (response.status === 200) {
          this.messages.push('Информация о событии успешно обновлена');
          await this.fetchEvents();

          setTimeout(() => {
            if (this.$route.name === 'editEventPage') this.$router.push({ name: 'eventPage', params: { event_id: this.event_id } });
          }, 1280);
        }
      } catch (err) {
        console.log(`Информация о событии не была обновлена: ${err.response?.data?.message || err.message}`);
        this.errors.push(`Информация о событии не была обновлена: ${err.response?.data?.message || err.message}`);
      }
    },
    async deleteEvent() {
      try {
        const response = await axios.delete(`${apiUrl}/events/${this.event_id}`, {
          headers: {
            authorization: `Bearer ${this.userData.token}`,
          },
        });
        if (response.data.status === 'success') {
          this.messages.push('Событие было успешно удалено');
          await this.fetchEvents();

          setTimeout(() => {
            if (this.$route.name === 'editEventPage') this.$router.push({ name: 'results' });
          }, 1280);
        }
      } catch (e) {
        console.error('Не удалось удалить семинар:', e);
        this.errors.push('Не удалось удалить семинар:' + e?.message);
      }
    },
    async saveOnlineRegistrationData(data) {
      const { registration_status, allow_registration_by_organization, allow_registration_by_trainer, allowed_secretaries, athletes_groups } = data;

      try {
        const response = await axios.patch(
          `${apiUrl}/events/${this.event_id}/registration-settings`,
          {
            registration_status,
            allow_registration_by_organization,
            allow_registration_by_trainer,
            allowed_secretaries,
            athletes_groups,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              authorization: `Bearer ${this.userData.token}`,
            },
          }
        );

        if (response.status === 200) {
          this.messages.push('Информация о регистрации успешно обновлена');
          setTimeout(() => {
            if (this.showRegistrationSection) {
              this.showRegistrationSection = false;
            }
          }, 1500);
        }
      } catch (error) {
        if (error) {
          console.log(error?.response?.data);
          this.errors.push(error?.response?.data?.message);
        }
      }
    },
  },

  mounted() {
    if (this.event_id) {
      this.loadEventData();
    }
  },
};
</script>

<style lang="scss" scoped>
.editEventPage__wrapper {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  overflow-y: auto;
}
</style>
