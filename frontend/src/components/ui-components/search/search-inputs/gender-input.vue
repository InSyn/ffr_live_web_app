<template>
  <select
    @input="$emit('input', $event.target.value)"
    id="gender"
    name="gender"
    :class="['searchInput__control', !elemValue && 'empty']"
  >
    <option :data-cancel-option="!!elemValue" value="">
      {{ elemValue ? "Очистить" : "Выбрать пол..." }}
    </option>
    <option v-for="gender in gendersList" :key="gender" :value="gender">
      {{ gender }}
    </option>
  </select>
</template>

<script>
export default {
  name: "gender-input",
  computed: {
    gendersList() {
      return ["М", "Ж"];
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
