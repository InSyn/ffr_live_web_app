<template>
  <div class="navBar__wrapper">
    <router-link
      v-for="menu_item in appMenu()"
      :key="menu_item.title"
      v-slot="{ navigate, isActive }"
      custom
      :to="{ name: menu_item.link }"
    >
      <button
        @click="navigate"
        :class="['navBar__button', isActive && 'isActive']"
      >
        {{ menu_item.title }}
      </button>
    </router-link>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "navBar",
  methods: {
    appMenu() {
      return this.userData.role === "admin"
        ? this.menu
        : this.menu.filter((menuItem) => !menuItem.adminOnly);
    },
  },
  computed: {
    ...mapGetters("authorization", {
      userData: "getUserData",
    }),
    ...mapGetters("menu", {
      menu: "getMenu",
    }),
  },
};
</script>

<style lang="scss" scoped>
.navBar__wrapper {
  position: relative;
  flex: 1 1 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  padding: 0 2rem 0 340px;

  .navBar__button {
    flex: 0 1 auto;
    position: relative;
    display: flex;
    align-items: center;
    padding: 8px;
    font-size: 16px;
    text-decoration: none;
    text-transform: uppercase;
    transition: color 96ms, background-color 96ms;

    &:hover {
      color: var(--text-contrast-hovered);
    }
    &::after {
      position: absolute;
      content: "";
      left: 50%;
      transform: translateX(-50%);
      bottom: 0;
      width: 0;
      height: 2px;
      background: var(--ffr-brand);
      transition: width 92ms ease-out;
    }
    /*noinspection CssUnusedSymbol*/
    &.isActive::after {
      width: 100%;
    }
  }
  @media screen and (max-width: 1200px) {
    padding-left: 280px;
  }
  @media screen and (max-width: 920px) {
    display: none;
  }
}
</style>
