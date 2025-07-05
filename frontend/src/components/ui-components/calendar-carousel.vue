<template>
	<div class="calendar__wrapper">
		<div class="calendar__head">
			<div class="calendar__control">
				<v-btn color="var(--color-text-primary)" text small @click="previousMonth">
					<v-icon small>
						{{ icons.controlLeftIcon }}
					</v-icon>
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
				<v-btn color="var(--color-text-primary)" text small @click="nextMonth">
					<v-icon small>
						{{ icons.controlRightIcon }}
					</v-icon>
				</v-btn>
			</div>
		</div>
		<div class="calendar__days__wrapper">
			<button
				v-for="day in days"
				:key="day"
				:class="[
					'calendar__day__item',
					selectedDay === day && 'selected',
					isCurrentDay(day) && 'isCurrentDay',
					hasEvents(day) && 'hasEvents'
				]"
				type="button"
				@click="selectDay(day)"
			>
				<span>{{ day }}</span>
			</button>
		</div>
	</div>
</template>

<script>
import { getDaysOfMonth } from '../../utils/calendar-helpers'
import {
	toUTCDate,
	isEventOnCalendarDay,
	isCurrentDay,
	formatDateForAPI
} from '../../utils/date-utils'
import { mdiChevronLeft, mdiChevronRight, mdiChevronDown } from '@mdi/js'
import { capitalizeString } from '@/utils/capitalizeString'

export default {
	name: 'CalendarCarousel',
	props: ['calendarDateProp', 'events'],
	data() {
		return {
			icons: {
				controlLeftIcon: mdiChevronLeft,
				controlRightIcon: mdiChevronRight,
				arrowIcon: mdiChevronDown
			}
		}
	},
	computed: {
		days() {
			const date = new Date(this.calendarDate)
			const year = date.getFullYear()
			const month = date.getMonth() + 1
			return getDaysOfMonth(year, month)
		},
		formattedDate() {
			const date = new Date(this.calendarDate)
			const month = date.toLocaleString('default', { month: 'long' })

			return `${capitalizeString(month.toString())} ${date.getFullYear()}`
		},
		calendarDate: {
			get() {
				return this.calendarDateProp
			},
			set(val) {
				this.$emit('set-calendar-date', val)
			}
		},
		selectedDay() {
			const date = new Date(this.calendarDate)
			if (!date) return ''

			return date.getDate()
		}
	},
	methods: {
		getDaysOfMonth,
		selectDay(day) {
			const date = toUTCDate(this.calendarDate)
			date.setUTCDate(day)
			this.$emit('set-calendar-date', formatDateForAPI(date))
		},
		openDatePicker() {
			const input = this.$refs.dateInput
			input.showPicker()
		},
		previousMonth() {
			const date = toUTCDate(this.calendarDate)
			date.setUTCMonth(date.getUTCMonth() - 1)
			this.$emit('set-calendar-date', formatDateForAPI(date))
		},
		nextMonth() {
			const date = toUTCDate(this.calendarDate)
			date.setUTCMonth(date.getUTCMonth() + 1)
			this.$emit('set-calendar-date', formatDateForAPI(date))
		},
		isCurrentDay(day) {
			return isCurrentDay(day, this.calendarDate)
		},
		hasEvents(day) {
			if (!this.events || !this.events.length) return false

			return this.events.some(evt => isEventOnCalendarDay(evt, day, this.calendarDate))
		}
	}
}
</script>

<style scoped lang="scss">
.calendar__wrapper {
	display: flex;
	flex-direction: column;
	padding-bottom: 4px;
	background-color: var(--color-bg-surface);
	border-bottom: 1px solid var(--color-text-secondary);

	.calendar__head {
		flex: 0 0 auto;
		display: flex;
		align-items: stretch;

		.calendar__control {
			flex: 0 0 auto;
			display: flex;

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
					color: var(--color-text-primary);
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
			flex: 1 0 1.5rem;
			max-width: 2rem;
			display: flex;
			justify-content: center;
			align-items: center;
			height: 1.5rem;

			color: var(--color-text-secondary);
			//border-radius: 50%;
			font-size: 1.1rem;

			&::before {
				position: absolute;
				top: 100%;
				left: 50%;
				transform: translateX(-50%);
				width: 0;
				height: 2px;
				background-color: var(--color-text-accent);
				transition: width var(--transition-duration-instant);
				content: '';
			}

			&.hasEvents {
				font-weight: bold;
				color: var(--color-text-primary);
			}

			&.selected {
				flex-basis: 1.75rem;
				font-weight: bold;

				&::before {
					width: 100%;
				}

				span {
					transform: scale(1.25);
					opacity: 0.9;
				}
			}

			&.isCurrentDay {
				color: var(--color-text-accent);
			}

			span {
				display: inline-block;
				margin: auto;
				transition:
					transform var(--transition-duration-instant),
					opacity var(--transition-duration-instant);
			}

			&:hover span {
				transform: scale(1.25);
				opacity: 0.9;
			}
		}
	}
}
</style>
