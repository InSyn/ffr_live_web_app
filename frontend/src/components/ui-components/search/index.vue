<template>
  <form class="search_wrapper" @submit.prevent="search">
    <div class="search_body">
      <div v-for="(_, key) in getSearchFields" :key="key" class="searchControl__wrapper">
        <label :for="key" class="searchControl__label">
          {{ translateField(key) }}
        </label>

        <sport-input v-if="key === 'sport'" v-model="getSearchFields[key]"></sport-input>
        <discipline-input v-else-if="key === 'discipline'" v-model="getSearchFields[key]"></discipline-input>
        <gender-input v-else-if="key === 'gender'" v-model="getSearchFields[key]"></gender-input>
        <athlete-category-input v-else-if="key === 'category'" v-model="getSearchFields[key]"></athlete-category-input>
        <jury-category-input v-else-if="key === 'jury_category'" v-model="getSearchFields[key]"></jury-category-input>

        <date-input v-else-if="key === 'date'" v-model="getSearchFields[key]"></date-input>
        <season-input v-else-if="key === 'season'" v-model="getSearchFields[key]"></season-input>

        <input v-else v-model="getSearchFields[key]" :id="key" :name="key" class="searchInput__control" />
      </div>
    </div>

    <div class="search_actions">
      <v-btn type="submit" class="search__button" color="var(--text-contrast)"> Поиск </v-btn>
    </div>
  </form>
</template>

<script>
import axios from 'axios';
import { databaseUrl } from '@/store/constants';
import { translateField } from '@/utils/formFields-translator';
import DisciplineInput from '@/components/ui-components/search/search-inputs/discipline-input.vue';
import SportInput from '@/components/ui-components/search/search-inputs/sport-input.vue';
import GenderInput from '@/components/ui-components/search/search-inputs/gender-input.vue';
import AthleteCategoryInput from '@/components/ui-components/search/search-inputs/athlete-category-input.vue';
import JuryCategoryInput from '@/components/ui-components/search/search-inputs/jury-category-input.vue';
import DateInput from '@/components/ui-components/search/search-inputs/date-input.vue';
import SeasonInput from '@/components/ui-components/search/search-inputs/season-input.vue';

export default {
  name: 'search',
  components: {
    SeasonInput,
    DateInput,
    JuryCategoryInput,
    AthleteCategoryInput,
    GenderInput,
    SportInput,
    DisciplineInput,
  },
  props: ['mode'],
  methods: {
    translateField,
    async search() {
      this.$emit('search-loading', true);
      try {
        const searchParams = new URLSearchParams();
        for (const [key, value] of Object.entries(this.getSearchFields)) {
          if (value) {
            searchParams.append(key, value);
          }
        }
        const queryString = searchParams.toString();

        const response = await axios.get(`${databaseUrl}/${this.mode}/find${queryString ? '?' + queryString : ''}`);
        if (response.status === 200) {
          this.$emit('search-results-loaded', response.data[this.mode]);
          this.$emit('search-loading', false);
        }
      } catch (e) {
        if (e) {
          console.error('Error fetching events:', e.response?.data?.message || e.message);
          this.$emit('search-loading', false);
        }
      }
    },
  },
  data() {
    return {
      searchFilters: {
        events: {
          title: '',
          discipline: '',
          season: '',
          date: '',
          location: '',
          calendar_code: '',
        },
        athletes: {
          rus_code: '',
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
          discipline: '',
          gender: '',
          age: '',
          jury_category: '',
          region: '',
        },
        trainers: {
          trainer_id: '',
          fullname: '',
          discipline: '',
          gender: '',
          region: '',
        },
        organizations: {
          title: '',
          region: '',
        },
        seminars: {
          discipline: '',
          season: '',
          region: '',
          location: '',
          date: '',
        },
      },
    };
  },
  computed: {
    getSearchFields() {
      return this.searchFilters[this.mode] || {};
    },
  },
};
</script>

<style scoped lang="scss">
@import url('search-inputs/search-input-style.css');

.search_wrapper {
  position: relative;
  align-self: flex-start;
  width: 368px;
  margin: 32px 16px auto 0;
  padding: 32px 16px 24px;
  background-color: var(--background--card);
  box-shadow: var(--container-shadow-s);
  border: 1px solid var(--border-container);
  border-radius: 4px;

  @media screen and (max-width: 900px) {
    display: none;
  }

  .search_body {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .searchControl__wrapper {
      display: flex;
      align-items: center;
      flex-wrap: nowrap;
      gap: 4px;
      padding-bottom: 4px;
      border-bottom: 1px solid var(--background--card-hover);
      transition: border-bottom-color 92ms;

      &:focus-within {
        border-bottom: 1px solid var(--text-muted);
      }

      .searchControl__label {
        flex: 1 1 0;

        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        user-select: none;

        &:hover {
          overflow: visible;
        }
      }
    }
  }

  .search_actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;

    .search__button {
      padding: 3px 1rem !important;
      font-size: 1rem;
      letter-spacing: 0;
      text-transform: capitalize;
    }
  }
}
</style>
