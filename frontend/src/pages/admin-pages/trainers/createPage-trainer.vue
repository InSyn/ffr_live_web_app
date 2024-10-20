<template>
  <div class="createTrainerPage__wrapper">
    <trainer-form
      @create-trainer="createTrainer"
      :trainer="trainer"
      action="create"
    ></trainer-form>

    <message-container
      :messages="messages"
      :errors="errors"
    ></message-container>
  </div>
</template>

<script>
import MessageContainer from "@/components/ui-components/message-container.vue";
import axios from "axios";
import { databaseUrl } from "@/store/constants";
import { mapGetters } from "vuex";
import TrainerForm from "@/pages/admin-pages/trainers/form-trainer.vue";

export default {
  name: "createTrainer-page",
  components: {
    TrainerForm,
    MessageContainer,
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
        is_national_team: false,
        socials: {
          vk: "",
          telegram: "",
        },
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
    async createTrainer(selectedFile) {
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
        const response = await axios.post(
          databaseUrl + "/trainers/",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              authorization: `Bearer ${this.userData.token}`,
            },
          }
        );

        if (response.status === 200) {
          this.messages.push("Тренер успешно добавлен в базу данных");

          setTimeout(() => {
            this.$router.push({
              name: "trainerPage",
              params: { trainer_id: this.trainer.trainer_id },
            });
          }, 2000);
        }
      } catch (err) {
        if (err) {
          console.log(err);
          this.errors.push(
            "Тренер не был добавлен: " + err.response?.data?.data
          );
        }
      }
    },
  },
};
</script>

<style scoped lang="scss">
.createTrainerPage__wrapper {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  padding: 2rem;
}
</style>
