<template>
  <form v-if="selectedFilter" @submit.prevent="getFilteredStats" class="statisticsFilter__wrapper">
    <div class="filters__section__header">Фильтры</div>
    <div class="filters__section__body">
      <div v-for="(_, key) in filters[selectedFilter]" :key="key" class="filterControl__wrapper">
        <sport-input v-if="key === 'sport'" v-model="filters[selectedFilter][key]"></sport-input>
        <discipline-input v-else-if="key === 'discipline'" v-model="filters[selectedFilter][key]"></discipline-input>
        <gender-input v-else-if="key === 'gender'" v-model="filters[selectedFilter][key]"></gender-input>
        <athlete-category-input v-else-if="key === 'category'" v-model="filters[selectedFilter][key]"></athlete-category-input>
        <jury-category-input v-else-if="key === 'jury_category'" v-model="filters[selectedFilter][key]"></jury-category-input>

        <date-input v-else-if="key === 'date'" v-model="filters[selectedFilter][key]"></date-input>

        <input v-else class="searchControl__input" v-model="filters[selectedFilter][key]" :id="key" :name="key" :placeholder="translateField(key)" />
      </div>
    </div>
    <div class="filters__section__actions">
      <div v-if="filterResults !== null" class="results__section">
        Найдено: {{ filterResults.length }}

        <v-btn @click="downloadFilteredStats()" icon>
          <v-icon class="downloadStats__icon">
            {{ icons.mdiDownload }}
          </v-icon>
        </v-btn>
      </div>

      <v-btn type="submit" color="var(--accent)" text> Применить фильтр</v-btn>
    </div>
  </form>
</template>

<script>
import SportInput from '@/components/ui-components/search/search-inputs/sport-input.vue';
import GenderInput from '@/components/ui-components/search/search-inputs/gender-input.vue';
import DisciplineInput from '@/components/ui-components/search/search-inputs/discipline-input.vue';
import AthleteCategoryInput from '@/components/ui-components/search/search-inputs/athlete-category-input.vue';
import JuryCategoryInput from '@/components/ui-components/search/search-inputs/jury-category-input.vue';
import DateInput from '@/components/ui-components/search/search-inputs/date-input.vue';
import { translateField } from '@/utils/formFields-translator';
import axios from 'axios';
import { apiUrl } from '@/constants';
import { mdiDownload } from '@mdi/js';
import { saveExcelData } from '@/utils/excelData-saver';

export default {
  name: 'stat-filters',
  props: {
    selectedFilter: String,
  },
  components: {
    DateInput,
    JuryCategoryInput,
    AthleteCategoryInput,
    DisciplineInput,
    GenderInput,
    SportInput,
  },
  data() {
    return {
      filterResults: null,
      filters: {
        events: {
          title: '',
          sport: '',
          discipline: '',
          season: '',
          date: '',
          location: '',
          calendar_code: '',
        },
        athletes: {
          ffr_id: '',
          sport: '',
          discipline: '',
          name: '',
          gender: '',
          year: '',
          category: '',
          region: '',
        },
        jury: {
          jury_code: '',
          name: '',
          sport: '',
          discipline: '',
          gender: '',
          age: '',
          jury_category: '',
          region: '',
        },
        trainers: {
          trainer_id: '',
          fullname: '',
          sport: '',
          discipline: '',
          gender: '',
          region: '',
        },
        organizations: {
          sport: '',
          title: '',
          region: '',
        },
        seminars: {
          sport: '',
          discipline: '',
          season: '',
          region: '',
          location: '',
          date: '',
        },
      },
      loading: false,

      icons: {
        mdiDownload,
      },
    };
  },
  methods: {
    translateField,

    async getFilteredStats() {
      try {
        const searchParams = new URLSearchParams();
        for (const [key, value] of Object.entries(this.filters[this.selectedFilter])) {
          if (value) {
            searchParams.append(key, value);
          }
        }
        const queryString = searchParams.toString();

        const response = await axios.get(`${apiUrl}/${this.selectedFilter}/find${queryString ? '?' + queryString : ''}`);
        if (response.status === 200) {
          this.filterResults = response.data[this.selectedFilter];
        }
      } catch (e) {
        if (e) {
          console.error('Error fetching events:', e.response?.data?.message || e.message);
        }
      }
    },
    async downloadFilteredStats() {
      saveExcelData(this.filterResults, this.selectedFilter);
    },
  },

  watch: {
    selectedFilter(val, newVal) {
      if (val !== newVal) this.filterResults = null;
    },
  },
};
</script>

<style scoped lang="scss">
.statisticsFilter__wrapper {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--text-depressed);

  .filters__section__header {
    flex: 0 0 auto;
    padding: 0 0.5rem 0.25rem;
    font-weight: bold;
  }

  .filters__section__body {
    flex: 0 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    grid-gap: 0.5rem 0.75rem;

    .filterControl__wrapper {
      display: flex;

      input {
        flex: 1 1 0;
        padding: 4px 8px;
        color: var(--text-default);
        background-color: var(--background--card-secondary);
        border-radius: 2px;
        outline: transparent;
        transition: background-color 92ms;

        &:focus {
          background-color: var(--background--card-hover);
        }
      }
    }
  }

  .filters__section__actions {
    margin-top: 1.75rem;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    padding: 0 1rem;

    .results__section {
      flex: 1 1 0;
      display: flex;
      align-items: center;
      font-weight: bold;
      font-size: 1.2rem;

      button {
        margin-left: 1rem;
        color: var(--text-muted);

        &:hover {
          color: var(--accent);
        }
      }
    }

    button {
      margin-left: auto;
    }
  }
}
</style>
