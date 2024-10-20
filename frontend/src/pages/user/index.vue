<template>
  <div class="userPage__wrapper">
    <div class="userInfo__wrapper">
      <div class="username__wrapper">
        <span>Пользователь:&nbsp;</span>
        <b>{{ userData.username }}</b>

        <v-btn
          @click.prevent="logout"
          class="userPage__actions-exit"
          color="var(--message-error)"
          text
        >
          Выйти
        </v-btn>
      </div>
      <div class="userRole__wrapper">
        <span>Ваша роль:&nbsp;</span>
        <b>{{ translateRole(userData.role) }}</b>
      </div>

      <admin-pages-nav></admin-pages-nav>
    </div>

    <statistics></statistics>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import Statistics from "@/pages/user/statistics/index.vue";
import AdminPagesNav from "@/pages/user/statistics/admin-pages-nav.vue";

export default {
  name: "userPage",
  components: { AdminPagesNav, Statistics },
  methods: {
    ...mapActions("authorization", {
      exitAccount: "EXIT_ACCOUNT",
    }),

    logout() {
      this.exitAccount();
    },
    translateRole(role) {
      const rolesMap = {
        admin: "Администратор",
        user: "Пользователь",
      };

      return rolesMap[role] || role;
    },
  },
  computed: {
    ...mapGetters("authorization", {
      userData: "getUserData",
    }),
  },
  beforeUpdate() {
    if (!this.userData.token) this.$router.push({ name: "auth" });
  },
};
</script>

<style scoped lang="scss">
.userPage__wrapper {
  flex: 1 1 0;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
    border-radius: 4px;
    font-size: 1.2rem;

    .username__wrapper {
      flex: 0 0 auto;
      display: flex;

      .userPage__actions-exit {
        margin-left: auto;
        font-size: 1rem;
        font-weight: bold;
      }
    }
  }
}
</style>
