<template>
	<div class="createJuryPage__wrapper">
		<jury-form :jury="jury" action="create" @create-jury="createJury" />
		<message-container :messages="messages" :errors="errors" />
	</div>
</template>

<script>
import MessageContainer from '@/components/ui-components/message-container.vue'
import { translateField } from '@/utils/formFields-translator'
import axios from 'axios'
import { apiUrl } from '@/constants'
import { capitalizeString } from '@/utils/capitalizeString'
import { getDisciplines } from '@/store/data/sports'
import { getInputType } from '@/utils/inputType-util'
import { mapActions, mapGetters } from 'vuex'
import { getJuryCategoriesList } from '@/store/data/sport-data-sets'
import JuryForm from '@/pages/admin-pages/jury/form-jury.vue'

export default {
	name: 'CreateJuryPage',
	components: {
		JuryForm,
		MessageContainer
	},
	data() {
		return {
			jury: {
				jury_code: '',
				lastname: '',
				name: '',
				sport: '',
				disciplines: [],
				jury_category: '',
				gender: '',
				birth_date: '',
				country: '',
				region: '',
				socials: {
					vk: '',
					telegram: ''
				}
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
		...mapActions('jury', {
			fetchJury: 'LOAD_JURY'
		}),
		getJuryCategoriesList,
		getDisciplines,
		getInputType,
		capitalizeString,
		translateField,

		async createJury(selectedFile) {
			const formData = new FormData()

			Object.keys(this.jury).forEach(key => {
				if (Array.isArray(this.jury[key]) || typeof this.jury[key] === 'object') {
					formData.append(key, JSON.stringify(this.jury[key]))
				} else {
					formData.append(key, this.jury[key])
				}
			})

			for (const imageKey in selectedFile) {
				formData.append(imageKey, selectedFile[imageKey])
			}

			try {
				const response = await axios.post(apiUrl + '/jury/', formData, {
					headers: {
						'Content-Type': 'multipart/form-data',
						authorization: `Bearer ${this.userData.token}`
					}
				})

				if (response.status === 200) {
					this.messages.push('Судья успешно добавлен в базу данных')
					await this.fetchJury()

					setTimeout(() => {
						if (this.$route.name === 'createJuryPage') {
							this.$router.push({
								name: 'juryPage',
								params: { jury_code: response.data.jury.jury_code }
							})
						}
					}, 1280)
				}
			} catch (err) {
				if (err) {
					console.log(err)
					this.errors.push('Судья не был добавлен: ' + err.response?.data?.message)
				}
			}
		}
	}
}
</script>

<style scoped lang="scss">
.createJuryPage__wrapper {
	flex: 1 1 0;
	display: flex;
	flex-direction: column;
	padding: 2rem;
}
</style>
