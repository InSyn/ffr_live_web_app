<template>
	<div class="stringMulti_control__wrapper">
		<div
			v-for="(_, idx) in target[target_key]"
			:key="idx"
			class="stringMulti_control__updateValue__wrapper"
		>
			<input
				:id="target_key"
				class="stringMulti_control__updateValue__input"
				:value="target[target_key][idx]"
				@change="setFieldValue(target, target_key, $event.target.value, idx)"
			/>
			<span
				class="stringMulti_control__removeValue__button"
				@click="removeFieldValue(target, target_key, idx)"
			/>
		</div>
		<input
			:id="target_key"
			class="stringMulti_control__newValue__input"
			:placeholder="placeholder"
			@change="addFieldValue(target, target_key, $event)"
		/>
	</div>
</template>

<script>
import { addFieldValue, removeFieldValue, setFieldValue } from '@/utils/formData-helpers'

export default {
	name: 'MultipleStringControl',
	props: {
		target: {
			type: Object,
			required: true
		},
		target_key: {
			type: String,
			required: true
		},
		placeholder: String
	},
	data() {
		return {}
	},
	methods: {
		setFieldValue,
		removeFieldValue,
		addFieldValue
	}
}
</script>

<style lang="scss" scoped>
.stringMulti_control__wrapper {
	flex: 1 1 0;
	display: flex;
	flex-direction: column;
	gap: 0.25rem;

	.stringMulti_control__updateValue__wrapper {
		position: relative;
		flex: 0 0 auto;

		.stringMulti_control__removeValue__button {
			position: absolute;
			top: 50%;
			transform: translateY(-50%);
			right: 0;
			width: 1.25rem;
			height: 1.25rem;
			margin: 0;

			border-radius: 50%;
			background-color: var(--color-bg-surface-secondary);
			opacity: 0.45;
			transition: opacity var(--transition-duration-instant);
			cursor: pointer;
			content: '';

			&:hover {
				opacity: 1;
			}

			&::before {
				content: '';
				position: absolute;
				display: block;
				height: 3px;
				width: 12px;
				background-color: var(--color-text-error);
				transform-origin: center;
				left: 50%;
				top: 50%;
				transform: translate(-50%, -50%) rotate(45deg);
			}

			&::after {
				content: '';
				position: absolute;
				display: block;
				height: 3px;
				width: 12px;
				background-color: var(--color-text-error);
				transform-origin: center;
				left: 50%;
				top: 50%;
				transform: translate(-50%, -50%) rotate(-45deg);
			}
		}
	}

	.stringMulti_control__newValue__input {
		flex: 0 0 auto;
	}

	input {
		min-width: 0;
		width: 100%;
		padding: 3px 6px;
		border-radius: 2px;
		background-color: var(--color-bg-surface-secondary);
	}
}
</style>
