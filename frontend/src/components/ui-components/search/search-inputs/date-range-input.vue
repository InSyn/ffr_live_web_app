<template>
	<div class="date-range-input__wrapper">
		<div class="date-range-input__control">
			<div class="date-range-input__input-wrapper">
				<input
					:id="`${name}_from`"
					type="date"
					:aria-label="`Дата начала диапазона (${name})`"
					:value="value.date_from"
					:placeholder="`${name} от`"
					class="date-range-input__input"
					@input="updateDate('date_from', $event.target.value)"
				/>
			</div>
		</div>
		<div class="date-range-input__control">
			<div class="date-range-input__input-wrapper">
				<input
					:id="`${name}_to`"
					type="date"
					:aria-label="`Дата конца диапазона (${name})`"
					:value="value.date_to"
					:placeholder="`${name} до`"
					class="date-range-input__input"
					@input="updateDate('date_to', $event.target.value)"
				/>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'DateRangeInput',
	props: {
		value: {
			type: Object,
			default: () => ({ date_from: '', date_to: '' })
		},
		name: {
			type: String,
			required: true
		}
	},
	methods: {
		updateDate(key, date) {
			this.$emit('input', { ...this.value, [key]: date })
		}
	}
}
</script>

<style scoped lang="scss">
/* === Date Range Input Modern Styling Template === */
:root {
	/* Example color variables for future theming */
	--date-range-bg: var(--color-bg-surface, #fff);
	--date-range-border: var(--border-default, #e0e0e0);
	--date-range-focus: var(--primary, #1976d2);
	--date-range-label: var(--text-muted, #757575);
	--date-range-icon: var(--primary, #1976d2);
	--date-range-shadow: 0 2px 8px rgba(25, 118, 210, 0.08);
}

.date-range-input__wrapper {
	flex: 0 0 auto;
	display: flex;
}

.date-range-input__control {
	flex: 0 0 auto;
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	position: relative;

	&:focus-within,
	&:hover {
		background-color: var(--color-bg-surface-hover);
	}
}

.date-range-input__label {
	flex: 1 1 0;
	font-size: var(--font-size-sm);
	font-weight: var(--font-weight-medium);
	color: var(--color-text-secondary);
	margin-right: var(--space-2);
	letter-spacing: 0.01em;
	transition: color 0.2s;
	white-space: nowrap;
}

.date-range-input__input-wrapper {
	flex: 0 0 4ch;
	position: relative;
	display: flex;
	align-items: center;
}

.date-range-input__input {
	min-width: 0;
	padding: var(--space-1) var(--space-2);
	border-radius: var(--border-radius-sm);
	background: transparent;
	color: var(--color-text-primary);
	font-family: inherit;
	font-size: 1rem;
	transition:
		border-color 0.2s,
		box-shadow 0.2s,
		background 0.2s;
	box-shadow: var(--date-range-shadow);
	outline: none;
	appearance: none;
}

.date-range-input__icon {
	position: absolute;
	right: 10px;
	top: 50%;
	transform: translateY(-50%);
	display: flex;
	align-items: center;
	color: var(--primary);
	opacity: 0.7;
	pointer-events: none;
	transition:
		color 0.2s,
		opacity 0.2s;

	svg {
		display: block;
	}
}

/* Accessibility: high-contrast focus for keyboard users */
.date-range-input__input:focus-visible {
	outline: 2px solid var(--primary);
	outline-offset: 2px;
}

/* Responsive: stack vertically on small screens */
@media (max-width: 600px) {
	.date-range-input__wrapper {
		flex-direction: column;
		gap: 12px;
	}
}
</style>
