<template>
	<router-link v-if="isSecretary" :to="getTargetLink(type, code)">
		<button class="editButton__wrapper" :class="buttonStyleClasses">
			<edit-icon class="editButton__icon" />
		</button>
	</router-link>
</template>

<script>
import EditIcon from '@/components/icons/edit-icon.vue'
import { mapGetters } from 'vuex'

export default {
	name: 'EditButton',
	components: { EditIcon },
	props: {
		code: String,
		type: String
	},
	computed: {
		...mapGetters('authorization', {
			isAdmin: 'isAdmin',
			isSecretary: 'isSecretary'
		}),
		buttonStyleClasses() {
			if (this.type === 'seminar' || this.type === 'event') {
				return 'ml-4'
			}
			return ''
		}
	},
	methods: {
		getTargetLink(type, code) {
			switch (type) {
				case 'event': {
					return {
						name: 'editEventPage',
						params: {
							event_id: code
						}
					}
				}
				case 'athlete': {
					return {
						name: 'editAthletePage',
						params: {
							athlete_code: code
						}
					}
				}
				case 'jury': {
					return {
						name: 'editJuryPage',
						params: {
							jury_code: code
						}
					}
				}
				case 'trainer': {
					return {
						name: 'editTrainerPage',
						params: {
							trainer_id: code
						}
					}
				}
				case 'organization': {
					return {
						name: 'editOrganizationPage',
						params: {
							org_id: code
						}
					}
				}
				case 'seminar': {
					return {
						name: 'editSeminarPage',
						params: {
							seminar_id: code
						}
					}
				}
			}
		}
	}
}
</script>

<style scoped lang="scss">
.editButton__wrapper {
	display: flex;
	justify-content: center;
	align-items: center;
	width: var(--space-8);
	height: var(--space-8);

	background-color: var(--color-bg-surface-hover);
	border-radius: var(--radius-full);
	opacity: 0.25;
	transition: opacity var(--transition-duration-fast);

	.editButton__icon {
		height: 75%;
		color: var(--color-text-primary);
	}

	&:hover {
		opacity: 1;
	}
}
</style>
