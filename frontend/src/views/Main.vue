<template>
  <div class="mainView__wrapper">
    <app-header></app-header>
    <div class="app_main_container">
      <v-fade-transition id="page-transition" mode="out-in">
        <router-view></router-view>
      </v-fade-transition>
    </div>
    <app-footer></app-footer>
  </div>
</template>

<script>
import { checkUserTheme } from '@/utils/check-theme';
import AppHeader from '@/components/layout/app-header/index.vue';
import AppFooter from '@/components/layout/AppFooter.vue';

export default {
  name: 'Home',
  components: { AppFooter, AppHeader },
  methods: {
    checkUserTheme,
  },
};
</script>
<style lang="scss">
.mainView__wrapper {
  position: relative;
  flex: 1 1 0;
  display: flex;
  flex-direction: column;

  .app_main_container {
    position: relative;
    isolation: isolate;
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    background-color: var(--background--primary);

    &::before {
      position: absolute;
      z-index: -1;
      content: '';
      height: 100%;
      width: 100%;
      opacity: 0.25;
      background-image: linear-gradient(to bottom, var(--background--primary), var(--background--secondary));
    }
  }
}
</style>
