<template>
  <div class="organizationsPage__wrapper">
    <search
      @search-loading="setLoadingState"
      @search-results-loaded="showSearchResults"
      mode="organizations"
    ></search>

    <div class="organizationsList__wrapper">
      <div class="organizationsList__header">Региональные организации</div>
      <div class="organizationsList">
        <router-link
          v-for="(organization, idx) in getOrganizationsList"
          :key="organization._id"
          :to="'/organizations/' + organization._id"
          custom
          v-slot="{ navigate }"
        >
          <div
            @click="navigate"
            :class="[
              'organizationsList__item__wrapper',
              idx % 2 === 0 && 'isEven',
            ]"
          >
            <div class="organizationImage__wrapper">
              <img
                v-if="organization['logo_url']"
                class="organizationImage"
                :src="uploadsFolderUrl + `${organization['logo_url']}`"
                alt="img"
                loading="lazy"
              />
              <div v-else class="imageFiller">
                <competition-image-filler-icon
                  class="imageFiller__icon"
                ></competition-image-filler-icon>
              </div>
            </div>
            <div class="organizationInfo__top">
              <span class="organizationInfo__title">
                {{ organization.title }}
              </span>

              <span class="organizationInfo__sport">
                <span>{{ organization.sport }} </span>
                <country-flag
                  class="countryFlag"
                  :country-code="getCountryCode(organization['country'])"
                  height="1rem"
                ></country-flag>
              </span>
            </div>

            <div class="organizationInfo__bottom">
              <div
                class="organizationInfo__region"
                v-if="organization['region']"
              >
                <country-flag
                  class="countryFlag"
                  is-region-flag="true"
                  :country-code="getCountryCode(organization.country)"
                  :region-code="getRegionCode(organization.region)"
                  width="calc(8px + 1.2rem)"
                ></country-flag>
                {{ organization["region"] }}
              </div>
            </div>
          </div>
        </router-link>

        <span
          class="emptySearchResults"
          v-if="getOrganizationsList.length === 0 && !loading"
        >
          Организации не найдены
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
import CompetitionImageFillerIcon from "@/assets/svg/competitionImageFiller-icon.vue";
import { mapActions, mapGetters } from "vuex";
import LoaderSpinner from "@/components/ui-components/loader-spinner.vue";

export default {
  name: "organizationsPage",
  components: {
    LoaderSpinner,
    CompetitionImageFillerIcon,
    Search,
    CountryFlag,
  },
  data() {
    return {
      searchResults: null,
      athleteIcon: mdiAccount,
      loading: false,
    };
  },
  computed: {
    ...mapGetters("organizations", {
      organizationsList: "getOrganizations",
    }),
    uploadsFolderUrl() {
      return uploadsFolderUrl;
    },
    getOrganizationsList() {
      return this.searchResults === null
        ? this.organizationsList
        : this.searchResults;
    },
  },
  methods: {
    ...mapActions("organizations", {
      fetchOrganizations: "LOAD_ORGANIZATIONS",
      setOrganizations: "SET_ORGANIZATIONS",
    }),
    getCountryCode,
    getRegionCode,
    getDisciplineCode,

    async loadOrganizations() {
      if (this.organizationsList.length) return;

      this.setLoadingState(true);
      try {
        await this.fetchOrganizations();
      } catch (e) {
        setTimeout(this.loadOrganizations, 2000);
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
    this.loadOrganizations();
  },
};
</script>

<style scoped lang="scss">
.organizationsPage__wrapper {
  flex: 1 1 0;
  display: flex;
  flex-wrap: nowrap;
  max-width: var(--desktop-small);
  width: 100%;
  overflow-y: auto;
  margin: 0 auto;
  padding: var(--padd-page);

  .organizationsList__wrapper {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    max-height: 100%;
    overflow-y: auto;

    background-color: var(--background--card);
    border-radius: 4px;

    .organizationsList__header {
      flex: 0 0 auto;
      padding: 0.75rem 1.25rem;
      font-size: 1.2rem;
      font-weight: bold;
    }
    .organizationsList {
      flex: 0 0 auto;
      display: flex;
      flex-direction: column;

      .organizationsList__item__wrapper {
        flex: 0 0 auto;
        display: grid;
        grid-template-areas:
          "image top"
          "image bottom";
        grid-template-columns: auto 1fr;
        grid-gap: 0.5rem 1rem;
        padding: 0.25rem 1.25rem 0.25rem 0.5rem;
        cursor: pointer;

        &.isEven {
          background-color: var(--background--card-secondary);
        }
        &:hover {
          background-color: var(--background--card-hover);
        }
        .organizationImage__wrapper {
          position: relative;
          isolation: isolate;
          place-self: flex-start center;
          grid-area: image;
          align-self: start;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100px;
          aspect-ratio: 1;
          padding: 0.5rem;

          .organizationImage {
            max-height: 100%;
            max-width: 100%;
          }
          .imageFiller {
            display: flex;
            justify-content: center;
            align-items: flex-end;
            height: 100%;
            width: 100%;
            color: var(--text-muted);

            .imageFiller__icon {
              flex: 1 1 0;
            }
          }

          @media screen and (max-width: 1440px) {
            height: 88px;
          }
          @media screen and (max-width: 1200px) {
            height: 72px;
          }
          @media screen and (max-width: 900px) {
            height: 64px;
          }
        }
        .organizationInfo__top {
          grid-area: top;
          display: flex;
          align-items: center;
          flex-wrap: nowrap;
          gap: 1.25rem;

          .organizationInfo__title {
            position: relative;
            font-size: 1.25rem;
            font-weight: bold;

            .athleteInfo__icon {
              margin-left: 8px;
            }
          }
          .organizationInfo__sport {
            display: flex;
            align-items: center;
            margin-left: auto;
            border-bottom-left-radius: 2px;
            font-size: 1.25rem;
            line-height: 1;

            .countryFlag {
              margin-left: 0.5rem;
            }
          }
          @media screen and (max-width: 1200px) {
            .organizationInfo__title {
              flex: 1 1 auto;
            }
            .organizationInfo__sport {
              margin: 0;
            }
          }
        }
        .organizationInfo__bottom {
          margin-top: auto;
          padding: 0.5rem;

          .organizationInfo__region {
            flex: 0 0 auto;
            display: flex;
            align-items: center;
            font-size: 1.1rem;

            .countryFlag {
              margin-right: 1rem;
            }
          }
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
