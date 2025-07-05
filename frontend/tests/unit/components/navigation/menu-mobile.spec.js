import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import MenuMobile from '@/components/navigation/menu-mobile.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

const mockMenu = [
	{ title: 'Home', link: 'home', adminOnly: false },
	{ title: 'Events', link: 'events', adminOnly: false },
	{ title: 'Admin', link: 'admin', adminOnly: true }
]

describe('MenuMobile.vue', () => {
	let store
	let authorization
	let menu
	let wrapper

	const createWrapper = (props, userData) => {
		authorization = {
			namespaced: true,
			getters: {
				getUserData: () => userData
			}
		}
		menu = {
			namespaced: true,
			getters: {
				getMenu: () => mockMenu
			}
		}
		store = new Vuex.Store({
			modules: {
				authorization,
				menu
			}
		})
		return shallowMount(MenuMobile, {
			store,
			localVue,
			propsData: props,
			// Attach to document to test focus and keyboard events
			attachTo: document.body
		})
	}

	afterEach(() => {
		// Clean up listeners and wrapper
		if (wrapper) {
			wrapper.destroy()
		}
	})

	describe('Rendering and Visibility', () => {
		it('is hidden when menuState is false', () => {
			wrapper = createWrapper({ menuState: false }, {})
			expect(wrapper.find('.mobileMenu__container').classes()).not.toContain('opened')
		})

		it('is visible when menuState is true', () => {
			wrapper = createWrapper({ menuState: true }, {})
			expect(wrapper.find('.mobileMenu__container').classes()).toContain('opened')
		})
	})

	describe('Menu Item Filtering', () => {
		it('shows all menu items for admin user', () => {
			wrapper = createWrapper({ menuState: true }, { role: 'admin' })
			const menuItems = wrapper.findAll('button.menuItem')
			expect(menuItems.length).toBe(3)
		})

		it('filters admin-only items for non-admin user', () => {
			wrapper = createWrapper({ menuState: true }, { role: 'user' })
			const menuItems = wrapper.findAll('button.menuItem')
			expect(menuItems.length).toBe(2)
			expect(menuItems.at(0).text()).toBe('Home')
			expect(menuItems.at(1).text()).toBe('Events')
		})
	})

	describe('User Interactions', () => {
		beforeEach(() => {
			wrapper = createWrapper({ menuState: true }, {})
		})

		it('emits menu-navigated when overlay is clicked', async () => {
			await wrapper.find('.mobileMenu__overlay').trigger('click')
			expect(wrapper.emitted('menu-navigated')).toBeTruthy()
			expect(wrapper.emitted('menu-navigated').length).toBe(1)
		})

		it('emits menu-navigated when Escape key is pressed', async () => {
			// The listener is on `document`, so we need to trigger it there
			const event = new KeyboardEvent('keydown', { key: 'Escape' })
			document.dispatchEvent(event)
			await wrapper.vm.$nextTick()
			expect(wrapper.emitted('menu-navigated')).toBeTruthy()
		})

		it('emits menu-navigated when a menu item is clicked', async () => {
			const navigate = jest.fn()
			wrapper.vm.handleNavigation({}, navigate)
			expect(navigate).toHaveBeenCalled()
			expect(wrapper.emitted('menu-navigated')).toBeTruthy()
		})
	})

	describe('Accessibility: Focus Trapping', () => {
		beforeEach(() => {
			// Mock focus/blur for JSDOM environment
			HTMLElement.prototype.focus = jest.fn()
			HTMLElement.prototype.blur = jest.fn()
		})

		it('focuses the first item when the menu is opened', async () => {
			wrapper = createWrapper({ menuState: false }, { role: 'user' })
			await wrapper.setProps({ menuState: true })
			await wrapper.vm.$nextTick()

			const firstButton = wrapper.find('button.menuItem')
			expect(firstButton.element.focus).toHaveBeenCalled()
		})

		it('traps tab forward', async () => {
			wrapper = createWrapper({ menuState: true }, { role: 'user' })
			await wrapper.vm.$nextTick() // Wait for menu to be populated

			const focusableElements = wrapper.findAll('button.menuItem').wrappers.map(w => w.element)
			const firstElement = focusableElements[0]
			const lastElement = focusableElements[focusableElements.length - 1]

			// Mock document.activeElement
			Object.defineProperty(document, 'activeElement', {
				value: lastElement,
				writable: false,
				configurable: true
			})

			const event = new KeyboardEvent('keydown', { key: 'Tab' })
			document.dispatchEvent(event)
			await wrapper.vm.$nextTick()

			expect(firstElement.focus).toHaveBeenCalled()
		})

		it('traps tab backward (shift + tab)', async () => {
			wrapper = createWrapper({ menuState: true }, { role: 'user' })
			await wrapper.vm.$nextTick()

			const focusableElements = wrapper.findAll('button.menuItem').wrappers.map(w => w.element)
			const firstElement = focusableElements[0]
			const lastElement = focusableElements[focusableElements.length - 1]

			Object.defineProperty(document, 'activeElement', {
				value: firstElement,
				writable: false,
				configurable: true
			})

			const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true })
			document.dispatchEvent(event)
			await wrapper.vm.$nextTick()

			expect(lastElement.focus).toHaveBeenCalled()
		})
	})
})
