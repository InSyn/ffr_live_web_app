<template>
	<svg
		:width="width"
		:height="height"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="M9 6L15 12L9 18"
			stroke="currentColor"
			:stroke-width="strokeWidth"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</svg>
</template>

<script>
export default {
	name: 'ArrowRightIcon',
	props: {
		width: {
			type: [String, Number],
			default: 24
		},
		height: {
			type: [String, Number],
			default: 24
		},
		strokeWidth: {
			type: [String, Number],
			default: 2
		}
	}
}
</script>
