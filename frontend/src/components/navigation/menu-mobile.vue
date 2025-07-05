<template>
	<div :class="['mobileMenu__container', { opened: menuState }]">
		<div class="mobileMenu__overlay" @click="closeMenu" />
		<nav class="mobileMenu__wrapper">
			<div class="grid_wrapper">
				<router-link
					v-for="menu_item in appMenu()"
					:key="menu_item.title"
					:to="{ name: menu_item.link }"
					custom
				>
					<template #default="{ navigate, href, isActive }">
						<button
							:class="['menuItem', isActive && 'isActive']"
							@click="handleNavigation($event, navigate)"
						>
							{{ menu_item.title }}
						</button>
					</template>
				</router-link>
			</div>
		</nav>
	</div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
	name: 'MenuMobile',
	props: ['menuState'],
	watch: {
		menuState(isOpen) {
			if (isOpen) {
				this.$nextTick(() => {
					const focusable = this.$el.querySelectorAll('button, [href]')
					if (focusable.length > 0) {
						focusable[0].focus()
					}
				})
			}
		}
	},
	mounted() {
		document.addEventListener('keydown', this.handleKeydown)
	},
	beforeDestroy() {
		document.removeEventListener('keydown', this.handleKeydown)
	},
	methods: {
		appMenu() {
			return this.userData?.role === 'admin'
				? this.menu
				: this.menu.filter(menuItem => !menuItem.adminOnly)
		},
		handleNavigation(event, navigate) {
			navigate(event)
			this.$emit('menu-navigated')
		},
		closeMenu() {
			this.$emit('menu-navigated')
		},
		handleKeydown(e) {
			if (!this.menuState) return

			if (e.key === 'Escape') {
				this.closeMenu()
				return
			}

			if (e.key === 'Tab') {
				const focusableElements = Array.from(this.$el.querySelectorAll('button, [href]'))
				if (focusableElements.length === 0) return

				const firstElement = focusableElements[0]
				const lastElement = focusableElements[focusableElements.length - 1]

				if (e.shiftKey) {
					/* shift + tab */
					if (document.activeElement === firstElement) {
						e.preventDefault()
						lastElement.focus()
					}
				} else {
					/* tab */
					if (document.activeElement === lastElement) {
						e.preventDefault()
						firstElement.focus()
					}
				}
			}
		}
	},
	computed: {
		...mapGetters('authorization', {
			userData: 'getUserData'
		}),
		...mapGetters('menu', {
			menu: 'getMenu'
		})
	}
}
</script>

<style scoped lang="scss">
.mobileMenu__container {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 1000;
	visibility: hidden;
	pointer-events: none;

	&.opened {
		visibility: visible;
		pointer-events: auto;
	}

	@media screen and (min-width: 920px) {
		& {
			display: none;
		}
	}
}

.mobileMenu__overlay {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	opacity: 0;
	transition: opacity 0.3s ease;
}

.mobileMenu__container.opened .mobileMenu__overlay {
	opacity: 1;
}

.mobileMenu__wrapper {
	position: absolute;
	left: 0;
	right: 0;
	top: 0;
	background: var(--color-bg-surface);
	backdrop-filter: blur(8px);
	transform: translateY(-100%);
	transition: transform 0.3s ease;
}

.mobileMenu__container.opened .mobileMenu__wrapper {
	transform: translateY(0);
}

.grid_wrapper {
	display: flex;
	flex-direction: column;
	padding: 1rem 0;
}

.menuItem {
	padding: 1.25rem 0;
	font-size: 1.4rem;
	font-weight: bold;
	background: none;
	border: none;
	color: inherit;
	width: 100%;
	text-align: center;
}
</style>
