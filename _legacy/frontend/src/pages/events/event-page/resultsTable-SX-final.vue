<script>
import CountryFlag from '@/components/ui-components/country-flag.vue';
import { getRegionCode } from '@/store/data/russia-regions';
import { getCountryCode } from '@/store/data/countries';
import { isLoggedIn } from '@/utils/auth-helpers';
import { getSXHeatCompetitorColor } from '@/utils/competition-utils';

export default {
  name: 'resultsTable-SX-final',
  components: { CountryFlag },
  props: ['competition', 'selectedStage'],
  data() {
    return {
      raceFilter: {
        type: null,
        target: null,
      },
    };
  },
  methods: {
    getSXHeatCompetitorColor,
    getRegionCode,
    getCountryCode,
    isLoggedIn,
    getAthlete(competitor_id) {
      return this.competition.competitors.find((athlete) => athlete.bib.toString() === competitor_id.toString()) || null;
    },
    getHeats(race_id) {
      const race = this.competition.races.find((race) => race.race_id === race_id);
      if (!race || !race.heats) return [];

      return race.heats.map((heat) => {
        const competitors = heat.competitors.map((competitor_id, index) => {
          const athlete = this.getAthlete(competitor_id);
          return {
            ...athlete,
            result: heat.results[index] || '',
            position: index + 1,
          };
        });

        return { competitors, title: heat.title || `Heat ${heat._id}` };
      });
    },
    setResultsFilter(filter) {
      const [type, target] = filter.split(':');
      this.raceFilter.type = type;
      this.raceFilter.target = target || null;
    },
    getHeatTitle(heatIdx) {
      const race = this.competition.races.find((race) => race.race_id === this.raceFilter.target);
      return `${race.title} - Заезд ${heatIdx + 1}`;
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
        this.setResultsFilter(`race-results:${this.competition['races'][0]['race_id']}`);
        return;
      }
      this.raceFilter = 'overall';
    },
  },
  mounted() {
    if (this.competition['races'].length > 0) {
      this.setResultsFilter(`race-results:${this.competition['races'][0]['race_id']}`);
      return;
    }
    this.raceFilter.type = 'overall';
  },
};
</script>

<template>
  <div v-if="competition" class="competitionResults__wrapper">
    <div v-if="competition.races.length > 0" class="raceSelect__wrapper">
      <div class="raceFilters__group raceResultsFilters__wrapper">
        <button
          v-for="race in competition.races"
          :key="`RFilter_${race._id}`"
          @click="setResultsFilter(`race-results:${race.race_id}`)"
          :class="['raceSelect__button', 'raceResults', raceFilter.type === 'race-results' && raceFilter.target === race.race_id && 'isSelectedFilter']"
        >
          {{ race.title }}
        </button>
      </div>
    </div>

    <div class="resultsTable__wrapper">
      <div class="resultsTable__header">
        <div class="resultsTable__tableValue" data-header-value="position">Ст. №</div>
        <div class="resultsTable__tableValue" data-header-value="bib">Н/Н</div>
        <div class="resultsTable__tableValue" data-header-value="name">Фамилия, имя</div>
        <div class="resultsTable__tableValue" data-header-value="overallResult">Место</div>
      </div>

      <div class="resultsSheet__body">
        <div v-for="(heat, heat_idx) in getHeats(raceFilter.target)" :key="heat.title" class="heatResults__wrapper">
          <div class="heatResults__header">
            {{ getHeatTitle(heat_idx) }}
          </div>
          <div class="heatResults__competitors">
            <div v-for="(competitor, competitor_idx) in heat.competitors" :key="competitor_idx" class="resultsSheet__competitorResult">
              <div class="resultsTable__tableValue" data-header-value="position">
                <div class="sx-color-wrapper" :style="{ backgroundColor: `var(${getSXHeatCompetitorColor(competitor_idx + 1)})` }">
                  {{ competitor ? competitor.position : '-' }}
                </div>
              </div>
              <div class="resultsTable__tableValue" data-header-value="bib">
                {{ competitor ? competitor.bib : '-' }}
              </div>
              <div class="resultsTable__tableValue" data-header-value="name" @click="navigateToAthletePage(competitor.ffr_id)">
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
                {{ `${competitor && competitor.lastname ? competitor.lastname.toUpperCase() + ' ' : ''}${competitor.name || '-'}` }}
              </div>
              <div class="resultsTable__tableValue" data-header-value="overallResult">
                {{ competitor.result || '-' }}
              </div>
            </div>
          </div>
        </div>
      </div>
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
  padding: 2px 4px;
  text-align: center;
  white-space: nowrap;

  .sx-color-wrapper {
    flex: 1 1 0;
    border-radius: 2px;
  }
}

.resultsTable__tableValue[data-header-value='position'] {
  flex: 2 0 0;
  min-width: 2rem;
  max-width: 3.75rem;
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
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  height: 100%;
  margin-right: 0.5rem;
  padding: 2px 4px;
}

.athleteFlags__wrapper img {
  max-height: 100%;
  min-width: 100%;
}

.resultsTable__tableValue[data-header-value='overallResult'] {
  flex: 2 0 0;
  min-width: 3rem;
  max-width: 5rem;
  font-weight: bold;
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

/* finals updates */
.heatResults__wrapper {
  margin-bottom: 0.75rem;
}

.heatResults__header {
  font-weight: bold;
  margin-bottom: 0.5rem;
  padding: 0.25rem 0.75rem;
}

.heatResults__competitors {
  display: flex;
  flex-direction: column;
}

.resultsTable__tableValue {
  padding: 2px 4px;
  border-bottom: 1px solid var(--border-color);
}

.resultsTable__tableValue[data-header-value='position'] {
  font-weight: bold;
}
</style>
