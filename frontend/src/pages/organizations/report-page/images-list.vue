<script>
import { backendRootUrl } from '@/constants'

export default {
	name: 'ImagesList',
	props: {
		images: {
			type: Array,
			required: true
		}
	},
	data() {
		return {
			currentIndex: 0,
			isFullSize: false,
			fullSizeIndex: null
		}
	},
	computed: {
		backendRootUrl() {
			return backendRootUrl
		}
	},
	methods: {
		openFullSize(index) {
			this.fullSizeIndex = index
			this.isFullSize = true
		},
		closeFullSize() {
			this.isFullSize = false
			this.fullSizeIndex = null
		}
	}
}
</script>

<template>
	<div class="imagesList__wrapper">
		<div
			v-for="(image, idx) in images"
			:key="idx"
			class="imagesList__image__wrapper"
			@click="openFullSize(idx)"
		>
			<img
				:src="backendRootUrl + image.url"
				:alt="`Report image ${idx + 1}`"
				class="slider__image"
			/>
		</div>

		<div v-if="isFullSize" class="fullsize__backdrop" @click="closeFullSize">
			<img
				:src="backendRootUrl + images[fullSizeIndex].url"
				:alt="`Report_image_${currentIndex + 1}`"
				class="fullsize__image"
				@click.stop
			/>
		</div>
	</div>
</template>

<style scoped lang="scss">
.imagesList__wrapper {
	position: relative;
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.75rem 1.25rem;
	max-width: 100%;

	.imagesList__image__wrapper {
		display: flex;
		justify-content: center;
		padding: 8px;
		border-radius: 2px;
		cursor: pointer;
		transition: background-color var(--transition-duration-instant);

		img {
			display: block;
			height: 100px;
			max-width: 100%;
			border-radius: 2px;
		}
		&:hover {
			background-color: var(--color-bg-surface-hover);
		}
	}
	.fullsize__backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.8);
		backdrop-filter: blur(2px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;

		.fullsize__image {
			position: relative;
			max-width: 75%;
			max-height: 90%;
			border-radius: 4px;
		}
	}
}
</style>
