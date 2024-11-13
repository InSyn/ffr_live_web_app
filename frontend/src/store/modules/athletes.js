import axios from 'axios';
import { apiUrl } from '@/constants';

export default {
  namespaced: true,
  state: {
    athletes: [],
  },
  getters: {
    getAthletes: (state) => state.athletes,
  },
  mutations: {
    setAthletes: (state, athletes) => {
      state.athletes = athletes;
    },
  },
  actions: {
    SET_ATHLETES: ({ commit }, payload) => {
      commit('setAthletes', payload);
    },
    LOAD_ATHLETES: async (store) => {
      try {
        const response = await axios.get(apiUrl + '/athletes');
        if (response.status === 200) {
          store.commit('setAthletes', response.data.athletes);
        }
      } catch (err) {
        if (err) {
          console.error(err?.response?.data?.message);
        }
      }
    },
  },
};
