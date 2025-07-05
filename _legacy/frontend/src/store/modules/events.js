import axios from 'axios';
import { apiUrl } from '@/constants';

export default {
  namespaced: true,
  state: {
    events: [],
  },
  getters: {
    getEvents: (state) => state.events,
  },
  mutations: {
    setEvents: (state, events) => {
      state.events = events;
    },
  },
  actions: {
    SET_EVENTS: async ({ dispatch, commit }) => {
      try {
        const events = await dispatch('LOAD_EVENTS');
        commit('setEvents', events);
      } catch (err) {
        if (err) {
          console.error(err);
        }
      }
    },
    LOAD_EVENTS: async () => {
      try {
        const response = await axios.get(apiUrl + '/events');
        if (response.status === 200) {
          return response.data.events;
        }
      } catch (err) {
        if (err) {
          console.error(err);
        }
      }
    },
    LOAD_EVENT_BY_ID: async (store, payload) => {
      try {
        const response = await axios.get(apiUrl + '/events/' + payload);
        if (response.status === 200) {
          return response.data.event ? response.data.event : new Error('Событие с таким ID не найдено');
        }
      } catch (err) {
        if (err) {
          console.error(err?.response?.data?.message);
        }
      }
    },
  },
};
