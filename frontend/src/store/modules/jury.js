import axios from 'axios';
import { databaseUrl } from '@/store/constants';

export default {
  namespaced: true,
  state: {
    jury: [],
  },
  getters: {
    getJury: (state) => state.jury,
  },
  mutations: {
    setJury: (state, jury) => {
      state.jury = jury;
    },
  },
  actions: {
    SET_JURY: ({ commit }, payload) => {
      commit('setJury', payload);
    },
    LOAD_JURY: async (store) => {
      try {
        const response = await axios.get(databaseUrl + '/jury');
        if (response.status === 200) {
          store.commit('setJury', response.data.jury);
        }
      } catch (err) {
        if (err) {
          setTimeout(() => store.dispatch('LOAD_JURY'), 2000);
        }
      }
    },
    LOAD_JURY_BY_ROLE: async (store, payload) => {
      try {
        const response = await axios.get(databaseUrl + '/jury', { params: { role: payload } });
        if (response.status === 200) {
          return response.data.jury;
        }
      } catch (err) {
        if (err) {
          console.log(err?.response?.data?.message);
        }
      }
    },
  },
};
