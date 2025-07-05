<template>
	<router-link :to="{ name: 'seminarPage', params: { seminar_id: item._id } }">
		<div
			:class="[
				'seminar__item__wrapper',
				index % 2 === 0 && 'isEven',
				matchCalendarDate && 'calendarDate-match'
			]"
		>
			<div class="seminar__item__header">
				<div class="seminar__item title">
					{{ item['title'] }}
				</div>
				<div class="seminar__item sport">
					{{ item['sport'] }}

					<country-flag
						class="countryFlag"
						:country-code="getCountryCode(item['country'])"
						height="1rem"
					/>
				</div>
			</div>

			<div class="seminar__item__footer">
				<div class="seminar__item region">
					<country-flag
						is-region-flag="true"
						country-code="RU"
						:region-code="getRegionCode(item.region)"
						width="calc(4px + 1rem)"
					/>
					{{ item['region'] }}
				</div>
				<div class="seminar__item date">
					{{ formatDate(item['date']) }}
				</div>
				<div class="seminar__item disciplines">
					{{ item.disciplines.join(', ') }}
				</div>
			</div>
		</div>
	</router-link>
</template>

<script>
import { getRegionCode } from '@/store/data/russia-regions'
import { formatDate } from '@/utils/data-formaters'
import CountryFlag from '@/components/ui-components/country-flag.vue'
import { getCountryCode } from '@/store/data/countries'

export default {
	name: 'SeminarListItem',
	components: {
		CountryFlag
	},
	props: {
		item: {
			type: Object,
			required: true
		},
		index: {
			type: Number,
			required: true
		},
		matchCalendarDate: {
			type: Boolean,
			default: false
		}
	},
	methods: {
		getCountryCode,
		formatDate,
		getRegionCode
	}
}
</script>

<style scoped lang="scss">
.seminar__item__wrapper {
	display: flex;
	flex-direction: column;
	gap: 0.75rem 1.5rem;
	padding: 0.5rem 1rem;
	border-bottom: 1px solid var(--color-bg-primary);

	&.isEven {
		background-color: var(--color-bg-tertiary);
	}

	&.calendarDate-match {
		padding-left: 6px;
		border-left: 4px solid var(--color-text-secondary);
	}

	&:hover {
		background-color: var(--color-bg-surface-hover);
	}

	.seminar__item__header {
		flex: 0 0 auto;
		display: flex;
		flex-wrap: nowrap;
		align-items: flex-start;
		gap: 0.5rem 1rem;
		font-size: 1.15rem;

		.seminar__item.title {
			flex: 1 1 0;
			font-weight: bold;
		}

		.seminar__item.sport {
			flex: 0 0 auto;

			.countryFlag {
				margin-left: 0.5rem;
			}
		}
	}

	.seminar__item__footer {
		flex: 0 0 auto;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 1rem;

		.seminar__item.region {
			display: flex;
			align-items: center;
			gap: 0.5rem;
		}

		.seminar__item.date {
			margin-left: auto;
		}
	}
}
</style>
