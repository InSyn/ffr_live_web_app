<script>
export default {
	name: 'HeaderLogo'
}
</script>

<template>
	<a
		class="header__logo__wrapper"
		href="https://www.ffr-ski.ru"
		target="_blank"
		rel="noopener noreferrer"
		title="Перейти на сайт ФФР"
	>
		<img
			alt="tw-logo"
			class="header__logo__image light"
			src="../../../assets/logo/FFR_HEADER_LOGO_BLUE.png"
		/>
		<img
			alt="tw-logo"
			class="header__logo__image dark"
			src="../../../assets/logo/FFR_HEADER_LOGO_WHITE.png"
		/>
		<img
			alt="tw-logo"
			class="header__logo__image mini"
			src="../../../assets/logo/FFR_logo_mini.png"
		/>
	</a>
</template>

<style scoped lang="scss">
.header__logo__wrapper {
	position: absolute;
	flex: 0 0 auto;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;

	&::before {
		position: absolute;
		width: 400px;
		height: 400px;
		top: -272px;
		left: 0;
		background-color: var(--color-bg-surface);
		box-shadow: var(--shadow-brand);
		transform: rotate(40deg) skewX(-27deg);
		content: '';
	}
	.header__logo__image {
		position: relative;
		height: 55px;
		top: 28px;
		left: 84px;

		&.light {
			display: block;
		}
		&.dark {
			display: none;
		}
		&.mini {
			display: none;
		}
	}
	@media screen and (max-width: 1200px) {
		&::before {
			top: -316px;
		}
		.header__logo__image {
			top: 14px;
			left: 102px;
			height: 40px;
		}
	}
	@media screen and (max-width: 1000px) {
		&::before {
			top: -340px;
		}
		.header__logo__image {
			top: 6px;
			left: 110px;
			height: 32px;
		}
	}
	@media screen and (max-width: 920px) {
		margin-left: 50px;

		&::before {
			display: none;
		}
		.header__logo__image {
			top: -2px;
			left: 60px;
			height: 32px;
		}
	}
	@media screen and (max-width: 600px) {
		.header__logo__image {
			left: 20px;
		}
	}
	@media screen and (max-width: 480px) {
		.header__logo__image.dark,
		.header__logo__image.light {
			display: none !important;
		}
		.header__logo__image.mini {
			display: block;
		}
	}
	@media screen and (max-width: 380px) {
		display: none;
	}
}
:root.dark {
	.header__logo__image {
		&.light {
			display: none;
		}
		&.dark {
			display: block;
		}
	}
}
</style>
