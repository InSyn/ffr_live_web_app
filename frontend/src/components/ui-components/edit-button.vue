<template>
  <router-link v-if="isAdmin" :to="getTargetLink(type, code)">
    <button
      class="editButton__wrapper"
      :style="
        type === 'seminar' || (type === 'event' && { marginLeft: '1rem' })
      "
    >
      <edit-icon class="editButton__icon"></edit-icon>
    </button>
  </router-link>
</template>

<script>
import EditIcon from "@/components/icons/edit-icon.vue";
import { mapGetters } from "vuex";

export default {
  name: "edit-button",
  props: {
    code: String,
    type: String,
  },
  components: { EditIcon },
  methods: {
    getTargetLink(type, code) {
      switch (type) {
        case "event": {
          return {
            name: "editEventPage",
            params: {
              event_id: code,
            },
          };
        }
        case "athlete": {
          return {
            name: "editAthletePage",
            params: {
              athlete_code: code,
            },
          };
        }
        case "jury": {
          return {
            name: "editJuryPage",
            params: {
              jury_code: code,
            },
          };
        }
        case "trainer": {
          return {
            name: "editTrainerPage",
            params: {
              trainer_id: code,
            },
          };
        }
        case "organization": {
          return {
            name: "editOrganizationPage",
            params: {
              org_id: code,
            },
          };
        }
        case "seminar": {
          return {
            name: "editSeminarPage",
            params: {
              seminar_id: code,
            },
          };
        }
      }
    },
  },
  computed: {
    ...mapGetters("authorization", {
      isAdmin: "isAdmin",
    }),
  },
};
</script>

<style scoped lang="scss">
.editButton__wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 2rem;
  height: 2rem;

  background-color: var(--background--card-hover);
  border-radius: 50%;
  opacity: 0.25;
  transition: opacity 92ms;

  .editButton__icon {
    height: 80%;
    color: var(--text-default);
  }

  &:hover {
    opacity: 1;
  }
}
</style>
