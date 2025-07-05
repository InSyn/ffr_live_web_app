<script>
export default {
	name: 'CustomCheckbox',
	props: {
		value: Boolean,
		label: {
			type: String,
			default: ''
		}
	},
	methods: {
		handleChange(event) {
			this.$emit('input', event.target.checked)
		}
	}
}
</script>

<template>
	<label class="registrationStatus__checkbox">
		<span v-if="label" class="registrationStatus__checkbox__label">{{ label }}</span>
		<input type="checkbox" :checked="value" @change="handleChange" />
		<span class="registrationStatus__checkbox__thumb" />
	</label>
</template>

<style scoped lang="scss">
.registrationStatus__checkbox {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	cursor: pointer;

	.registrationStatus__checkbox__label {
	}
	input[type='checkbox'] {
		display: none;
	}
	.registrationStatus__checkbox__thumb {
		position: relative;
		display: block;
		width: 26px;
		height: 16px;
		background-color: var(--color-bg-primary-hovered);
		box-shadow:
			inset 1px 1px 4px rgba(0, 0, 0, 0.18),
			inset -1px -1px 3px rgba(255, 255, 255, 0.12);
		border-radius: 8px;

		&::after {
			position: absolute;
			display: block;
			top: 50%;
			left: 2px;
			height: 14px;
			width: 14px;
			background-color: #ffffff;
			box-shadow:
				inset -1px -1px 3px rgba(0, 0, 0, 0.35),
				inset 1px 1px 2px rgba(0, 0, 0, 0.1);
			border-radius: 50%;
			transform: translate(0, -50%);
			transition:
				background-color var(--transition-duration-instant),
				transform var(--transition-duration-instant);
			content: '';
		}
		&:hover {
			&::after {
				background-color: #f1f1f4;
			}
		}
	}
	input[type='checkbox']:checked ~ .registrationStatus__checkbox__thumb {
		background-color: var(--color-text-success);

		&::after {
			transform: translate(10px, -50%);
		}
	}
}
</style>
