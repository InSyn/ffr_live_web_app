<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { setAppHeight } from '@/utils/mobile-height-resize';

export default {
  name: 'App',
  methods: {
    ...mapActions('authorization', {
      checkStoredUserData: 'CHECK_STORED_DATA',
    }),
  },

  mounted() {
    window.addEventListener('resize', setAppHeight);
    setAppHeight();

    this.checkStoredUserData();

    if (this.$route.name === 'Main') this.$router.push({ name: 'results' });
  },
};
</script>
<style lang="scss">
@import url('./assets/styles/defaults.css');

#app {
  font-family: 'Petrov Sans-Trial', Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  letter-spacing: 0.01em;

  display: flex;
  flex-direction: column;
  height: inherit;
  max-height: var(--app-height);

  color: var(--text-default);

  * {
    box-sizing: border-box;
    scroll-behavior: smooth;

    &::-webkit-scrollbar {
      height: 6px;
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--text-contrast-hovered);
      border-radius: 4px;
      cursor: pointer;
    }

    &::-webkit-scrollbar-thumb:hover {
      background-color: var(--text-depressed);
    }
  }

  &.theme-dark * {
    color-scheme: dark;
  }

  & input:checked {
    outline: none;
    accent-color: var(--text-default);
  }
}
</style>
