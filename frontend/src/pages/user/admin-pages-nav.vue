<template>
  <div class="adminPages__wrapper">
    <div class="adminRoutes__wrapper">
      <router-link v-for="route in adminRoutes" :key="route.routePath" v-show="checkRouteAccess(route)" class="adminPage__link" :to="route.routePath">
        {{ route.title }}
      </router-link>
    </div>
    <div class="adminContentRoutes__wrapper">
      <router-link v-for="route in adminContentRoutes" :key="route.routePath" v-show="checkRouteAccess(route)" class="adminPage__link" :to="route.routePath">
        {{ route.title }}
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'admin-pages-nav',
  data() {
    return {
      adminRoutes: [
        { routePath: 'registration', title: 'Создать пользователя', access: ['admin', 'secretary'] },
        { routePath: 'all-registrations', title: 'Список онлайн заявок', access: ['admin', 'secretary'] },
      ],
      adminContentRoutes: [
        { routePath: 'new-event', title: 'Создать событие', access: ['admin', 'secretary'] },
        { routePath: 'new-athlete', title: 'Создать спортсмена', access: ['admin'] },
        { routePath: 'new-jury', title: 'Создать судью', access: ['admin'] },
        { routePath: 'new-trainer', title: 'Создать тренера', access: ['admin'] },
        { routePath: 'new-organization', title: 'Создать организацию', access: ['admin'] },
        { routePath: 'new-seminar', title: 'Создать семинар', access: ['admin', 'secretary'] },
      ],
    };
  },
  computed: {
    ...mapGetters('authorization', {
      userData: 'getUserData',
    }),
  },
  methods: {
    checkRouteAccess(route) {
      return route.access.includes(this.userData.role);
    },
  },
};
</script>

<style scoped lang="scss">
.adminPages__wrapper {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2.25rem;
  margin-top: 2rem;

  .adminRoutes__wrapper {
    flex: 0 0 auto;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 0.75rem;

    & > * {
      flex: 1 0 200px;
      max-width: calc(33.3% - 0.5rem);
    }
  }

  .adminContentRoutes__wrapper {
    flex: 0 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    grid-gap: 0.5rem 0.75rem;
  }

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
