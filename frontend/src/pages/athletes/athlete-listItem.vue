<template>
  <router-link :to="'/athlete_info/' + athlete.rus_code">
    <div class="athlete__listItem__wrapper">
      <person-photo class="athletePhoto" :person="athlete"></person-photo>

      <div class="athleteInfo__top">
        <span class="athleteInfo__name">
          {{ getAthleteName(athlete) }}
        </span>

        <span class="athleteInfo__code">
          <b>FFR-ID:&nbsp; {{ athlete.rus_code }}</b>
          <country-flag
            class="athleteInfo__countryFlag"
            :country-code="athlete.country_code"
            :region-code="athlete.region_code"
            width="1.5rem"
          ></country-flag>
        </span>
      </div>

      <div class="athleteInfo__bottom">
        <div class="personalInfo__wrapper">
          <div
            v-if="athlete.birth_date"
            class="personalInfo__item__wrapper athleteYear"
          >
            <div class="personalInfo__item">
              <span>Год рождения:&nbsp;</span>
              <span>
                {{
                  athlete.birth_date ? formatBirthDate(athlete.birth_date) : "-"
                }}
              </span>
            </div>
          </div>

          <div
            v-if="athlete.category"
            class="personalInfo__item__wrapper athleteRank"
          >
            <div class="personalInfo__item">
              <span>Разряд:&nbsp;</span>
              <span>{{ getShortAthleteRank(athlete.category) }}</span>
            </div>
          </div>

          <div
            class="personalInfo__item__wrapper athleteRegions"
            v-if="athlete['regions'].length"
          >
            {{ athlete["regions"].join(", ") }}
          </div>
        </div>

        <div class="athleteSport__wrapper">
          <div class="sport">{{ athlete.sport }}</div>
          <div class="disciplines__wrapper">
            <div
              class="discipline__item"
              v-for="dsc in athlete.disciplines"
              :key="dsc"
            >
              {{ getDisciplineCode(dsc) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script>
import CountryFlag from "@/components/ui-components/country-flag.vue";
import { getDisciplineCode } from "@/store/data/sports";
import { formatBirthDate, getAthleteName } from "@/utils/data-formaters";
import { getRegionCode } from "@/store/data/russia-regions";
import { uploadsFolderUrl } from "@/store/constants";
import { getShortAthleteRank } from "@/store/data/sport-data-sets";
import PersonPhoto from "@/components/ui-components/person-photo.vue";

export default {
  name: "athlete-listItem",
  props: {
    athlete: Object,
  },
  methods: {
    getShortAthleteRank,
    uploadsFolderUrl() {
      return uploadsFolderUrl;
    },
    getRegionCode,
    getAthleteName,
    formatBirthDate,
    getDisciplineCode,
  },
  components: { PersonPhoto, CountryFlag },
};
</script>

<style scoped lang="scss">
.athlete__listItem__wrapper {
  display: grid;
  grid-template-areas:
    "image top"
    "image bottom";
  grid-template-columns: auto 1fr;
  grid-template-rows: auto 1fr;
  grid-gap: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--background--primary);

  &:first-child {
    border-top: 1px solid var(--background--primary);
  }
  &:hover {
    background-color: var(--background--card-hover);
  }
  .athletePhoto {
    place-self: start center;
    grid-area: image;
  }
  .athleteInfo__top {
    grid-area: top;
    display: flex;
    flex-wrap: wrap;
    color: var(--text-default);

    .athleteInfo__name {
      position: relative;
      padding: 0.5rem 0 0 0.5rem;
      font-size: 1.15rem;
      font-weight: bold;
    }
    .athleteInfo__code {
      display: flex;
      align-items: center;
      margin-left: auto;
      padding: 0 1rem;
      color: var(--text-card-contrast);
      background-color: var(--text-default);
      border-bottom-left-radius: 2px;
      font-size: 0.9rem;
      line-height: 1;

      .athleteInfo__countryFlag {
        margin-left: 8px;
      }
    }
    @media screen and (max-width: 1200px) {
      .athleteInfo__name {
        flex: 1 1 0;
      }
      .athleteInfo__code {
        margin: 0;
      }
    }
  }
  .athleteInfo__bottom {
    grid-area: bottom;
    display: flex;
    flex-wrap: wrap;
    align-self: flex-end;
    gap: 0.25rem;
    padding: 3px 6px 8px;
    color: var(--text-muted);
    font-size: 0.9rem;

    @media screen and (max-width: 1200px) {
      gap: 8px;
    }
    .personalInfo__wrapper {
      flex: 1 1 0;
      display: grid;
      grid-template-areas:
        "year rank"
        "regions regions";

      grid-template-columns: 1fr 2fr;
      grid-auto-rows: min-content;
      grid-gap: 0.25rem 0.5rem;
      align-items: flex-end;

      .personalInfo__item__wrapper {
        flex: 0 0 auto;
        display: flex;
        flex-wrap: wrap;

        &.athleteYear {
          grid-area: year;
        }
        &.athleteRank {
          grid-area: rank;
        }
        &.athleteRegions {
          grid-area: regions;
        }
        .personalInfo__item {
          flex: 0 0 auto;
          white-space: nowrap;
        }
      }
    }
    .athleteSport__wrapper {
      flex: 0 0 auto;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      gap: 0.25rem;
      margin-left: auto;

      .sport {
        flex: 0 0 auto;
      }
      .disciplines__wrapper {
        flex: 0 0 auto;
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 8px;

        .discipline__item {
        }
      }
    }
  }
}
</style>
