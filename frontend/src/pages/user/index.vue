<template>
  <div class="userPage__wrapper">
    <div class="userInfo__wrapper">
      <div class="username__wrapper">
        <span>Пользователь:&nbsp;</span>
        <b>{{ userData.username }}</b>

        <v-btn @click.prevent="logout" class="userPage__actions-exit" color="var(--message-error)" text> Выйти </v-btn>
      </div>
      <div class="userRole__wrapper">
        <span>Ваша роль:&nbsp;</span>
        <b>{{ translateField(userData.role) }}</b>
      </div>
      <div v-show="userData.role === 'regional_organization'" class="userRole__wrapper">
        <span>Регион:&nbsp;</span>
        <b>{{ `${getRegionCode(userData.region)} - ${userData.region}` }}</b>
      </div>

      <admin-pages-nav></admin-pages-nav>
    </div>

    <statistics></statistics>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import Statistics from '@/pages/user/statistics/index.vue';
import AdminPagesNav from '@/pages/user/admin-pages-nav.vue';
import { translateField } from '@/utils/formFields-translator';
import { getRegionCode } from '@/store/data/russia-regions';

export default {
  name: 'userPage',
  components: { AdminPagesNav, Statistics },
  methods: {
    getRegionCode,
    translateField,
    ...mapActions('authorization', {
      exitAccount: 'EXIT_ACCOUNT',
    }),

    logout() {
      this.exitAccount();
    },
  },
  computed: {
    ...mapGetters('authorization', {
      userData: 'getUserData',
    }),
  },
  beforeUpdate() {
    if (!this.userData.token) this.$router.push({ name: 'auth' });
  },
};
</script>

<style scoped lang="scss">
.userPage__wrapper {
  flex: 1 1 0;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  overflow-y: auto;

  width: 100%;
  margin: 0 auto;
  padding: 6rem 2rem 2rem;
  max-width: var(--tablet-default);

  .userInfo__wrapper {
    display: flex;
    flex-direction: column;
    padding: 1rem 2rem 2rem;
    gap: 8px;

    background-color: var(--background--card);
    box-shadow: var(--container-shadow-m);
    border: 1px solid var(--border-container);
    border-radius: 4px;
    font-size: 1.15rem;

    .username__wrapper {
      flex: 0 0 auto;
      display: flex;
      align-items: center;

      .userPage__actions-exit {
        margin-left: auto;
        font-size: 1rem;
        font-weight: bold;
      }
    }
  }
}
</style>
