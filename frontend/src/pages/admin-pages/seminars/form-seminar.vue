<template>
  <form enctype="multipart/form-data" @submit.prevent="submitForm">
    <div class="formHeader">
      <span v-if="action === 'create'">Новый семинар</span>
      <span v-else>Обновление данных семинара</span>
    </div>

    <div class="formBody">
      <div v-for="(_, field_key) in seminar" :key="field_key" class="formGroup">
        <label :for="field_key" class="formLabel">
          {{ translateField(field_key) }}
        </label>

        <country-select-control
          v-if="field_key === 'country'"
          :value="seminar[field_key]"
          @input="setFieldValue(seminar, 'country', $event)"
        ></country-select-control>
        <region-select-control
          v-else-if="field_key === 'region'"
          :value="seminar[field_key]"
          :country="seminar['country']"
          @input="setFieldValue(seminar, 'region', $event)"
        ></region-select-control>

        <select
          @change="setFieldValue(seminar, 'sport', $event.target.value)"
          v-else-if="field_key === 'sport'"
          :id="field_key"
          class="formControl"
          :value="seminar[field_key]"
        >
          <option selected disabled value="">Выберите вид спорта</option>
          <option v-for="sport in sports" :key="sport.code" class="formControl-option">
            {{ capitalizeString(sport.name_rus) }}
          </option>
        </select>
        <div class="select__wrapper" v-else-if="field_key === 'disciplines'">
          <div class="formControl__wrapper" v-for="(_, dsc_idx) in seminar[field_key]" :key="dsc_idx">
            <select
              @change="setFieldValue(seminar, 'disciplines', $event.target.value, dsc_idx)"
              :id="field_key"
              data-new-region="false"
              class="formControl"
              :value="seminar[field_key][dsc_idx]"
            >
              <option v-for="discipline in getDisciplines(seminar['sport'])" :key="discipline.code">
                {{ discipline.name_rus }}
              </option>
            </select>
            <span @click="removeFieldValue(seminar, 'disciplines', dsc_idx)" class="removeOption__button"> </span>
          </div>
          <select @change="addFieldValue(seminar, 'disciplines', $event)" :id="field_key" data-new-region="true" class="formControl">
            <option selected disabled value="">Выберите дисциплину</option>
            <option v-for="discipline in getDisciplines(seminar['sport'])" :key="discipline.code">
              {{ discipline.name_rus }}
            </option>
          </select>
        </div>

        <documents-select-control
          v-else-if="field_key === 'documents'"
          @update:documents="updateDocuments"
          :initial-documents="seminar.documents"
        ></documents-select-control>

        <div class="select__wrapper" v-else-if="field_key === 'contacts'">
          <div class="formControl__wrapper" v-for="(_, idx) in seminar[field_key]" :key="idx">
            <input @change="setFieldValue(seminar, field_key, $event.target.value, idx)" :id="field_key" class="formControl" :value="seminar[field_key][idx]" />
            <span @click="removeFieldValue(seminar, field_key, idx)" class="removeOption__button"> </span>
          </div>
          <input @change="addFieldValue(seminar, field_key, $event)" :id="field_key" class="formControl" placeholder="Добавить контакт" />
        </div>

        <input v-else v-model="seminar[field_key]" :id="field_key" class="formControl" :type="getInputType(field_key)" :name="field_key" />
      </div>
    </div>

    <div class="formActions">
      <v-btn class="actionButton" type="submit" color="var(--text-contrast)" small>
        {{ action === 'create' ? 'Создать' : 'Обновить' }}
      </v-btn>
      <v-btn class="actionButton" v-show="action === 'update'" type="button" color="var(--message-error)" @click="deleteSeminar" text small> Удалить </v-btn>
    </div>
  </form>
</template>

<script>
import DocumentsSelectControl from '@/components/ui-components/custom-controls/documents-select-control.vue';
import { addFieldValue, removeFieldValue, setFieldValue } from '@/utils/formData-helpers';
import { getDisciplines, sports } from '@/store/data/sports';
import { capitalizeString } from '@/utils/capitalizeString';
import { getSortedRegions } from '@/store/data/russia-regions';
import { countries, getCountryCode } from '@/store/data/countries';
import { translateField } from '@/utils/formFields-translator';
import { getInputType } from '@/utils/inputType-util';
import CountrySelectControl from '@/components/ui-components/custom-controls/country-select-control.vue';
import RegionSelectControl from '@/components/ui-components/custom-controls/region-select-control.vue';

export default {
  name: 'seminar-form',
  props: {
    seminar: Object,
    action: String,
  },
  components: { RegionSelectControl, CountrySelectControl, DocumentsSelectControl },
  computed: {
    countries() {
      return countries;
    },
    sports() {
      return sports;
    },
  },
  methods: {
    getInputType,
    translateField,
    getCountryCode,
    getSortedRegions,
    capitalizeString,
    getDisciplines,
    setFieldValue,
    removeFieldValue,
    addFieldValue,

    updateDocuments(documents) {
      this.seminar.documents = [...documents];
    },
    async submitForm() {
      switch (this.action) {
        case 'create': {
          this.$emit('create-seminar');
          return;
        }
        case 'update': {
          this.$emit('update-seminar');
          return;
        }
      }
    },
    deleteSeminar() {
      if (confirm('Вы уверены, что хотите удалить семинар?')) {
        this.$emit('delete-seminar', this.seminar._id);
      }
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
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    gap: 8px;
    max-height: 60vh;

    @media screen and (max-width: 900px) {
      max-height: none;
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
