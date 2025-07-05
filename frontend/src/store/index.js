import Vue from 'vue'
import Vuex from 'vuex'

import events from '@/store/modules/events'
import menu from '@/store/modules/menu'
import authorization from '@/store/modules/authorization'
import athletes from '@/store/modules/athletes'
import jury from '@/store/modules/jury'
import trainers from '@/store/modules/trainers'
import organizations from '@/store/modules/organizations'
import seminars from '@/store/modules/seminars'
import search from '@/store/modules/search'
// import modules from "./modules";

Vue.use(Vuex)

export default new Vuex.Store({
	state: {},
	mutations: {},
	actions: {},
	modules: {
		authorization,
		menu,
		events,
		athletes,
		jury,
		trainers,
		organizations,
		seminars,
		search
	}
})
