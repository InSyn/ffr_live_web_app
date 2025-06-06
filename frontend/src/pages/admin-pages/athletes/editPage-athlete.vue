<template>
  <div class="updateAthletePage__wrapper">
    <athlete-form
      @update-athlete="updateAthlete"
      @delete-athlete="deleteAthlete"
      :athlete="athlete"
      :athlete-images="athleteImages"
      action="update"
    ></athlete-form>
    <message-container :messages="messages" :errors="errors"></message-container>
  </div>
</template>

<script>
import MessageContainer from '@/components/ui-components/message-container.vue';
import AthleteForm from '@/pages/admin-pages/athletes/form-athlete.vue';
import axios from 'axios';
import { apiUrl } from '@/constants';
import { mapActions, mapGetters } from 'vuex';
import { addImagesToFormData, prepareFormData } from '@/utils/formData-helpers';

export default {
  name: 'editAthletePage',
  props: ['athlete_code'],
  components: { AthleteForm, MessageContainer },
  data() {
    return {
      athlete: {
        ffr_id: '',
        gender: '',
        lastname: '',
        name: '',
        birth_date: '',
        category: '',
        country: '',
        country_code: '',
        regions: [],
        region_code: '',
        sport: '',
        disciplines: [],
        organizations: [],
        trainer: '',
        education: '',
        sponsors: [],
        socials: {
          vk: '',
          telegram: '',
        },
        equipment: [],
        hobbies: [],
        athleteAbout: '',
        medals: [],
        is_national_team: false,
      },
      athleteImages: {
        photo_url: '',
        photo_tv_url: '',
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
    ...mapActions('athletes', {
      fetchAthletes: 'LOAD_ATHLETES',
    }),
    async loadAthleteData() {
      try {
        const response = await axios.get(`${apiUrl}/athletes/${this.athlete_code}`);

        if (response.status === 200) {
          const athleteData = response.data.data;
          Object.keys(this.athlete).forEach((key) => {
            if (key in athleteData) {
              this.athlete[key] = athleteData[key];
            }
          });

          if (athleteData.birth_date) {
            this.athlete.birth_date = athleteData.birth_date.substring(0, 10);
          }

          this.athleteImages = {
            photo_url: athleteData.photo_url,
            photo_tv_url: athleteData.photo_tv_url,
          };
          athleteData.sponsors.forEach((sponsor, idx) => {
            this.athleteImages[`sponsor${idx}_logo`] = sponsor.logo_url;
          });
        }
      } catch (err) {
        if (err) {
          this.errors.push(err.response?.data?.message || err.message);
        }
      }
    },
    async updateAthlete(images) {
      const formData = prepareFormData(this.athlete, ['birth_date']);

      addImagesToFormData(formData, images);

      try {
        const response = await axios.patch(`${apiUrl}/athletes/${this.athlete_code}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            authorization: `Bearer ${this.userData.token}`,
          },
        });

        if (response.status === 200) {
          this.messages.push('Информация о спортсмене успешно обновлена');
          await this.fetchAthletes();

          setTimeout(() => {
            if (this.$route.name === 'editAthletePage') {
              this.$router.push({
                name: 'athletePage',
                params: { athlete_code: this.athlete_code },
              });
            }
          }, 1280);
        }
      } catch (err) {
        if (err) {
          this.errors.push(`Информация о спортсмене не обновлена: ${err.response?.data?.data || err.message}`);
        }
      }
    },
    async deleteAthlete() {
      try {
        const response = await axios.delete(`${apiUrl}/athletes/${this.athlete_code}`, {
          headers: {
            authorization: `Bearer ${this.userData.token}`,
          },
        });
        if (response.data.status === 'success') {
          this.messages.push('Спортсмен был успешно удалён');
          await this.fetchAthletes();

          setTimeout(() => {
            if (this.$route.name === 'editAthletePage') {
              this.$router.push({
                name: 'allAthletes',
              });
            }
          }, 1280);
        }
      } catch (e) {
        console.error('Failed to delete athlete:', e);
        this.errors.push('Не удалось удалить спортсмена');
      }
    },
  },

  mounted() {
    if (this.athlete_code) this.loadAthleteData();
  },
};
</script>

<style scoped lang="scss">
.updateAthletePage__wrapper {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  overflow-y: auto;
}
</style>
