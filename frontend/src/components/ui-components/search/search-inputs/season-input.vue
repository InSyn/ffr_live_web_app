<template>
  <select @input="$emit('input', $event.target.value)" id="season" name="season" :class="['searchInput__control', !elemValue && 'empty']">
    <option :data-cancel-option="!!elemValue" value="">
      {{ elemValue ? 'Очистить' : 'Выбрать сезон...' }}
    </option>
    <option v-for="season in seasonsList" :key="season" :value="season">
      {{ season }}
    </option>
  </select>
</template>

<script>
export default {
  name: 'season-input',
  computed: {
    seasonsList() {
      const currentYear = new Date().getFullYear(),
        seasonsList = [];
      for (let i = 2020; i <= currentYear; i++) {
        seasonsList.push(i + '-' + (i + 1));
      }

      return seasonsList.reverse();
    },
    elemValue() {
      return this.$attrs.value;
    },
  },
};
</script>

<style scoped>
@import 'search-input-style.css';
</style>
