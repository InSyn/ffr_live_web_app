<script>
import { mdiArrowLeft, mdiClose } from '@mdi/js'
import CustomCheckbox from '@/components/ui-components/custom-checkbox.vue'
import { mapActions } from 'vuex'

export default {
	name: 'OnlineRegistrationSection',
	components: { CustomCheckbox },
	props: {
		registrationData: Object
	},
	data() {
		return {
			registrationStatus: false,
			registrationGroups: [],

			availableSecretaries: [],
			allowedSecretaries: [],
			availableSecretariesSearch: '',

			allowTrainers: true,
			allowOrganizations: true,

			arrowLeftIcon: mdiArrowLeft,
			removeIcon: mdiClose
		}
	},
	computed: {
		getFilteredAvailableSecretaries() {
			return this.availableSecretaries.filter(secretary => {
				if (!this.availableSecretariesSearch) {
					return !this.allowedSecretaries.includes(secretary._id)
				}
				const searchText = this.availableSecretariesSearch.toLowerCase()
				return (
					!this.allowedSecretaries.includes(secretary._id) &&
					(secretary.jury_code.toLowerCase().includes(searchText) ||
						secretary.name.toLowerCase().includes(searchText) ||
						secretary.lastname.toLowerCase().includes(searchText))
				)
			})
		}
	},
	methods: {
		...mapActions('jury', {
			loadSecretaries: 'LOAD_SECRETARIES'
		}),
		addAthletesGroup() {
			this.registrationGroups.push('')
		},
		removeAthletesGroup(idx) {
			this.registrationGroups.splice(idx, 1)
		},

		async setSecretaryList() {
			try {
				const jury = await this.loadSecretaries()
				if (jury.length) {
					this.availableSecretaries = jury
				}
			} catch (e) {
				console.log(e?.response?.data?.message)
			}
		},
		allowSecretary(id) {
			this.allowedSecretaries.push(id)
		},
		removeAllowedSecretary(idx) {
			this.allowedSecretaries.splice(idx, 1)
		},
		getSecretaryById(id) {
			return this.availableSecretaries.find(secretary => {
				return secretary._id === id
			})
		},

		loadRegistrationData() {
			for (const registrationDataKey in this.registrationData) {
				this[registrationDataKey] = this.registrationData[registrationDataKey]
			}
		},
		saveOnlineRegistrationData() {
			this.$emit('save-online-registration-data', {
				registration_status: this.registrationStatus,
				allow_registration_by_trainer: this.allowTrainers,
				allow_registration_by_organization: this.allowOrganizations,
				allowed_secretaries: this.allowedSecretaries,
				athletes_groups: this.registrationGroups
			})
		},
		closeOnlineRegistration() {
			this.$emit('close-online-registration')
		}
	},

	mounted() {
		this.loadRegistrationData()
		this.setSecretaryList()
	}
}
</script>

<template>
	<div class="eventOnlineRegistrationSection__wrapper">
		<div class="eventOnlineRegistrationSection__header">
			<div class="navigateBack__link" @click="closeOnlineRegistration">
				<v-icon class="navigateBack__icon" color="currentColor" size="18">
					{{ arrowLeftIcon }}
				</v-icon>
				Назад
			</div>
			<span class="eventOnlineRegistrationSection__header__text">Настройки онлайн регистрации</span>
		</div>

		<div class="eventOnlineRegistrationSection__body">
			<div class="registrationStatus__wrapper">
				<custom-checkbox v-model="registrationStatus" label="Статус регистрации" />
				<span class="registrationStatus__status">{{
					registrationStatus ? 'Открыта' : 'Закрыта'
				}}</span>
			</div>

			<div class="registrationGroups__wrapper">
				<div class="registrationGroups__title">Группы</div>
				<div class="registrationGroups__list">
					<div
						v-for="(_, idx) in registrationGroups"
						:key="`group_${idx}`"
						class="registrationGroups__list__item"
					>
						<input v-model="registrationGroups[idx]" type="text" placeholder="Название группы" />
						<button
							class="removeGroup__button"
							type="button"
							@click.prevent="removeAthletesGroup(idx)"
						>
							<v-icon class="removeGroup__button__icon" size="22">
								{{ removeIcon }}
							</v-icon>
						</button>
					</div>
					<button class="addGroup__button" type="button" @click.prevent="addAthletesGroup">
						Добавить группу
					</button>
				</div>
			</div>

			<div class="accessSection__wrapper">
				<div class="accessSection__title">Разрешения</div>
				<label class="allowEntity__checkbox__label"
					>Тренеры <input v-model="allowTrainers" type="checkbox"
				/></label>
				<label class="allowEntity__checkbox__label"
					>Региональные организации <input v-model="allowOrganizations" type="checkbox"
				/></label>
			</div>

			<div class="allowedSecretaries__wrapper">
				<div class="allowedSecretaries__title">
					<b>Доступ секретарей</b>
					<span class="allowedSecretaries__notice"
						>(Доступ к управлению соревнованиями доступен только судьям со статусом
						"секретарь")</span
					>
				</div>
				<div class="availableSecretaries__search__wrapper">
					<input
						v-model="availableSecretariesSearch"
						class="availableSecretaries__search__input"
						type="text"
						placeholder="Поиск..."
					/>
				</div>
				<div class="allowedSecretaries__body">
					<div v-if="availableSecretaries.length" class="allowedSecretaries__list">
						<div
							v-for="(secretary, idx) in allowedSecretaries"
							:key="secretary"
							class="allowedSecretaries__list__item"
						>
							<span class="secretary_code">{{ getSecretaryById(secretary).jury_code }}</span>
							<span class="secretary_name">{{
								`${getSecretaryById(secretary).lastname}&nbsp;${getSecretaryById(secretary).name}`
							}}</span>
							<v-icon class="removeSecretary__icon" size="22" @click="removeAllowedSecretary(idx)">
								{{ removeIcon }}
							</v-icon>
						</div>
					</div>
					<div v-if="availableSecretaries.length" class="availableSecretaries__list">
						<div
							v-for="secretary in getFilteredAvailableSecretaries"
							:key="secretary._id"
							class="availableSecretaries__list__item"
							@click="allowSecretary(secretary._id)"
						>
							<span class="secretary_code">{{ secretary.jury_code }}</span>
							<span class="secretary_name">{{
								`${secretary.lastname}&nbsp;${secretary.name}`
							}}</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="eventOnlineRegistrationSection__actions">
			<button class="actionButton" type="button" @click.prevent="saveOnlineRegistrationData">
				Сохранить
			</button>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.eventOnlineRegistrationSection__wrapper {
	flex: 0 0 auto;
	display: flex;
	flex-direction: column;
	margin: auto;
	max-width: var(--tablet-small);
	width: 100%;

	background-color: var(--color-bg-surface);
	box-shadow: var(--surface-shadow-m);
	border-radius: 4px;
	user-select: none;

	.eventOnlineRegistrationSection__header {
		flex: 0 0 auto;
		display: flex;
		align-items: center;
		gap: 2rem;
		padding: 0.5rem 1.25rem;
		border-bottom: 1px solid var(--color-bg-primary-hovered);

		.navigateBack__link {
			display: flex;
			align-items: center;
			gap: 0.25rem;
			margin-right: auto;
			color: var(--color-text-secondary);
			cursor: pointer;
			transition: color var(--transition-duration-fast);

			&:hover {
				color: var(--color-interactive-brand-default);
			}
			.navigateBack__icon {
				color: inherit;
				transition: fill var(--transition-duration-fast);
			}
		}

		.eventOnlineRegistrationSection__header__text {
			font-weight: bold;
		}
	}

	.eventOnlineRegistrationSection__body {
		flex: 1 1 200px;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 0.5rem;

		.registrationStatus__wrapper {
			display: flex;
			align-items: center;
			gap: 1.25rem;
			padding: 0.5rem 1.25rem 0.5rem;

			.registrationStatus__status {
				margin-left: auto;
				font-weight: bold;
			}
		}

		.registrationGroups__wrapper {
			flex: 0 0 auto;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			border-bottom: 1px solid var(--color-bg-primary-hovered);

			.registrationGroups__title {
				margin-bottom: 0.5rem;
				padding: 0.5rem 1.25rem 0.25rem;
			}
			.registrationGroups__list {
				display: flex;
				flex-direction: column;
				gap: 0.25rem;
				padding: 0.25rem 0.75rem 0.5rem;

				.registrationGroups__list__item {
					position: relative;
					flex: 0 0 auto;

					input {
						padding: 3px 6px;
						background-color: var(--color-bg-surface-secondary);
						border-radius: 2px;
						outline: transparent;
						transition:
							background-color var(--transition-duration-fast),
							outline-color var(--transition-duration-fast);

						&:focus {
							background-color: var(--color-bg-surface-hover);
							outline: 1px solid var(--color-interactive-brand-default);
						}
					}
					.removeGroup__button {
						position: absolute;
						display: flex;
						align-items: center;
						justify-content: center;
						left: calc(100% + 0.25rem);
						top: 5%;
						height: 90%;
						aspect-ratio: 1;
						border-radius: 4px;
						transition: background-color var(--transition-duration-fast);

						.removeGroup__button__icon {
							color: var(--color-text-error);
						}
						&:hover {
							background-color: rgba(222, 98, 112, 0.25);
						}
						&:active {
							scale: 0.9;
						}
					}
				}
			}
			.addGroup__button {
				margin-top: 0.25rem;
				padding: 3px 6px;
				font-size: 0.9rem;
				color: var(--color-text-secondary);

				&:hover {
					color: var(--color-interactive-brand-default);
				}
				&:active {
					scale: 0.9;
				}
			}
		}

		.accessSection__wrapper {
			flex: 0 0 auto;
			display: flex;
			flex-direction: column;
			gap: 0.25rem;
			border-bottom: 1px solid var(--color-bg-primary-hovered);

			.accessSection__title {
				flex: 0 0 auto;
				padding: 0.5rem 1.25rem 0.75rem;
			}
			.allowEntity__checkbox__label {
				flex: 0 0 auto;
				display: flex;
				align-items: center;
				gap: 0.75rem;
				padding: 0.25rem 0.75rem 0.25rem;
				cursor: pointer;

				input[type='checkbox']:checked {
					accent-color: var(--color-interactive-brand-default);
				}
			}
		}

		.allowedSecretaries__wrapper {
			flex: 0 0 auto;
			display: flex;
			flex-direction: column;

			.allowedSecretaries__title {
				display: inline-block;
				flex: 0 0 auto;
				padding: 0.5rem 1.25rem 0.25rem;
				.allowedSecretaries__notice {
					margin-left: 1rem;
					color: var(--color-text-error);
					font-size: 0.8rem;
				}
			}
			.availableSecretaries__search__wrapper {
				flex: 0 0 auto;
				display: flex;
				justify-content: flex-end;
				padding: 0.25rem 0.75rem;

				.availableSecretaries__search__input {
					width: 24ch;
					padding: 3px 6px;
					border-radius: 2px;
					outline: transparent;
					background-color: var(--color-bg-surface-secondary);

					&:focus {
						outline: 1px solid var(--color-interactive-brand-default);
						background-color: var(--color-bg-surface-hover);
					}
				}
			}
			.allowedSecretaries__body {
				flex: 0 0 240px;
				display: flex;
				flex-wrap: nowrap;
				gap: 1.25rem;
				padding: 0.25rem 0.75rem 0.5rem;
				& > * {
					flex: 1 0 200px;
					display: flex;
					flex-direction: column;
					overflow-y: auto;
					background-color: var(--color-bg-surface-secondary);
					border-radius: 4px;

					& > * {
						flex: 0 0 auto;
						display: flex;
						flex-wrap: nowrap;
						gap: 1rem;
						padding: 0.25rem 0.5rem;

						& > span:first-child {
							flex: 0 0 4rem;
						}
						& > span:nth-child(2) {
							flex: 1 1 0;
							text-wrap: nowrap;
						}
					}
					.allowedSecretaries__list__item {
						position: relative;

						.removeSecretary__icon {
							position: absolute;
							right: 0.5rem;
							top: 50%;
							transform: translateY(-50%) scale(1);
							color: var(--color-text-error);
							opacity: 0.75;
							cursor: pointer;
							transition:
								opacity var(--transition-duration-fast),
								transform var(--transition-duration-fast);
							&:hover {
								opacity: 1;
								transform: translateY(-50%) scale(1.1);
							}
							&:active {
								scale: 0.9;
							}
						}
					}
					.availableSecretaries__list__item {
						cursor: pointer;
						transition: background-color var(--transition-duration-fast);
						&:hover {
							background-color: var(--color-bg-surface-hover);
						}
					}
				}
			}
		}
	}

	.eventOnlineRegistrationSection__actions {
		flex: 0 0 auto;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		padding: 0.5rem 1.25rem;
		border-top: 1px solid var(--color-bg-primary-hovered);
	}
}
</style>
