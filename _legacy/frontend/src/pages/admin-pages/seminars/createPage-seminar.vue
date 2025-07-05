<template>
  <div class="createSeminarPage__wrapper">
    <seminar-form @create-seminar="createSeminar" :seminar="seminar" action="create"></seminar-form>

    <message-container :messages="messages" :errors="errors"></message-container>
  </div>
</template>

<script>
import MessageContainer from '@/components/ui-components/message-container.vue';
import { apiUrl } from '@/constants';
import SeminarForm from '@/pages/admin-pages/seminars/form-seminar.vue';
import axios from 'axios';
import { mapActions, mapGetters } from 'vuex';
import { addDocumentsToFormData, prepareFormData } from '@/utils/formData-helpers';

export default {
  name: 'createOrganization-Page',
  components: { SeminarForm, MessageContainer },
  data() {
    return {
      seminar: {
        title: '',
        date: '',
        sport: '',
        disciplines: [],
        country: '',
        region: '',
        location: '',
        format: '',
        contacts: [],
        documents: [],
      },

      messages: [],
      errors: [],
    };
  },
  computed: {
    ...mapGetters('authorization', {
      userData: 'getUserData',
    }),
  },
  methods: {
    ...mapActions('seminars', {
      fetchSeminars: 'LOAD_SEMINARS',
    }),

    async createSeminar() {
      const formData = prepareFormData(this.seminar, ['date']);

      addDocumentsToFormData(formData, this.seminar.documents);

      try {
        const response = await axios.post(`${apiUrl}/seminars/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            authorization: `Bearer ${this.userData.token}`,
          },
        });

        if (response.status === 201) {
          this.messages.push('Семинар создан успешно');
          await this.fetchSeminars();

          setTimeout(() => {
            if (this.$route.name === 'createSeminarPage') this.$router.push({ name: 'seminarPage', params: { seminar_id: response.data.seminar._id } });
          }, 2000);
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        const errorMessage = error.response?.data?.message || 'Не удалось создать семинар. Пожалуйста, попробуйте еще раз.';
        this.errors.push(errorMessage);
      }
    },
  },
};
</script>

<style scoped lang="scss">
.createSeminarPage__wrapper {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  overflow-y: auto;
}
</style>
