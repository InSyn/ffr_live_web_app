<script>
import MobileMenuButton from '@/components/navigation/mobile-menu-button.vue'
import MenuMobile from '@/components/navigation/menu-mobile.vue'
import { mapGetters } from 'vuex'
import { mdiAccount } from '@mdi/js'
import HeaderLogo from '@/components/layout/app-header/header-logo.vue'
import NavBar from '@/components/navigation/menu-desktop.vue'
import ThemeSwitch from '@/components/ui-components/theme-switch.vue'

export default {
	name: 'AppHeader',
	components: {
		HeaderLogo,
		MenuMobile,
		MobileMenuButton,
		NavBar,
		ThemeSwitch
	},
	data() {
		return {
			icons: { mdiAccount },
			mobileMenuState: false
		}
	},
	computed: {
		...mapGetters('authorization', {
			userName: 'getUserName',
			isLoggedIn: 'isAuthorized'
		})
	}
}
</script>

<template>
	<div class="appHeader__wrapper">
		<div class="appHeader__container">
			<div class="appHeader__content">
				<header-logo />
				<mobile-menu-button
					:menu-state="mobileMenuState"
					@toggle-menu="mobileMenuState = !mobileMenuState"
				/>
				<nav-bar />

				<router-link
					:class="['login__link py-1 px-4', isLoggedIn && 'logged_in']"
					:to="{ name: 'auth' }"
					custom
				>
					<v-icon class="login__link__button__icon mr-2" size="28px">
						{{ icons.mdiAccount }}
					</v-icon>
					<span class="login__link__button__text">{{ isLoggedIn ? userName : 'Войти' }}</span>
				</router-link>

				<theme-switch />
			</div>

			<menu-mobile :menu-state="mobileMenuState" @menu-navigated="mobileMenuState = false" />
		</div>
	</div>
</template>

<style lang="scss" scoped>
@import '../../../assets/fonts/Bebasneue-Regular/stylesheet.css';

.appHeader__wrapper {
	position: relative;
	isolation: isolate;
	z-index: 1;
	flex: 0 0 auto;

	&::before {
		position: absolute;
		z-index: 2;
		top: -8px;
		left: 0;
		width: 100%;
		height: 12px;
		background-image: linear-gradient(
			to left,
			var(--color-bg-primary) -5%,
			var(--color-bg-brand) 25%,
			var(--color-bg-brand) 90%,
			var(--color-bg-primary) 110%
		);
		animation: brand-gradient 2s ease-out infinite alternate;
		transform: skewY(-0.085deg);
		content: '';
	}

	&::after {
		position: absolute;
		z-index: 0;
		top: -250px;
		right: -40px;
		width: 600px;
		height: 320px;
		background-color: var(--color-bg-brand);
		box-shadow: var(--shadow-brand);
		transform: rotate(3.25deg);
		content: '';

		@media screen and (max-width: 920px) {
			//display: none;
		}
	}

	.appHeader__container {
		position: relative;
		z-index: 1;
		padding: 0 2rem;

		&::before {
			position: absolute;
			z-index: 0;
			top: -85px;
			left: 0;
			width: 100%;
			height: calc(100% + 100px);
			background-color: var(--color-bg-surface);
			box-shadow: var(--shadow-brand);
			transform: skewY(-0.75deg);
			content: '';
		}

		.appHeader__content {
			position: relative;
			z-index: 1;
			display: flex;
			max-width: var(--desktop-medium);
			padding-top: 8px;
			margin: 0 auto;
			font-family: 'Bebas Neue', sans-serif;

			.login__link {
				flex: 0 0 auto;
				display: flex;
				flex-wrap: nowrap;
				align-items: center;
				margin: auto 0 auto auto;
				border-radius: var(--radius-full);
				font-size: 16px;

				.login__link__button__text,
				.login__link__button__icon {
					transition:
						background-color var(--transition-duration-fast),
						color var(--transition-duration-fast),
						fill var(--transition-duration-fast);
					color: var(--color-text-secondary);
				}

				&.logged_in {
					background-color: var(--color-text-primary);

					.login__link__button__text,
					.login__link__button__icon {
						color: var(--color-text-contrast);
					}
				}

				&:hover .login__link__button__text,
				&:hover .login__link__button__icon {
					color: var(--color-text-accent);
				}
			}

			// Mobile header layout adjustments
			@media screen and (max-width: 900px) {
				gap: 8px; // Add spacing between header elements

				.login__link {
					margin-left: 8px; // Reduce excessive auto margin on mobile
				}
			}

			@media screen and (max-width: 1200px) {
				max-width: 100%;
			}
		}
	}
}

.theme-dark .appHeader__wrapper {
	.header__logo__image {
		&.light {
			display: none !important;
		}

		&.dark {
			display: block !important;
		}
	}
}
</style>
