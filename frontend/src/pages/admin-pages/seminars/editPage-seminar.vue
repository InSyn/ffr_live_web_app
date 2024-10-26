<template>
  <div class="updateSeminarPage__wrapper">
    <seminar-form @update-seminar="updateSeminar" @delete-seminar="deleteSeminar" :seminar="seminar" action="update"></seminar-form>

    <message-container :messages="messages" :errors="errors"></message-container>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import MessageContainer from '@/components/ui-components/message-container.vue';
import SeminarForm from '@/pages/admin-pages/seminars/form-seminar.vue';
import axios from 'axios';
import { databaseUrl } from '@/store/constants';

export default {
  name: 'editSeminar-page',
  components: { SeminarForm, MessageContainer },
  props: {
    seminar_id: String,
  },
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
    async loadSeminarData() {
      try {
        const response = await axios.get(`${databaseUrl}/seminars/${this.seminar_id}`);
        if (response.status === 200) {
          const seminarData = response.data.seminar;
          Object.keys(this.seminar).forEach((key) => {
            if (key in seminarData) {
              this.seminar[key] = seminarData[key];
            }
          });

          if (seminarData.date) {
            this.seminar.date = seminarData.date.substring(0, 10);
          }
        }
      } catch (err) {
        if (err) {
          this.errors.push(err.response?.data?.message || err.message);
        }
      }
    },
    async updateSeminar() {
      const formData = new FormData();

      Object.keys(this.seminar).forEach((key) => {
        const value = this.seminar[key];

        if (key === 'documents') return;

        if (Array.isArray(value) || typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      if (this.seminar.documents.length) {
        const documents = this.seminar.documents.filter((doc) => doc.file);

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

      try {
        const response = await axios.patch(`${databaseUrl}/seminars/${this.seminar_id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            authorization: `Bearer ${this.userData.token}`,
          },
        });

        if (response.status === 200) {
          this.messages.push('Семинар обновлен успешно');

          setTimeout(() => {
            this.$router.push({
              name: 'seminarPage',
              params: { seminar_id: this.seminar_id },
            });
          }, 2000);
        }
      } catch (error) {
        console.error('Error updating form:', error);
        const errorMessage = error.response?.data?.message || 'Не удалось обновить семинар. Пожалуйста, попробуйте еще раз.';
        this.errors.push(errorMessage);
      }
    },
    async deleteSeminar() {
      try {
        const response = await axios.delete(`${databaseUrl}/seminars/${this.seminar_id}`, {
          headers: {
            authorization: `Bearer ${this.userData.token}`,
          },
        });
        if (response.data.status === 'success') {
          this.messages.push('Семинар был успешно удалён');

          setTimeout(() => {
            if (this.$route.name === 'editSeminarPage') {
              this.$router.push({
                name: 'seminarPage',
                params: { seminar_id: this.seminar_id },
              });
            }
          }, 2000);
        }
      } catch (e) {
        console.error('Не удалось удалить семинар:', e);
        this.errors.push('Не удалось удалить семинар:' + e?.message);
      }
    },
  },

  mounted() {
    if (this.seminar_id) this.loadSeminarData();
  },
};
</script>

<style scoped>
.updateSeminarPage__wrapper {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  padding: 2rem;
}
</style>
