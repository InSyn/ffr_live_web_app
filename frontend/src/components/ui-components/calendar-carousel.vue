<template>
  <div class="calendar__wrapper">
    <div class="calendar__head">
      <div class="calendar__control">
        <v-btn color="var(--text-default)" text small @click="previousMonth">
          <v-icon small>{{ icons.controlLeftIcon }}</v-icon>
        </v-btn>
      </div>
      <div class="date__input__wrapper">
        <label for="calendar-date" @click="openDatePicker">
          {{ formattedDate }}
          <v-icon class="calendar__arrow"> {{ icons.arrowIcon }}</v-icon>
        </label>
        <input id="calendar-date" ref="dateInput" v-model="calendarDate" type="date" />
      </div>
      <div class="calendar__control">
        <v-btn color="var(--text-default)" text small @click="nextMonth">
          <v-icon small>{{ icons.controlRightIcon }}</v-icon>
        </v-btn>
      </div>
    </div>
    <div class="calendar__days__wrapper">
      <button
        :class="['calendar__day__item', selectedDay === day && 'selected', isCurrentDay(day) && 'isCurrentDay', hasEvents(day) && 'hasEvents']"
        @click="selectDay(day)"
        type="button"
        v-for="day in days"
        :key="day"
      >
        <span>{{ day }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { getDaysOfMonth } from '@/utils/calendar-helpers';
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import { capitalizeString } from '@/utils/capitalizeString';
import { mdiChevronDown } from '@mdi/js';

export default {
  name: 'calendar-carousel',
  props: ['calendarDateProp', 'events'],
  methods: {
    getDaysOfMonth,
    selectDay(day) {
      const date = new Date(this.calendarDate);
      date.setDate(day);
      this.$emit('set-calendar-date', date.toISOString().substring(0, 10));
    },
    openDatePicker() {
      const input = this.$refs.dateInput;
      input.showPicker();
    },
    previousMonth() {
      const date = new Date(this.calendarDate);
      date.setMonth(date.getMonth() - 1);
      this.$emit('set-calendar-date', date.toISOString().substring(0, 10));
    },
    nextMonth() {
      const date = new Date(this.calendarDate);
      date.setMonth(date.getMonth() + 1);
      this.$emit('set-calendar-date', date.toISOString().substring(0, 10));
    },
    isCurrentDay(day) {
      const currentDay = new Date().getDate();
      const currentMonth = new Date().getMonth() === new Date(this.calendarDate).getMonth();
      const currentYear = new Date().getFullYear() === new Date(this.calendarDate).getFullYear();

      return day === currentDay && currentMonth && currentYear;
    },
    hasEvents(day) {
      if (!this.events) return;

      return this.events.some((evt) => {
        const evtDate = new Date(evt.start_at === undefined ? evt.date : evt.start_at);
        if (!evtDate) return false;

        const evtDay = evtDate.getDate();
        if (evtDay.toString() !== day.toString()) return false;

        const evtYear = evtDate.getFullYear(),
          evtMonth = evtDate.getMonth();
        if (evtYear === new Date(this.calendarDate).getFullYear() && evtMonth === new Date(this.calendarDate).getMonth()) return true;
      });
    },
  },
  data() {
    return {
      icons: {
        controlLeftIcon: mdiChevronLeft,
        controlRightIcon: mdiChevronRight,
        arrowIcon: mdiChevronDown,
      },
    };
  },
  computed: {
    days() {
      const date = new Date(this.calendarDate);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      return getDaysOfMonth(year, month);
    },
    formattedDate() {
      const date = new Date(this.calendarDate);
      const month = date.toLocaleString('default', { month: 'long' });

      return `${capitalizeString(month.toString())} ${date.getFullYear()}`;
    },
    calendarDate: {
      get() {
        return this.calendarDateProp;
      },
      set(val) {
        this.$emit('set-calendar-date', val);
      },
    },
    selectedDay() {
      const date = new Date(this.calendarDate);
      if (!date) return '';

      return date.getDate();
    },
  },
};
</script>

<style scoped lang="scss">
.calendar__wrapper {
  display: flex;
  flex-direction: column;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--text-muted);

  .calendar__head {
    flex: 0 0 auto;
    display: flex;
    align-items: center;

    .calendar__control {
      flex: 0 0 auto;
      display: flex;
      height: 100%;

      button {
        height: 100%;
        border-radius: 0;
      }
    }

    .date__input__wrapper {
      flex: 1 1 0;
      display: flex;
      justify-content: center;
      position: relative;

      label {
        display: block;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 4px;
        font-weight: bold;

        .calendar__arrow {
          display: inline-block;
          color: var(--text-default);
        }
      }

      input {
        position: absolute;
        opacity: 0;
        pointer-events: none;
      }
    }
  }

  .calendar__days__wrapper {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    padding: 8px 8px 0;

    .calendar__day__item {
      position: relative;
      flex: 0 0 1.5rem;
      display: flex;
      height: 1.75rem;

      color: var(--text-muted);
      border-radius: 50%;
      font-size: 1.1rem;

      &.hasEvents {
        font-weight: bold;
        color: var(--text-default);
      }

      &.selected {
        flex-basis: 1.75rem;
        box-shadow: 0 0 0 2px var(--text-default);
        font-weight: bold;
      }

      &.isCurrentDay {
        color: var(--accent);
      }

      span {
        display: block;
        margin: auto;
      }
    }
  }
}
</style>
