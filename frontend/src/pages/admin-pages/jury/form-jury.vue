<template>
  <form @submit.prevent="submitForm" enctype="multipart/form-data">
    <div class="formHeader">
      <span v-if="action === 'create'">Новый судья</span>
      <span v-else>Обновление данных судьи</span>
    </div>

    <div class="formBody">
      <div class="imageUpload__wrapper">
        <div v-if="imagePreview['photo_url']" class="imagePreview">
          <img :src="imagePreview['photo_url']" alt="Selected Image" />
        </div>
        <div v-else class="imageFiller">
          <athlete-photo-filler-icon class="athletePhotoFiller__icon" :gender="jury.gender"></athlete-photo-filler-icon>
        </div>

        <div class="imageInput__wrapper">
          <div class="imageInput__title">Фото</div>
          <input @change="onFileChange($event, 'photo_url')" type="file" class="formControl-image" id="photo_url" name="photo_url" />
        </div>
      </div>

      <div v-for="(_, key) in jury" v-show="key !== 'country_code' && key !== 'region_code'" :key="key" class="formGroup">
        <label :for="key" class="formLabel">{{ translateField(key) }}</label>

        <select v-if="key === 'gender'" :id="key" class="formControl" v-model="jury[key]">
          <option selected disabled value="">Выберите пол</option>
          <option v-for="option in ['М', 'Ж']" :key="option">
            {{ capitalizeString(option) }}
          </option>
        </select>

        <select v-else-if="key === 'sport'" :id="key" class="formControl" v-model="jury[key]">
          <option selected disabled value="">Выберите вид спорта</option>
          <option v-for="sport in sports" :key="sport.code" class="formControl-option">
            {{ capitalizeString(sport.name_rus) }}
          </option>
        </select>
        <div class="select__wrapper" v-else-if="key === 'disciplines' && jury['sport']">
          <div class="formControl__wrapper" v-for="(_, dsc_idx) in jury[key]" :key="dsc_idx">
            <select
              @change="setFieldValue(jury, 'disciplines', $event.target.value, dsc_idx)"
              :id="key"
              data-new-region="false"
              class="formControl"
              :value="jury[key][dsc_idx]"
            >
              <option v-for="discipline in getDisciplines(jury['sport'])" :key="discipline.code">
                {{ discipline.name_rus }}
              </option>
            </select>
            <span @click="removeFieldValue(jury, 'disciplines', dsc_idx)" class="removeOption__button"> </span>
          </div>
          <select @change="addFieldValue(jury, 'disciplines', $event)" :id="key" data-new-region="true" class="formControl">
            <option selected disabled value="">Выберите дисциплину</option>
            <option v-for="discipline in getDisciplines(jury['sport'])" :key="discipline.code">
              {{ discipline.name_rus }}
            </option>
          </select>
        </div>

        <select v-else-if="key === 'country'" :id="key" class="formControl" :value="jury[key]" @change="setFieldValue(jury, 'country', $event.target.value)">
          <option selected disabled value="">Выберите страну</option>
          <option v-for="country in countries" :key="country.country_code" class="formControl-option">
            {{ country.country_name }}
          </option>
        </select>
        <div class="select__wrapper" v-else-if="key === 'region'">
          <input v-if="getCountryCode(jury['country']) !== 'RU'" v-model="jury[key]" :id="key" :name="key" :type="getInputType(key)" class="formControl" />
          <div v-else class="formControl__wrapper">
            <select @change="setFieldValue(jury, 'region', $event.target.value)" :id="key" data-new-region="false" class="formControl" :value="jury[key]">
              <option selected disabled value="">Выберите регион</option>
              <option v-for="region in russiaRegions" :key="region.code">
                {{ region.fullname }}
              </option>
            </select>
          </div>
        </div>
        <select
          v-else-if="key === 'jury_category'"
          :id="key"
          class="formControl"
          :value="jury[key]"
          @change="setFieldValue(jury, 'jury_category', $event.target.value)"
        >
          <option selected disabled value="">Выберите категорию судьи</option>
          <option v-for="category in getJuryCategoriesList()" :key="category" class="formControl-option">
            {{ category }}
          </option>
        </select>

        <div class="select__wrapper" v-else-if="key === 'socials'">
          <div class="formControl__wrapper">
            <span>vk</span>
            <input :id="`${key}_vk`" class="formControl" v-model="jury[key]['vk']" />
          </div>
          <div class="formControl__wrapper">
            <span>telegram</span>
            <input :id="`${key}_tg`" class="formControl" v-model="jury[key]['telegram']" />
          </div>
        </div>

        <input v-else v-model="jury[key]" :id="key" :name="key" :type="getInputType(key)" class="formControl" />
      </div>
    </div>

    <div class="formActions">
      <v-btn class="actionButton" type="submit" color="var(--text-contrast)" small>
        {{ action === 'create' ? 'Создать' : 'Обновить' }}
      </v-btn>
      <v-btn class="actionButton" v-show="action === 'update'" type="button" color="var(--message-error)" @click="deleteJury" text small> Удалить </v-btn>
    </div>
  </form>
</template>

<script>
import AthletePhotoFillerIcon from '@/assets/svg/athletePhotoFiller-icon.vue';
import { getInputType } from '@/utils/get-input-type';
import { getJuryCategoriesList } from '@/store/data/sport-data-sets';
import { russiaRegions } from '@/store/data/russia-regions';
import { countries, getCountryCode } from '@/store/data/countries';
import { getDisciplines, sports } from '@/store/data/sports';
import { capitalizeString } from '@/utils/capitalizeString';
import { translateField } from '@/utils/formFields-translator';
import { uploadsFolderUrl } from '@/store/constants';
import { addFieldValue, removeFieldValue, setFieldValue } from '@/utils/form-data-helpers';

export default {
  name: 'jury-form',
  components: { AthletePhotoFillerIcon },
  props: {
    jury: Object,
    juryImages: Object,
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
    russiaRegions() {
      return russiaRegions;
    },
    sports() {
      return sports;
    },
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
        this.$set(this.imagePreview, imageType, uploadsFolderUrl + this.juryImages[imageType]);
      }
    },

    async submitForm() {
      switch (this.action) {
        case 'create': {
          this.$emit('create-jury', this.selectedFile);
          return;
        }
        case 'update': {
          this.$emit('update-jury', this.selectedFile);
          return;
        }
      }
    },

    deleteJury() {
      if (confirm('Вы уверены, что хотите удалить судью?')) {
        this.$emit('delete-jury', this.jury.jury_code);
      }
    },
  },

  watch: {
    juryImages: {
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
    grid-template-columns: repeat(2, minmax(300px, 1fr));
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

          .removeOption__button {
            display: block;
            position: absolute;
            right: 4px;
            top: 50%;
            transform: translateY(-50%);
            width: 0.75rem;
            height: 0.75rem;
            opacity: 0.25;
            transition: opacity 92ms;
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
              height: 4px;
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

        &:focus {
          background-color: var(--background--card-hover);
        }
      }
    }
  }

  .formActions {
    display: flex;
    justify-content: flex-end;
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
