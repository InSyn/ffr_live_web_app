<template>
  <div class="updateTrainerPage__wrapper">
    <trainer-form
      @update-trainer="updateTrainer"
      @delete-trainer="deleteTrainer"
      :trainer="trainer"
      :trainer-images="trainerImages"
      action="update"
    ></trainer-form>
    <message-container
      :messages="messages"
      :errors="errors"
    ></message-container>
  </div>
</template>

<script>
import MessageContainer from "@/components/ui-components/message-container.vue";
import { mapGetters } from "vuex";
import axios from "axios";
import { databaseUrl } from "@/store/constants";
import TrainerForm from "@/pages/admin-pages/trainers/form-trainer.vue";

export default {
  name: "editTrainer-page",
  components: { TrainerForm, MessageContainer },
  props: {
    trainer_id: String,
  },
  data() {
    return {
      trainer: {
        trainer_id: "",
        fullname: "",
        gender: "",
        birth_date: "",
        country: "",
        region: "",
        sport: "",
        disciplines: [],
        trainer_category: "",
        rank: [],
        position: [],
        is_national_team: "",
        socials: {
          vk: "",
          telegram: "",
        },
      },
      trainerImages: {
        photo_url: "",
      },

      messages: [],
      errors: [],
    };
  },
  computed: {
    ...mapGetters("authorization", {
      userData: "getUserData",
    }),
  },
  methods: {
    async loadTrainerData() {
      try {
        const response = await axios.get(
          `${databaseUrl}/trainers/${this.trainer_id}`
        );
        if (response.status === 200) {
          const trainerData = response.data.trainer;
          Object.keys(this.trainer).forEach((key) => {
            if (key in trainerData) {
              this.trainer[key] = trainerData[key];
            }
          });

          if (trainerData.birth_date) {
            this.trainer.birth_date = trainerData.birth_date.substring(0, 10);
          }

          this.trainerImages = {
            photo_url: trainerData.photo_url,
          };
        }
      } catch (err) {
        if (err) {
          this.errors.push(err.response?.data?.message || err.message);
        }
      }
    },
    async updateTrainer(selectedFile) {
      const formData = new FormData();

      Object.keys(this.trainer).forEach((key) => {
        if (
          Array.isArray(this.trainer[key]) ||
          typeof this.trainer[key] === "object"
        ) {
          formData.append(key, JSON.stringify(this.trainer[key]));
        } else {
          formData.append(key, this.trainer[key]);
        }
      });

      for (const imageKey in selectedFile) {
        formData.append(imageKey, selectedFile[imageKey]);
      }

      try {
        const response = await axios.patch(
          `${databaseUrl}/trainers/${this.trainer_id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              authorization: `Bearer ${this.userData.token}`,
            },
          }
        );

        if (response.status === 200) {
          this.messages.push("Информация о тренере успешно обновлена");

          setTimeout(() => {
            if (this.$route.name === "editTrainerPage") {
              this.$router.push({
                name: "trainerPage",
                params: { trainer_id: this.trainer_id },
              });
            }
          }, 2000);
        }
      } catch (err) {
        if (err) {
          this.errors.push(
            `Информация о тренере не была обновлена: ${
              err.response?.data?.data || err.message
            }`
          );
        }
      }
    },
    async deleteTrainer() {
      try {
        const response = await axios.delete(
          `${databaseUrl}/trainers/${this.trainer_id}`,
          {
            headers: {
              authorization: `Bearer ${this.userData.token}`,
            },
          }
        );
        if (response.data.status === "success") {
          this.messages.push("Тренер был успешно удалён");

          setTimeout(() => {
            if (this.$route.name === "editTrainerPage") {
              this.$router.push({
                name: "trainerPage",
                params: { trainer_id: this.trainer_id },
              });
            }
          }, 2000);
        }
      } catch (e) {
        console.error("Не удалось удалить тренера:", e);
        this.errors.push("Не удалось удалить тренера");
      }
    },
  },

  mounted() {
    if (this.trainer_id) this.loadTrainerData();
  },
};
</script>

<style scoped lang="scss">
.updateTrainerPage__wrapper {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  padding: 2rem;
}
</style>
