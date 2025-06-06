<script>
import { mdiEyeOff, mdiNumeric10BoxMultiple } from '@mdi/js';
import { getRegionCode } from '@/store/data/russia-regions';
import { getCountryCode } from '@/store/data/countries';
import { isLoggedIn } from '@/utils/auth-helpers';
import CountryFlag from '@/components/ui-components/country-flag.vue';

export default {
  name: 'resultsTable-SX-qual',
  components: { CountryFlag },
  props: ['competition', 'selectedStage'],
  data() {
    return {
      icons: {
        showMarksButtonIcon: mdiNumeric10BoxMultiple,
        closeMarksIcon: mdiEyeOff,
      },
      marksFilter: null,
      raceFilter: {
        type: null,
        target: null,
      },
    };
  },
  computed: {
    getSheetContent() {
      switch (this.raceFilter.type) {
        case 'start-list':
          return this.getRaceStartlist(this.raceFilter.target);

        case 'race-results':
          return this.getRaceResults(this.raceFilter.target);

        case 'overall':
          return this.getTotalResults();

        default:
          return [];
      }
    },
    onDistance() {
      if (!this.raceFilter.target) return null;

      const selectedRace = this.competition['races'].find((race) => race['race_id'] === this.raceFilter.target);
      if (!selectedRace) return null;

      const competitorOnTrack = this.competition['competitors'].find((competitor) => competitor['local_id'] === selectedRace['active_athlete']);

      if (!competitorOnTrack) return null;

      return competitorOnTrack;
    },
  },
  methods: {
    getRegionCode,
    getCountryCode,
    isLoggedIn,
    getAthlete(competitor_id) {
      const athlete = this.competition['competitors'].find((athlete) => athlete['local_id'] === competitor_id);

      if (!athlete) return null;

      return athlete;
    },
    getRaceStartlist(race_id) {
      if (!race_id) return [];

      const race = this.competition['races'].find((race) => race['race_id'] === race_id);
      if (!race) return [];

      return race['start_list'].map((competitor_id) => this.getAthlete(competitor_id));
    },
    getRaceResults(race_id) {
      if (!race_id) return [];

      const race = this.competition['races'].find((race) => race['race_id'] === race_id);
      if (!race) return [];

      const resultsList = new Array(...race['results']).map((result) => {
        const athlete = this.getAthlete(result['competitor_id']);
        if (!athlete) return;

        return { ...athlete, result };
      });

      return resultsList;
    },
    getTotalResults() {
      const totalResultsList = new Array(...this.competition['total_results']).map((totalResult) => {
        if (!totalResult) return;

        const athlete = this.getAthlete(totalResult['competitor_id']);
        if (!athlete) return;

        const raceResults = this.competition['races'].map((race) => {
          return race.results.find((raceResult) => raceResult['competitor_id'] === athlete['local_id']);
        });

        return { ...athlete, raceResults, totalResult };
      });

      return totalResultsList.filter((result) => !!result);
    },
    selectMarksToShow(competitor_id) {
      if (!competitor_id) return;

      this.marksFilter === competitor_id ? (this.marksFilter = null) : (this.marksFilter = competitor_id);
    },
    setResultsFilter(filter) {
      const filter_arr = filter.split(':');

      this.raceFilter.type = filter_arr[0];
      this.raceFilter.target = filter_arr[1] ? filter_arr[1] : '';
    },
    navigateToAthletePage(athlete_code) {
      if (!athlete_code) return;

      this.$router.push(`/athlete-info/${athlete_code}`);
    },
  },

  watch: {
    selectedStage: function (val, oldVal) {
      if (val === oldVal) return;

      if (this.competition['races'].length > 0) {
        this.setResultsFilter(`start-list:${this.competition['races'][0]['race_id']}`);
        return;
      }
      this.raceFilter = 'overall';
    },
  },
  mounted() {
    if (this.competition['races'].length > 0) {
      this.setResultsFilter(`start-list:${this.competition['races'][0]['race_id']}`);
      return;
    }
    this.raceFilter.type = 'overall';
  },
};
</script>

<template>
  <div v-if="competition" class="competitionResults__wrapper">
    <div v-if="competition['races'].length > 0" class="raceSelect__wrapper">
      <div class="raceFilters__group startListFilters__wrapper">
        <button
          v-for="race in competition['races']"
          :key="`SLFilter_${race['race_id']}`"
          @click="setResultsFilter(`start-list:${race['race_id']}`)"
          :class="['raceSelect__button', 'startList', raceFilter.type === 'start-list' && raceFilter.target === race['race_id'] && 'isSelectedFilter']"
        >
          Старт-лист&nbsp;{{ race.title }}
        </button>
      </div>

      <div class="raceFilters__group raceResultsFilters__wrapper">
        <button
          v-for="race in competition['races']"
          :key="`RFilter_${race._id}`"
          @click="setResultsFilter(`race-results:${race['race_id']}`)"
          :class="['raceSelect__button', 'raceResults', raceFilter.type === 'race-results' && raceFilter.target === race['race_id'] && 'isSelectedFilter']"
        >
          {{ race.title }}
        </button>
      </div>

      <div class="raceFilters__group overallResultFilter__wrapper">
        <button @click="setResultsFilter('overall')" :class="['raceSelect__button', 'overallResult', raceFilter.type === 'overall' && 'isSelectedFilter']">
          Результаты
        </button>
      </div>
    </div>

    <div class="resultsTable__wrapper">
      <div class="resultsTable__header">
        <div class="resultsTable__tableValue" data-header-value="rank">
          {{ raceFilter.type === 'start-list' ? 'Ст. №' : 'Место' }}
        </div>
        <div class="resultsTable__tableValue" data-header-value="bib">Н/Н</div>
        <div class="resultsTable__tableValue" data-header-value="name">Фамилия, имя</div>

        <div
          v-show="raceFilter.type === 'overall'"
          v-for="race in competition['races']"
          :key="`rr_${race._id}`"
          class="resultsTable__tableValue"
          data-header-value="raceResult"
        >
          {{ race.title }}
        </div>

        <div v-if="raceFilter.type !== 'start-list'" class="resultsTable__tableValue" data-header-value="overallResult">Рез-т</div>
        <div v-if="raceFilter.type === 'overall'" class="resultsTable__tableValue" data-header-value="gap">Отставание</div>
      </div>

      <div class="resultsSheet__body">
        <div
          v-for="(competitor, comp_idx) in getSheetContent"
          :key="comp_idx"
          :class="['resultsSheet__competitorResult', comp_idx % 2 > 0 && 'isOddCompetitor']"
        >
          <div class="resultsTable__tableValue" data-header-value="rank">
            {{ comp_idx + 1 }}
          </div>
          <div class="resultsTable__tableValue" data-header-value="bib">
            {{ competitor['bib'] }}
          </div>

          <div v-if="competitor.region" class="athleteFlags__wrapper">
            <country-flag
              v-for="athleteRegion in competitor.region.split(',')"
              :key="athleteRegion"
              :is-region-flag="!!getRegionCode(athleteRegion)"
              :country-code="getCountryCode(competitor.country || 'Россия')"
              :region-code="getRegionCode(athleteRegion)"
              height="1rem"
              rounding="2px"
            ></country-flag>
          </div>

          <div @click="navigateToAthletePage(competitor.ffr_id)" class="resultsTable__tableValue" data-header-value="name">
            <span>{{ `${competitor['lastname'].toUpperCase()} ${competitor['name']}` }}</span>
          </div>

          <div
            v-if="raceFilter.type === 'race-results'"
            :key="`raceRes_${competitor['local_id']}`"
            class="resultsTable__tableValue"
            data-header-value="raceResult"
          >
            <v-btn v-show="isLoggedIn()" @click="selectMarksToShow(competitor['local_id'])" class="showMarks__button" color="var(--text-default)" small text>
              <v-icon v-if="marksFilter === competitor['local_id']" size="1.2rem">
                {{ icons.closeMarksIcon }}
              </v-icon>
              <v-icon v-else size="1.2rem">{{ icons.showMarksButtonIcon }} </v-icon>
            </v-btn>

            <div v-if="raceFilter.type === 'race-results' && marksFilter === competitor['local_id']" class="competitorRaceMarks__wrapper">
              <div v-for="mark in competitor.result.marks" :key="mark['judge']" class="competitorRaceMarks__item">
                {{ `С${mark['judge_id']}: ` }}
                <span class="competitorRaceMarks__item__value">
                  {{ mark.value }}
                </span>
              </div>
            </div>

            {{ competitor.result.value }}
          </div>

          <!--          <div v-for="(raceResult, idx) in competitor.raceResults" :key="`raceRes_${idx}`" class="resultsTable__tableValue" data-header-value="raceResult">-->
          <!--            <span v-if="raceFilter.type === 'overall'">-->
          <!--              {{ raceResult ? raceResult.value : '' }}-->
          <!--            </span>-->
          <!--          </div>-->

          <div v-if="raceFilter.type === 'overall'" class="resultsTable__tableValue" data-header-value="overallResult">
            {{ competitor.totalResult.value }}
          </div>
          <div v-if="raceFilter.type === 'overall'" class="resultsTable__tableValue" data-header-value="gap">
            {{ competitor.totalResult.gap !== null ? competitor.totalResult.gap : '-' }}
          </div>
        </div>
      </div>
    </div>

    <div class="competitorOnDistance__wrapper">
      <div class="competitorOnDistance__title">На дистанции</div>

      <div v-if="onDistance" class="competitorOnDistance__body">
        {{ `${onDistance['bib']} ${onDistance['name']} ${onDistance['lastname']}` }}
      </div>

      <div v-else class="competitorOnDistance__empty">Ожидание...</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.competitionResults__wrapper {
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
}

.raceSelect__wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  margin-bottom: 8px;
}

.raceFilters__group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.overallResultFilter__wrapper {
  margin-left: auto;
}

.raceSelect__button {
  flex: 0 0 auto;
  padding: 0.4rem 1rem;

  background-color: var(--background--card);
  color: var(--text-default);
  border-radius: 2px;
  transition: background-color 92ms, color 92ms, transform 64ms ease-in;
}

.raceSelect__button:hover,
.raceSelect__button:focus {
  background-color: var(--ffr-brand);
  color: var(--text-contrast);
}

.raceSelect__button.overallResult {
  font-weight: bold;
}

/*noinspection CssUnusedSymbol*/
.isSelectedFilter {
  background-color: var(--ffr-brand);
  color: var(--text-contrast);
  transform: translateY(4px);
}

.resultsTable__wrapper {
  flex: 1 1 200px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--background--card);
  box-shadow: var(--container-shadow-m);
  border: 1px solid var(--border-container);
  border-radius: 4px;
}

.resultsTable__header {
  flex: 0 0 auto;
  display: flex;
  flex-wrap: nowrap;
  font-weight: bold;
}

.resultsTable__tableValue {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem 0.5rem;
  text-align: center;
  white-space: nowrap;
}

.resultsTable__tableValue[data-header-value='rank'] {
  flex: 2 0 0;
  min-width: 3rem;
  max-width: 5rem;
}
.resultsTable__tableValue[data-header-value='bib'] {
  flex: 2 0 0;
  min-width: 3rem;
  max-width: 5rem;
  font-weight: bold;
}
.resultsTable__tableValue[data-header-value='name'] {
  position: relative;
  flex: 8 0 0;
  justify-content: flex-start;
  min-width: 12rem;
  max-width: 32rem;
  margin-right: auto;

  text-align: left;
  cursor: pointer;
}
.resultsTable__tableValue[data-header-value='name']:hover {
  font-weight: bold;
}

.athleteFlags__wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  height: 100%;
  max-width: 36px;
  padding: 3px 6px;
}

.athleteFlags__wrapper img {
  max-height: 100%;
  min-width: 100%;
}

.resultsTable__tableValue[data-header-value='raceResult'] {
  position: relative;
  flex: 2 0 0;
  min-width: 3rem;
  max-width: 5rem;
}

.showMarks__button {
  position: absolute;
  right: 100%;

  height: 100% !important;
  min-width: 0 !important;
  padding: 0 1rem !important;

  font-weight: bold;
  font-size: 0.75rem;
  letter-spacing: 1px;
  opacity: 0.25;
  transition: opacity 92ms;
}

.resultsSheet__competitorResult:hover .showMarks__button {
  opacity: 1;
}

.competitorRaceMarks__wrapper {
  position: absolute;
  height: 100%;
  right: 100%;
  margin-right: 100%;
  display: flex;
  align-items: center;
  padding: 3px 6px;

  background-color: var(--background--card-hover);
  border-radius: 2px;
}

.competitorRaceMarks__item {
  white-space: nowrap;
  font-size: 0.85rem;
}

.competitorRaceMarks__item__value {
  font-weight: bold;
}

.competitorRaceMarks__item:not(:last-child) {
  margin-right: 6px;
}

.resultsTable__tableValue[data-header-value='overallResult'] {
  flex: 2 0 0;
  min-width: 3rem;
  max-width: 5rem;
  font-weight: bold;
}
.resultsTable__tableValue[data-header-value='gap'] {
  flex: 1 0 0;
  min-width: 3rem;
  max-width: 7rem;
}

.resultsSheet__body {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  overflow-y: auto;
}

@media screen and (orientation: landscape) {
  .resultsSheet__body {
    flex-basis: 200px;
  }
}

.resultsSheet__competitorResult {
  flex: 0 0 auto;
  display: flex;
  flex-wrap: nowrap;
  transition: background-color 92ms;
}

.resultsSheet__competitorResult:hover,
.resultsSheet__competitorResult:focus {
  background-color: var(--background--card-hover) !important;
}

/*noinspection CssUnusedSymbol*/
.resultsSheet__competitorResult.isOddCompetitor {
  background-color: var(--background--card-secondary);
}

.competitorOnDistance__wrapper {
  margin: 8px 0;
  width: 100%;
  border-radius: 4px;
  background-color: var(--background--card);
  box-shadow: var(--container-shadow-s);
}

.competitorOnDistance__title {
  padding: 4px 8px;
  font-size: 0.9rem;
  font-weight: bold;
}

.competitorOnDistance__body {
  padding: 3px 6px;
}

.competitorOnDistance__empty {
  padding: 3px 6px;
}
</style>
