<template>
	<form enctype="multipart/form-data" @submit.prevent="submitForm">
		<div class="formHeader">
			<span v-if="action === 'create'">Новый судья</span>
			<span v-else>Обновление данных судьи</span>
			<div
				v-if="userData['role'] === 'admin' || userData['role'] === 'secretary'"
				class="secretaryToggle__wrapper"
			>
				<custom-checkbox :value="jury.is_secretary" label="Секретарь" @input="setSecretaryRole" />
			</div>
		</div>

		<div class="formBody">
			<div class="imageUpload__wrapper">
				<div v-if="imagePreview['photo_url']" class="imagePreview">
					<img :src="imagePreview['photo_url']" alt="Selected Image" />
				</div>
				<div v-else class="imageFiller">
					<athlete-photo-filler-icon class="athletePhotoFiller__icon" :gender="jury.gender" />
				</div>

				<div class="imageInput__wrapper">
					<div class="imageInput__title">Фото</div>
					<input
						id="photo_url"
						type="file"
						class="formControl-image"
						name="photo_url"
						@change="onFileChange($event, 'photo_url')"
					/>
				</div>
			</div>

			<div
				v-for="(_, key) in jury"
				v-show="key !== 'country_code' && key !== 'region_code' && key !== 'is_secretary'"
				:key="key"
				class="formGroup"
			>
				<label :for="key" class="formLabel">{{ translateField(key) }}</label>

				<select v-if="key === 'gender'" :id="key" v-model="jury[key]" class="formControl">
					<option selected disabled value="">Выберите пол</option>
					<option v-for="option in ['М', 'Ж']" :key="option">
						{{ capitalizeString(option) }}
					</option>
				</select>

				<select v-else-if="key === 'sport'" :id="key" v-model="jury[key]" class="formControl">
					<option selected disabled value="">Выберите вид спорта</option>
					<option v-for="sport in sports" :key="sport.code" class="formControl-option">
						{{ capitalizeString(sport.name_rus) }}
					</option>
				</select>
				<div v-else-if="key === 'disciplines' && jury['sport']" class="select__wrapper">
					<div v-for="(_, dsc_idx) in jury[key]" :key="dsc_idx" class="formControl__wrapper">
						<select
							:id="key"
							data-new-region="false"
							class="formControl"
							:value="jury[key][dsc_idx]"
							@change="setFieldValue(jury, 'disciplines', $event.target.value, dsc_idx)"
						>
							<option v-for="discipline in getDisciplines(jury['sport'])" :key="discipline.code">
								{{ discipline.name_rus }}
							</option>
						</select>
						<span
							class="removeOption__button"
							@click="removeFieldValue(jury, 'disciplines', dsc_idx)"
						/>
					</div>
					<select
						:id="key"
						data-new-region="true"
						class="formControl"
						@change="addFieldValue(jury, 'disciplines', $event)"
					>
						<option selected disabled value="">Выберите дисциплину</option>
						<option v-for="discipline in getDisciplines(jury['sport'])" :key="discipline.code">
							{{ discipline.name_rus }}
						</option>
					</select>
				</div>

				<country-select-control
					v-else-if="key === 'country'"
					:value="jury[key]"
					@input="setFieldValue(jury, 'country', $event)"
				/>
				<region-select-control
					v-else-if="key === 'region'"
					:value="jury[key]"
					:country="jury['country']"
					@input="setFieldValue(jury, 'region', $event)"
				/>

				<select
					v-else-if="key === 'jury_category'"
					:id="key"
					class="formControl"
					:value="jury[key]"
					@change="setFieldValue(jury, 'jury_category', $event.target.value)"
				>
					<option selected disabled value="">Выберите категорию судьи</option>
					<option
						v-for="category in getJuryCategoriesList()"
						:key="category"
						class="formControl-option"
					>
						{{ category }}
					</option>
				</select>

				<div v-else-if="key === 'socials'" class="select__wrapper">
					<div class="formControl__wrapper">
						<span>vk</span>
						<input :id="`${key}_vk`" v-model="jury[key]['vk']" class="formControl" />
					</div>
					<div class="formControl__wrapper">
						<span>telegram</span>
						<input :id="`${key}_tg`" v-model="jury[key]['telegram']" class="formControl" />
					</div>
				</div>

				<input
					v-else
					:id="key"
					v-model="jury[key]"
					:name="key"
					:type="getInputType(key)"
					class="formControl"
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
				@click="deleteJury"
			>
				Удалить
			</v-btn>
		</div>
	</form>
</template>

<script>
import AthletePhotoFillerIcon from '@/assets/svg/athletePhotoFiller-icon.vue'
import { getInputType } from '@/utils/inputType-util'
import { getJuryCategoriesList } from '@/store/data/sport-data-sets'
import { russiaRegions } from '@/store/data/russia-regions'
import { countries, getCountryCode } from '@/store/data/countries'
import { getDisciplines, sports } from '@/store/data/sports'
import { capitalizeString } from '@/utils/capitalizeString'
import { translateField } from '@/utils/formFields-translator'
import { backendRootUrl } from '@/constants'
import { addFieldValue, removeFieldValue, setFieldValue } from '@/utils/formData-helpers'
import CustomCheckbox from '@/components/ui-components/custom-checkbox.vue'
import { mapGetters } from 'vuex'
import CountrySelectControl from '@/components/ui-components/custom-controls/country-select-control.vue'
import RegionSelectControl from '@/components/ui-components/custom-controls/region-select-control.vue'

export default {
	name: 'JuryForm',
	components: {
		RegionSelectControl,
		CountrySelectControl,
		CustomCheckbox,
		AthletePhotoFillerIcon
	},
	props: {
		jury: Object,
		juryImages: Object,
		action: String
	},
	data() {
		return {
			selectedFile: {},
			imagePreview: {}
		}
	},
	computed: {
		...mapGetters('authorization', {
			userData: 'getUserData'
		}),
		countries() {
			return countries
		},
		russiaRegions() {
			return russiaRegions
		},
		sports() {
			return sports
		}
	},

	watch: {
		juryImages: {
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
		capitalizeString,
		getDisciplines,
		getCountryCode,
		getJuryCategoriesList,
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
				this.$set(this.imagePreview, imageType, backendRootUrl + this.juryImages[imageType])
			}
		},

		setSecretaryRole() {
			this.$emit('set-secretary-role')
		},
		async submitForm() {
			switch (this.action) {
				case 'create': {
					this.$emit('create-jury', this.selectedFile)
					return
				}
				case 'update': {
					this.$emit('update-jury', this.selectedFile)
				}
			}
		},

		deleteJury() {
			if (confirm('Вы уверены, что хотите удалить судью?')) {
				this.$emit('delete-jury', this.jury.jury_code)
			}
		}
	}
}
</script>

<style scoped lang="scss">
form {
	position: relative;
	display: flex;
	flex-direction: column;
	width: 100%;
	max-width: var(--tablet-default);

	margin: auto;
	padding: 1rem 1.6rem;

	background-color: var(--color-bg-surface);
	box-shadow: var(--surface-shadow-m);
	border: 1px solid var(--color-border-primary);
	border-radius: 4px;

	.formHeader {
		flex: 0 0 auto;
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 8px;
		padding: 0 0.5rem 1.25rem;
		font-size: 1.4rem;
		font-weight: bold;
		user-select: none;

		.secretaryToggle__wrapper {
			margin-left: auto;
			font-size: 1rem;
			color: var(--color-text-secondary);
		}
	}

	.formBody {
		flex: 0 1 auto;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		grid-auto-rows: min-content;
		gap: 0.75rem 1.25rem;
		overflow-y: auto;

		.imageUpload__wrapper {
			flex: 0 0 auto;
			display: flex;
			gap: 1rem;
			margin-bottom: 1.25rem;

			.imagePreview {
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
				padding: 0.25rem;

				.athletePhotoFiller__icon {
					width: 80px;
					height: auto;
				}
			}

			.imageInput__wrapper {
				display: flex;
				flex-direction: column;

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
			align-items: flex-start;
			padding: 0 0 0.25rem;
			border-bottom: 1px solid var(--color-bg-surface-hover);
			transition: border-bottom var(--transition-duration-fast);

			&:focus-within {
				border-bottom: 1px solid var(--color-text-secondary);
			}

			.formLabel {
				flex: 0 1 auto;
				width: 9rem;
				margin-right: 1rem;
				padding: 3px 6px;
			}

			.select__wrapper {
				flex: 1 1 0;
				display: flex;
				flex-direction: column;
				gap: 8px;

				.formControl__wrapper {
					position: relative;
					display: flex;
					align-items: center;

					span {
						width: 4rem;
						margin-right: 8px;
					}

					.formControl-image {
						font-size: 0.75rem;

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

					.removeOption__button {
						display: block;
						position: absolute;
						right: 4px;
						top: 50%;
						transform: translateY(-50%);
						width: 0.75rem;
						height: 0.75rem;
						opacity: 0.25;
						transition: opacity var(--transition-duration-fast);
						cursor: pointer;
						content: '';

						&:hover {
							opacity: 1;
						}

						&::before {
							content: '';
							position: absolute;
							display: block;
							height: 4px;
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
							height: 4px;
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

			.formControl {
				position: relative;
				flex: 1 1 0;
				min-width: 0;
				max-width: 32ch;
				padding: 3px 6px;
				color: var(--color-text-primary);
				background-color: var(--color-bg-surface-secondary);
				border-radius: 2px;
				outline: transparent;
				transition: background-color var(--transition-duration-fast);

				&:focus {
					background-color: var(--color-bg-surface-hover);
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
