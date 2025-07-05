<template>
	<div class="updateOrganizationPage__wrapper">
		<organization-form
			:organization="organization"
			:organization-images="organizationImages"
			action="update"
			@update-organization="updateOrganization"
			@delete-organization="deleteOrganization"
		/>

		<message-container :messages="messages" :errors="errors" />
	</div>
</template>

<script>
import MessageContainer from '@/components/ui-components/message-container.vue'
import { mapActions, mapGetters } from 'vuex'
import axios from 'axios'
import { apiUrl } from '@/constants'
import OrganizationForm from '@/pages/admin-pages/organizations/form-organization.vue'

export default {
	name: 'EditOrganizationPage',
	components: { OrganizationForm, MessageContainer },
	props: {
		org_id: String
	},
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
			organizationImages: {
				logo_url: ''
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

		async loadOrganizationData() {
			try {
				const response = await axios.get(`${apiUrl}/organizations/${this.org_id}`)
				if (response.status === 200) {
					const organizationData = response.data.organization
					Object.keys(this.organization).forEach(key => {
						if (key in organizationData) {
							this.organization[key] = organizationData[key]
						}
					})

					this.organizationImages = {
						logo_url: organizationData.logo_url
					}
				}
			} catch (err) {
				if (err) {
					this.errors.push(err.response?.data?.message || err.message)
				}
			}
		},
		async updateOrganization(selectedFile) {
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
				const response = await axios.patch(`${apiUrl}/organizations/${this.org_id}`, formData, {
					headers: {
						'Content-Type': 'multipart/form-data',
						authorization: `Bearer ${this.userData.token}`
					}
				})

				if (response.status === 200) {
					this.messages.push('Информация о судье успешно обновлена')
					await this.fetchOrganizations()

					setTimeout(() => {
						if (this.$route.name === 'editOrganizationPage') {
							this.$router.push({
								name: 'organizationPage',
								params: { org_id: response.data.organization._id }
							})
						}
					}, 1280)
				}
			} catch (err) {
				if (err) {
					this.errors.push(
						`Информация об организации не была обновлена: ${
							err.response?.data?.data || err.message
						}`
					)
				}
			}
		},
		async deleteOrganization() {
			try {
				const response = await axios.delete(`${apiUrl}/organizations/${this.org_id}`, {
					headers: {
						authorization: `Bearer ${this.userData.token}`
					}
				})
				if (response.data.status === 'success') {
					this.messages.push('Организация была успешно удалёна')
					await this.fetchOrganizations()

					setTimeout(() => {
						if (this.$route.name === 'editOrganizationPage') {
							this.$router.push({ name: 'organizationsPage' })
						}
					}, 1280)
				}
			} catch (e) {
				console.error('Не удалось удалить организацию:', e)
				this.errors.push('Не удалось удалить организацию')
			}
		}
	},

	mounted() {
		if (this.org_id) this.loadOrganizationData()
	}
}
</script>

<style scoped lang="scss">
.updateOrganizationPage__wrapper {
	flex: 1 1 0;
	display: flex;
	flex-direction: column;
	padding: 2rem;
	overflow-y: auto;
}
</style>
