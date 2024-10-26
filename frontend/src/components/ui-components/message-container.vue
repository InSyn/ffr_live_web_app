<template>
  <section :class="[(messages.length || errors.length) && 'open']" class="messages__wrapper">
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
  name: 'message-container',
  props: {
    messages: { type: Array, default: () => [] },
    errors: { type: Array, default: () => [] },
  },
  data() {
    return {
      messageTimeoutId: null,
      errorTimeoutId: null,
    };
  },
  watch: {
    'messages.length': function () {
      clearTimeout(this.messageTimeoutId);
      this.messageTimeoutId = setTimeout(() => {
        if (this.messages) this.messages.splice(0, 1);
      }, 2500);
    },
    'errors.length': function () {
      clearTimeout(this.errorTimeoutId);
      this.errorTimeoutId = setTimeout(() => {
        if (this.errors) this.errors.splice(0, 1);
      }, 2500);
    },
  },
};
</script>

<style lang="scss" scoped>
.messages__wrapper {
  display: grid;
  grid-template-rows: 0fr;
  gap: 8px;
  padding: 0 1.25rem;
  overflow: hidden;
  max-width: var(--tablet-default);
  width: 100%;

  transition: opacity 128ms, grid-template-rows 128ms ease-in, padding 256ms;

  .messages__innerWrapper {
    overflow: hidden;

    .error__item,
    .msg__item {
      font-weight: bold;
      animation: fadeIn 128ms;
    }

    .error__item {
      color: var(--message-error);
    }

    .msg__item {
      color: var(--text-default);
    }
  }

  &.open {
    grid-template-rows: 1fr;
    padding: 0.5rem 1.25rem;
    opacity: 1;
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
