<template>
  <div class="trainersPage__wrapper">
    <search
      @search-loading="setLoadingState"
      @search-results-loaded="showSearchResults"
      mode="trainers"
    ></search>

    <div class="trainersList__wrapper">
      <div class="trainersList">
        <div
          class="alphabetCharSection"
          v-for="char in getAlphabetList(this.getTrainersList, 'fullname')"
          :key="char"
        >
          <span class="alphabetChar">&nbsp;-&nbsp;{{ char }}</span>
          <router-link
            v-for="trainer in getTrainersList.filter(
              (t) => t.fullname[0].toUpperCase() === char
            )"
            :key="trainer._id"
            :to="'/trainer_page/' + trainer.trainer_id"
          >
            <div class="trainersList__item__wrapper">
              <person-photo
                class="trainerPhoto"
                :person="trainer"
              ></person-photo>

              <div class="trainerInfo__top">
                <span class="trainerInfo__name">
                  {{ trainer.fullname }}
                </span>

                <span class="trainerInfo__code">
                  <b>FFR-ID:&nbsp; {{ trainer.trainer_id }}</b>
                  <country-flag
                    class="countryFlag"
                    :country-code="getCountryCode(trainer.country)"
                    width="1.5rem"
                  ></country-flag>
                </span>
              </div>

              <div class="trainerInfo__bottom">
                <div class="trainerPersonalInfo__wrapper">
                  <div
                    v-if="trainer.birth_date"
                    class="trainerPersonalInfo__item__wrapper"
                  >
                    <div class="trainerCategory">
                      {{ trainer.trainer_category }}
                    </div>
                  </div>

                  <div class="trainerPersonalInfo__item__wrapper">
                    {{ trainer.region }}
                  </div>
                </div>

                <div class="trainerSport__wrapper">
                  <div class="sport">{{ trainer.sport }}</div>
                  <div class="disciplines__wrapper">
                    <div
                      class="discipline__item"
                      v-for="(dsc, idx) in trainer.disciplines"
                      :key="idx"
                    >
                      {{ getDisciplineCode(dsc) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </router-link>
        </div>
        <span
          class="emptySearchResults"
          v-if="getTrainersList.length === 0 && !loading"
        >
          Тренеры не найдены
        </span>

        <loader-spinner
          v-if="loading"
          class="loading__spinner"
        ></loader-spinner>
      </div>
    </div>
  </div>
</template>

<script>
import { uploadsFolderUrl } from "@/store/constants";
import { mdiAccount } from "@mdi/js";
import CountryFlag from "@/components/ui-components/country-flag.vue";
import Search from "@/components/ui-components/search/index.vue";
import { getDisciplineCode } from "@/store/data/sports";
import { getRegionCode } from "@/store/data/russia-regions";
import { getCountryCode } from "@/store/data/countries";
import { getAgeFromBirthdate } from "@/utils/data-formaters";
import LoaderSpinner from "@/components/ui-components/loader-spinner.vue";
import PersonPhoto from "@/components/ui-components/person-photo.vue";
import { mapActions, mapGetters } from "vuex";
import { getAlphabetList } from "@/utils/alphabet-generator";

export default {
  name: "trainersPage",
  components: {
    PersonPhoto,
    LoaderSpinner,
    Search,
    CountryFlag,
  },
  data() {
    return {
      searchResults: null,
      loading: false,
      athleteIcon: mdiAccount,
    };
  },
  computed: {
    ...mapGetters("trainers", {
      trainersList: "getTrainers",
    }),
    uploadsFolderUrl() {
      return uploadsFolderUrl;
    },
    getTrainersList() {
      return this.searchResults === null
        ? this.trainersList
        : this.searchResults;
    },
  },
  methods: {
    getAlphabetList,
    ...mapActions("trainers", {
      fetchTrainers: "LOAD_TRAINERS",
      setTrainers: "SET_TRAINERS",
    }),
    getAgeFromBirthdate,
    getCountryCode,
    getRegionCode,
    getDisciplineCode,

    async loadTrainers() {
      if (this.trainersList.length) return;

      this.setLoadingState(true);
      try {
        await this.fetchTrainers();
      } catch (e) {
        setTimeout(this.loadTrainers, 2000);
      } finally {
        this.setLoadingState(false);
      }
    },
    showSearchResults(searchResults) {
      this.searchResults = searchResults;
    },
    setLoadingState(state) {
      this.loading = state;
    },
  },

  mounted() {
    this.loadTrainers();
  },
};
</script>

<style scoped lang="scss">
.trainersPage__wrapper {
  flex: 1 1 0;
  display: flex;
  flex-wrap: nowrap;
  max-width: var(--desktop-small);
  width: 100%;
  overflow-y: auto;
  margin: 0 auto;
  padding: var(--padd-page);

  .trainersList__wrapper {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    max-height: 100%;
    overflow-y: auto;

    background-color: var(--background--card);
    border-radius: 4px;

    .trainersList {
      flex: 0 0 auto;
      display: flex;
      flex-direction: column;

      .trainersList__item__wrapper {
        display: grid;
        grid-template-areas:
          "image top"
          "image bottom";
        grid-template-columns: 96px auto;
        grid-template-rows: auto 1fr;
        grid-gap: 0.5rem 0.75rem;
        border-bottom: 1px solid var(--background--primary);

        &:first-child {
          border-top: 1px solid var(--background--primary);
        }
        &:hover {
          background-color: var(--background--card-hover);
        }
        .trainerPhoto {
          place-self: start center;
          grid-area: image;
        }
        .trainerInfo__top {
          grid-area: top;
          display: flex;
          flex-wrap: nowrap;
          align-items: flex-start;
          color: var(--text-default);

          .trainerInfo__name {
            position: relative;
            padding: 8px 0 0 4px;
            font-size: 1.15rem;
            font-weight: bold;
          }
          .trainerInfo__code {
            display: flex;
            align-items: center;
            margin-left: auto;
            padding: 0.5rem 1rem;
            color: var(--text-card-contrast);
            background-color: var(--text-default);
            border-bottom-left-radius: 2px;
            line-height: 1;

            span {
              font-weight: 700;
            }
            .countryFlag {
              margin-left: 8px;
            }
          }
          @media screen and (max-width: 1200px) {
            .trainerInfo__name {
              flex: 1 1 auto;
            }
            .trainerInfo__code {
              margin: 0;
            }
          }
        }
        .trainerInfo__bottom {
          grid-area: bottom;
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem 0.5rem;
          align-items: flex-end;
          padding: 3px 6px 8px;
          color: var(--text-muted);
          font-size: 0.9rem;

          .trainerPersonalInfo__wrapper {
            flex: 1 1 0;
            display: flex;
            flex-direction: column;
            gap: 0.25rem;

            .trainerPersonalInfo__item__wrapper {
              flex: 0 0 auto;
              display: flex;
              align-items: center;
              gap: 0.75rem;
            }
            .trainerPersonalInfo__item {
              flex: 0 0 auto;
              white-space: nowrap;
            }
          }
          .trainerSport__wrapper {
            flex: 0 0 auto;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
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
              gap: 0.25rem;
            }
          }
        }
      }
      .alphabetCharSection {
        .alphabetChar {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          font-size: 1.2rem;
          font-weight: bold;
          user-select: none;
        }
      }
    }
    .emptySearchResults {
      align-self: center;
      display: inline-block;
      padding: 8px;
      font-size: 1.2rem;
      font-weight: bold;
      color: var(--text-muted);
    }
  }
}
</style>
