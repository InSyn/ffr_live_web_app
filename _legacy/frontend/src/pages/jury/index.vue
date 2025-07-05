<template>
  <div class="juryPage__wrapper">
    <search @search-loading="setLoadingState" @search-results-loaded="showSearchResults" mode="jury"></search>

    <div class="juryList__wrapper">
      <div class="juryList">
        <div class="alphabetCharSection" v-for="char in getAlphabetList(this.getJuryList, 'lastname')" :key="char">
          <span class="alphabetChar">&nbsp;-&nbsp;{{ char }}</span>
          <router-link
            v-for="jury in getJuryList.filter((j) => j.lastname[0].toUpperCase() === char)"
            :key="jury._id"
            :to="{ name: 'juryPage', params: { jury_code: jury.jury_code } }"
          >
            <div class="juryList__item__wrapper">
              <person-photo class="juryPhoto" :person="jury"></person-photo>

              <div class="juryInfo__top">
                <span class="juryInfo__name">
                  {{ getAthleteName(jury) }}
                </span>

                <span class="juryInfo__code">
                  <b>FFR-ID:&nbsp; {{ jury.jury_code }}</b>
                  <country-flag class="countryFlag" :country-code="getCountryCode(jury.country)" height="1.2rem" rounding="2px"></country-flag>
                </span>
              </div>

              <div class="juryInfo__bottom">
                <div class="personalInfo__wrapper">
                  <div class="juryCategory">
                    {{ jury.jury_category }}
                  </div>
                  <div class="juryRegion">
                    {{ jury.region }}
                  </div>
                </div>

                <div class="jurySport__wrapper">
                  <div class="sport">{{ jury.sport }}</div>
                  <div class="disciplines__wrapper">
                    <div class="discipline__item" v-for="(dsc, idx) in jury.disciplines" :key="idx">
                      {{ getDisciplineCode(dsc) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </router-link>
        </div>
        <span class="emptySearchResults" v-if="getJuryList.length === 0 && !loading"> Судьи не найдены </span>

        <loader-spinner v-if="loading" class="loading__spinner"></loader-spinner>
      </div>
    </div>
  </div>
</template>

<script>
import { backendRootUrl } from '@/constants';
import { mdiAccount } from '@mdi/js';
import CountryFlag from '@/components/ui-components/country-flag.vue';
import Search from '@/components/ui-components/search/index.vue';
import { getDisciplineCode } from '@/store/data/sports';
import { getRegionCode } from '@/store/data/russia-regions';
import { getCountryCode } from '@/store/data/countries';
import { getAgeFromBirthdate, getAthleteName } from '@/utils/data-formaters';
import LoaderSpinner from '@/components/ui-components/loader-spinner.vue';
import PersonPhoto from '@/components/ui-components/person-photo.vue';
import { mapActions, mapGetters } from 'vuex';
import { getAlphabetList } from '@/utils/alphabet-generator';

export default {
  name: 'juryPage',
  components: {
    PersonPhoto,
    LoaderSpinner,
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
    ...mapGetters('jury', {
      juryList: 'getJury',
    }),
    uploadsFolderUrl() {
      return backendRootUrl;
    },
    getJuryList() {
      return this.searchResults === null ? this.juryList : this.searchResults;
    },
  },
  methods: {
    ...mapActions('jury', {
      fetchJury: 'LOAD_JURY',
      setJury: 'SET_JURY',
    }),
    getAlphabetList,
    getAthleteName,
    getAgeFromBirthdate,
    getCountryCode,
    getRegionCode,
    getDisciplineCode,

    async loadJury() {
      if (this.juryList.length) return;

      this.setLoadingState(true);
      try {
        await this.fetchJury();
      } catch (e) {
        setTimeout(this.loadJury, 2000);
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
    this.loadJury();
  },
};
</script>

<style scoped lang="scss">
.juryPage__wrapper {
  flex: 1 1 0;
  display: flex;
  flex-wrap: nowrap;
  width: 100%;
  height: 100%;
  max-width: var(--desktop-small);
  margin: 0 auto;
  padding: var(--padd-page);

  .juryList__wrapper {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    max-height: 100%;
    overflow-y: auto;

    background-color: var(--background--card);
    box-shadow: var(--container-shadow-l);
    border: 1px solid var(--border-container);
    border-radius: 4px;

    .juryList {
      flex: 1 1 0;
      display: flex;
      flex-direction: column;

      .juryList__item__wrapper {
        display: grid;
        grid-template-areas:
          'image top'
          'image bottom';
        grid-template-columns: 96px auto;
        grid-template-rows: auto 1fr;
        grid-gap: 0.5rem 1.25rem;
        border-bottom: 1px solid var(--background--primary);

        &:first-child {
          border-top: 1px solid var(--background--primary);
        }

        &:hover {
          background-color: var(--background--card-hover);
        }

        .juryPhoto {
          place-self: start center;
          grid-area: image;
        }

        .juryInfo__top {
          grid-area: top;
          display: flex;
          padding: 0.5rem 1rem 0 0;

          .juryInfo__name {
            font-weight: bold;
          }

          .juryInfo__code {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-left: auto;

            .countryFlag {
              box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.25);
            }
          }
        }

        .juryInfo__bottom {
          grid-area: bottom;
          display: flex;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 0.25rem;
          padding: 0 1rem 0.5rem 0;
          color: var(--text-muted);

          .personalInfo__wrapper {
            flex: 1 1 0;
            display: flex;
            flex-direction: column;
            gap: 0.25rem;

            .personalInfo__item__wrapper {
              flex: 0 0 auto;
              display: flex;
              align-items: center;
            }

            .personalInfo__item {
              flex: 0 0 auto;
              white-space: nowrap;
            }
          }

          .jurySport__wrapper {
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
