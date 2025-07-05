<template>
	<div class="navBar__wrapper">
		<router-link
			v-for="menu_item in appMenu()"
			:key="menu_item.title"
			v-slot="{ navigate, isActive }"
			custom
			:to="{ name: menu_item.link }"
		>
			<button :class="['navBar__button', isActive && 'isActive']" @click="navigate">
				{{ menu_item.title }}
			</button>
		</router-link>
	</div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
	name: 'NavBar',
	methods: {
		appMenu() {
			return this.userData.role === 'admin'
				? this.menu
				: this.menu.filter(menuItem => !menuItem.adminOnly)
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

<style lang="scss" scoped>
.navBar__wrapper {
	position: relative;
	flex: 1 1 0;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 1rem;
	padding: 0 2rem 0 340px;

	.navBar__button {
		flex: 0 1 auto;
		position: relative;
		display: flex;
		align-items: center;
		padding: 8px;

		background-image: linear-gradient(to top, var(--color-bg-surface) 60%, transparent);
		font-size: 16px;
		text-decoration: none;
		text-transform: uppercase;
		transition:
			color var(--transition-duration-fast),
			background-color var(--transition-duration-fast);

		&:hover {
			color: var(--color-text-secondary);
		}

		&::after {
			position: absolute;
			content: '';
			left: 50%;
			transform: translateX(-50%);
			bottom: 0;
			width: 0;
			height: 2px;
			background: var(--color-interactive-brand-default);
			transition: width var(--transition-duration-fast) ease-out;
		}

		/*noinspection CssUnusedSymbol*/
		&.isActive {
			color: var(--color-text-accent);
			font-weight: 600;
			&::after {
				width: 100%;
			}
		}
	}

	@media screen and (max-width: 1200px) {
		padding-left: 280px;
	}

	@media screen and (max-width: 1000px) {
		padding-left: 232px;
	}

	@media screen and (max-width: 920px) {
		display: none;
	}
}
</style>
