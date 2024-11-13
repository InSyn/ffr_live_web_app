<template>
  <div class="updateJuryPage__wrapper">
    <jury-form
      :jury="jury"
      :jury-images="juryImages"
      action="update"
      @update-jury="updateJury"
      @delete-jury="deleteJury"
      @set-secretary-role="setSecretaryRole"
    ></jury-form>
    <message-container :messages="messages" :errors="errors"></message-container>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import axios from 'axios';
import { apiUrl } from '@/constants';
import MessageContainer from '@/components/ui-components/message-container.vue';
import JuryForm from '@/pages/admin-pages/jury/form-jury.vue';

export default {
  name: 'editJury-page',
  components: { JuryForm, MessageContainer },
  props: {
    jury_code: String,
  },
  data() {
    return {
      jury: {
        jury_code: '',
        lastname: '',
        name: '',
        sport: '',
        disciplines: [],
        jury_category: '',
        gender: '',
        birth_date: '',
        country: '',
        region: '',
        socials: {
          vk: '',
          telegram: '',
        },
        is_secretary: false,
      },
      juryImages: {
        photo_url: '',
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
    ...mapActions('jury', {
      fetchJury: 'LOAD_JURY',
    }),
    async loadJuryData() {
      try {
        const response = await axios.get(`${apiUrl}/jury/${this.jury_code}`);
        if (response.status === 200) {
          const juryData = response.data.jury;
          Object.keys(this.jury).forEach((key) => {
            if (key in juryData) {
              this.jury[key] = juryData[key];
            }
          });

          if (juryData.birth_date) {
            this.jury.birth_date = juryData.birth_date.substring(0, 10);
          }

          this.juryImages = {
            photo_url: juryData.photo_url,
          };
        }
      } catch (err) {
        if (err) {
          this.errors.push(err.response?.data?.message);
        }
      }
    },
    async updateJury(selectedFile) {
      const formData = new FormData();

      Object.keys(this.jury).forEach((key) => {
        if (Array.isArray(this.jury[key]) || typeof this.jury[key] === 'object') {
          formData.append(key, JSON.stringify(this.jury[key]));
        } else {
          formData.append(key, this.jury[key]);
        }
      });

      for (const imageKey in selectedFile) {
        formData.append(imageKey, selectedFile[imageKey]);
      }

      try {
        const response = await axios.patch(`${apiUrl}/jury/${this.jury_code}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            authorization: `Bearer ${this.userData.token}`,
          },
        });

        if (response.status === 200) {
          this.messages.push('Информация о судье успешно обновлена');
          await this.fetchJury();

          setTimeout(() => {
            if (this.$route.name === 'editJuryPage') this.$router.push({ name: 'juryPage', params: { jury_code: response.data.jury.jury_code } });
          }, 1280);
        }
      } catch (err) {
        if (err) {
          this.errors.push(`Информация о судье не была обновлена: ${err.response?.data?.message}`);
        }
      }
    },
    async setSecretaryRole() {
      try {
        const response = await axios.patch(
          `${apiUrl}/jury/${this.jury_code}/set-secretary`,
          {},
          {
            headers: {
              'Content-Type': 'application/json',
              authorization: `Bearer ${this.userData.token}`,
            },
          }
        );
        if (response.data.status === 'success') {
          await this.loadJuryData();
          this.messages.push('Роль судьи была изменена');
        }
      } catch (e) {
        this.errors.push('Не удалось изменить роль судьи: ' + e?.response?.data?.message);
      }
    },
    async deleteJury() {
      try {
        const response = await axios.delete(`${apiUrl}/jury/${this.jury_code}`, {
          headers: {
            authorization: `Bearer ${this.userData.token}`,
          },
        });
        if (response.data.status === 'success') {
          this.messages.push('Судья был успешно удалён');
          await this.fetchJury();

          setTimeout(() => {
            if (this.$route.name === 'editJuryPage') this.$router.push({ name: 'juryListPage' });
          }, 1280);
        }
      } catch (e) {
        console.error('Не удалось удалить судью:', e);
        this.errors.push('Не удалось удалить судью:' + e?.message);
      }
    },
  },

  mounted() {
    if (this.jury_code) this.loadJuryData();
  },
};
</script>

<style scoped lang="scss">
.updateJuryPage__wrapper {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  padding: 2rem;
}
</style>
