<template>
  <div :class="['mobileMenu__wrapper', menuState && 'opened']">
    <div class="grid_wrapper">
      <router-link v-for="menu_item in appMenu()" :key="menu_item.title" :to="{ name: menu_item.link }" custom>
        <template v-slot="{ navigate, href, isActive }">
          <button @click="handleNavigation($event, navigate)" :class="['menuItem', isActive && 'isActive']">
            {{ menu_item.title }}
          </button>
        </template>
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'menu-mobile',
  props: ['menuState'],
  methods: {
    appMenu() {
      return this.userData.role === 'admin' ? this.menu : this.menu.filter((menuItem) => !menuItem.adminOnly);
    },
    handleNavigation(event, navigate) {
      navigate(event);
      this.$emit('menu-navigated');
    },
  },
  computed: {
    ...mapGetters('authorization', {
      userData: 'getUserData',
    }),
    ...mapGetters('menu', {
      menu: 'getMenu',
    }),
  },
};
</script>

<style scoped lang="scss">
.mobileMenu__wrapper {
  position: absolute;
  left: 0;
  right: 0;
  display: grid;
  grid-template-rows: 0fr;
  overflow: hidden;
  flex-direction: column;
  background: var(--background--card);
  backdrop-filter: blur(8px);
  transition: grid-template-rows 92ms;

  @media screen and (min-width: 920px) {
    & {
      display: none;
    }
  }

  &.opened {
    grid-template-rows: 1fr;
  }

  .grid_wrapper {
    grid-row: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .menuItem {
      padding: 1.25rem 0;
      font-size: 1.4rem;
      font-weight: bold;
    }
  }
}
</style>
