<template>
	<section :class="['messages__wrapper bg-blur', (messages.length || errors.length) && 'open']">
		<div class="messages__innerWrapper">
			<div v-for="(err, err_idx) in errors" :key="`err_${err_idx}`" class="error__item">
				{{ err }}
			</div>
			<div v-for="(msg, msg_idx) in messages" :key="`msg_${msg_idx}`" class="msg__item">
				{{ msg }}
			</div>
		</div>
	</section>
</template>

<script>
export default {
	name: 'MessageContainer',
	props: {
		messages: { type: Array, default: () => [] },
		errors: { type: Array, default: () => [] }
	},
	data() {
		return {
			messageTimeoutId: null,
			errorTimeoutId: null
		}
	},
	watch: {
		'messages.length': {
			handler() {
				clearTimeout(this.messageTimeoutId)
				this.messageTimeoutId = setTimeout(() => {
					if (this.messages) {
						this.messages.splice(0, 1)
					}
				}, 3250)
			},
			'errors.length': {
				handler() {
					clearTimeout(this.errorTimeoutId)
					this.errorTimeoutId = setTimeout(() => {
						if (this.errors) {
							this.errors.splice(0, 1)
						}
					}, 3250)
				}
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.messages__wrapper {
	--blur-bg-color: var(--color-bg-surface);
	position: fixed;
	z-index: 999;
	display: grid;
	grid-template-rows: 0fr;
	gap: 8px;
	top: 8vh;
	left: 50%;
	transform: translate(-50%, -16px);
	overflow: hidden;

	width: 100%;
	max-width: var(--tablet-small);
	border: none;
	border-radius: 6px;
	opacity: 0;

	transition:
		opacity var(--transition-duration-slow),
		grid-template-rows var(--transition-duration-medium) ease-in,
		padding var(--transition-duration-medium),
		transform var(--transition-duration-medium);

	.messages__innerWrapper {
		overflow: hidden;

		.error__item,
		.msg__item {
			font-weight: bold;
			animation: fadeIn var(--transition-duration-medium);
		}

		.error__item {
			color: var(--color-text-error);
		}

		.msg__item {
			color: var(--color-text-primary);
		}
	}

	&.open {
		grid-template-rows: 1fr;
		padding: 0.75rem 1.75rem;
		border: 1px solid var(--color-border-primary);
		opacity: 1;
		transform: translate(-50%, 0);
	}
}

@keyframes fadeIn {
	0% {
		transform: translateY(-6px);
		opacity: 0;
	}
	100% {
		transform: translateY(0);
		opacity: 1;
	}
}
</style>
