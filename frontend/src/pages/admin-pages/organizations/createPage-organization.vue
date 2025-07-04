<template>
	<div class="createOrganization-page">
		<organization-form
			:organization="organization"
			action="create"
			@create-organization="createOrganization"
		/>

		<message-container :messages="messages" :errors="errors" />
	</div>
</template>

<script>
import MessageContainer from '@/components/ui-components/message-container.vue'
import axios from 'axios'
import { apiUrl } from '@/constants'
import { mapActions, mapGetters } from 'vuex'
import OrganizationForm from '@/pages/admin-pages/organizations/form-organization.vue'

export default {
	name: 'CreateOrganizationPage',
	components: { OrganizationForm, MessageContainer },
	data() {
		return {
			organization: {
				title: '',
				country: '',
				region: '',
				sport: '',
				contacts: [],
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
		...mapActions('organizations', {
			fetchOrganizations: 'LOAD_ORGANIZATIONS'
		}),

		async createOrganization(selectedFile) {
			const formData = new FormData()

			Object.keys(this.organization).forEach(key => {
				if (Array.isArray(this.organization[key]) || typeof this.organization[key] === 'object') {
					formData.append(key, JSON.stringify(this.organization[key]))
				} else {
					formData.append(key, this.organization[key])
				}
			})

			for (const imageKey in selectedFile) {
				formData.append(imageKey, selectedFile[imageKey])
			}

			try {
				const response = await axios.post(`${apiUrl}/organizations/`, formData, {
					headers: {
						'Content-Type': 'multipart/form-data',
						authorization: `Bearer ${this.userData.token}`
					}
				})

				if (response.status === 201) {
					this.messages.push('Организация создана успешно')
					await this.fetchOrganizations()

					setTimeout(() => {
						if (this.$route.name === 'createOrganizationPage') {
							this.$router.push({
								name: 'organizationPage',
								params: { org_id: response.data.organization._id }
							})
						}
					}, 1280)
				}
			} catch (error) {
				console.error('Error submitting form:', error)
				this.errors.push('Не удалось создать организацию. Пожалуйста, попробуйте еще раз.')
			}
		}
	}
}
</script>

<style scoped lang="scss">
.createOrganization-page {
	flex: 1 1 0;
	display: flex;
	flex-direction: column;
	padding: 2rem;
	overflow-y: auto;
}
</style>
