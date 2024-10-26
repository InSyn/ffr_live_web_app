import axios from 'axios';
import { databaseUrl } from '@/store/constants';

export default {
  namespaced: true,
  state: {
    organizations: [],
  },
  getters: {
    getOrganizations: (state) => state.organizations,
  },
  mutations: {
    setOrganizations: (state, organizations) => {
      state.organizations = organizations;
    },
  },
  actions: {
    SET_ORGANIZATIONS: ({ commit }, payload) => {
      commit('setOrganizations', payload);
    },
    LOAD_ORGANIZATIONS: async (store) => {
      try {
        const response = await axios.get(databaseUrl + '/organizations');
        if (response.status === 200) {
          store.commit('setOrganizations', response.data.organizations);
        }
      } catch (err) {
        if (err) {
          setTimeout(() => store.dispatch('LOAD_ORGANIZATIONS'), 2000);
        }
      }
    },
  },
};
