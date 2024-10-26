<template>
  <form enctype="multipart/form-data" @submit.prevent="submitForm">
    <div class="formHeader">
      <span v-if="action === 'create'">Новое соревнование</span>
      <span v-else>Обновление данных соревнования</span>

      <div @click="openOnlineRegistration" v-if="action === 'update'" class="onlineRegistration__link">
        Дополнительные настройки
        <v-icon class="onlineRegistration__icon" color="currentColor" size="18">
          {{ arrowRightIcon }}
        </v-icon>
      </div>
    </div>

    <div class="formBody">
      <div class="imageUpload__wrapper">
        <div class="imagePreview__wrapper">
          <img v-if="imagePreview['logo_image_url']" :src="imagePreview['logo_image_url']" alt="Selected Image" />
          <div v-else class="imageFiller">
            <competition-image-filler-icon class="imageFiller__icon"></competition-image-filler-icon>
          </div>
        </div>

        <div class="imageInput__wrapper">
          <div class="imageInput__title">Логотип события</div>
          <input @change="onFileChange($event, 'logo_image_url')" id="image_url" class="formControl-image" name="image_url" type="file" />
        </div>
      </div>

      <div class="imageUpload__wrapper">
        <div class="imagePreview__wrapper">
          <img v-if="imagePreview['track_image_url']" :src="imagePreview['track_image_url']" alt="Selected Image" />
          <div v-else class="imageFiller">
            <competition-image-filler-icon class="imageFiller__icon"></competition-image-filler-icon>
          </div>
        </div>

        <div class="imageInput__wrapper">
          <div class="imageInput__title">Изображение трассы</div>
          <input @change="onFileChange($event, 'track_image_url')" id="image_url" class="formControl-image" name="image_url" type="file" />
        </div>
      </div>

      <div v-for="(_, field_key) in event" v-show="field_key !== 'country_code' && field_key !== 'region_code'" :key="field_key" class="formGroup">
        <label :for="field_key" class="formLabel">
          {{ translateField(field_key) }}
        </label>

        <select v-if="field_key === 'sport'" :id="field_key" class="formControl" v-model="event[field_key]">
          <option selected disabled value="">Выберите вид спорта</option>
          <option v-for="sport in sports" :key="sport.code" class="formControl-option">
            {{ capitalizeString(sport.name_rus) }}
          </option>
        </select>
        <div class="select__wrapper" v-else-if="field_key === 'discipline'">
          <select
            @change="setFieldValue(event, 'discipline', $event.target.value)"
            :value="event[field_key]"
            :key="event[field_key] || 'dsc'"
            :id="field_key"
            class="formControl"
            :disabled="!event['sport']"
          >
            <option selected disabled value="">Выберите дисциплину</option>
            <option v-for="discipline in getDisciplines(event['sport'])" :key="discipline.code">
              {{ discipline.name_rus }}
            </option>
          </select>
        </div>

        <select
          v-else-if="field_key === 'country'"
          @change="setFieldValue(event, 'country', $event.target.value)"
          :id="field_key"
          class="formControl"
          :value="event[field_key]"
        >
          <option v-for="country in countries" :key="country.country_code" class="formControl-option">
            {{ country.country_name }}
          </option>
        </select>
        <div class="select__wrapper" v-else-if="field_key === 'region'">
          <input
            v-if="getCountryCode(event['country']) !== 'RU'"
            v-model="event[field_key]"
            :id="field_key"
            :name="field_key"
            :type="getInputType(field_key)"
            class="formControl"
          />
          <div v-else class="formControl__wrapper">
            <select @change="setFieldValue(event, 'region', $event.target.value)" :id="field_key" class="formControl" :value="event[field_key]">
              <option selected disabled value="">Выберите регион</option>
              <option v-for="region in getSortedRegions()" :key="region.code">
                {{ region.fullname }}
              </option>
            </select>
          </div>
        </div>

        <documents-select-control
          v-else-if="field_key === 'documents'"
          @update:documents="updateDocuments"
          :initial-documents="event.documents"
        ></documents-select-control>

        <input v-else v-model="event[field_key]" :id="field_key" class="formControl" :type="getInputType(field_key)" :name="field_key" />
      </div>
    </div>

    <div class="formActions">
      <v-btn class="actionButton" type="submit" color="var(--text-contrast)" small>
        {{ action === 'create' ? 'Создать' : 'Обновить' }}
      </v-btn>
      <v-btn v-show="action === 'update'" class="actionButton" type="button" color="var(--message-error)" @click="deleteEvent" text small> Удалить </v-btn>
    </div>
  </form>
</template>

<script>
import DocumentsSelectControl from '@/components/ui-components/custom-controls/documents-select-control.vue';
import { uploadsFolderUrl } from '@/store/constants';
import { getInputType } from '@/utils/get-input-type';
import { getDisciplines, sports } from '@/store/data/sports';
import { setFieldValue } from '@/utils/form-data-helpers';
import { translateField } from '@/utils/formFields-translator';
import { countries, getCountryCode } from '@/store/data/countries';
import { getSortedRegions } from '@/store/data/russia-regions';
import CompetitionImageFillerIcon from '@/assets/svg/competitionImageFiller-icon.vue';
import { capitalizeString } from '@/utils/capitalizeString';
import { mdiArrowRight } from '@mdi/js';

export default {
  name: 'event-form',
  components: { CompetitionImageFillerIcon, DocumentsSelectControl },
  props: {
    event: Object,
    eventImages: Object,
    action: String,
  },
  data() {
    return {
      selectedFile: {},
      imagePreview: {},
      arrowRightIcon: mdiArrowRight,
    };
  },
  computed: {
    countries() {
      return countries;
    },
    sports() {
      return sports;
    },
  },
  methods: {
    capitalizeString,
    getSortedRegions,
    getCountryCode,
    translateField,
    setFieldValue,
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
        this.$set(this.imagePreview, imageType, uploadsFolderUrl + this.eventImages[imageType]);
      }
    },
    updateDocuments(documents) {
      this.event.documents = [...documents];
    },

    submitForm() {
      switch (this.action) {
        case 'create': {
          this.$emit('create-event', this.selectedFile);
          return;
        }
        case 'update': {
          this.$emit('update-event', this.selectedFile);
          return;
        }
      }
    },
    deleteEvent() {
      if (confirm('Вы уверены, что хотите удалить событие?')) {
        this.$emit('delete-event', this.event.event_id);
      }
    },
    openOnlineRegistration() {
      this.$emit('open-online-registration');
    },
  },

  watch: {
    eventImages: {
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
  flex: 0 1 0;
  position: relative;
  display: flex;
  flex-direction: column;
  max-width: var(--tablet-default);
  width: 100%;

  margin: auto;
  padding: 1rem 1.6rem;

  background-color: var(--background--card);
  box-shadow: var(--container-shadow-m);
  border: 1px solid var(--border-container);
  border-radius: 4px;

  .formHeader {
    flex: 0 0 auto;
    display: flex;
    align-items: flex-end;
    gap: 8px;
    padding: 0 0.5rem 1.25rem;
    font-size: 1.4rem;
    font-weight: bold;

    .onlineRegistration__link {
      display: flex;
      align-items: center;
      margin-left: auto;
      font-size: 1rem;
      color: var(--text-muted);
      cursor: pointer;
      transition: color 92ms;
      &:hover {
        color: var(--ffr-brand);
      }
      .onlineRegistration__icon {
        margin-left: 0.25rem;
        color: inherit;
        transition: fill 92ms;
      }
    }
  }

  .formBody {
    flex: 0 1 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    align-items: flex-start;
    grid-auto-rows: min-content;
    grid-gap: 0.75rem 1.25rem;
    overflow-y: auto;

    @media screen and (max-width: 900px) {
      max-height: none;
    }

    .imageUpload__wrapper {
      flex: 0 0 auto;
      display: flex;
      flex-wrap: nowrap;
      margin-bottom: 4px;

      .imagePreview__wrapper {
        flex: 0 0 auto;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 80px;
        aspect-ratio: 1;
        padding: 8px;

        img {
          display: block;
          max-height: 100%;
          max-width: 100%;
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
            width: 100%;
            height: 100%;
          }
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
          min-width: 0;
          width: 100%;
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
        flex: 0 0 12ch;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-right: 1rem;

        &:hover {
          overflow: visible;
        }
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
        }
      }

      .formControl {
        flex: 1 1 0;
        min-width: 0;
        width: 100%;
        padding: 3px 6px;
        color: var(--text-default);
        background-color: var(--background--card-secondary);
        border-radius: 2px;
        outline: transparent;
        transition: background-color 92ms;

        &[type='checkbox'] {
          flex: 0 0 auto;
        }

        &:focus-visible {
          background-color: var(--background--card-hover);
        }

        &[name='international'] {
          align-self: center;
          width: auto;
        }
      }
    }

    .select__wrapper {
      flex: 1 1 0;
      display: flex;

      .formControl {
        flex: 1 1 0;
        min-width: 0;
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
