<template>
	<div class="spinner__wrapper">
		<div class="lds-default">
			<div />
			<div />
			<div />
			<div />
			<div />
			<div />
			<div />
			<div />
			<div />
			<div />
			<div />
			<div />
		</div>
	</div>
</template>

<script>
export default {
	name: 'LoaderSpinner'
}
</script>

<style scoped>
.spinner__wrapper {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: color-mix(in srgb, var(--color-bg-surface) 5%, transparent);
	z-index: 1000;
	backdrop-filter: blur(2px);
}

.lds-default {
	position: relative;
	width: 80px;
	height: 80px;
}

.lds-default div {
	position: absolute;
	width: 6px;
	height: 6px;
	background: var(--color-text-accent);
	border-radius: 50%;
	animation: lds-default 1.2s linear infinite;
}

.lds-default div:nth-child(1) {
	animation-delay: 0s;
	top: 37px;
	left: 66px;
}

.lds-default div:nth-child(2) {
	animation-delay: -0.1s;
	top: 22px;
	left: 62px;
}

.lds-default div:nth-child(3) {
	animation-delay: -0.2s;
	top: 11px;
	left: 52px;
}

.lds-default div:nth-child(4) {
	animation-delay: -0.3s;
	top: 7px;
	left: 37px;
}

.lds-default div:nth-child(5) {
	animation-delay: -0.4s;
	top: 11px;
	left: 22px;
}

.lds-default div:nth-child(6) {
	animation-delay: -0.5s;
	top: 22px;
	left: 11px;
}

.lds-default div:nth-child(7) {
	animation-delay: -0.6s;
	top: 37px;
	left: 7px;
}

.lds-default div:nth-child(8) {
	animation-delay: -0.7s;
	top: 52px;
	left: 11px;
}

.lds-default div:nth-child(9) {
	animation-delay: -0.8s;
	top: 62px;
	left: 22px;
}

.lds-default div:nth-child(10) {
	animation-delay: -0.9s;
	top: 66px;
	left: 37px;
}

.lds-default div:nth-child(11) {
	animation-delay: -1s;
	top: 62px;
	left: 52px;
}

.lds-default div:nth-child(12) {
	animation-delay: -1.1s;
	top: 52px;
	left: 62px;
}

@keyframes lds-default {
	0%,
	20%,
	80%,
	100% {
		transform: scale(1);
	}
	50% {
		transform: scale(1.5);
	}
}
</style>
