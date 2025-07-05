<template>
  <div class="authorizationPage__wrapper">
    <form class="authorizationForm" @submit.prevent="authorizeUser">
      <div class="authorizationForm__header">Авторизация</div>

      <div class="authorizationForm__inputWrapper">
        <label for="login">Логин:&nbsp;</label>
        <input v-model="authorizationData.username" id="login" type="text" />
      </div>

      <div class="authorizationForm__inputWrapper">
        <label for="pwd">Пароль:&nbsp;</label>
        <input v-model="authorizationData.password" id="pwd" :type="showPassword ? 'text' : 'password'" />

        <v-btn @click="showPassword = !showPassword" class="showPassword__button" :color="showPassword ? '#b6b9c1' : '#2c3e50'" x-small icon>
          <v-icon small>{{ passwordVisibilityIcon }}</v-icon>
        </v-btn>
      </div>

      <div class="authorizeUser__button__wrapper">
        <v-btn class="authorizeUser__button" type="submit" color="#029fe2" text> Войти </v-btn>
      </div>
    </form>

    <message-container :messages="messages" :errors="errors"></message-container>
  </div>
</template>

<script>
import { mdiEye } from '@mdi/js';
import axios from 'axios';
import { apiUrl } from '@/constants';
import { mapActions, mapGetters } from 'vuex';
import MessageContainer from '@/components/ui-components/message-container.vue';

export default {
  name: 'authPage',
  components: { MessageContainer },
  mounted() {
    if (this.userData.token) {
      this.$router.push({ name: 'userPage' });
    }
  },
  methods: {
    ...mapActions('authorization', {
      updateUserData: 'CHECK_STORED_DATA',
    }),

    async authorizeUser() {
      if (!this.authorizationData.username) {
        this.errors.push('Введите логин');
        return;
      }
      if (!this.authorizationData.password) {
        this.errors.push('Введите пароль');
        return;
      }

      try {
        const authResponse = await axios.post(apiUrl + '/auth/login', this.authorizationData);
        if (authResponse.status === 200) {
          const userData = {
            id: authResponse.data.id,
            username: this.authorizationData.username,
            token: authResponse.data.token,
            role: authResponse.data.role,
            region: authResponse.data.region,
            ffr_id: authResponse.data.ffr_id,
          };
          localStorage.setItem('authorizationData', JSON.stringify(userData));
          this.messages.push(`Добрый день, ${userData.username}!`);

          setTimeout(() => {
            if (this.$route.name !== 'results') this.$router.push({ name: 'results' });

            this.updateUserData();
          }, 1536);
        }
      } catch (e) {
        this.errors.push(e?.response?.data?.message || e.message);
      }
    },
  },
  data() {
    return {
      authorizationData: {
        username: '',
        password: '',
      },
      showPassword: false,

      errors: [],
      messages: [],

      passwordVisibilityIcon: mdiEye,
    };
  },
  computed: {
    ...mapGetters('authorization', {
      userData: 'getUserData',
    }),
  },
};
</script>

<style scoped lang="scss">
.authorizationPage__wrapper {
  isolation: isolate;
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10vh auto;
  padding: 32px;

  .authorizationForm {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    padding: 0.75rem 2rem;
    background-color: var(--background--card);
    box-shadow: var(--container-shadow-s);
    border: 1px solid var(--border-container);
    border-radius: 4px;

    .authorizationForm__header {
      margin-bottom: 0.75rem;
      font-size: 1.2rem;
      font-weight: bold;
      text-align: center;
    }
    .authorizationForm__inputWrapper {
      position: relative;
      display: flex;
      align-items: center;
      padding: 3px 1rem 0.5rem;
      border-bottom: 1px solid transparent;
      transition: border-bottom-color 128ms;

      &:focus-within {
        border-bottom: 1px solid var(--text-muted);
      }
      label {
        width: 6rem;
        font-weight: bold;
      }
      input {
        width: 12rem;
        padding: 3px 6px;
        border-radius: 2px;
        color: var(--text-default);
        background-color: var(--background--card-secondary);
        outline: transparent;

        &:focus {
          background-color: var(--background--card-hover);
        }
      }
      .showPassword__button {
        position: absolute;
        right: calc(1rem + 4px);
        margin: auto;
      }
    }

    .authorizeUser__button__wrapper {
      display: flex;

      .authorizeUser__button {
        margin-left: auto;
        font-weight: bold;
      }
    }
  }
}
</style>
