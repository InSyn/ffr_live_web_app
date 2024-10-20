<template>
  <select
    @input="$emit('input', $event.target.value)"
    id="category"
    name="category"
    :class="['searchInput__control', !elemValue && 'empty']"
  >
    <option :data-cancel-option="!!elemValue" value="">
      {{ elemValue ? "Очистить" : "Выбрать разряд..." }}
    </option>
    <option
      v-for="category in categoriesList"
      :key="category"
      :value="category"
    >
      {{ category }}
    </option>
  </select>
</template>

<script>
import { getAthletesRanksList } from "@/store/data/sport-data-sets";

export default {
  name: "athlete-category-input",
  computed: {
    categoriesList() {
      return getAthletesRanksList();
    },
    elemValue() {
      return this.$attrs.value;
    },
  },
};
</script>

<style scoped>
@import "search-input-style.css";
</style>
