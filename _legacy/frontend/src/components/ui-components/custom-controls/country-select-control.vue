<script>
import { countries } from '@/store/data/countries';

export default {
  name: 'country-select-control',
  props: ['value'],
  computed: {
    countries() {
      return countries;
    },
  },
  methods: {
    onChange(event) {
      this.$emit('input', event.target.value);
    },
  },

  mounted() {
    this.$emit('input', this.countries[0].country_name);
  },
};
</script>

<template>
  <select :value="value" @change="onChange" class="countryControl">
    <option v-for="country in countries" :key="country.country_code">
      {{ country.country_name }}
    </option>
  </select>
</template>

<style scoped lang="scss">
.countryControl {
  flex: 1 1 0;
  min-width: 0;
  width: 100%;
  max-width: 32ch;
  padding: 3px 6px;
  color: var(--text-default);
  background-color: var(--background--card-secondary);
  border-radius: 2px;
  outline: transparent;
  transition: background-color 92ms;
}
</style>
