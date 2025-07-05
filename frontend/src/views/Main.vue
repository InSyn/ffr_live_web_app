<template>
	<div class="mainView__wrapper">
		<app-header />
		<div class="app_main_container">
			<v-fade-transition id="page-transition" mode="out-in">
				<router-view />
			</v-fade-transition>
		</div>
		<app-footer />
	</div>
</template>

<script>
import { checkUserTheme } from '@/utils/check-theme'
import AppHeader from '@/components/layout/app-header/index.vue'
import AppFooter from '@/components/layout/AppFooter.vue'

export default {
	name: 'Home',
	components: { AppFooter, AppHeader },
	methods: {
		checkUserTheme
	}
}
</script>
<style lang="scss">
@property --gradient-angle {
	syntax: '<angle>';
	inherits: false;
	initial-value: 0deg;
}

@property --bg-gradient-color-1 {
	syntax: '<color>';
	inherits: false;
	initial-value: var(--color-bg-primary);
}

@property --bg-gradient-color-2 {
	syntax: '<color>';
	inherits: false;
	initial-value: var(--color-bg-secondary);
}

.mainView__wrapper {
	position: relative;
	flex: 1 1 0;
	display: flex;
	flex-direction: column;

	.app_main_container {
		position: relative;
		isolation: isolate;
		flex: 1 1 0;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		background: var(--color-bg-primary);

		&::before {
			content: '';
			position: absolute;
			z-index: -1;
			height: 100%;
			width: 100%;
			opacity: 0.3;
			background-image: linear-gradient(
				var(--gradient-angle),
				var(--color-bg-secondary),
				var(--color-bg-primary)
			);
			background-size: 100% 100%;
			background-repeat: no-repeat;
			background-position: center;
			mask-image: url('/public/mask_golf.png');
			mask-size: 20% 20%;
			mask-repeat: repeat;
			mask-position: 0 0;
			mask-mode: alpha;
			animation: rotate-gradient 3s linear infinite alternate;
		}

		&::after {
			content: '';
			position: absolute;
			z-index: -2;
			height: 100%;
			width: 100%;
			opacity: 0.3;
			background-image: linear-gradient(
				to bottom,
				var(--color-bg-primary),
				var(--color-bg-secondary)
			);
		}
	}
}

.dark {
	.mainView__wrapper {
		.app_main_container {
			&::before {
				opacity: 1;
			}
		}
	}
}

@keyframes rotate-gradient {
	to {
		--gradient-angle: 360deg;
	}
}
</style>
