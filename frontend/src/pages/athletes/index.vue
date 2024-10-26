<template>
  <div class="allAthletesPage__wrapper">
    <search @search-loading="setLoadingState" @search-results-loaded="showSearchResults" mode="athletes"></search>

    <div class="allAthletesPage__athletesList__wrapper">
      <div class="allAthletesPage__athletesList">
        <div class="alphabetCharSection" v-for="char in getAlphabetList(this.getAthletesList, 'lastname')" :key="char">
          <span class="alphabetChar">&nbsp;-&nbsp;{{ char }}</span>
          <athlete-list-item
            v-for="athlete in getAthletesList.filter((a) => a.lastname[0].toUpperCase() === char)"
            :key="athlete._id"
            :athlete="athlete"
          ></athlete-list-item>
        </div>

        <span class="emptySearchResults" v-if="getAthletesList.length === 0 && !loading"> Участники не найдены </span>

        <loader-spinner v-if="loading" class="loading__spinner"></loader-spinner>
      </div>
    </div>
  </div>
</template>

<script>
import { uploadsFolderUrl } from '@/store/constants';
import { mdiAccount } from '@mdi/js';
import Search from '@/components/ui-components/search/index.vue';
import { getDisciplineCode } from '@/store/data/sports';
import { getRegionCode } from '@/store/data/russia-regions';
import { formatBirthDate, getAthleteName } from '@/utils/data-formaters';
import AthleteListItem from '@/pages/athletes/athlete-listItem.vue';
import LoaderSpinner from '@/components/ui-components/loader-spinner.vue';
import { mapActions, mapGetters } from 'vuex';
import { getAlphabetList } from '@/utils/alphabet-generator';

export default {
  name: 'allAthletesPage',
  components: { LoaderSpinner, AthleteListItem, Search },
  data() {
    return {
      searchResults: null,
      athleteIcon: mdiAccount,

      loading: false,
    };
  },
  computed: {
    ...mapGetters('athletes', {
      athletesList: 'getAthletes',
    }),
    uploadsFolderUrl() {
      return uploadsFolderUrl;
    },
    getAthletesList() {
      return this.searchResults === null ? this.athletesList : this.searchResults;
    },
  },
  methods: {
    getAlphabetList,
    ...mapActions('athletes', {
      fetchAthletes: 'LOAD_ATHLETES',
      setAthletes: 'SET_ATHLETES',
    }),
    getAthleteName,
    formatBirthDate,
    getRegionCode,
    getDisciplineCode,

    async loadAthletes() {
      if (this.athletesList.length) return;

      this.setLoadingState(true);
      try {
        await this.fetchAthletes();
      } catch (e) {
        setTimeout(this.loadAthletes, 2000);
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
    this.loadAthletes();
  },
};
</script>

<style scoped lang="scss">
.allAthletesPage__wrapper {
  flex: 1 1 0;
  display: flex;
  flex-wrap: nowrap;
  max-width: var(--desktop-small);
  width: 100%;
  margin: 0 auto;
  padding: var(--padd-page);

  .allAthletesPage__athletesList__wrapper {
    flex: 1 1 300px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;

    background-color: var(--background--card);
    box-shadow: var(--container-shadow-l);
    border: 1px solid var(--border-container);
    border-radius: 4px;

    .allAthletesPage__athletesList {
      flex: 1 1 0;
      display: flex;
      flex-direction: column;

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
