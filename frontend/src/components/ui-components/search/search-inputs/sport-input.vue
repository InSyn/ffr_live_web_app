<template>
  <select @input="$emit('input', $event.target.value)" id="sport" name="sport" class="searchInput__control">
    <option :value="sportsList[0]" selected>
      {{ sportsList[0] }}
    </option>
    <option :value="sportsList[0]">
      {{ sportsList[1] }}
    </option>
  </select>
</template>

<script>
import { sports } from '@/store/data/sports';

export default {
  name: 'sport-input',
  computed: {
    sportsList() {
      return sports.map((sport) => sport.name_rus);
    },
  },
};
</script>

<style scoped>
@import 'search-input-style.css';
</style>
