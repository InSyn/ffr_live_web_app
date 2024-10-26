<template>
  <div class="athleteMedalsControl__wrapper">
    <div v-for="(event, e_idx) in athleteMedalEvents" :key="e_idx" class="medalsEvent__wrapper">
      <div class="eventSelect__wrapper">
        <label for="eventName">Событие</label>
        <select id="eventName" @change="validateEventName($event, e_idx)" :value="event.name">
          <option disabled value="">Выберите событие</option>
          <option v-for="(option, index) in medalEvents()" :key="index" :value="option">
            {{ option }}
          </option>
        </select>
      </div>

      <div v-show="event.name" class="eventMedals__wrapper">
        <div v-for="medalType in ['gold', 'silver', 'bronze']" :key="medalType" class="medalControl__wrapper">
          <label :for="medalType">{{ `${getMedalName(medalType)}(кол - во):` }}</label>
          <input @input="updateMedals($event, e_idx, medalType)" :value="event[medalType]" :id="medalType" min="0" max="9" type="number" />
        </div>
      </div>

      <v-btn @click="removeEvent(e_idx)" color="var(--message-error)" text small> Удалить событие </v-btn>
    </div>

    <v-btn @click="addEvent" color="var(--accent)" text small> Добавить событие </v-btn>
  </div>
</template>

<script>
import { getMedalEvents } from '@/store/data/medal-events';

export default {
  name: 'medals-select',
  props: {
    athleteMedalEvents: Array,
  },
  methods: {
    addEvent() {
      this.$emit('add-medals-event');
    },
    removeEvent(eIdx) {
      this.$emit('remove-medals-event', eIdx);
    },
    validateEventName(e, event_index) {
      const event = this.athleteMedalEvents[event_index];

      if (e.target.value) event.name = e.target.value;

      this.$emit('update-medals-event', event);
    },
    medalEvents() {
      return getMedalEvents();
    },
    updateMedals(e, eIdx, medal) {
      const event = this.athleteMedalEvents[eIdx];

      let medalValue = Number(e.target.value);

      if (!medalValue || isNaN(e.target.value)) return;
      if (medalValue < 0) medalValue = 0;
      if (medalValue > 9) medalValue = 9;

      event[medal] = medalValue;

      this.$emit('update-medals-event', event);
    },

    getMedalName(medal) {
      const medalsMap = {
        gold: 'Золото',
        silver: 'Серебро',
        bronze: 'Бронза',
      };
      return medalsMap[medal] || '';
    },
  },
};
</script>

<style lang="scss" scoped>
.athleteMedalsControl__wrapper {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;

  .eventSelect__wrapper {
    display: flex;
    margin-bottom: 6px;

    label {
      display: block;
      flex: 0 0 auto;
      margin-right: 0.5rem;
    }

    select {
      padding: 3px 6px;
      border-radius: 2px;
      color: var(--text-default);
      background-color: var(--background--card-secondary);
      outline: transparent;
    }
  }

  .eventMedals__wrapper {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    gap: 4px;

    .medalControl__wrapper {
      display: flex;

      label {
        width: 10rem;
        display: block;
        flex: 0 0 auto;
        margin-right: 0.5rem;
      }

      input {
        min-width: 0;
        width: 3rem;
        flex: 0 1 auto;
        padding: 3px 6px;
        border-radius: 2px;
        color: var(--text-default);
        background-color: var(--background--card-secondary);
        outline: transparent;
      }
    }

    button {
      align-self: flex-end;
    }
  }

  button {
    align-self: center;
  }
}
</style>
