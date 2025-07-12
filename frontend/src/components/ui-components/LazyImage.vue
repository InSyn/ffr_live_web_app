<template>
	<div
		:class="['lazy-image__wrapper', wrapperClass, variantClass]"
		:style="{ borderRadius: rounding }"
	>
		<img
			v-if="hasValidSrc"
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
			v-if="!imageLoaded && !error && placeholderComponent"
			class="lazy-image__smart-placeholder"
			role="status"
			aria-live="polite"
		>
			<component
				:is="placeholderComponent"
				v-bind="placeholderProps"
				class="lazy-image__placeholder-content lazy-image__placeholder-content--loading"
			/>
		</div>
		<div
			v-if="error && placeholderComponent"
			class="lazy-image__error-placeholder"
			role="status"
			aria-live="polite"
		>
			<component
				:is="placeholderComponent"
				v-bind="placeholderProps"
				class="lazy-image__placeholder-content lazy-image__placeholder-content--error"
			/>
		</div>
		<div
			v-if="!imageLoaded && !placeholderComponent"
			class="lazy-image__fallback-placeholder"
			:class="{
				'lazy-image__fallback-placeholder--loading': loading && !error,
				'lazy-image__fallback-placeholder--error': error
			}"
			role="status"
			aria-live="polite"
		>
			<slot name="placeholder">
				<span v-if="loading && !error">Loading...</span>
				<span v-if="error">{{ errorText || 'Failed to load image' }}</span>
			</slot>
		</div>
	</div>
</template>

<script>
import PersonPhoto from '@/components/ui-components/person-photo.vue'
import AthletePhotoFillerIcon from '@/assets/svg/athletePhotoFiller-icon.vue'
import CompetitionImageFillerIcon from '@/assets/svg/competitionImageFiller-icon.vue'

export default {
	name: 'LazyImage',
	components: {
		PersonPhoto,
		AthletePhotoFillerIcon,
		CompetitionImageFillerIcon
	},
	props: {
		src: { type: String, required: true },
		alt: { type: String, default: '' },
		variant: {
			type: String,
			default: null,
			validator: value => [null, 'list', 'page'].includes(value)
		},
		entityType: {
			type: String,
			default: null,
			validator: value =>
				[
					null,
					'person',
					'athlete',
					'jury',
					'trainer',
					'event',
					'competition',
					'organization'
				].includes(value)
		},
		entityData: { type: Object, default: () => ({}) },
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
			imageSrc: this.getValidImageSrc(),
			entityPlaceholderMap: {
				person: { component: 'PersonPhoto', useEntityData: true },
				athlete: { component: 'PersonPhoto', useEntityData: true },
				jury: { component: 'PersonPhoto', useEntityData: true },
				trainer: { component: 'PersonPhoto', useEntityData: true },
				event: { component: 'CompetitionImageFillerIcon', useEntityData: false },
				competition: { component: 'CompetitionImageFillerIcon', useEntityData: false },
				organization: { component: 'CompetitionImageFillerIcon', useEntityData: false }
			}
		}
	},
	computed: {
		variantClass() {
			if (!this.variant) return null
			return `lazy-image__wrapper--${this.variant}`
		},
		placeholderComponent() {
			if (!this.entityType) return null
			const mapping = this.entityPlaceholderMap[this.entityType]
			return mapping ? mapping.component : null
		},
		placeholderProps() {
			if (!this.entityType || !this.placeholderComponent) return {}

			const mapping = this.entityPlaceholderMap[this.entityType]
			if (!mapping) return {}

			if (mapping.useEntityData && this.entityData) {
				return { person: this.entityData }
			}

			if (this.entityData.gender) {
				return { gender: this.entityData.gender }
			}

			return {}
		},
		hasValidSrc() {
			return this.src && this.src.trim() !== '' && this.src !== 'null' && this.src !== 'undefined'
		}
	},
	mounted() {
		if (process.env.NODE_ENV !== 'production' && this.variant && (this.width || this.height)) {
			console.warn(
				"[LazyImage] The `width` and `height` props are deprecated when using the `variant` prop. Sizing is now handled by the component's internal styles."
			)
		}

		if (!this.nativeLazy && this.$refs.img) {
			console.log('initIntersectionObserver')
			this.initIntersectionObserver()
		} else if (this.nativeLazy) {
			if (this.hasValidSrc && this.$refs.img?.complete && this.$refs.img?.naturalHeight > 0) {
				console.log(
					'nativeLazy',
					this.hasValidSrc,
					this.$refs.img?.complete,
					this.$refs.img?.naturalHeight
				)
				this.onLoad()
			} else if (!this.hasValidSrc) {
				this.loading = false
				this.error = true
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
				setTimeout(() => {
					this.loadImage()
				}, 5000)
				return
			}
			this.observer = new IntersectionObserver(
				entries => {
					if (entries[0].isIntersecting) {
						setTimeout(() => {
							this.loadImage()
						}, 5000)
						this.observer.disconnect()
					}
				},
				{ rootMargin: '100px' }
			)
			this.observer.observe(this.$el)
		},
		loadImage() {
			if (this.hasValidSrc && this.imageSrc !== this.src) {
				this.imageSrc = this.src
			} else if (!this.hasValidSrc) {
				this.loading = false
				this.error = true
			}
		},
		onLoad(event) {
			if (this.hasValidSrc && (!event || event.target.src === this.src)) {
				this.imageLoaded = true
				this.loading = false
				this.error = false
			}
		},
		onError(e) {
			if (this.hasValidSrc && this.imageSrc !== this.src) {
				this.loadImage()
			} else {
				this.loading = false
				this.error = true
			}
		},
		getValidImageSrc() {
			const hasValidSrc =
				this.src && this.src.trim() !== '' && this.src !== 'null' && this.src !== 'undefined'
			if (this.nativeLazy && hasValidSrc) {
				return this.src
			}
			return ''
		}
	}
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/abstracts/_mixins.scss';

.lazy-image__wrapper {
	position: relative;
	flex: 0 0 auto;
	display: inline-block;
	max-width: 100%;
	max-height: 100%;
	background: var(--color-bg-image);

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
		border-radius: inherit;
	}

	.lazy-image--hidden {
		opacity: 0;
	}

	.lazy-image__smart-placeholder,
	.lazy-image__error-placeholder {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: inherit;

		.lazy-image__placeholder-content {
			position: relative;
			width: 100%;
			height: 100%;
			border-radius: inherit;

			&--loading {
				animation: pulse 2s ease-in-out infinite alternate;
			}

			&--error {
				background: var(--color-bg-image);
			}
		}
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
		color: var(--color-text-muted, #888);
		font-size: 0.875rem;
		border-radius: inherit;
		background: color-mix(in srgb, var(--color-bg-surface-secondary), transparent 90%);

		&--loading {
			opacity: 0.9;
			animation: pulse 1.5s ease-in-out infinite alternate;
		}
		&--error {
			color: var(--color-error, #d32f2f);
		}
	}
}

@keyframes pulse {
	0% {
		opacity: 0.3;
	}
	100% {
		opacity: 0.9;
	}
}
</style>
