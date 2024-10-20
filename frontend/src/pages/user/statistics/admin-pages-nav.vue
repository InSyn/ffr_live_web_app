<template>
  <div class="adminPages__wrapper">
    <router-link class="adminPage__link" :to="{ name: 'createEventPage' }">
      Создать событие
    </router-link>
    <router-link class="adminPage__link" :to="{ name: 'createAthletePage' }">
      Создать спортсмена
    </router-link>
    <router-link class="adminPage__link" :to="{ name: 'createJuryPage' }">
      Создать судью
    </router-link>
    <router-link class="adminPage__link" :to="{ name: 'createTrainerPage' }">
      Создать тренера
    </router-link>
    <router-link
      class="adminPage__link"
      :to="{ name: 'createOrganizationPage' }"
    >
      Создать организацию
    </router-link>
    <router-link class="adminPage__link" :to="{ name: 'createSeminarPage' }">
      Создать семинар
    </router-link>
  </div>
</template>

<script>
export default {
  name: "admin-pages-nav",
};
</script>

<style scoped lang="scss">
.adminPages__wrapper {
  flex: 0 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  grid-gap: 0.5rem 0.75rem;
  margin-top: 2rem;

  .adminPage__link {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem 0.75rem;

    background-color: var(--background--card-secondary);
    border: 2px solid var(--text-depressed);
    border-radius: 2px;
    font-size: 0.95rem;

    transition: background-color 92ms, border-color 92ms;

    &:hover {
      background-color: var(--background--card-hover);
      border-color: var(--text-hovered);
    }
  }
}
</style>
