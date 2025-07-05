<script>
import { mapGetters } from 'vuex'

export default {
	name: 'AdminPagesNav',
	props: {
		// eslint-disable-next-line vue/prop-name-casing
		db_id: {
			type: String,
			default: ''
		}
	},
	data() {
		return {
			adminRoutes: [
				{
					routePath: 'registration',
					title: 'Создать пользователя',
					access: ['admin', 'secretary']
				},
				{
					routePath: 'all-registrations',
					title: 'Список онлайн заявок',
					access: ['admin', 'secretary']
				},
				{ routePath: 'new-cup-event', title: 'Кубковое событие', access: ['admin', 'secretary'] }
			],
			adminContentRoutes: [
				{ routePath: 'new-event', title: 'Создать событие', access: ['admin', 'secretary'] },
				{ routePath: 'new-athlete', title: 'Создать спортсмена', access: ['admin'] },
				{ routePath: 'new-jury', title: 'Создать судью', access: ['admin'] },
				{ routePath: 'new-trainer', title: 'Создать тренера', access: ['admin'] },
				{ routePath: 'new-organization', title: 'Создать организацию', access: ['admin'] },
				{ routePath: 'new-seminar', title: 'Создать семинар', access: ['admin', 'secretary'] }
			]
		}
	},
	computed: {
		...mapGetters('authorization', {
			userData: 'getUserData'
		}),
		dbUserRoutes() {
			return [
				{
					routePath: `organizations/${this.db_id}`,
					title: 'Страница организации',
					access: ['regional_organization'],
					check: this.checkRegionalOrganizationAccess
				},
				{
					routePath: `create-organization-report/${this.db_id}-`,
					title: 'Создать отчёт',
					access: ['regional_organization']
				},
				{
					routePath: `jury-page/${this.userData.ffr_id}`,
					title: 'Страница судьи',
					access: ['jury', 'secretary'],
					check: this.checkRegionalOrganizationAccess
				},

				{
					routePath: `trainer-page/${this.userData.ffr_id}`,
					title: 'Страница тренера',
					access: ['trainer'],
					check: this.checkRegionalOrganizationAccess
				}
			]
		}
	},
	methods: {
		checkRouteAccess(route) {
			return route.access.includes(this.userData.role)
		},
		checkRegionalOrganizationAccess() {
			return this.userData.role && this.db_id
		}
	}
}
</script>

<template>
	<div class="adminPages__wrapper">
		<div class="adminRoutes__wrapper">
			<router-link
				v-for="route in adminRoutes"
				v-show="checkRouteAccess(route)"
				:key="route.routePath"
				class="adminPage__link"
				:to="route.routePath"
			>
				{{ route.title }}
			</router-link>
		</div>
		<div class="adminContentRoutes__wrapper">
			<router-link
				v-for="route in adminContentRoutes"
				v-show="checkRouteAccess(route)"
				:key="route.routePath"
				class="adminPage__link"
				:to="route.routePath"
			>
				{{ route.title }}
			</router-link>
		</div>
		<div class="additionalRoutes__wrapper">
			<router-link
				v-for="route in dbUserRoutes"
				v-show="checkRouteAccess(route)"
				:key="route.routePath"
				class="adminPage__link"
				:to="route.routePath"
				:disabled="route.check && !route.check()"
			>
				{{ route.title }}
			</router-link>
		</div>
	</div>
</template>

<style scoped lang="scss">
.adminPages__wrapper {
	flex: 0 0 auto;
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	padding-top: 1.25rem;
	border-top: 1px solid var(--color-border-primary);

	.adminRoutes__wrapper,
	.additionalRoutes__wrapper {
		flex: 0 0 auto;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 0.75rem;
		margin-bottom: 0.75rem;

		& > * {
			flex: 1 0 200px;
			max-width: calc(33.3% - 0.5rem);
		}
	}

	.additionalRoutes__wrapper {
		padding-top: 1.25rem;
		border-top: 1px solid var(--color-border-primary);
	}

	.adminContentRoutes__wrapper {
		flex: 0 0 auto;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		grid-gap: 0.5rem 0.75rem;
	}

	.adminPage__link {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.25rem 0.75rem;

		background-color: var(--color-bg-surface-secondary);
		border: 2px solid var(--color-text-secondary);
		border-radius: 2px;
		font-size: 0.95rem;

		transition:
			background-color var(--transition-duration-fast),
			border-color var(--transition-duration-fast);

		&:hover {
			background-color: var(--color-bg-surface-hover);
			border-color: var(--text-hovered);
		}

		&[disabled] {
			pointer-events: none;
			opacity: 0.5;
		}
	}
}
</style>
