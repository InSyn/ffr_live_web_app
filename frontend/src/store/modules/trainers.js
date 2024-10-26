import axios from 'axios';
import { databaseUrl } from '@/store/constants';

export default {
  namespaced: true,
  state: {
    trainers: [],
  },
  getters: {
    getTrainers: (state) => state.trainers,
  },
  mutations: {
    setTrainers: (state, trainers) => {
      state.trainers = trainers;
    },
  },
  actions: {
    SET_TRAINERS: ({ commit }, payload) => {
      commit('setTrainers', payload);
    },
    LOAD_TRAINERS: async (store) => {
      try {
        const response = await axios.get(databaseUrl + '/trainers');
        if (response.status === 200) {
          store.commit('setTrainers', response.data.trainers);
        }
      } catch (err) {
        if (err) {
          setTimeout(() => store.dispatch('LOAD_TRAINERS'), 2000);
        }
      }
    },
  },
};
