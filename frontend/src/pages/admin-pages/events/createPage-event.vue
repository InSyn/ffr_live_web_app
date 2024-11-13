<script>
import axios from 'axios';
import { apiUrl } from '@/constants';
import { mdiImage } from '@mdi/js';
import { mapActions, mapGetters } from 'vuex';
import MessageContainer from '@/components/ui-components/message-container.vue';
import { getInputType } from '@/utils/inputType-util';
import { translateField } from '@/utils/formFields-translator';
import { countries, getCountryCode } from '@/store/data/countries';
import { getDisciplines, sports } from '@/store/data/sports';
import { capitalizeString } from '@/utils/capitalizeString';
import EventForm from '@/pages/admin-pages/events/form-event.vue';
import { addDocumentsToFormData, addImagesToFormData, prepareFormData } from '@/utils/formData-helpers';

export default {
  name: 'createEventPage',
  components: { EventForm, MessageContainer },
  data() {
    return {
      imageFillerIcon: mdiImage,

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

      messages: [],
      errors: [],
    };
  },
  computed: {
    ...mapGetters('authorization', {
      userData: 'getUserData',
    }),
    sports() {
      return sports;
    },
    countries() {
      return countries;
    },
  },
  methods: {
    getCountryCode,
    getDisciplines,
    capitalizeString,
    translateField,
    getInputType,
    ...mapActions('events', {
      fetchEvents: 'SET_EVENTS',
    }),

    async createEvent(images) {
      const formData = prepareFormData(this.event, ['start_at']);

      addDocumentsToFormData(formData, this.event.documents);
      addImagesToFormData(formData, images);

      try {
        const response = await axios.post(apiUrl + '/events/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            authorization: `Bearer ${this.userData.token}`,
          },
        });

        if (response.status === 200) {
          this.messages.push('Соревнование создано успешно');
          await this.fetchEvents();

          setTimeout(() => {
            if (this.$route.name === 'createEventPage') this.$router.push({ name: 'eventPage', params: { event_id: response.data.event.event_id } });
          }, 1280);
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        this.errors.push(error?.response?.data?.message);
      }
    },
  },
};
</script>

<template>
  <div class="createEventPage__wrapper">
    <event-form @create-event="createEvent" :event="event" action="create"> </event-form>

    <message-container :messages="messages" :errors="errors"></message-container>
  </div>
</template>

<style scoped lang="scss">
.createEventPage__wrapper {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  overflow-y: auto;
}
</style>
