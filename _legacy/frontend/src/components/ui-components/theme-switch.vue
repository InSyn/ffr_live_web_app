<template>
  <div class="themeSwitch__wrapper">
    <button class="toggle__wrapper" type="button" @click="toggleTheme()">
      <span class="toggle__thumb">
        <v-icon class="theme__icon light" size="18">
          {{ themeLightIcon }}
        </v-icon>
        <v-icon class="theme__icon dark" size="18">
          {{ themeDarkIcon }}
        </v-icon>
      </span>
    </button>
  </div>
</template>

<script>
import { mdiBrightness2, mdiBrightness7 } from '@mdi/js';
import { checkUserTheme } from '@/utils/check-theme';

export default {
  name: 'theme-switch',
  mounted() {
    this.$nextTick(() => {
      this.appTheme = checkUserTheme();
    });
  },
  methods: {
    toggleTheme() {
      if (this.appTheme === 'dark') {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('app-theme', 'light');
        this.appTheme = 'light';
      } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('app-theme', 'dark');
        this.appTheme = 'dark';
      }
    },
  },
  data() {
    return {
      appTheme: '',
      themeDarkIcon: mdiBrightness2,
      themeLightIcon: mdiBrightness7,
    };
  },
};
</script>

<style lang="scss" scoped>
.themeSwitch__wrapper {
  display: flex;
  align-items: center;
  margin-left: 2rem;
  padding: 0 1rem;

  .toggle__wrapper {
    position: relative;
    overflow: visible;
    height: 16px;
    width: 32px;
    background: #ffffff;
    border: 2px solid rgba(130, 156, 153, 0.6);
    border-radius: 16px;
    box-shadow: 4px 2px 8px rgba(0, 0, 0, 0.45) inset, -2px -1px 3px rgba(255, 255, 255, 0.3) inset;
    transition: background-color 296ms;

    .toggle__thumb {
      position: absolute;
      display: block;
      top: 50%;
      left: -4px;
      height: 24px;
      aspect-ratio: 1;
      margin-left: 0;
      background: #ffffff;
      border-radius: 50%;
      box-shadow: 2px 2px 4px rgba(255, 255, 255, 0.3) inset, -1px -1px 4px rgba(0, 0, 0, 0.4) inset;
      transform: translateY(-50%);
      transition: left 192ms ease-in-out, box-shadow 128ms;

      &:hover {
        background: #f1f1f4;
        box-shadow: 3px 3px 6px rgba(255, 255, 255, 0.3) inset, -2px -2px 6px rgba(0, 0, 0, 0.4) inset;
      }

      .theme__icon {
        position: absolute;
        top: 50%;
        left: 50%;
        height: 100%;
        aspect-ratio: 1;
        transform: translate(-50%, -50%);
        color: #50506d;
        transition: opacity 256ms;

        &.light {
          opacity: 1;
        }

        &.dark {
          opacity: 0;
        }
      }
    }
  }
}

.dark .toggle__wrapper {
  .toggle__thumb {
    left: calc(100% - 18px);

    .theme__icon {
      &.light {
        opacity: 0;
      }

      &.dark {
        opacity: 1;
      }
    }
  }
}
</style>
