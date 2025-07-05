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
      <div class="userRole__wrapper">
        <span v-if="userData.role === 'regional_organization'">Название организации:&nbsp;</span>
        <span v-else-if="['secretary', 'jury', 'athlete', 'trainer'].includes(userData.role)">Имя:&nbsp;</span>

        <b>{{ dbUserName }}</b>
      </div>
      <div v-show="userData.role === 'regional_organization'" class="userRole__wrapper">
        <span>Регион:&nbsp;</span>
        <b>{{ `${getRegionCode(userData.region)} - ${userData.region}` }}</b>
      </div>

      <admin-pages-nav :db_id="db_id"></admin-pages-nav>
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
import { apiUrl } from '@/constants';
import axios from 'axios';

export default {
  name: 'userPage',
  components: { AdminPagesNav, Statistics },
  data() {
    return {
      db_id: null,
      dbUserName: '',
    };
  },
  computed: {
    ...mapGetters('authorization', {
      userData: 'getUserData',
    }),
  },
  methods: {
    getRegionCode,
    translateField,
    ...mapActions('authorization', {
      exitAccount: 'EXIT_ACCOUNT',
    }),

    getDataFieldName(role) {
      switch (role) {
        case 'regional_organization':
          return 'organization';
        case 'jury':
        case 'secretary':
          return 'jury';
        default:
          return role;
      }
    },
    async loadDbUserData() {
      const { ffr_id, role, region, token } = this.userData;
      if (!role && !ffr_id && !region) return;

      let connectionString;
      switch (role) {
        case 'regional_organization':
          connectionString = `${apiUrl}/organizations/findByRegion/${region}`;
          break;
        case 'trainer':
          connectionString = `${apiUrl}/trainers/${ffr_id}`;
          break;
        case 'jury':
        case 'secretary':
          connectionString = `${apiUrl}/jury/${ffr_id}`;
          break;
        case 'athlete':
          connectionString = `${apiUrl}/athletes/${ffr_id}`;
          break;
        default:
          return;
      }

      try {
        const response = await axios.get(connectionString, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
          const dataField = this.getDataFieldName(role);

          this.db_id = response.data[dataField]._id;

          if (role === 'regional_organization') this.dbUserName = response.data[dataField].title;
          if (role === 'trainer') this.dbUserName = response.data[dataField].fullname;
          if (['secretary', 'jury', 'athlete'].includes(this.userData.role))
            this.dbUserName = `${response.data[dataField].lastname} ${response.data[dataField].name}`;
        }
      } catch (error) {
        console.log(error);
        console.log(`Не удалось загрузить данные пользователя: ${error?.response?.data?.message}`);
      }
    },
    logout() {
      this.exitAccount();
    },
  },

  watch: {
    'userData.role': {
      immediate: true,
      handler(value) {
        if (typeof value === 'string') this.loadDbUserData();
      },
    },
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
