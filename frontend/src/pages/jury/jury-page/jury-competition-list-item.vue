<template>
  <div class="juryEvent__item__wrapper">
    <div class="event__image__wrapper">
      <img v-if="event['logo_image_url']" :src="uploadsFolderUrl + event['logo_image_url']" alt="Event Logo" loading="lazy" />
      <competition-image-filler-icon v-else></competition-image-filler-icon>
      <country-flag
        class="juryEvent_regionFlag"
        width="1.5rem"
        is-region-flag="true"
        :country-code="getCountryCode(event.country)"
        :region-code="getRegionCode(event.region)"
        rounding="2px"
      ></country-flag>
    </div>
    <div class="juryEvent__item__body">
      <div class="juryEvent__item__topSection">
        <div class="juryEvent__title">
          {{ event.title }}
        </div>
        <div class="juryEvent__sport">
          {{ event.sport }}
          <country-flag class="juryEvent_countryFlag" height="1rem" :country-code="getCountryCode(event.country)"></country-flag>
        </div>
      </div>
      <div class="juryEvent__item__middleSection">
        <div class="juryEvent__date">
          {{ formatDate(event.start_at) }}
        </div>
        <div class="juryEvent__discipline">
          {{ event.discipline }}
        </div>
      </div>
      <div class="juryEvent__item__bottomSection">
        <div class="juryEvent__region">
          {{ event.region }}
        </div>
        <div class="juryEvent__location">
          {{ event.location }}
        </div>

        <div class="juryEvent__role">
          {{ `Позиция:&nbsp;&nbsp;${role}` }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { uploadsFolderUrl } from '@/store/constants';
import CompetitionImageFillerIcon from '@/assets/svg/competitionImageFiller-icon.vue';
import CountryFlag from '@/components/ui-components/country-flag.vue';
import { getCountryCode } from '@/store/data/countries';
import { getRegionCode } from '@/store/data/russia-regions';
import { formatDate } from '@/utils/data-formaters';

export default {
  name: 'jury-competition-list-item',
  components: { CountryFlag, CompetitionImageFillerIcon },
  computed: {
    uploadsFolderUrl() {
      return uploadsFolderUrl;
    },
  },
  props: {
    event: Object,
    jury_code: String,
  },
  data() {
    return {
      role: '',
    };
  },
  methods: {
    formatDate,
    getRegionCode,
    getCountryCode,
    getJuryCompetitionRole() {
      const juryObj = this.event.jury.find((jury) => jury.jury_code === this.jury_code);
      if (!juryObj) return;

      this.role = juryObj.role;
    },
  },

  mounted() {
    this.getJuryCompetitionRole();
  },
};
</script>

<style scoped lang="scss">
.juryEvent__item__wrapper {
  display: flex;
  flex-wrap: nowrap;

  .event__image__wrapper {
    position: relative;
    flex: 0 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 72px;
    aspect-ratio: 1;

    img {
      flex: 1 1 0;
      display: block;
      max-height: 100%;
      max-width: 100%;
    }

    .juryEvent_regionFlag {
      position: absolute;
      bottom: 0;
      right: -0.75rem;
    }

    @media screen and (max-width: 920px) {
      height: 60px;
    }
    @media screen and (max-width: 640px) {
      height: 48px;
    }
  }

  .juryEvent__item__body {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-left: 1.25rem;

    .juryEvent__item__topSection {
      flex: 0 0 auto;
      display: flex;
      flex-wrap: nowrap;

      .juryEvent__title {
        font-size: 1.1rem;
        font-weight: bold;
      }

      .juryEvent__sport {
        display: flex;
        align-items: center;
        margin-left: auto;
        font-size: 1.1rem;

        .juryEvent_countryFlag {
          margin-left: 0.5rem;
        }
      }
    }

    .juryEvent__item__middleSection {
      flex: 0 0 auto;
      display: flex;
      align-items: center;

      .juryEvent__date {
        color: var(--text-muted);
      }

      .juryEvent__discipline {
        margin-left: auto;
      }
    }

    .juryEvent__item__bottomSection {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      margin-top: auto;

      .juryEvent__region {
        margin-left: 0.5rem;
        color: var(--text-muted);
      }

      .juryEvent__location {
        color: var(--text-muted);
      }

      .juryEvent__role {
        margin-left: auto;
      }
    }
  }
}
</style>
