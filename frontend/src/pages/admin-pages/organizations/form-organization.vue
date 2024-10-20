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
          <competition-image-filler-icon
            class="imageFiller__icon"
          ></competition-image-filler-icon>
        </div>

        <div class="imageInput__wrapper">
          <div class="imageInput__title">
            {{ translateField("logo_url") }}
          </div>
          <input
            @change="onFileChange($event, 'logo_url')"
            type="file"
            class="formControl-image"
            id="photo_url"
            name="photo_url"
          />
        </div>
      </div>
      <div
        v-for="(_, field_key) in organization"
        :key="field_key"
        class="formGroup"
      >
        <label :for="field_key" class="formLabel">
          {{ translateField(field_key) }}
        </label>

        <select
          v-if="field_key === 'country'"
          :id="field_key"
          class="formControl"
          :value="organization[field_key]"
          @change="setFieldValue(organization, 'country', $event.target.value)"
        >
          <option
            v-for="country in countries"
            :key="country.country_code"
            class="formControl-option"
          >
            {{ country.country_name }}
          </option>
        </select>
        <select
          v-else-if="
            field_key === 'region' &&
            getCountryCode(organization['country']) === 'RU'
          "
          :id="field_key"
          class="formControl"
          :value="organization[field_key]"
          @change="setFieldValue(organization, 'region', $event.target.value)"
        >
          <option selected disabled value="">Выберите регион</option>
          <option v-for="region in getSortedRegions()" :key="region.code">
            {{ region.fullname }}
          </option>
        </select>

        <select
          @change="setFieldValue(organization, 'sport', $event.target.value)"
          v-else-if="field_key === 'sport'"
          :id="field_key"
          class="formControl"
          :value="organization[field_key]"
        >
          <option selected disabled value="">Выберите вид спорта</option>
          <option
            v-for="sport in sports"
            :key="sport.code"
            class="formControl-option"
          >
            {{ capitalizeString(sport.name_rus) }}
          </option>
        </select>
        <div class="select__wrapper" v-else-if="field_key === 'disciplines'">
          <div
            class="formControl__wrapper"
            v-for="(_, dsc_idx) in organization[field_key]"
            :key="dsc_idx"
          >
            <select
              @change="
                setFieldValue(
                  organization,
                  'disciplines',
                  $event.target.value,
                  dsc_idx
                )
              "
              :id="field_key"
              data-new-region="false"
              class="formControl"
              :value="organization[field_key][dsc_idx]"
            >
              <option
                v-for="discipline in getDisciplines(organization['sport'])"
                :key="discipline.code"
              >
                {{ discipline.name_rus }}
              </option>
            </select>
            <span
              @click="removeFieldValue(organization, 'disciplines', dsc_idx)"
              class="removeOption__button"
            >
            </span>
          </div>
          <select
            @change="addFieldValue(organization, 'disciplines', $event)"
            :id="field_key"
            data-new-region="true"
            class="formControl"
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

        <div class="select__wrapper" v-else-if="field_key === 'contacts'">
          <div
            class="formControl__wrapper"
            v-for="(_, idx) in organization[field_key]"
            :key="idx"
          >
            <input
              @change="
                setFieldValue(organization, field_key, $event.target.value, idx)
              "
              :id="field_key"
              class="formControl"
              :value="organization[field_key][idx]"
            />
            <span
              @click="removeFieldValue(organization, field_key, idx)"
              class="removeOption__button"
            >
            </span>
          </div>
          <input
            @change="addFieldValue(organization, field_key, $event)"
            :id="field_key"
            class="formControl"
            placeholder="Добавить контакт"
          />
        </div>
        <div class="select__wrapper" v-else-if="field_key === 'socials'">
          <div class="formControl__wrapper">
            <span>vk</span>
            <input
              :id="`${field_key}_vk`"
              class="formControl"
              v-model="organization[field_key]['vk']"
            />
          </div>
          <div class="formControl__wrapper">
            <span>telegram</span>
            <input
              :id="`${field_key}_tg`"
              class="formControl"
              v-model="organization[field_key]['telegram']"
            />
          </div>
        </div>

        <input
          v-else
          v-model="organization[field_key]"
          :id="field_key"
          class="formControl"
          :type="getInputType(field_key)"
          :name="field_key"
        />
      </div>
    </div>

    <div class="formActions">
      <v-btn
        class="actionButton"
        type="submit"
        color="var(--text-contrast)"
        small
      >
        {{ action === "create" ? "Создать" : "Обновить" }}
      </v-btn>
      <v-btn
        class="actionButton"
        v-show="action === 'update'"
        type="button"
        color="var(--message-error)"
        @click="deleteOrganization"
        text
        small
      >
        Удалить
      </v-btn>
    </div>
  </form>
</template>

<script>
import { getInputType } from "@/utils/get-input-type";
import { getDisciplines, sports } from "@/store/data/sports";
import { capitalizeString } from "@/utils/capitalizeString";
import { getSortedRegions } from "@/store/data/russia-regions";
import { countries, getCountryCode } from "@/store/data/countries";
import { translateField } from "@/utils/formFields-translator";
import {
  addFieldValue,
  removeFieldValue,
  setFieldValue,
} from "@/utils/form-data-helpers";
import { uploadsFolderUrl } from "@/store/constants";
import CompetitionImageFillerIcon from "@/assets/svg/competitionImageFiller-icon.vue";

export default {
  name: "organization-form",
  components: { CompetitionImageFillerIcon },
  props: {
    organization: Object,
    organizationImages: Object,
    action: String,
  },
  data() {
    return {
      selectedFile: {},
      imagePreview: {},
    };
  },
  computed: {
    sports() {
      return sports;
    },
    countries() {
      return countries;
    },
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
        this.$set(this.imagePreview, imageType, null);
        return;
      }

      this.$set(this.selectedFile, imageType, e.target.files[0]);
      this.previewImage(imageType, "file");
    },
    previewImage(imageType, sourceType) {
      if (sourceType === "file" && this.selectedFile[imageType]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.$set(this.imagePreview, imageType, e.target.result);
        };
        reader.readAsDataURL(this.selectedFile[imageType]);
      } else if (sourceType === "url") {
        this.$set(
          this.imagePreview,
          imageType,
          uploadsFolderUrl + this.organizationImages[imageType]
        );
      }
    },

    async submitForm() {
      switch (this.action) {
        case "create": {
          this.$emit("create-organization", this.selectedFile);
          return;
        }
        case "update": {
          this.$emit("update-organization", this.selectedFile);
          return;
        }
      }
    },

    deleteOrganization() {
      if (confirm("Вы уверены, что хотите удалить организацию?")) {
        this.$emit("delete-organization", this.organization.org_id);
      }
    },
  },

  watch: {
    organizationImages: {
      immediate: true,
      handler(newImages) {
        if (!newImages) return;

        for (const imgKey in newImages) {
          if (newImages[imgKey]) this.previewImage(imgKey, "url");
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

  margin: 2rem auto;
  padding: 1rem 1.6rem;

  background-color: var(--background--card);
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
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    gap: 8px;
    max-height: 50vh;

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
        width: 150px;
        margin-right: 1rem;
      }
      .formControl {
        flex-grow: 1;
        max-width: 32ch;
        padding: 3px 6px;
        color: var(--text-default);
        background-color: var(--background--card-secondary);
        border-radius: 2px;
        outline: transparent;
        transition: background-color 92ms, outline-color 92ms;

        &[type="checkbox"] {
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
            content: "";

            &:hover {
              opacity: 1;
            }
            &::before {
              content: "";
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
              content: "";
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
