<template>
  <div v-if="competition" class="pedestal__wrapper">
    <div class="pedestalAthlete_wrapper" v-for="athletePlace in [1, 0, 2]" v-show="pedestalAthletes[athletePlace]" :key="athletePlace">
      <div v-if="pedestalAthletes[athletePlace]" class="pedestalAthleteImage__wrapper">
        <img
          v-if="pedestalAthletes[athletePlace]['photo_url']"
          class="pedestalAthlete__image"
          :src="uploadsFolderUrl() + `${pedestalAthletes[athletePlace]['photo_url']}`"
          alt="img"
          loading="lazy"
        />
        <athlete-photo-filler-icon v-else class="athletePhotoFiller__icon" :gender="pedestalAthletes[athletePlace]?.gender"></athlete-photo-filler-icon>
        <country-flag
          class="countryFlag"
          v-for="(region, idx) in pedestalAthletes[athletePlace]['regions']"
          :key="idx"
          is-region-flag="true"
          :country-code="pedestalAthletes[athletePlace].country_code"
          :region-code="getRegionCode(region)"
          :style="{
            zIndex: -idx,
            transform: `translate(${4 * idx}px, ${6 * idx}px)`,
          }"
          width="1.5rem"
        ></country-flag>
        <div class="athleteMedal" :style="{ backgroundColor: getMedalColor(athletePlace) }">
          <span>{{ athletePlace + 1 }}</span>
        </div>
      </div>
      <div v-if="pedestalAthletes[athletePlace]" class="pedestalAthleteInfo__wrapper">
        <router-link
          v-if="pedestalAthletes[athletePlace].rus_code"
          class="athleteName__link"
          :to="{
            name: 'athletePage',
            params: { athlete_code: pedestalAthletes[athletePlace].rus_code },
          }"
        >
          {{ getAthleteName(pedestalAthletes[athletePlace]) }}
        </router-link>
        <div v-else class="athleteName">
          {{ getAthleteName(pedestalAthletes[athletePlace]) }}
        </div>
        <div class="athleteRegions">
          <span class="region__item" v-for="region in pedestalAthletes[athletePlace].regions" :key="region">
            {{ region }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AthletePhotoFillerIcon from '@/assets/svg/athletePhotoFiller-icon.vue';
import CountryFlag from '@/components/ui-components/country-flag.vue';
import { apiUrl, backendRootUrl } from '@/constants';
import { getRegionCode } from '@/store/data/russia-regions';
import { getAthleteName } from '@/utils/data-formaters';
import axios from 'axios';

export default {
  name: 'eventPedestal',
  components: { CountryFlag, AthletePhotoFillerIcon },
  props: {
    competition: {
      type: Object,
    },
  },
  data() {
    return {
      pedestalAthletes: [],
    };
  },
  methods: {
    getAthleteName,
    getRegionCode,
    uploadsFolderUrl() {
      return backendRootUrl;
    },
    async getAthletesTop() {
      if (!this.competition || !this.competition['total_results']) return;

      const resultsTop = this.competition['total_results'].slice(0, 3);
      let athletesTop = [];

      if (resultsTop.length) {
        athletesTop = await Promise.all(
          resultsTop.map(async (result) => {
            let athlete = this.competition['competitors'].find((competitor) => competitor['local_id'] === result['competitor_id']);

            if (athlete && athlete.rus_code) {
              const athleteData = await this.loadAthleteData(athlete.rus_code);
              athlete = { ...athlete, ...athleteData };
            }

            return athlete;
          })
        );
      }

      this.pedestalAthletes = athletesTop;
    },
    async loadAthleteData(code) {
      try {
        const data = await axios.get(apiUrl + '/athletes/' + code);
        if (data.status === 200) {
          const athleteData = data.data.data;
          if (athleteData) return athleteData;
        }
      } catch (err) {
        if (err) {
          console.error(err?.data?.data);
        }
      }
    },
    getMedalColor(place) {
      switch (place) {
        case 0:
          return '#D9C357';
        case 1:
          return '#A3BBD9';
        case 2:
          return '#B16C3A';
        default:
          return 'transparent';
      }
    },
  },

  mounted() {
    this.getAthletesTop();
  },
  watch: {
    'competition.total_results': {
      deep: true,
      handler() {
        this.getAthletesTop();
      },
    },
  },
};
</script>

<style scoped lang="scss">
.pedestal__wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 1.5rem 0;

  .pedestalAthlete_wrapper {
    flex: 0 1 auto;
    position: relative;
    isolation: isolate;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    padding: 8px;

    .pedestalAthleteImage__wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      height: 80px;
      aspect-ratio: 1;

      .pedestalAthlete__image {
        flex: 1 1 0;
        max-height: 100%;
        max-width: 100%;
        border: 1px solid var(--background--primary-hover);
        border-radius: 50%;
      }

      .athletePhotoFiller__icon {
        height: 100%;
        width: 100%;
      }

      .countryFlag {
        position: absolute;
        right: -0.5rem;
        bottom: 0;
      }

      .athleteMedal {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;

        bottom: -1rem;
        left: 50%;
        transform: translateX(-50%);
        width: 1.75rem;
        height: 1.75rem;
        font-size: 1.25rem;

        color: var(--text-contrast);
        box-shadow: 1px 1px 1px 0 var(--text-muted);
        border-radius: 50%;
        line-height: 1.25rem;
      }

      @media screen and (max-width: 1440px) {
        height: 72px;
      }
      @media screen and (max-width: 1200px) {
        height: 64px;
      }
      @media screen and (max-width: 900px) {
        height: 58px;
      }
    }

    .pedestalAthleteInfo__wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 1.25rem;
      transition: color 92ms;

      .athleteName {
        font-size: 1.2rem;
        font-weight: bold;
        text-align: center;
      }

      .athleteName__link {
        font-size: 1.2rem;
        font-weight: bold;
        text-align: center;

        &:hover {
          color: var(--text-hovered);
        }
      }

      .athleteRegions {
        display: flex;
        flex-direction: column;
        margin-top: 0.25rem;

        .region__item {
          display: inline-block;
          font-size: 0.85rem;
          text-align: center;
        }
      }
    }
  }
}
</style>
