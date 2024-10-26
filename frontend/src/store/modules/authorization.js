export default {
  namespaced: true,
  state: {
    userData: {
      username: '',
      password: '',
      role: 'user',

      token: '',
    },
  },
  getters: {
    getUserData: (state) => state.userData,
    getUserName: (state) => state.userData.username,
    isAuthorized: (state) => !!state.userData.token,
    isAdmin: (state) => state.userData.token && state.userData.role === 'admin',
  },
  mutations: {
    updateUserData: (state, userData) => {
      localStorage.setItem('authorizationData', JSON.stringify(userData));
      state.userData = { ...userData };
    },
  },
  actions: {
    CHECK_STORED_DATA: ({ commit }) => {
      const storedUserData = JSON.parse(localStorage.getItem('authorizationData'));

      if (storedUserData) {
        commit('updateUserData', storedUserData);
      }
    },
    EXIT_ACCOUNT: ({ commit }) => {
      const emptyUserData = {
        username: '',
        password: '',
        role: 'user',
        token: '',
      };

      commit('updateUserData', emptyUserData);
    },
  },
};
