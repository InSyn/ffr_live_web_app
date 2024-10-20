<template>
  <div v-if="seminar" class="seminarPage__wrapper">
    <div class="seminarCard__wrapper">
      <div class="seminarPage__header">
        <div class="seminar__title__wrapper">
          <div class="seminar__title">
            {{ seminar.title }}
            <edit-button type="seminar" :code="seminar._id"></edit-button>
          </div>
          <div class="seminar__title__disciplines">
            {{ getSeminarDisciplines() }}
          </div>
        </div>
        <div class="seminar__sport">
          {{ seminar.sport }}
          <country-flag
            class="countryFlag"
            :country-code="getCountryCode(seminar['country'])"
            height="1rem"
          ></country-flag>
        </div>
      </div>
      <div class="seminarPage__body">
        <div class="seminarData__wrapper">
          <div v-if="seminar.region" class="seminar__region">
            <country-flag
              is-region-flag="true"
              country-code="RU"
              :region-code="getRegionCode(seminar.region)"
              width="calc(8px + 1rem)"
            ></country-flag>
            &nbsp;
            {{ [seminar.region, seminar.location].join(", ") }}
          </div>
          <div v-if="seminar.date" class="seminar__date">
            {{ formatDate(seminar.date) }}
          </div>
          <div v-if="seminar.format" class="seminar__format">
            {{ `Формат: ${seminar.format}` }}
          </div>
        </div>
        <div v-if="seminar.participants.length" class="participants__wrapper">
          <div class="participants__title">Участники</div>
          <div class="seminarParticipant__list">
            <div
              class="seminarParticipant__item"
              v-for="(participant, idx) in seminar.participants"
              :key="idx"
            >
              {{
                `${participant.fullname}${
                  participant.role ? " - " + participant.role : ""
                }`
              }}
            </div>
          </div>
        </div>
        <div class="seminarFiles__wrapper">
          <div class="seminarFiles__title">Документы:</div>
          <div
            v-for="(document, idx) in seminar.documents"
            :key="idx"
            class="seminarFile__item"
          >
            <a
              v-if="document?.file?.url"
              :href="`${uploadsFolderUrl}${document.file.url}`"
              target="_blank"
              class="seminarFile__item__link"
            >
              <file-icon class="seminarFile__item__icon"></file-icon>
              {{ document.title }}
            </a>
          </div>
        </div>
        <div class="seminarContacts__wrapper">
          <div class="seminarContacts__title">Контакты:</div>
          <div
            v-for="(contact, idx) in seminar.contacts"
            :key="idx"
            class="seminarContact__item"
          >
            {{ contact }}
          </div>
        </div>
      </div>
      <div v-if="isAdmin" class="seminarPage__actions">
        <v-btn
          @click="openParticipantsControl"
          color="var(--accent)"
          small
          text
        >
          Добавить участников
        </v-btn>
      </div>
    </div>

    <seminar-participants-control
      v-if="showParticipantsControl"
      @close-participants-control="showParticipantsControl = false"
      :seminar="seminar"
    ></seminar-participants-control>
  </div>
</template>

<script>
import axios from "axios";
import { databaseUrl, uploadsFolderUrl } from "@/store/constants";
import CountryFlag from "@/components/ui-components/country-flag.vue";
import { getCountryCode } from "@/store/data/countries";
import FileIcon from "@/components/icons/file-icon.vue";
import { formatDate } from "@/utils/data-formaters";
import { getDisciplineCode } from "@/store/data/sports";
import EditButton from "@/components/ui-components/edit-button.vue";
import { mapGetters } from "vuex";
import SeminarParticipantsControl from "@/pages/seminars/seminarParticipants-control/index.vue";
import { getRegionCode } from "@/store/data/russia-regions";

export default {
  name: "index",
  components: { SeminarParticipantsControl, EditButton, FileIcon, CountryFlag },
  props: ["seminar_id"],
  data() {
    return {
      seminar: null,
      loading: true,

      showParticipantsControl: false,
    };
  },
  computed: {
    ...mapGetters("authorization", {
      isAdmin: "isAdmin",
    }),

    uploadsFolderUrl() {
      return uploadsFolderUrl;
    },
  },
  methods: {
    getRegionCode,
    getDisciplineCode,
    formatDate,
    getCountryCode,
    async getSeminarById(id) {
      try {
        const data = await axios.get(`${databaseUrl}/seminars/${id}`);
        if (data.status === 200) {
          const seminarData = data.data.seminar;
          if (seminarData) this.seminar = { ...seminarData };
        }

        this.loading = false;
      } catch (err) {
        if (err) {
          console.error(err);
        }
        this.loading = false;
      }
    },
    getSeminarDisciplines() {
      if (!this.seminar.disciplines.length) return "";

      return this.seminar.disciplines.join(", ");
    },

    openParticipantsControl() {
      this.showParticipantsControl = true;
    },
  },

  mounted() {
    if (this.$route.params.seminar_id) {
      try {
        this.loading = true;
        this.getSeminarById(this.$route.params.seminar_id);
      } catch (e) {
        this.loading = false;
        throw new Error(e);
      }
    }
  },
};
</script>

<style scoped lang="scss">
.seminarPage__wrapper {
  display: flex;
  flex-direction: column;
  max-width: var(--desktop-small);
  width: 100%;
  margin: 0 auto;
  padding: var(--padd-page);

  .seminarCard__wrapper {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    margin: 2rem;
    padding: 1.25rem 1.75rem;

    background-color: var(--background--card);
    backdrop-filter: blur(4px);
    border-radius: 4px;

    .seminarPage__header {
      flex: 0 0 auto;
      display: flex;
      align-items: flex-start;

      .seminar__title__wrapper {
        display: flex;
        flex-direction: column;
        font-size: 1.4rem;
        font-weight: 500;

        .seminar__title {
          display: flex;
          align-items: center;
        }
        .seminar__title__disciplines {
          margin-top: 0.5rem;
          font-size: 1.2rem;
        }
      }
      .seminar__sport {
        display: flex;
        align-items: center;
        margin-left: auto;
        font-size: 1.4rem;

        .countryFlag {
          margin-left: 1rem;
        }
      }
    }
    .seminarPage__body {
      flex: 0 0 auto;
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem 1.25rem;

      .seminarData__wrapper {
        flex: 1 1 100%;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.75rem 1.25rem;
        margin-bottom: 2rem;

        .seminar__region {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
        }
        .seminar__format {
          margin-left: auto;
          font-size: 1rem;
          color: var(--text-muted);
          text-align: end;
        }
      }

      .participants__wrapper {
        flex: 1 1 100%;
        display: flex;
        flex-direction: column;
        margin-bottom: 2rem;
        padding: 0 1rem;

        .participants__title {
          flex: 0 0 auto;
          margin-bottom: 0.5rem;
        }
        .seminarParticipant__list {
          flex: 0 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
      }
      .seminarFiles__wrapper {
        flex: 0 0 auto;
        display: flex;
        flex-direction: column;
        gap: 4px;

        .seminarFiles__title {
          margin-left: 1.25rem;
        }
        .seminarFile__item {
          flex: 0 0 auto;

          .seminarFile__item__link {
            display: flex;
            align-items: center;
            color: var(--text-muted);

            .seminarFile__item__icon {
              color: var(--accent);
              height: 1rem;
              margin-right: 0.25rem;
            }
          }
        }
      }
      .seminarContacts__wrapper {
        flex: 0 0 auto;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;
        margin-left: auto;

        .seminarContact__item {
          color: var(--text-muted);
        }
      }
    }
    .seminarPage__actions {
      flex: 0 0 auto;
      display: flex;
      justify-content: flex-end;
      margin-top: 1rem;
    }
  }
  @media screen and (max-width: 640px) {
    flex: 1 1 0;
    margin: 0;

    .seminarCard__wrapper {
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      gap: 1.5rem;
      margin: 0;
      padding: 4rem 2rem;
      border-radius: 0;

      .seminarPage__header {
        margin-bottom: auto;
        .seminar__title__wrapper {
          font-size: 1.75rem;
        }
        .seminar__sport {
          font-size: 1.75rem;
        }
      }
      .seminarPage__body {
        flex: 1 1 0;
        gap: 1.2rem;
      }
    }
  }
}
</style>
