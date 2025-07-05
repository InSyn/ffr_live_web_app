<template>
	<div
		:class="['lazy-image__wrapper', wrapperClass, variantClass]"
		:style="{ borderRadius: rounding }"
	>
		<img
			v-if="placeholderSrc"
			:src="placeholderSrc"
			:alt="alt"
			:class="['lazy-image__placeholder', { 'lazy-image--hidden': imageLoaded }]"
			aria-hidden="true"
		/>
		<img
			ref="img"
			:data-src="src"
			:src="imageSrc"
			:alt="alt"
			:class="['lazy-image', imgClass, { 'lazy-image--loaded': imageLoaded }]"
			:loading="nativeLazy ? 'lazy' : undefined"
			:width="width"
			:height="height"
			role="img"
			:aria-label="alt"
			@load="onLoad"
			@error="onError"
		/>
		<div
			v-if="!imageLoaded && !placeholderSrc"
			class="lazy-image__fallback-placeholder"
			role="status"
			aria-live="polite"
		>
			<slot name="placeholder">
				<span v-if="loading && !error">Loading...</span>
				<span v-if="error">{{ errorText }}</span>
			</slot>
		</div>
	</div>
</template>

<script>
export default {
	name: 'LazyImage',
	props: {
		src: { type: String, required: true },
		placeholderSrc: { type: String, default: null },
		alt: { type: String, default: '' },
		variant: {
			type: String,
			default: null,
			validator: value => [null, 'list', 'page'].includes(value)
		},
		imgClass: { type: [String, Array, Object], default: '' },
		wrapperClass: { type: [String, Array, Object], default: '' },
		width: { type: [String, Number], default: undefined },
		height: { type: [String, Number], default: undefined },
		errorText: { type: String, default: '' },
		rounding: { type: String, default: 'var(--space-1)' }
	},
	data() {
		return {
			imageLoaded: false,
			loading: true,
			error: false,
			observer: null,
			nativeLazy: 'loading' in HTMLImageElement.prototype,
			imageSrc: this.nativeLazy ? this.src : ''
		}
	},
	computed: {
		variantClass() {
			if (!this.variant) return null
			return `lazy-image__wrapper--${this.variant}`
		}
	},
	mounted() {
		if (process.env.NODE_ENV !== 'production' && this.variant && (this.width || this.height)) {
			console.warn(
				"[LazyImage] The `width` and `height` props are deprecated when using the `variant` prop. Sizing is now handled by the component's internal styles."
			)
		}

		if (!this.nativeLazy && this.$refs.img) {
			this.initIntersectionObserver()
		} else if (this.nativeLazy) {
			if (this.$refs.img?.complete && this.$refs.img?.naturalHeight > 0) {
				this.onLoad()
			}
		}
	},
	beforeDestroy() {
		if (this.observer) {
			this.observer.disconnect()
		}
	},
	methods: {
		initIntersectionObserver() {
			if (!('IntersectionObserver' in window)) {
				this.loadImage()
				return
			}
			this.observer = new IntersectionObserver(
				entries => {
					if (entries[0].isIntersecting) {
						this.loadImage()
						this.observer.disconnect()
					}
				},
				{ rootMargin: '100px' }
			)
			this.observer.observe(this.$el)
		},
		loadImage() {
			if (this.imageSrc !== this.src) {
				this.imageSrc = this.src
			}
		},
		onLoad(event) {
			if (event.target.src === this.src) {
				this.imageLoaded = true
				this.loading = false
				this.error = false
				this.$emit('load')
			}
		},
		onError() {
			this.loading = false
			this.error = true
			this.loadImage()
			this.$emit('error')
		}
	}
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/abstracts/_mixins.scss';

.lazy-image__wrapper {
	flex-shrink: 0;
	display: inline-block;
	position: relative;
	overflow: hidden;
	background: color-mix(in srgb, var(--color-bg-surface-secondary), transparent 80%);

	&--list {
		width: 48px;
		height: 48px;

		@include respond-to('sm') {
			width: 64px;
			height: 64px;
		}

		@include respond-to('lg') {
			width: 80px;
			height: 80px;
		}
	}

	&--page {
		width: 120px;
		height: 120px;

		@include respond-to('sm') {
			width: 140px;
			height: 140px;
		}

		@include respond-to('lg') {
			width: 180px;
			height: 180px;
		}
	}

	.lazy-image {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: opacity 0.4s ease-in-out;
		opacity: 0;
	}

	.lazy-image--loaded {
		opacity: 1;
	}

	.lazy-image__placeholder {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: inherit;
		filter: blur(8px);
		transform: scale(1.1);
		transition: opacity 0.4s ease-in-out;
		opacity: 1;
	}

	.lazy-image--hidden {
		opacity: 0;
	}

	.lazy-image__fallback-placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		min-height: 48px;
		color: var(--text-muted, #888);
		font-size: 1rem;
		border-radius: inherit;
	}
}
</style>
