<template>
  <div class="statistics__wrapper">
    <div class="statistics__header">Статистика базы данных</div>

    <div v-if="!loading" class="statistics__body">
      <div class="statistics__list">
        <div
          :class="['statistics__item', selectedFilter === key ? 'activeFilter' : '']"
          @click="selectFilters(key)"
          v-for="(_, key) in stats_overall"
          :key="key"
        >
          <div class="statistics__item__name">
            {{ menuTranslationMap[key] }}
          </div>
          <div class="statistics__item__count">
            {{ stats_overall[key] ? stats_overall[key] : '' }}
          </div>

          <v-btn @click.stop="downloadStats(key)" class="downloadStats__button" small icon>
            <v-icon class="downloadStats__icon">
              {{ icons.mdiDownload }}
            </v-icon>
          </v-btn>
        </div>
      </div>

      <stat-filters :selected-filter="selectedFilter"></stat-filters>
    </div>
    <loader-spinner v-else></loader-spinner>
  </div>
</template>

<script>
import axios from 'axios';
import { mdiDownload } from '@mdi/js';
import { databaseUrl } from '@/store/constants';
import LoaderSpinner from '@/components/ui-components/loader-spinner.vue';
import { saveExcelData } from '@/utils/excel-data-saver';
import StatFilters from '@/pages/user/statistics/stat-filters.vue';

export default {
  name: 'statistics',
  components: { StatFilters, LoaderSpinner },
  data() {
    return {
      menuTranslationMap: {
        events: 'События',
        athletes: 'Спортсмены',
        jury: 'Судьи',
        trainers: 'Тренеры',
        organizations: 'Организации',
        seminars: 'Семинары',
      },
      stats_overall: {
        events: null,
        athletes: null,
        jury: null,
        trainers: null,
        organizations: null,
        seminars: null,
      },
      selectedFilter: '',
      filters: {
        events: {},
        athletes: {},
        jury: {},
        trainers: {},
        organizations: {},
        seminars: {},
      },

      loading: false,
      icons: {
        mdiDownload,
      },
    };
  },
  methods: {
    async loadStatistics() {
      this.loading = true;

      try {
        const response = await axios.get(databaseUrl + '/stats/overall');
        if (response.status === 200) {
          const stats = response.data.statistics;

          for (let statsKey in stats) {
            if (statsKey in this.stats_overall) {
              this.stats_overall[statsKey] = stats[statsKey];
            }
          }
        }
      } catch (err) {
        if (err) {
          console.error(err?.data?.message);
        }
      } finally {
        this.loading = false;
      }
    },
    selectFilters(filter) {
      if (filter === this.selectedFilter) this.selectedFilter = '';
      else this.selectedFilter = filter;
    },
    async downloadStats(dataKey) {
      try {
        const response = await axios.get(databaseUrl + `/${dataKey}`);
        if (response.status === 200) {
          const statsData = response.data[dataKey];
          saveExcelData(statsData, dataKey);
        }
      } catch (err) {
        if (err) {
          console.error(err?.data?.message);
        }
      }
    },
  },

  mounted() {
    this.loadStatistics();
  },
};
</script>

<style scoped lang="scss">
.statistics__wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 2rem 2rem;

  background-color: var(--background--card);
  box-shadow: var(--container-shadow-s);
  border: 1px solid var(--border-container);
  border-radius: 4px;

  .statistics__header {
    font-size: 1.2rem;
  }

  .statistics__body {
    display: flex;
    flex-direction: column;

    .statistics__list {
      flex: 0 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      grid-gap: 0.5rem 0.75rem;

      .statistics__item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem 1rem;

        background-color: var(--background--card-secondary);
        border: 2px solid var(--text-depressed);
        border-radius: 2px;
        font-size: 1.1rem;

        user-select: none;
        cursor: pointer;
        transition: background-color 92ms, border-color 92ms;

        &:hover {
          border-color: var(--text-hovered);
          background-color: var(--background--card-hover);
        }

        &.activeFilter {
          background-color: var(--background--card-hover);
          border-color: var(--accent);
        }

        .statistics__item__count {
          flex: 0 0 auto;
          font-weight: bold;
        }

        .statistics__item__name {
          flex: 0 0 auto;
        }

        .downloadStats__button {
          margin-left: auto;
          color: var(--text-depressed);

          &:hover {
            color: var(--success);
          }
        }
      }
    }
  }
}
</style>
