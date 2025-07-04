<template>
	<div class="createAthletePage__wrapper">
		<athlete-form :athlete="athlete" action="create" @create-athlete="createAthlete" />
		<message-container :messages="messages" :errors="errors" />
	</div>
</template>

<script>
import axios from 'axios'
import { apiUrl } from '@/constants'
import { mapActions, mapGetters } from 'vuex'
import MessageContainer from '@/components/ui-components/message-container.vue'
import AthleteForm from '@/pages/admin-pages/athletes/form-athlete.vue'
import { addImagesToFormData, prepareFormData } from '@/utils/formData-helpers'

export default {
	name: 'CreateAthletePage',
	components: { AthleteForm, MessageContainer },
	data() {
		return {
			athlete: {
				ffr_id: '',
				gender: '',
				lastname: '',
				name: '',
				birth_date: '',
				category: '',
				country: '',
				country_code: '',
				regions: [],
				region_code: '',
				sport: '',
				disciplines: [],
				organizations: [],
				trainer: '',
				education: '',
				sponsors: [],
				socials: {
					vk: '',
					telegram: ''
				},
				equipment: [],
				hobbies: [],
				athleteAbout: '',
				medals: [],
				is_national_team: false
			},

			messages: [],
			errors: []
		}
	},
	computed: {
		...mapGetters('authorization', {
			userData: 'getUserData'
		})
	},
	methods: {
		...mapActions('athletes', {
			fetchAthletes: 'LOAD_ATHLETES'
		}),
		async createAthlete(images) {
			const formData = prepareFormData(this.athlete, ['birth_date'])

			addImagesToFormData(formData, images)

			try {
				const response = await axios.post(`${apiUrl}/athletes/`, formData, {
					headers: {
						'Content-Type': 'multipart/form-data',
						authorization: `Bearer ${this.userData.token}`
					}
				})

				if (response.status === 200) {
					this.messages.push('Спортсмен успешно добавлен в базу данных')
					await this.fetchAthletes()

					setTimeout(() => {
						if (this.$route.name === 'createAthletePage') {
							this.$router.push({
								name: 'athletePage',
								params: { athlete_code: response.data.athlete.ffr_id }
							})
						}
					}, 1280)
				}
			} catch (err) {
				if (err) {
					this.errors.push(`Error ${err.response?.data?.message || err.message}`)
				}
			}
		}
	}
}
</script>

<style scoped lang="scss">
.createAthletePage__wrapper {
	flex: 1 1 0;
	display: flex;
	flex-direction: column;
	padding: 2rem;
	overflow-y: auto;
}
</style>
