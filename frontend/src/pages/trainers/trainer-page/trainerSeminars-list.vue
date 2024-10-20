<template>
  <div class="trainerSeminars__list__wrapper">
    <div class="trainerSeminars__list">
      <router-link
        :class="['trainerSeminars__list__item', idx % 2 === 0 && 'even']"
        v-for="(seminar, idx) in seminars"
        :key="seminar._id"
        :to="{ name: 'seminarPage', params: { seminar_id: seminar._id } }"
      >
        <div class="trainerSeminars__list__item__header">
          <div class="seminarTitle">
            {{ seminar.title }}
          </div>
          <div class="seminarSport">
            {{ seminar.sport }}
            <country-flag
              height="1.1rem"
              :country-code="getCountryCode(seminar.country)"
            ></country-flag>
          </div>
        </div>
        <div class="trainerSeminars__list__item__footer">
          <div class="seminarRegion">
            {{ seminar.region }}
          </div>
          <div class="seminarDate">
            {{ formatDate(seminar.date) }}
          </div>
          <div v-if="seminar.disciplines.length" class="seminarDisciplines">
            {{ seminar.disciplines.join(", ") }}
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { databaseUrl } from "@/store/constants";
import { formatDate } from "@/utils/data-formaters";
import CountryFlag from "@/components/ui-components/country-flag.vue";
import { getCountryCode } from "@/store/data/countries";

export default {
  name: "trainerSeminars-list",
  components: { CountryFlag },
  props: {
    trainer_id: String,
  },
  data() {
    return {
      seminars: [],
    };
  },
  methods: {
    getCountryCode,
    formatDate,
    async getTrainerSeminars() {
      try {
        const response = await axios.get(
          databaseUrl + `/trainers/${this.trainer_id}/seminars`
        );
        if (response.status === 200) {
          this.seminars = response.data["seminars"];
        }
      } catch (e) {
        if (e) {
          console.log(e?.response?.data?.message);
        }
      }
    },
  },

  mounted() {
    this.getTrainerSeminars();
  },
};
</script>

<style scoped lang="scss">
.trainerSeminars__list__wrapper {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  .trainerSeminars__list {
    display: flex;
    flex-direction: column;
    .trainerSeminars__list__item {
      flex: 0 0 auto;
      display: flex;
      flex-direction: column;
      padding: 0.75rem 1.25rem;

      &.even {
        background-color: var(--background--card-secondary);
      }
      &:hover {
        background-color: var(--background--card-hover);
      }
      .trainerSeminars__list__item__header {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        margin-bottom: 0.5rem;
        font-size: 1.1rem;

        .seminarTitle {
          flex: 1 1 0;
          font-weight: bold;
        }
        .seminarSport {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-left: 1rem;
        }
      }
      .trainerSeminars__list__item__footer {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        gap: 2rem;

        .seminarRegion {
          color: var(--text-muted);
        }
        .seminarDate {
          color: var(--text-muted);
        }
        .seminarDisciplines {
          margin-left: auto;
        }
      }
    }
  }
}
</style>
