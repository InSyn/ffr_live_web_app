<template>
  <select
    @input="$emit('input', $event.target.value)"
    id="jury_category"
    name="jury_category"
    :class="['searchInput__control', !elemValue && 'empty']"
  >
    <option :data-cancel-option="!!elemValue" value="">
      {{ elemValue ? "Очистить" : "Выбрать категорию..." }}
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
import { getJuryCategoriesList } from "@/store/data/sport-data-sets";

export default {
  name: "jury-category-input",
  computed: {
    categoriesList() {
      return getJuryCategoriesList();
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
