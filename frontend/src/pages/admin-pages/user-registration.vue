<script>
import axios from 'axios'
import { apiUrl } from '@/constants'
import { mapGetters } from 'vuex'
import { translateField } from '@/utils/formFields-translator'
import MessageContainer from '@/components/ui-components/message-container.vue'
import { getSortedRegions } from '@/store/data/russia-regions'

export default {
	name: 'Registration',
	components: { MessageContainer },
	data() {
		return {
			username: '',
			email: '',
			password: '',

			role: '',
			availableRoles: ['athlete', 'jury', 'trainer', 'regional_organization', 'admin'],
			dbRoles: ['athlete', 'jury', 'trainer'],

			region: '',
			ffr_id: '',

			messages: [],
			errors: []
		}
	},
	computed: {
		...mapGetters('authorization', {
			userData: 'getUserData'
		}),
		getAvailableRoles() {
			return this.userData.role === 'admin'
				? this.availableRoles
				: this.availableRoles.filter(role => role !== 'admin')
		}
	},
	methods: {
		getSortedRegions,
		translateField,
		async createUser() {
			try {
				const response = await axios.post(
					apiUrl + '/auth/registerNewUser',
					{
						username: this.username,
						email: this.email,
						password: this.password,
						role: this.role,
						region: this.region,
						ffr_id: this.ffr_id
					},
					{
						headers: {
							'Content-Type': 'application/json',
							authorization: `Bearer ${this.userData.token}`
						}
					}
				)

				if (response.status === 201) {
					this.messages.push(`Пользователь ${this.username} успешно создан`)
					setTimeout(() => {
						if (this.$route.name === 'registration') this.$router.push({ name: 'userPage' })
					}, 2000)
				}
			} catch (error) {
				console.error(error?.response?.data?.message)
				this.errors.push(error?.response?.data?.message)
			}
		}
	}
}
</script>

<template>
	<div class="registration__wrapper">
		<div class="registration__title">Новый пользователь</div>

		<form class="registration__body">
			<div class="input__wrapper">
				<label for="username">Логин:&nbsp;</label>
				<input
					id="username"
					v-model="username"
					class="input-text"
					type="text"
					placeholder="Логин"
				/>
			</div>
			<div class="input__wrapper">
				<label for="email">E-mail:&nbsp;</label>
				<input id="email" v-model="email" class="input-text" type="email" placeholder="E-mail" />
			</div>
			<div class="input__wrapper">
				<label for="password">Пароль:&nbsp;</label>
				<input
					id="password"
					v-model="password"
					class="input-text"
					type="text"
					placeholder="Пароль"
				/>
			</div>
			<div class="input__wrapper">
				<label for="role">Роль:&nbsp;</label>
				<select id="role" v-model="role" class="input-select" type="text">
					<option selected disabled value="">Выберите роль</option>
					<option v-for="role in getAvailableRoles" :key="role" :value="role">
						{{ translateField(role) }}
					</option>
				</select>
			</div>
			<div
				v-show="dbRoles.includes(role) || role === 'regional_organization'"
				class="input__wrapper"
			>
				<label for="regional_organization">Регион:&nbsp;</label>
				<select id="regional_organization" v-model="region" class="input-select" type="text">
					<option selected disabled value="">Выберите регион</option>
					<option v-for="region in getSortedRegions()" :key="region.code" :value="region.fullname">
						{{ region.fullname }}
					</option>
				</select>
			</div>
			<div v-show="dbRoles.includes(role)" class="input__wrapper">
				<label for="ffr_id">FFR-ID:&nbsp;</label>
				<input id="ffr_id" v-model="ffr_id" class="input-text" type="text" placeholder="FFR-ID" />
			</div>
		</form>

		<div class="registration__actions">
			<button class="actionButton" type="button" @click.prevent="createUser">Создать</button>
		</div>

		<message-container :messages="messages" :errors="errors" />
	</div>
</template>

<style scoped lang="scss">
.registration__wrapper {
	flex: 0 0 auto;
	display: flex;
	flex-direction: column;
	max-width: var(--mobile-small);
	width: 100%;
	margin: auto;

	background-color: var(--color-bg-surface);
	box-shadow: var(--surface-shadow-s);
	border: 1px solid var(--color-border-primary);
	border-radius: 4px;

	.registration__title {
		flex: 0 0 auto;
		padding: 0.75rem 2rem;
		font-size: 1.2rem;
		border-bottom: 1px solid var(--color-border-primary);
	}
	.registration__body {
		flex: 0 0 auto;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1.25rem 2.5rem 0;

		.input__wrapper {
			flex: 0 0 auto;
			display: flex;
			align-items: center;
			gap: 0.5rem;

			label {
				flex: 0 0 5rem;
			}
			input {
			}
		}
	}
	.registration__actions {
		flex: 0 0 auto;
		display: flex;
		justify-content: flex-end;
		padding: 1.25rem 2rem 0.5rem;
	}
}
</style>
