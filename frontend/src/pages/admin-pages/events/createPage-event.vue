<template>
  <div class="createEventPage__wrapper">
    <event-form @create-event="createEvent" :event="event" action="create">
    </event-form>

    <message-container
      :messages="messages"
      :errors="errors"
    ></message-container>
  </div>
</template>

<script>
import axios from "axios";
import { databaseUrl } from "@/store/constants";
import { mdiImage } from "@mdi/js";
import { mapActions, mapGetters } from "vuex";
import MessageContainer from "@/components/ui-components/message-container.vue";
import { getInputType } from "@/utils/get-input-type";
import { translateField } from "@/utils/formFields-translator";
import { countries, getCountryCode } from "@/store/data/countries";
import { getDisciplines, sports } from "@/store/data/sports";
import { capitalizeString } from "@/utils/capitalizeString";
import EventForm from "@/pages/admin-pages/events/form-event.vue";

export default {
  name: "createEventPage",
  components: { EventForm, MessageContainer },
  methods: {
    getCountryCode,
    getDisciplines,
    capitalizeString,
    translateField,
    getInputType,
    ...mapActions("events", {
      loadEvents: "LOAD_EVENTS",
    }),

    async createEvent(selectedFile) {
      const formData = new FormData();

      Object.keys(this.event).forEach((key) => {
        const value = this.event[key];

        if (key === "documents") return;

        if (Array.isArray(value) || typeof value === "object") {
          formData.append(key, JSON.stringify(value));
        } else {
          if (key === "start_at") {
            formData.append(key, new Date(value).toISOString());
            return;
          }
          formData.append(key, value);
        }
      });

      if (this.event.documents.length) {
        const documents = this.event.documents.filter((doc) => doc.file);

        const filteredDocuments = documents.filter(
          (doc) => doc.file?.url || doc.file?.newFile
        );

        formData.append(
          "documents",
          JSON.stringify(
            filteredDocuments.map((doc) => {
              const file = doc.file?.newFile ? {} : doc.file;
              return {
                title: doc.title,
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
        const response = await axios.post(databaseUrl + "/events/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            authorization: `Bearer ${this.userData.token}`,
          },
        });

        if (response.status === 200) {
          this.messages.push("Соревнование создано успешно");

          setTimeout(() => {
            this.loadEvents();
            this.$router.push({
              name: "eventPage",
              params: { event_id: this.event.event_id },
            });
          }, 2000);
        }
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    },
  },
  data() {
    return {
      imageFillerIcon: mdiImage,

      event: {
        title: "",
        start_at: "",
        sport: "",
        discipline: "",
        country: "",
        country_code: "",
        region: "",
        region_code: "",
        location: "",
        organization: "",
        calendar_code: "",
        timing_provider: "",
        translation_url: "",
        international: false,
        documents: [],
      },

      messages: [],
      errors: [],
    };
  },
  computed: {
    ...mapGetters("authorization", {
      userData: "getUserData",
    }),
    sports() {
      return sports;
    },
    countries() {
      return countries;
    },
  },
};
</script>

<style scoped lang="scss">
.createEventPage__wrapper {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  padding: 2rem;
}
</style>
