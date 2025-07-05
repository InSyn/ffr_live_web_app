<template>
	<form enctype="multipart/form-data" @submit.prevent="submitForm">
		<div class="formHeader">
			<span v-if="action === 'create'">Новая организация</span>
			<span v-else>Обновление данных организации</span>
		</div>

		<div class="formBody">
			<div class="imageUpload__wrapper">
				<div v-if="imagePreview['logo_url']" class="imagePreview">
					<img :src="imagePreview['logo_url']" alt="Selected Image" />
				</div>
				<div v-else class="imageFiller">
					<competition-image-filler-icon class="imageFiller__icon" />
				</div>

				<div class="imageInput__wrapper">
					<div class="imageInput__title">
						{{ translateField('logo_url') }}
					</div>
					<input
						id="photo_url"
						type="file"
						class="formControl-image"
						name="photo_url"
						@change="onFileChange($event, 'logo_url')"
					/>
				</div>
			</div>
			<div v-for="(_, field_key) in organization" :key="field_key" class="formGroup">
				<label :for="field_key" class="formLabel">
					{{ translateField(field_key) }}
				</label>

				<country-select-control
					v-if="field_key === 'country'"
					:value="organization[field_key]"
					@input="setFieldValue(organization, 'country', $event)"
				/>
				<region-select-control
					v-else-if="field_key === 'region'"
					:value="organization[field_key]"
					:country="organization['country']"
					@input="setFieldValue(organization, 'region', $event)"
				/>

				<select
					v-else-if="field_key === 'sport'"
					:id="field_key"
					class="formControl"
					:value="organization[field_key]"
					@change="setFieldValue(organization, 'sport', $event.target.value)"
				>
					<option selected disabled value="">Выберите вид спорта</option>
					<option v-for="sport in sports" :key="sport.code" class="formControl-option">
						{{ capitalizeString(sport.name_rus) }}
					</option>
				</select>
				<div v-else-if="field_key === 'disciplines'" class="select__wrapper">
					<div
						v-for="(_, dsc_idx) in organization[field_key]"
						:key="dsc_idx"
						class="formControl__wrapper"
					>
						<select
							:id="field_key"
							data-new-region="false"
							class="formControl"
							:value="organization[field_key][dsc_idx]"
							@change="setFieldValue(organization, 'disciplines', $event.target.value, dsc_idx)"
						>
							<option
								v-for="discipline in getDisciplines(organization['sport'])"
								:key="discipline.code"
							>
								{{ discipline.name_rus }}
							</option>
						</select>
						<span
							class="removeOption__button"
							@click="removeFieldValue(organization, 'disciplines', dsc_idx)"
						/>
					</div>
					<select
						:id="field_key"
						data-new-region="true"
						class="formControl"
						@change="addFieldValue(organization, 'disciplines', $event)"
					>
						<option selected disabled value="">Выберите дисциплину</option>
						<option
							v-for="discipline in getDisciplines(organization['sport'])"
							:key="discipline.code"
						>
							{{ discipline.name_rus }}
						</option>
					</select>
				</div>

				<div v-else-if="field_key === 'contacts'" class="select__wrapper">
					<div v-for="(_, idx) in organization[field_key]" :key="idx" class="formControl__wrapper">
						<input
							:id="field_key"
							class="formControl"
							:value="organization[field_key][idx]"
							@change="setFieldValue(organization, field_key, $event.target.value, idx)"
						/>
						<span
							class="removeOption__button"
							@click="removeFieldValue(organization, field_key, idx)"
						/>
					</div>
					<input
						:id="field_key"
						class="formControl"
						placeholder="Добавить контакт"
						@change="addFieldValue(organization, field_key, $event)"
					/>
				</div>
				<div v-else-if="field_key === 'socials'" class="select__wrapper">
					<div class="formControl__wrapper">
						<span>vk</span>
						<input
							:id="`${field_key}_vk`"
							v-model="organization[field_key]['vk']"
							class="formControl"
						/>
					</div>
					<div class="formControl__wrapper">
						<span>telegram</span>
						<input
							:id="`${field_key}_tg`"
							v-model="organization[field_key]['telegram']"
							class="formControl"
						/>
					</div>
				</div>

				<input
					v-else
					:id="field_key"
					v-model="organization[field_key]"
					class="formControl"
					:type="getInputType(field_key)"
					:name="field_key"
				/>
			</div>
		</div>

		<div class="formActions">
			<v-btn class="actionButton" type="submit" color="var(--color-text-secondary)" small>
				{{ action === 'create' ? 'Создать' : 'Обновить' }}
			</v-btn>
			<v-btn
				v-show="action === 'update'"
				class="actionButton"
				type="button"
				color="var(--color-text-error)"
				text
				small
				@click="deleteOrganization"
			>
				Удалить
			</v-btn>
		</div>
	</form>
</template>

<script>
import { getInputType } from '@/utils/inputType-util'
import { getDisciplines, sports } from '@/store/data/sports'
import { capitalizeString } from '@/utils/capitalizeString'
import { getSortedRegions } from '@/store/data/russia-regions'
import { countries, getCountryCode } from '@/store/data/countries'
import { translateField } from '@/utils/formFields-translator'
import { addFieldValue, removeFieldValue, setFieldValue } from '@/utils/formData-helpers'
import { backendRootUrl } from '@/constants'
import CompetitionImageFillerIcon from '@/assets/svg/competitionImageFiller-icon.vue'
import CountrySelectControl from '@/components/ui-components/custom-controls/country-select-control.vue'
import RegionSelectControl from '@/components/ui-components/custom-controls/region-select-control.vue'

export default {
	name: 'OrganizationForm',
	components: { RegionSelectControl, CountrySelectControl, CompetitionImageFillerIcon },
	props: {
		organization: Object,
		organizationImages: Object,
		action: String
	},
	data() {
		return {
			selectedFile: {},
			imagePreview: {}
		}
	},
	computed: {
		sports() {
			return sports
		},
		countries() {
			return countries
		}
	},

	watch: {
		organizationImages: {
			immediate: true,
			handler(newImages) {
				if (!newImages) return

				for (const imgKey in newImages) {
					if (newImages[imgKey]) this.previewImage(imgKey, 'url')
				}
			}
		}
	},
	methods: {
		addFieldValue,
		removeFieldValue,
		setFieldValue,
		translateField,
		getCountryCode,
		getSortedRegions,
		capitalizeString,
		getDisciplines,
		getInputType,

		onFileChange(e, imageType) {
			if (!e.target.files[0]) {
				this.$set(this.imagePreview, imageType, null)
				return
			}

			this.$set(this.selectedFile, imageType, e.target.files[0])
			this.previewImage(imageType, 'file')
		},
		previewImage(imageType, sourceType) {
			if (sourceType === 'file' && this.selectedFile[imageType]) {
				const reader = new FileReader()
				reader.onload = e => {
					this.$set(this.imagePreview, imageType, e.target.result)
				}
				reader.readAsDataURL(this.selectedFile[imageType])
			} else if (sourceType === 'url') {
				this.$set(this.imagePreview, imageType, backendRootUrl + this.organizationImages[imageType])
			}
		},

		async submitForm() {
			switch (this.action) {
				case 'create': {
					this.$emit('create-organization', this.selectedFile)
					return
				}
				case 'update': {
					this.$emit('update-organization', this.selectedFile)
				}
			}
		},

		deleteOrganization() {
			if (confirm('Вы уверены, что хотите удалить организацию?')) {
				this.$emit('delete-organization', this.organization.org_id)
			}
		}
	}
}
</script>

<style scoped lang="scss">
form {
	flex: 0 1 auto;
	position: relative;
	display: flex;
	flex-direction: column;

	margin: auto;
	padding: 1rem 1.6rem;

	background-color: var(--color-bg-surface);
	box-shadow: var(--surface-shadow-m);
	border: 1px solid var(--color-border-primary);
	border-radius: 4px;

	.formHeader {
		flex: 0 0 auto;
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		padding: 0 0.5rem 1.25rem;
		font-size: 1.4rem;
		font-weight: bold;
	}

	.formBody {
		flex: 0 1 auto;
		display: flex;
		flex-direction: column;
		gap: 0.75rem 1.25rem;
		overflow-y: auto;

		@media screen and (max-width: 900px) {
			max-height: none;
		}

		.imageUpload__wrapper {
			display: flex;

			.imagePreview {
				flex: 0 0 auto;

				img {
					display: block;
					max-width: 80px;
					height: auto;
					border-radius: 4px;
				}
			}

			.imageFiller {
				flex: 0 0 auto;
				display: flex;
				justify-content: center;
				align-items: center;
				height: 80px;
				aspect-ratio: 1;

				padding: 0.5rem;

				.imageFiller__icon {
					height: 100%;
					width: 100%;
				}
			}

			.imageInput__wrapper {
				flex: 1 1 0;
				display: flex;
				flex-direction: column;
				margin-left: 8px;

				.imageInput__title {
					flex: 0 0 auto;
				}

				.formControl-image {
					flex: 0 0 auto;
					margin-top: auto;

					&::file-selector-button {
						padding: 3px 6px;
						margin-right: 0.8rem;

						color: var(--color-text-primary);
						background-color: var(--color-bg-surface-secondary);
						border-radius: 4px;
						border-width: 1px;

						cursor: pointer;
					}

					&::file-selector-button:hover {
						background-color: var(--color-bg-surface-hover);
					}
				}
			}
		}

		.formGroup {
			flex: 0 0 auto;
			display: flex;
			padding: 0 0 0.25rem;
			border-bottom: 1px solid var(--color-bg-surface-hover);
			transition: border-bottom var(--transition-duration-fast);

			&:focus-within {
				border-bottom: 1px solid var(--color-text-secondary);
			}

			.formLabel {
				width: 150px;
				margin-right: 1rem;
			}

			.formControl {
				flex-grow: 1;
				max-width: 32ch;
				padding: 3px 6px;
				color: var(--color-text-primary);
				background-color: var(--color-bg-surface-secondary);
				border-radius: 2px;
				outline: transparent;
				transition:
					background-color var(--transition-duration-fast),
					outline-color var(--transition-duration-fast);

				&[type='checkbox'] {
					flex: 0 0 auto;
				}

				&:focus {
					background-color: var(--color-bg-surface-hover);
				}
			}

			.select__wrapper {
				flex: 1 1 0;
				display: flex;
				flex-direction: column;
				gap: 4px;

				.formControl__wrapper {
					position: relative;
					display: flex;
					align-items: center;

					span {
						width: 4rem;
						margin-right: 8px;
					}

					.removeOption__button {
						display: block;
						position: absolute;
						right: 0;
						width: 1.25rem;
						height: 1.25rem;
						margin: 0;

						border-radius: 50%;
						background-color: var(--color-bg-surface-secondary);
						opacity: 0.45;
						transition: opacity var(--transition-duration-instant);
						cursor: pointer;
						content: '';

						&:hover {
							opacity: 1;
						}

						&::before {
							content: '';
							position: absolute;
							display: block;
							height: 3px;
							width: 12px;
							background-color: var(--color-text-error);
							transform-origin: center;
							left: 50%;
							top: 50%;
							transform: translate(-50%, -50%) rotate(45deg);
						}

						&::after {
							content: '';
							position: absolute;
							display: block;
							height: 3px;
							width: 12px;
							background-color: var(--color-text-error);
							transform-origin: center;
							left: 50%;
							top: 50%;
							transform: translate(-50%, -50%) rotate(-45deg);
						}
					}
				}
			}
		}
	}

	.formActions {
		display: flex;
		justify-content: flex-end;
		gap: 1.25rem;
		margin-top: 1.75rem;

		.actionButton {
			color: #2c3e50;
			font-weight: bold;
			letter-spacing: 1px;
			font-size: 0.75rem;
		}
	}
}
</style>
