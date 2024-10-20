import axios from "axios";
import { databaseUrl } from "@/store/constants";

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
    SET_EVENTS: ({ commit }, payload) => {
      commit("setEvents", payload);
    },
    LOAD_EVENTS: async (store) => {
      try {
        const response = await axios.get(databaseUrl + "/events");
        if (response.status === 200) {
          store.commit("setEvents", response.data.events);
        }
      } catch (err) {
        if (err) {
          console.error(err?.response?.data?.message);
        }
      }
    },
    LOAD_EVENT_BY_ID: async (store, payload) => {
      try {
        const response = await axios.get(databaseUrl + "/events/" + payload);
        if (response.status === 200) {
          console.log(response);
          return response.data.event
            ? response.data.event
            : new Error("Событие с таким ID не найдено");
        }
      } catch (err) {
        if (err) {
          console.error(err?.response?.data?.message);
        }
      }
    },
  },
};
