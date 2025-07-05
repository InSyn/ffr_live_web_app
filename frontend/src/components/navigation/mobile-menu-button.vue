<template>
	<div class="mobileMenu__button__wrapper mr-auto">
		<div class="menu-button" @click="toggleMenu">
			<svg height="50" viewBox="0 0 100 100" width="50" xmlns="http://www.w3.org/2000/svg">
				<g :class="{ 'menu-open': menuState }">
					<line class="line top" x1="20" x2="80" y1="35" y2="35" />
					<line class="line middle" x1="20" x2="80" y1="50" y2="50" />
					<line class="line bottom" x1="20" x2="80" y1="65" y2="65" />
				</g>
			</svg>
		</div>
	</div>
</template>

<script>
export default {
	name: 'MobileMenuButton',
	props: ['menuState'],
	data() {
		return {
			isOpen: false
		}
	},
	methods: {
		toggleMenu() {
			this.$emit('toggle-menu')
		}
	}
}
</script>

<style scoped>
.menu-button {
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
}

@media screen and (min-width: 920px) {
	.menu-button {
		display: none;
	}
}

.line {
	fill: none;
	stroke: var(--color-text-primary);
	stroke-width: 6;
	transition:
		transform var(--transition-duration-medium) ease,
		opacity var(--transition-duration-medium) ease;
	transform-origin: 50% 50%;
}

.menu-open .top {
	transform: translateY(calc(15px - 4px)) rotate(45deg);
}

.menu-open .middle {
	transform: scaleX(0);
}

.menu-open .bottom {
	transform: translateY(calc(-15px + 4px)) rotate(-45deg);
}
</style>
