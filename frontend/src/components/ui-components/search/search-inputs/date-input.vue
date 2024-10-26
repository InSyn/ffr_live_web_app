<template>
  <input class="searchInput__control" type="date" @input="$emit('input', $event.target.value)" />
</template>

<script>
export default {
  name: 'date-input',
};
</script>

<style scoped lang="scss">
@import 'search-input-style.css';
</style>
