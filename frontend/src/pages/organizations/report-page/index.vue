<script>
export default {
  name: 'index',
  props: ['report_id'],
};
</script>

<template>
  <div class="reportPage__wrapper">
    {{ report_id }}
  </div>
</template>

<style scoped lang="scss">
.reportPage__wrapper {
  flex: 0 0 300px;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: var(--tablet-default);

  margin: auto;
  background-color: var(--background--card);
  box-shadow: var(--container-shadow-m);
  border: 1px solid var(--border-container);
  border-radius: 4px;
}
</style>
