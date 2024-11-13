<script>
import MobileMenuButton from '@/components/navigation/mobile-menu-button.vue';
import NavBar from '@/components/navigation/menu-desktop.vue';
import ThemeSwitch from '@/components/ui-components/theme-switch.vue';
import MenuMobile from '@/components/navigation/menu-mobile.vue';
import { mapGetters } from 'vuex';
import { mdiAccount } from '@mdi/js';
import HeaderLogo from '@/components/layout/app-header/header-logo.vue';

export default {
  name: 'app-header',
  components: { HeaderLogo, MenuMobile, ThemeSwitch, NavBar, MobileMenuButton },
  data() {
    return {
      icons: { mdiAccount },
      mobileMenuState: false,
    };
  },
  computed: {
    ...mapGetters('authorization', {
      userName: 'getUserName',
      isLoggedIn: 'isAuthorized',
    }),
  },
};
</script>

<template>
  <div class="appHeader__wrapper">
    <div class="appHeader__container">
      <div class="appHeader__content">
        <header-logo></header-logo>
        <mobile-menu-button :menu-state="mobileMenuState" @toggle-menu="mobileMenuState = !mobileMenuState"></mobile-menu-button>
        <nav-bar></nav-bar>

        <router-link :class="['login__link', isLoggedIn && 'logged_in']" :to="{ name: 'auth' }" custom>
          <v-icon class="login__link__button__icon" size="28px">
            {{ icons.mdiAccount }}
          </v-icon>
          <span class="login__link__button__text">
            {{ isLoggedIn ? userName : 'Войти' }}
          </span>
        </router-link>

        <theme-switch></theme-switch>
      </div>

      <menu-mobile :menu-state="mobileMenuState" @menu-navigated="mobileMenuState = false"></menu-mobile>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '../../../assets/fonts/Bebasneue-Regular/stylesheet.css';

.appHeader__wrapper {
  position: relative;
  isolation: isolate;
  z-index: 1;
  flex: 0 0 auto;

  &::before {
    position: absolute;
    z-index: 2;
    top: -8px;
    left: 0;
    width: 100%;
    height: 12px;
    background-color: var(--ffr-brand);
    transform: skewY(-0.085deg);
    content: '';
  }

  &::after {
    position: absolute;
    z-index: 0;
    top: -250px;
    right: -40px;
    width: 600px;
    height: 320px;
    background-color: var(--ffr-brand);
    box-shadow: var(--ffr-brand-shadow);
    transform: rotate(3.25deg);
    content: '';
    @media screen and (max-width: 920px) {
      //display: none;
    }
  }

  .appHeader__container {
    position: relative;
    z-index: 1;
    padding: 0 2rem;

    &::before {
      position: absolute;
      z-index: 0;
      top: -85px;
      left: 0;
      width: 100%;
      height: calc(100% + 100px);
      background-color: var(--text-card-contrast);
      box-shadow: var(--ffr-brand-shadow);
      transform: skewY(-0.75deg);
      content: '';
    }

    .appHeader__content {
      position: relative;
      z-index: 1;
      display: flex;
      max-width: var(--desktop-medium);
      padding-top: 8px;
      margin: 0 auto;
      font-family: 'Bebas Neue', sans-serif;

      .login__link {
        flex: 0 0 auto;
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
        margin: auto 0 auto auto;
        padding: 4px 12px;
        border-radius: 99px;
        font-size: 16px;

        .login__link__button__icon {
          color: var(--tablet-default);
        }

        .login__link__button__text {
          margin-left: 4px;
        }

        &.logged_in {
          background-color: var(--text-default);
          color: var(--text-card-contrast);
          transition: background-color 92ms, color 92ms;
        }

        &.logged_in svg {
          fill: var(--background--secondary);
          transition: fill 92ms;
        }

        &:hover,
        &:hover .login__link__button__icon,
        &:hover svg {
          color: var(--text-contrast-hovered);
          fill: var(--text-contrast-hovered);
        }
      }
      @media screen and (max-width: 1200px) {
        max-width: 100%;
      }
    }
  }
}

.theme-dark .appHeader__wrapper {
  .header__logo__image {
    &.light {
      display: none !important;
    }
    &.dark {
      display: block !important;
    }
  }
}
</style>
