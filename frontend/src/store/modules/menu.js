export default {
  namespaced: true,
  state: {
    menu: [
      { title: 'События', link: 'results', adminOnly: false },
      { title: 'Спортсмены', link: 'allAthletes', adminOnly: false },
      { title: 'Судьи', link: 'juryListPage', adminOnly: false },
      { title: 'Тренеры', link: 'trainersPage', adminOnly: false },
      { title: 'Организации', link: 'organizationsPage', adminOnly: false },
      { title: 'Семинары', link: 'seminarsPage', adminOnly: false },
    ],
  },
  getters: {
    getMenu: (state) => {
      return state.menu;
    },
  },
};
