import axios from "axios";
import { databaseUrl } from "@/store/constants";

export default {
  namespaced: true,
  state: {
    seminars: [],
  },
  getters: {
    getSeminars: (state) => state.seminars,
  },
  mutations: {
    setSeminars: (state, seminars) => {
      state.seminars = seminars;
    },
  },
  actions: {
    SET_SEMINARS: ({ commit }, payload) => {
      commit("setSeminars", payload);
    },
    LOAD_SEMINARS: async (store) => {
      try {
        const response = await axios.get(databaseUrl + "/seminars");
        if (response.status === 200) {
          store.commit("setSeminars", response.data.seminars);
        }
      } catch (err) {
        if (err) {
          setTimeout(() => store.dispatch("LOAD_SEMINARS"), 2000);
        }
      }
    },
  },
};
