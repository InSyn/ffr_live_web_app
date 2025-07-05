<script>
import axios from 'axios'
import { apiUrl } from '@/constants'
import { mapGetters } from 'vuex'
import {
	addDocumentsToFormData,
	addImagesToFormData,
	prepareFormData
} from '@/utils/formData-helpers'
import FormCupEvent from '@/pages/admin-pages/events/form-cupEvent.vue'
import MessageContainer from '@/components/ui-components/message-container.vue'

export default {
	name: 'CreatePageCupEvent',
	components: { MessageContainer, FormCupEvent },
	data() {
		return {
			event: {
				title: '',
				start_at: '',
				sport: '',
				discipline: '',
				country: '',
				organization: '',
				calendar_code: '',
				documents: [],
				is_public: true
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
		async createCupEvent(images) {
			const formData = prepareFormData(this.event, ['start_at'])

			addDocumentsToFormData(formData, this.event.documents)
			addImagesToFormData(formData, images)

			try {
				const response = await axios.post(apiUrl + '/events/', formData, {
					headers: {
						'Content-Type': 'multipart/form-data',
						authorization: `Bearer ${this.userData.token}`
					}
				})

				if (response.status === 200) {
					this.messages.push('Соревнование создано успешно')

					setTimeout(() => {
						if (this.$route.name === 'createEventPage') {
							this.$router.push({
								name: 'eventPage',
								params: { event_id: response.data.event.event_id }
							})
						}
					}, 1280)
				}
			} catch (error) {
				console.error('Error submitting form:', error)
				this.errors.push(error?.response?.data?.message)
			}
		}
	}
}
</script>

<template>
	<div class="createCupEventPage__wrapper">
		<form-cup-event :event="event" action="create" @create-event="createCupEvent" />
		<message-container :messages="messages" :errors="errors" />
	</div>
</template>

<style scoped lang="scss">
.createCupEventPage__wrapper {
	flex: 1 1 0;
	display: flex;
	flex-direction: column;
	padding: 2rem;
	overflow-y: auto;
}
</style>
