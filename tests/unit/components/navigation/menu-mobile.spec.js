import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import MenuMobile from '@/components-mobile/navigation/menu-mobile.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

function createWrapper(storeState = {}, user = { role: 'user' }) {
	const store = new Vuex.Store({
		modules: {
			// ... existing code ...
		}
	})
	return shallowMount(MenuMobile, {
		store,
		localVue,
		propsData: props,
		stubs: {
			'router-link': true
		}
	})
}

describe('MenuMobile.vue', () => {
	// ... existing code ...
})
