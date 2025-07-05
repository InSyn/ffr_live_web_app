<template>
  <div class="athleteMedals__wrapper">
    <div class="medalEvent__wrapper" v-for="(medalEvent, key) in getAthleteMedals()" :key="key">
      <abbr class="medalEventName" :title="medalEvent.name" :aria-label="medalEvent.name">
        {{ getMedalEventAbbr(medalEvent.name) }}
      </abbr>

      <div v-for="medalType in ['gold', 'silver', 'bronze']" :key="medalType" v-show="medalEvent[medalType] > 0" class="medals__wrapper">
        <div class="medalIcons__wrapper">
          <div
            v-for="(medalNum, m_idx) in medalEvent[medalType]"
            :key="`${medalType}_${medalNum}`"
            class="medal__icon"
            :style="{
              backgroundColor: getMedalColor(medalType),
              left: 3 * m_idx + 'px',
              zIndex: -m_idx,
            }"
          >
            {{ medalNum === 1 ? medalEvent[medalType] : '' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getMedalEventAbbr } from '@/store/data/medal-events';

export default {
  name: 'athleteMedals',
  props: ['medals'],
  methods: {
    getMedalEventAbbr,
    getAthleteMedals() {
      if (!this.medals.length) return [];
      return this.medals;
    },
    getMedalColor(medalType) {
      switch (medalType) {
        case 'gold':
          return '#D9C357';
        case 'silver':
          return '#A3BBD9';
        case 'bronze':
          return '#B16C3A';
        default:
          return 'transparent';
      }
    },
  },
};
</script>

<style scoped lang="scss">
.athleteMedals__wrapper {
  display: flex;
  flex-direction: column;
  gap: 3px;

  .medalEvent__wrapper {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    gap: 6px;

    .medalEventName {
      display: block;
      margin-right: 0.5rem;
      text-decoration: none;
      cursor: help;
      font-size: 1rem;
    }

    .medals__wrapper {
      display: flex;
      flex-wrap: nowrap;

      .medalIcons__wrapper {
        position: relative;
        isolation: isolate;
        flex: 0 1 0;
        display: flex;
        overflow: visible;
        height: 1.25rem;
        width: 1.25rem;

        .medal__icon {
          position: absolute;
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 1.25rem;
          width: 1.25rem;
          box-shadow: 1px 1px 1px 0 var(--text-contrast);
          border-radius: 50%;
          font-size: 0.75rem;
        }
      }
    }
  }
}
</style>
