<template>
  <form enctype="multipart/form-data" @submit.prevent="submitForm">
    <div class="formHeader">
      <span v-if="action === 'create'">Новый тренер</span>
      <span v-else>Обновление данных тренера</span>
    </div>

    <div class="formBody">
      <div class="imageUpload__wrapper">
        <div v-if="imagePreview['photo_url']" class="imagePreview">
          <img :src="imagePreview['photo_url']" alt="Selected Image" />
        </div>
        <div v-else class="imageFiller">
          <athlete-photo-filler-icon class="athletePhotoFiller__icon" :gender="trainer.gender"></athlete-photo-filler-icon>
        </div>

        <div class="imageInput__wrapper">
          <div class="imageInput__title">Фото</div>
          <input @change="onFileChange($event, 'photo_url')" type="file" class="formControl-image" id="photo_url" name="photo_url" />
        </div>
      </div>

      <div v-for="(_, field_key) in trainer" :key="field_key" class="formGroup">
        <label :for="field_key" class="formLabel">
          {{ translateField(field_key) }}
        </label>

        <select v-if="field_key === 'gender'" :id="field_key" class="formControl" v-model="trainer[field_key]">
          <option selected disabled value="">Выберите пол</option>
          <option v-for="option in ['М', 'Ж']" :key="option">
            {{ capitalizeString(option) }}
          </option>
        </select>

        <country-select-control
          v-else-if="field_key === 'country'"
          :value="trainer[field_key]"
          @input="setFieldValue('country', $event)"
        ></country-select-control>
        <region-select-control
          v-else-if="field_key === 'region'"
          :value="trainer[field_key]"
          :country="trainer['country']"
          @input="setFieldValue('region', $event)"
        ></region-select-control>

        <select
          @change="setFieldValue('sport', $event.target.value)"
          v-else-if="field_key === 'sport'"
          :id="field_key"
          class="formControl"
          :value="trainer[field_key]"
        >
          <option selected disabled value="">Выберите вид спорта</option>
          <option v-for="sport in sports" :key="sport.code" class="formControl-option">
            {{ capitalizeString(sport.name_rus) }}
          </option>
        </select>
        <div class="select__wrapper" v-else-if="field_key === 'disciplines'">
          <div class="formControl__wrapper" v-for="(_, dsc_idx) in trainer[field_key]" :key="dsc_idx">
            <select
              @change="setFieldValue('disciplines', $event.target.value, dsc_idx)"
              :id="field_key"
              data-new-region="false"
              class="formControl"
              :value="trainer[field_key][dsc_idx]"
            >
              <option v-for="discipline in getDisciplines(trainer['sport'])" :key="discipline.code">
                {{ discipline.name_rus }}
              </option>
            </select>
            <span @click="removeFieldValue('disciplines', dsc_idx)" class="removeOption__button"> </span>
          </div>
          <select @change="addFieldValue('disciplines', $event)" :id="field_key" data-new-region="true" class="formControl" data-empty="true">
            <option selected disabled value="">Выберите дисциплину</option>
            <option v-for="discipline in getDisciplines(trainer['sport'])" :key="discipline.code">
              {{ discipline.name_rus }}
            </option>
          </select>
        </div>

        <select
          @change="setFieldValue('trainer_category', $event.target.value)"
          v-else-if="field_key === 'trainer_category'"
          :id="field_key"
          class="formControl"
          :value="trainer[field_key]"
        >
          <option selected disabled value="">Выберите категорию</option>
          <option v-for="rank in trainerCategories" :key="rank" class="formControl-option">
            {{ rank }}
          </option>
        </select>

        <multiple-string-control
          v-else-if="field_key === 'rank' || field_key === 'position'"
          :target="trainer"
          :target_key="field_key"
          :placeholder="`${field_key === 'rank' ? 'Добавить звание' : 'Добавить должность'}`"
        ></multiple-string-control>

        <div class="select__wrapper" v-else-if="field_key === 'socials'">
          <div class="formControl__wrapper">
            <span>vk</span>
            <input :id="`${field_key}_vk`" class="formControl" v-model="trainer[field_key]['vk']" />
          </div>
          <div class="formControl__wrapper">
            <span>telegram</span>
            <input :id="`${field_key}_tg`" class="formControl" v-model="trainer[field_key]['telegram']" />
          </div>
        </div>

        <input v-else v-model="trainer[field_key]" :id="field_key" class="formControl" :type="getInputType(field_key)" :name="field_key" />
      </div>
    </div>

    <div class="formActions">
      <v-btn class="actionButton" type="submit" color="var(--text-contrast)" small>
        {{ action === 'create' ? 'Создать' : 'Обновить' }}
      </v-btn>
      <v-btn class="actionButton" v-show="action === 'update'" type="button" color="var(--message-error)" @click="deleteTrainer" text small> Удалить </v-btn>
    </div>
  </form>
</template>

<script>
import AthletePhotoFillerIcon from '@/assets/svg/athletePhotoFiller-icon.vue';
import { backendRootUrl } from '@/constants';
import { getInputType } from '@/utils/inputType-util';
import { countries, getCountryCode } from '@/store/data/countries';
import { getDisciplines, sports } from '@/store/data/sports';
import { capitalizeString } from '@/utils/capitalizeString';
import { getSortedRegions } from '@/store/data/russia-regions';
import { translateField } from '@/utils/formFields-translator';
import { trainerCategories } from '@/store/data/sport-data-sets';
import MultipleStringControl from '@/components/ui-components/custom-controls/multiple-string-control.vue';
import CountrySelectControl from '@/components/ui-components/custom-controls/country-select-control.vue';
import RegionSelectControl from '@/components/ui-components/custom-controls/region-select-control.vue';

export default {
  name: 'trainer-form',
  components: { RegionSelectControl, CountrySelectControl, MultipleStringControl, AthletePhotoFillerIcon },
  props: {
    trainer: Object,
    trainerImages: Object,
    action: String,
  },
  data() {
    return {
      selectedFile: {},
      imagePreview: {},
    };
  },
  computed: {
    countries() {
      return countries;
    },
    sports() {
      return sports;
    },
    trainerCategories() {
      return trainerCategories;
    },
  },
  methods: {
    translateField,
    getCountryCode,
    getSortedRegions,
    capitalizeString,
    getDisciplines,
    getInputType,

    onFileChange(e, imageType) {
      if (!e.target.files[0]) {
        this.$set(this.imagePreview, imageType, null);
        return;
      }

      this.$set(this.selectedFile, imageType, e.target.files[0]);
      this.previewImage(imageType, 'file');
    },
    previewImage(imageType, sourceType) {
      if (sourceType === 'file' && this.selectedFile[imageType]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.$set(this.imagePreview, imageType, e.target.result);
        };
        reader.readAsDataURL(this.selectedFile[imageType]);
      } else if (sourceType === 'url') {
        this.$set(this.imagePreview, imageType, backendRootUrl + this.trainerImages[imageType]);
      }
    },
    addFieldValue(field, event) {
      if (!event.target.value) return;

      const fieldValue = event.target.value.toString().trim();
      this.trainer[field].push(fieldValue);

      event.target.value = '';
    },
    setFieldValue(field, value, idx) {
      if (idx !== undefined) {
        this.trainer[field][idx] = value;
        return;
      }
      this.trainer[field] = value;
    },
    removeFieldValue(field, idx) {
      this.trainer[field].splice(idx, 1);
    },

    async submitForm() {
      switch (this.action) {
        case 'create': {
          this.$emit('create-trainer', this.selectedFile);
          return;
        }
        case 'update': {
          this.$emit('update-trainer', this.selectedFile);
          return;
        }
      }
    },

    deleteTrainer() {
      if (confirm('Вы уверены, что хотите удалить тренера?')) {
        this.$emit('delete-trainer', this.trainer.trainer_id);
      }
    },
  },

  watch: {
    trainerImages: {
      immediate: true,
      handler(newImages) {
        if (!newImages) return;

        for (const imgKey in newImages) {
          if (newImages[imgKey]) this.previewImage(imgKey, 'url');
        }
      },
    },
  },
};
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

  background-color: var(--background--card);
  box-shadow: var(--container-shadow-m);
  border: 1px solid var(--border-container);
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
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    grid-auto-rows: min-content;
    gap: 0.75rem 1.25rem;
    overflow-y: auto;

    @media screen and (max-width: 900px) {
      max-height: none;
    }

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

            color: var(--text-default);
            background-color: var(--background--card-secondary);
            border-radius: 4px;
            border-width: 1px;

            cursor: pointer;
          }

          &::file-selector-button:hover {
            background-color: var(--background--card-hover);
          }
        }
      }
    }

    .formGroup {
      flex: 0 0 auto;
      display: flex;
      align-items: flex-start;
      padding: 0 0 0.25rem;
      border-bottom: 1px solid var(--background--card-hover);
      transition: border-bottom 92ms;

      &:focus-within {
        border-bottom: 1px solid var(--text-muted);
      }

      .formLabel {
        flex: 0 1 auto;
        width: 9rem;
        margin-right: 1rem;
        padding: 3px 6px;
      }

      .formControl {
        position: relative;
        flex: 1 1 0;
        min-width: 0;
        max-width: 32ch;
        padding: 3px 6px;
        color: var(--text-default);
        background-color: var(--background--card-secondary);
        border-radius: 2px;
        outline: transparent;
        transition: background-color 92ms;

        &[type='checkbox'] {
          flex: 0 0 auto;
        }

        &:focus {
          background-color: var(--background--card-hover);
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
            background-color: var(--background--card-secondary);
            opacity: 0.45;
            transition: opacity 64ms;
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
              background-color: var(--message-error);
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
              background-color: var(--message-error);
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
