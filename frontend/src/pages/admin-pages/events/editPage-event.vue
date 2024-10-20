<template>
  <div class="editEventPage__wrapper">
    <event-form
      @update-event="updateEvent"
      @delete-event="deleteEvent"
      :event="event"
      :event-images="eventImages"
      action="update"
    >
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
import { mapGetters } from "vuex";
import MessageContainer from "@/components/ui-components/message-container.vue";
import EventForm from "@/pages/admin-pages/events/form-event.vue";
import { formatDate } from "@/utils/data-formaters";

export default {
  name: "editEventPage",
  components: { EventForm, MessageContainer },
  props: {
    event_id: String,
  },
  data() {
    return {
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
      eventImages: {
        logo_image_url: "",
        track_image_url: "",
        organization_logo: "",
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
    async loadEventData() {
      try {
        const response = await axios.get(
          `${databaseUrl}/events/${this.event_id}`
        );
        if (response.status === 200) {
          const eventData = response.data.event;
          Object.keys(this.event).forEach((key) => {
            if (key in eventData) {
              if (key === "start_at") {
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
        const response = await axios.put(
          `${databaseUrl}/events/${this.event_id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              authorization: `Bearer ${this.userData.token}`,
            },
          }
        );

        if (response.status === 200) {
          this.messages.push("Информация о событии успешно обновлена");

          setTimeout(() => {
            if (this.$route.name === "editEventPage") {
              this.$router.push({
                name: "eventPage",
                params: { event_id: this.event_id },
              });
            }
          }, 2000);
        }
      } catch (err) {
        if (err) {
          this.errors.push(
            `Информация о событии не была обновлена: ${
              err.response?.data?.data || err.message
            }`
          );
        }
      }
    },
    async deleteEvent() {
      try {
        const response = await axios.delete(
          `${databaseUrl}/events/${this.event_id}`,
          {
            headers: {
              authorization: `Bearer ${this.userData.token}`,
            },
          }
        );
        if (response.data.status === "success") {
          this.messages.push("Событие было успешно удалено");

          setTimeout(() => {
            if (this.$route.name === "editEventPage") {
              this.$router.push({
                name: "eventPage",
                params: { event_id: this.event_id },
              });
            }
          }, 2000);
        }
      } catch (e) {
        console.error("Не удалось удалить семинар:", e);
        this.errors.push("Не удалось удалить семинар:" + e?.message);
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

<style scoped lang="scss">
.editEventPage__wrapper {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  padding: 2rem;
}
</style>
