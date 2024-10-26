<template>
  <div class="stringMulti_control__wrapper">
    <div class="stringMulti_control__updateValue__wrapper" v-for="(_, idx) in target[target_key]" :key="idx">
      <input
        @change="setFieldValue(target, target_key, $event.target.value, idx)"
        :id="target_key"
        class="stringMulti_control__updateValue__input"
        :value="target[target_key][idx]"
      />
      <span @click="removeFieldValue(target, target_key, idx)" class="stringMulti_control__removeValue__button"> </span>
    </div>
    <input @change="addFieldValue(target, target_key, $event)" :id="target_key" class="stringMulti_control__newValue__input" :placeholder="placeholder" />
  </div>
</template>

<script>
import { addFieldValue, removeFieldValue, setFieldValue } from '@/utils/form-data-helpers';

export default {
  name: 'multiple-string-control',
  props: {
    target: {
      type: Object,
      required: true,
    },
    target_key: {
      type: String,
      required: true,
    },
    placeholder: String,
  },
  data() {
    return {};
  },
  methods: {
    setFieldValue,
    removeFieldValue,
    addFieldValue,
  },
};
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

    .stringMulti_control__updateValue__input {
    }

    .stringMulti_control__removeValue__button {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      right: 0;
      width: 1.25rem;
      height: 1.25rem;
      margin: 0;

      border-radius: 50%;
      background-color: var(--background--card-secondary);
      opacity: 0.45;
      transition: opacity 64ms;
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
        background-color: var(--message-error);
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
        background-color: var(--message-error);
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
    background-color: var(--background--card-secondary);
  }
}
</style>
