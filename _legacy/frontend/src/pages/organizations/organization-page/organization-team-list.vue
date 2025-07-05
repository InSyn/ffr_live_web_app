<script>
import AthleteListItem from '@/pages/athletes/athlete-listItem.vue';

export default {
  name: 'organization-team-list',
  components: { AthleteListItem },
  props: {
    team: {
      type: Array,
      default: () => [],
    },
  },
};
</script>

<template>
  <div class="organizationTeam__wrapper">
    <div class="organizationTeam__header">Команда</div>
    <div class="organizationTeam__list">
      <athlete-list-item v-for="(athlete, idx) in team" :key="idx" :athlete="athlete" :idx="idx"></athlete-list-item>
    </div>
  </div>
</template>

<style scoped lang="scss">
.organizationTeam__wrapper {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  height: 100%;
  background-color: var(--background--card);
  box-shadow: var(--container-shadow-m);
  border: 1px solid var(--border-container);
  border-radius: 4px;

  .organizationTeam__header {
    flex: 0 0 auto;
    padding: 8px 12px;
    font-size: 1.1rem;
    font-weight: bold;
  }

  .organizationTeam__list {
    flex: 1 1 200px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    border-radius: 2px;
  }

  @media screen and (max-width: 720px) {
    border-radius: 0;
  }
}
</style>
