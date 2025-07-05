<template>
	<form enctype="multipart/form-data" @submit.prevent="submitForm">
		<div class="formHeader">
			<span v-if="action === 'create'">Новый спортсмен</span>
			<span v-else>Обновление данных спортсмена</span>
		</div>

		<div class="formBody">
			<div
				v-for="athletePhoto in ['photo_url', 'photo_tv_url']"
				:key="athletePhoto"
				class="imageUpload__wrapper"
			>
				<div v-if="imagePreview[athletePhoto]" class="imagePreview">
					<img :src="imagePreview[athletePhoto]" alt="Selected Image" />
				</div>
				<div v-else class="imageFiller">
					<athlete-photo-filler-icon class="athletePhotoFiller__icon" :gender="athlete.gender" />
				</div>

				<div class="imageInput__wrapper">
					<div class="imageInput__title">
						{{ translateField(athletePhoto) }}
					</div>
					<input
						:id="athletePhoto"
						type="file"
						class="formControl-image"
						:name="athletePhoto"
						@change="onFileChange($event, athletePhoto)"
					/>
				</div>
			</div>

			<div
				v-for="(_, key) in athlete"
				v-show="key !== 'country_code' && key !== 'region_code'"
				:key="key"
				class="formGroup"
			>
				<label :for="key" class="formLabel">{{ translateField(key) }}</label>

				<select v-if="key === 'gender'" :id="key" v-model="athlete[key]" class="formControl">
					<option selected disabled value="">Выбрать пол...</option>
					<option v-for="option in ['М', 'Ж']" :key="option">
						{{ capitalizeString(option) }}
					</option>
				</select>

				<select v-else-if="key === 'sport'" :id="key" v-model="athlete[key]" class="formControl">
					<option selected disabled value="">Выбрать вид спорта...</option>
					<option v-for="sport in sports" :key="sport.code" class="formControl-option">
						{{ capitalizeString(sport.name_rus) }}
					</option>
				</select>
				<div v-else-if="key === 'disciplines'" class="select__wrapper">
					<div v-for="(_, dsc_idx) in athlete[key]" :key="dsc_idx" class="formControl__wrapper">
						<select
							:id="key"
							data-new-region="false"
							class="formControl"
							:value="athlete[key][dsc_idx]"
							@change="setFieldValue('disciplines', $event.target.value, dsc_idx)"
						>
							<option v-for="discipline in getDisciplines(athlete['sport'])" :key="discipline.code">
								{{ discipline.name_rus }}
							</option>
						</select>
						<span class="removeOption__button" @click="removeFieldValue('disciplines', dsc_idx)" />
					</div>
					<select
						:id="key"
						class="formControl"
						data-new-region="true"
						:disabled="!athlete['sport']"
						@change="addFieldValue('disciplines', $event)"
					>
						<option selected disabled value="">Выбрать дисциплину...</option>
						<option v-for="discipline in getDisciplines(athlete['sport'])" :key="discipline.code">
							{{ discipline.name_rus }}
						</option>
					</select>
				</div>

				<select
					v-else-if="key === 'category'"
					:id="key"
					class="formControl"
					:value="athlete[key]"
					@change="setFieldValue('category', $event.target.value)"
				>
					<option selected disabled value="">Выбрать категорию...</option>
					<option v-for="rank in getAthletesRanksList()" :key="rank" class="formControl-option">
						{{ rank }}
					</option>
				</select>

				<country-select-control
					v-else-if="key === 'country'"
					:value="athlete[key]"
					@input="setFieldValue('country', $event)"
				/>
				<div v-else-if="key === 'regions'" class="select__wrapper">
					<input
						v-if="getCountryCode(athlete['country']) !== 'RU'"
						:id="key"
						v-model="athlete[key]"
						class="formControl"
						:name="key"
						:type="getInputType(key)"
						:disabled="!athlete['country']"
						:placeholder="!athlete['country'] && 'Указать страну...'"
					/>

					<div
						v-for="(_, r_idx) in athlete[key]"
						v-else-if="getCountryCode(athlete['country']) === 'RU'"
						:key="r_idx"
						class="formControl__wrapper"
					>
						<select
							:id="key"
							data-new-region="false"
							class="formControl"
							:value="athlete[key][r_idx]"
							@change="setFieldValue('regions', $event.target.value, r_idx)"
						>
							<option selected disabled value="">Выбрать регион...</option>
							<option v-for="region in getSortedRegions()" :key="region.code">
								{{ region.fullname }}
							</option>
						</select>
						<span class="removeOption__button" @click="removeFieldValue('regions', r_idx)" />
					</div>
					<select
						v-show="getCountryCode(athlete['country']) === 'RU'"
						:id="key"
						data-new-region="true"
						class="formControl"
						@change="addFieldValue('regions', $event)"
					>
						<option selected disabled value="">Выбрать регион...</option>
						<option v-for="region in getSortedRegions()" :key="region.code">
							{{ region.fullname }}
						</option>
					</select>
				</div>

				<div
					v-else-if="key === 'organizations' || key === 'hobbies' || key === 'equipment'"
					class="select__wrapper"
				>
					<div v-for="(_, org_idx) in athlete[key]" :key="org_idx" class="formControl__wrapper">
						<input
							:id="key"
							class="formControl"
							:value="athlete[key][org_idx]"
							@change="setFieldValue(key, $event.target.value.trim(), org_idx)"
						/>
						<span class="removeOption__button" @click="removeFieldValue(key, org_idx)" />
					</div>
					<input
						:id="key"
						class="formControl"
						:placeholder="
							(key === 'organizations' && 'Добавьте организацию') ||
							(key === 'hobbies' && 'Добавьте хобби') ||
							(key === 'equipment' && 'Добавьте оборудование')
						"
						@change="addFieldValue(key, $event)"
					/>
				</div>

				<select
					v-else-if="key === 'trainer'"
					class="formControl"
					@input="setFieldValue('trainer', $event.target.value)"
				>
					<option selected disabled value="">Выбрать тренера...</option>
					<option
						v-for="trainer in getTrainersList"
						:key="trainer._id"
						class="formControl-option"
						:value="
							JSON.stringify({
								trainer_id: trainer.trainer_id,
								fullname: trainer.fullname
							})
						"
					>
						{{ `${trainer.trainer_id}: ${trainer.fullname}` }}
					</option>
				</select>

				<div v-else-if="key === 'socials'" class="select__wrapper">
					<div class="formControl__wrapper">
						<span>vk</span>
						<input :id="`${key}_vk`" v-model="athlete[key]['vk']" class="formControl" />
					</div>
					<div class="formControl__wrapper">
						<span>telegram</span>
						<input :id="`${key}_tg`" v-model="athlete[key]['telegram']" class="formControl" />
					</div>
				</div>

				<div v-else-if="key === 'sponsors'" class="select__wrapper">
					<div
						v-for="(sponsor, idx) in athlete.sponsors"
						:key="sponsor.sponsor_link + idx"
						class="sponsorInput__wrapper"
					>
						<div class="formControl__wrapper">
							<span>Логотип</span>
							<div v-if="imagePreview[`sponsor${idx}_logo`]" class="imagePreview">
								<img :src="imagePreview[`sponsor${idx}_logo`]" alt="Sponsor Logo" />
							</div>
							<input
								:id="`sponsor_${idx}`"
								class="formControl-image"
								type="file"
								accept="image/*"
								@change="setSponsorUrl($event, idx)"
							/>
							<span class="removeOption__button" @click="removeFieldValue('sponsors', idx)" />
						</div>
						<div class="formControl__wrapper">
							<span>Ссылка</span>
							<input :id="key" v-model="athlete.sponsors[idx].sponsor_link" class="formControl" />
						</div>
					</div>
					<v-btn
						v-if="athlete.sponsors.length < 5"
						class="addSponsor__button"
						color="var(--color-text-accent)"
						small
						text
						@click="addSponsor()"
					>
						Добавить
					</v-btn>
				</div>

				<medals-select
					v-else-if="key === 'medals'"
					:athlete-medal-events="athlete.medals"
					@add-medals-event="addMedalsEvent"
					@update-medals-event="updateMedalsEvent"
					@remove-medals-event="removeMedalsEvent"
				/>

				<input
					v-else
					:id="key"
					v-model.trim="athlete[key]"
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
				@click="deleteAthlete"
			>
				Удалить
			</v-btn>
		</div>
	</form>
</template>

<script>
import AthletePhotoFillerIcon from '@/assets/svg/athletePhotoFiller-icon.vue'
import { getInputType } from '@/utils/inputType-util'
import { countries, getCountryCode } from '@/store/data/countries'
import { getSortedRegions } from '@/store/data/russia-regions'
import { getDisciplines, sports } from '@/store/data/sports'
import { capitalizeString } from '@/utils/capitalizeString'
import { translateField } from '@/utils/formFields-translator'
import { apiUrl, backendRootUrl } from '@/constants'
import MedalsSelect from '@/components/ui-components/medals-select.vue'
import { getAthletesRanksList } from '@/store/data/sport-data-sets'
import axios from 'axios'
import CountrySelectControl from '@/components/ui-components/custom-controls/country-select-control.vue'

export default {
	name: 'AthleteForm',
	components: { CountrySelectControl, MedalsSelect, AthletePhotoFillerIcon },
	props: {
		athlete: Object,
		athleteImages: Object,
		action: String
	},
	data() {
		return {
			trainersList: [],
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
		},
		getTrainersList: {
			get() {
				if (!this.trainersList.length) {
					this.loadTrainersList()
				}
				return this.trainersList
			}
		}
	},

	watch: {
		athleteImages: {
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
		getCountryCode,
		getAthletesRanksList,
		translateField,
		capitalizeString,
		getDisciplines,
		getSortedRegions,
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
				this.$set(this.imagePreview, imageType, backendRootUrl + this.athleteImages[imageType])
			}
		},

		setFieldValue(field, value, idx) {
			switch (field) {
				case 'country': {
					this.athlete.country = value.trim()

					return
				}

				case 'region': {
					this.athlete.region[idx] = value.trim()

					return
				}

				default: {
					if (idx !== undefined) {
						this.athlete[field][idx] = value.trim()
						return
					}
					this.athlete[field] = value.trim()
				}
			}
		},
		addFieldValue(field, event) {
			if (!event.target.value) return

			const fieldValue = event.target.value.toString().trim()
			this.athlete[field].push(fieldValue)

			event.target.value = ''
		},
		removeFieldValue(field, idx) {
			if (field === 'sponsors') {
				this.athlete.sponsors.splice(idx, 1)
				this.$delete(this.imagePreview, `sponsor${idx}_logo`)
				this.$delete(this.selectedFile, `sponsor${idx}_logo`)

				for (let i = idx; i < this.athlete.sponsors.length; i++) {
					this.$set(
						this.imagePreview,
						`sponsor${i}_logo`,
						this.imagePreview[`sponsor${i + 1}_logo`] || null
					)
					this.$delete(this.imagePreview, `sponsor${i + 1}_logo`)
					this.$set(
						this.selectedFile,
						`sponsor${i}_logo`,
						this.selectedFile[`sponsor${i + 1}_logo`] || null
					)
					this.$delete(this.selectedFile, `sponsor${i + 1}_logo`)
				}
			} else {
				this.athlete[field].splice(idx, 1)
			}
		},
		addSponsor() {
			const newIdx = this.athlete.sponsors.length
			this.athlete.sponsors.push({
				logo_url: '',
				sponsor_link: ''
			})
			this.$set(this.imagePreview, `sponsor${newIdx}_logo`, null)
			this.$set(this.selectedFile, `sponsor${newIdx}_logo`, null)
		},
		setSponsorUrl(e, idx) {
			if (!e.target.files[0]) {
				this.$set(this.imagePreview, `sponsor${idx}_logo`, null)
				this.$set(this.athlete.sponsors[idx], 'logo_url', null)
				return
			}

			const file = e.target.files[0]
			const reader = new FileReader()

			reader.onload = e => {
				this.$set(this.imagePreview, `sponsor${idx}_logo`, e.target.result)
			}

			reader.readAsDataURL(file)
			this.$set(this.selectedFile, `sponsor${idx}_logo`, file)
		},
		addMedalsEvent() {
			this.athlete.medals.push({ name: '', gold: 0, silver: 0, bronze: 0 })
		},
		updateMedalsEvent(eIdx, eventData) {
			this.athlete.medals[eIdx] = { ...eventData }
		},
		removeMedalsEvent(eIdx) {
			this.athlete.medals.splice(eIdx, 1)
		},
		async loadTrainersList() {
			try {
				const response = await axios.get(`${apiUrl}/trainers`)
				if (response.status === 200) {
					this.trainersList = response.data.trainers
				}
			} catch (error) {
				console.error(error?.response?.data?.message)
			}
		},

		submitForm() {
			switch (this.action) {
				case 'create': {
					this.$emit('create-athlete', this.selectedFile)
					return
				}
				case 'update': {
					this.$emit('update-athlete', this.selectedFile)
				}
			}
		},

		deleteAthlete() {
			if (confirm('Вы уверены, что хотите удалить спортсмена?')) {
				this.$emit('delete-athlete', this.athlete.ffr_id)
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
	flex-wrap: wrap;

	max-width: var(--desktop-small);
	margin: auto;
	padding: 1rem 1.6rem;

	background-color: var(--color-bg-surface);
	box-shadow: var(--surface-shadow-m);
	border: 1px solid var(--color-border-primary);
	border-radius: 4px;

	.formHeader {
		flex: 0 0 auto;
		padding: 0 0.5rem 1.25rem;
		font-size: 1.4rem;
		font-weight: bold;
	}

	.formBody {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px 1rem;
		max-height: 50vh;
		overflow-y: auto;
		padding: 0 16px;

		.imageUpload__wrapper {
			display: flex;
			gap: 1rem;
			margin-bottom: 0.5rem;

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
				padding: 0.25rem;

				.athletePhotoFiller__icon {
					width: 80px;
				}
			}

			.imageInput__wrapper {
				flex: 1 1 0;
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
			display: flex;
			align-items: flex-start;
			padding-bottom: 2px;
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

				.sponsorInput__wrapper {
					display: flex;
					flex-direction: column;
					gap: 4px;
				}

				.formControl__wrapper {
					position: relative;
					display: flex;
					align-items: center;

					span {
						width: 4rem;
						margin-right: 8px;
					}

					.imagePreview {
						flex: 0 1 auto;
						display: flex;
						justify-content: center;
						align-items: center;
						height: 32px;
						max-width: 60px;
						margin-right: 8px;

						img {
							display: block;
							max-height: 100%;
							max-width: 100%;
						}
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

				.addSponsor__button {
					align-self: center;
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

				&[data-new-region='true'] {
					position: relative;
					border: 1px solid var(--color-text-secondary);
				}

				&[name='is_national_team'] {
					flex: 0 1 auto;
				}

				select {
					color: red;
				}
			}
		}

		@media screen and (max-width: 1024px) {
			grid-template-columns: auto;
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
