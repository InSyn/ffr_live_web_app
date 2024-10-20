<template>
  <div v-if="trainer" class="trainerPage__wrapper">
    <div class="trainerPage__top">
      <bg-mountains class="mountains_bg"></bg-mountains>

      <div class="trainerCard__wrapper">
        <div class="trainerCard__content">
          <div class="trainerCard__mainInfo">
            <div class="trainerPhoto__wrapper">
              <img
                v-if="trainer['photo_url']"
                class="trainerPhoto"
                :src="uploadsFolderUrl + `${trainer['photo_url']}`"
                alt="Event Logo"
              />
              <athlete-photo-filler-icon
                v-else
                class="trainerPhotoFiller__icon"
                :gender="trainer.gender"
              ></athlete-photo-filler-icon>

              <edit-button
                class="edit__button"
                type="trainer"
                :code="trainer_id"
              ></edit-button>
            </div>

            <div class="trainerMainInfo__wrapper">
              <div class="trainerMainInfo__header">
                <div
                  class="federation__wrapper"
                  v-if="
                    trainer['sport'] &&
                    trainer['sport'] === capitalizeString(sports[0].name_rus)
                  "
                >
                  <img
                    src="../../../assets/logo/FFR_logo_mini.png"
                    alt="FFR_logo"
                  />
                  <span>Федерация фристайла России</span>
                </div>
                <div
                  class="federation__wrapper"
                  v-if="
                    trainer['sport'] &&
                    trainer['sport'] === capitalizeString(sports[1].name_rus)
                  "
                >
                  <img
                    src="../../../assets/logo/FSR_logo_mini.png"
                    alt="FSR_logo"
                  />
                  <span>Федерация сноуборда России</span>
                </div>

                <div class="trainerSport">
                  {{ trainer.sport }}

                  <country-flag
                    class="countryFlag"
                    :country-code="getCountryCode(trainer.country)"
                    height="1.25rem"
                  ></country-flag>
                </div>
              </div>

              <div class="trainerMainInfo__nameLine">
                <div class="trainerName__wrapper">
                  <div class="trainerName">
                    {{ trainer.fullname }}
                  </div>
                  <div class="trainerPosition">
                    {{ trainer.trainer_category }}
                  </div>
                  <div class="trainerRank">
                    {{ trainer.rank.join(", ") }}
                  </div>
                </div>

                <div class="trainerPosition__wrapper">
                  <div
                    class="nationalTeamLogo__wrapper"
                    v-if="trainer.is_national_team"
                  >
                    Сборная России
                    <img
                      class="nationalTeamLogo"
                      src="../../../assets/logo/okr.png"
                      alt="NT_Logo"
                    />
                  </div>

                  <div class="trainerPositions">
                    <div
                      class="trainerPosition__item"
                      v-for="(position, idx) in trainer.position"
                      :key="idx"
                    >
                      {{ position }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="trainerMainInfo__bottom">
                <div class="trainerRegionInfo__wrapper">
                  <country-flag
                    class="regionFlag"
                    is-region-flag="true"
                    :country-code="getCountryCode(trainer.country)"
                    :region-code="getRegionCode(trainer.region)"
                    width="1.5rem"
                  ></country-flag>
                  <span class="trainerRegion">
                    {{ trainer.region }}
                  </span>
                </div>

                <div class="trainerAge__wrapper">
                  Возраст:&nbsp;{{ getAgeFromBirthdate(trainer.birth_date) }}
                </div>

                <div
                  v-if="trainer.disciplines.length"
                  class="trainerDisciplines__wrapper"
                >
                  Дисциплины:&nbsp;
                  {{
                    trainer.disciplines
                      .map(
                        (disciplineName) =>
                          getDisciplineCode(disciplineName) || disciplineName
                      )
                      .join(", ")
                  }}
                </div>
              </div>
            </div>
          </div>

          <div class="trainerAdditionalInfo__wrapper">
            <div v-if="trainer.trainer_id" class="trainerAdditionalInfo__group">
              <b> FFR-ID: </b>
              <span> {{ trainer.trainer_id }}</span>
            </div>
            <div v-if="trainer.socials" class="socials">
              <a
                class="socials__link"
                v-if="trainer.socials.vk"
                :href="trainer.socials.vk"
                target="_blank"
              >
                <socials-vk-icon class="socials__link__icon"></socials-vk-icon>
              </a>
              <a
                class="socials__link"
                v-if="trainer.socials.telegram"
                :href="trainer.socials.telegram"
                target="_blank"
              >
                <socials-telegram-icon
                  class="socials__link__icon"
                ></socials-telegram-icon>
              </a>
            </div>
          </div>

          <div class="trainer__menu">
            <button
              @click="bottomMenu = 'team'"
              class="trainer__menu__item"
              type="button"
            >
              Команда
            </button>
            <button
              @click="bottomMenu = 'seminars'"
              class="trainer__menu__item"
              type="button"
            >
              Семинары
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="trainerPage__bottom">
      <div v-if="bottomMenu === 'team'" class="trainerBottomSection__wrapper">
        <div class="trainerTeam__header">Команда</div>

        <div class="trainerTeam__list">
          <athlete-list-item
            v-for="(athlete, idx) in team"
            :key="athlete.rus_code"
            :athlete="athlete"
            :idx="idx"
          ></athlete-list-item>
        </div>
      </div>
      <div
        v-if="bottomMenu === 'seminars'"
        class="trainerBottomSection__wrapper"
      >
        <div class="trainerTeam__header">Семинары</div>

        <trainer-seminars-list :trainer_id="trainer_id"></trainer-seminars-list>
      </div>
    </div>
  </div>
</template>

<script>
import SocialsVkIcon from "@/components/icons/socials-vk-icon.vue";
import AthletePhotoFillerIcon from "@/assets/svg/athletePhotoFiller-icon.vue";
import CountryFlag from "@/components/ui-components/country-flag.vue";
import SocialsTelegramIcon from "@/components/icons/socials-telegram-icon.vue";
import EditButton from "@/components/ui-components/edit-button.vue";
import { mdiImage } from "@mdi/js";
import {
  formatBirthDate,
  getAgeFromBirthdate,
  getAthleteName,
} from "@/utils/data-formaters";
import { getCountryCode } from "@/store/data/countries";
import { getDisciplineCode, sports } from "@/store/data/sports";
import { getRegionCode } from "@/store/data/russia-regions";
import axios from "axios";
import { databaseUrl, uploadsFolderUrl } from "@/store/constants";
import AthleteListItem from "@/pages/athletes/athlete-listItem.vue";
import TrainerSeminarsList from "@/pages/trainers/trainer-page/trainerSeminars-list.vue";
import { capitalizeString } from "@/utils/capitalizeString";
import BgMountains from "@/assets/riv/bg-mountains.vue";

export default {
  name: "index",
  props: ["trainer_id"],
  components: {
    BgMountains,
    TrainerSeminarsList,
    AthleteListItem,
    EditButton,
    SocialsTelegramIcon,
    CountryFlag,
    AthletePhotoFillerIcon,
    SocialsVkIcon,
  },
  data() {
    return {
      trainer: null,
      team: [],

      loadingState: false,
      updateTimeoutId: null,
      bottomMenu: "team",

      imageFillerIcon: mdiImage,
    };
  },
  computed: {
    uploadsFolderUrl() {
      return uploadsFolderUrl;
    },
    sports() {
      return sports;
    },
  },
  methods: {
    capitalizeString,
    getAthleteName,
    formatBirthDate,
    getAgeFromBirthdate,
    getCountryCode,
    getDisciplineCode,
    getRegionCode,
    async getTrainerByCode(id) {
      try {
        const response = await axios.get(`${databaseUrl}/trainers/${id}`);

        if (response.status === 200) {
          const trainerData = response.data.trainer;
          if (trainerData) this.trainer = { ...trainerData };
        }

        this.loadingState = false;

        await this.getTrainerTeam(id);
      } catch (err) {
        if (err) {
          console.error(err);
        }
        this.loadingState = false;
      }
    },
    async getTrainerTeam(id) {
      try {
        const response = await axios.get(
          `${databaseUrl}/trainers/${id}/athletes`
        );

        if (response.status === 200) {
          const trainerTeam = response.data["athletes"];
          if (trainerTeam.length) this.team = [...trainerTeam];
        }
      } catch (err) {
        if (err) {
          console.error(err);
        }
      }
    },
  },

  mounted() {
    if (this.$route.params.trainer_id) {
      try {
        this.loadingState = true;
        this.getTrainerByCode(this.$route.params.trainer_id);
      } catch (e) {
        this.loadingState = false;
        throw new Error(e);
      }
    }
  },
};
</script>

<style scoped lang="scss">
.trainerPage__wrapper {
  position: relative;
  flex: 1 1 0;
  display: flex;
  flex-direction: column;

  .trainerPage__top {
    position: relative;
    isolation: isolate;
    flex: 0 0 400px;
    display: flex;
    justify-content: center;
    padding: var(--padd-entityPage-top);

    @media screen and (max-width: 640px) {
      flex-basis: auto;
    }
    .mountains_bg {
      position: absolute;
      z-index: 1;
      top: 0;
      width: 100%;
      height: 100%;
    }
    .trainerCard__wrapper {
      position: relative;
      z-index: 2;
      display: flex;
      flex-wrap: wrap;
      max-width: var(--desktop-small);
      width: 100%;
      margin: 16px 16px;

      color: var(--text-contrast);

      &::before {
        position: absolute;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(2, 2, 6, 0.6);
        backdrop-filter: blur(5px);
        border: 1px solid rgb(255, 255, 255);
        box-shadow: 0 0 6px -2px rgb(255, 255, 255) inset,
          0 16px 32px 0 rgba(12, 14, 46, 0.48),
          -4px -8px 24px 0 rgba(255, 255, 255, 0.14) inset;
        border-radius: 12px;

        content: "";
      }
      .trainerCard__content {
        flex: 1 1 0;
        display: flex;
        flex-direction: column;
        padding: var(--padd-entityPage-card);

        .trainerCard__mainInfo {
          flex: 1 1 auto;
          position: relative;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 1rem;
          border-bottom: 1px solid var(--text-contrast);

          .trainerPhoto__wrapper {
            position: relative;
            flex: 0 0 auto;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: center;

            width: 200px;
            height: 200px;
            background-color: var(--background--image);
            border: 2px solid var(--text-contrast);
            border-radius: 50%;

            .trainerPhoto {
              flex: 1 1 0;
              max-width: 100%;
              max-height: 100%;
              border-radius: 50%;
            }
            .trainerPhotoFiller__icon {
              width: 192px;
              color: var(--text-default);
            }
            .edit__button {
              position: absolute;
              bottom: 0;
              right: 0;
            }

            @media screen and (max-width: 1200px) {
              width: 160px;
              height: 160px;
            }
            @media screen and (max-width: 900px) {
              width: 144px;
              height: 144px;
            }
            @media screen and (max-width: 720px) {
              width: 120px;
              height: 120px;
            }
            @media screen and (max-width: 480px) {
              width: 100px;
              height: 100px;
            }
          }
          .trainerMainInfo__wrapper {
            position: relative;
            flex: 1 1 0;
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
            margin-left: 1.25rem;

            .trainerMainInfo__header {
              display: flex;
              flex-wrap: wrap;
              align-items: flex-start;
              gap: 0.5rem 1rem;
              margin-bottom: 0.75rem;

              .federation__wrapper {
                flex: 1 1 0;
                display: flex;
                align-items: center;
                font-size: 1.1rem;

                img {
                  height: 2rem;
                  margin-right: 1rem;
                }
              }
              .trainerSport {
                flex: 0 0 auto;
                display: flex;
                align-items: center;
                font-size: 1.2rem;
                margin-left: auto;

                .countryFlag {
                  margin-left: 1rem;
                }
              }
            }
            .trainerMainInfo__nameLine {
              display: flex;
              flex-wrap: wrap;
              gap: 0.75rem 1rem;
              margin-left: 0.5rem;

              .trainerName__wrapper {
                flex: 1 1 auto;
                display: flex;
                flex-direction: column;

                .trainerName {
                  margin-bottom: 0.5rem;
                  font-size: 1.5rem;
                  font-weight: bold;
                }
                .trainerRank {
                  color: var(--text-muted);
                }
              }
              .trainerPosition__wrapper {
                flex: 0 1 auto;
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                margin-left: auto;

                .nationalTeamLogo__wrapper {
                  flex: 0 0 auto;
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  margin-left: auto;
                  white-space: nowrap;

                  .nationalTeamLogo {
                    height: 1.25rem;
                  }
                }
                .trainerPositions {
                  flex: 0 0 auto;
                  display: flex;
                  flex-direction: column;
                  align-items: flex-end;
                  margin-top: auto;
                  color: var(--text-muted);

                  .trainerPosition__item {
                    flex: 0 0 auto;
                  }
                }
              }
            }
            .trainerMainInfo__bottom {
              display: flex;
              align-items: flex-end;
              flex-wrap: wrap;
              margin-top: auto;

              .trainerRegionInfo__wrapper {
                flex: 1 0 auto;
                display: flex;
                align-items: center;
                font-size: 1.25rem;
                margin-right: 0.5rem;

                .regionFlag {
                  margin-right: 0.5rem;
                }
                .trainerRegion {
                  display: flex;
                  flex-wrap: wrap;
                  gap: 4px;
                }
              }

              .trainerAge__wrapper {
                flex: 5 0 auto;
                align-self: flex-end;
                display: flex;
              }

              .trainerDisciplines__wrapper {
                display: flex;
                margin-left: auto;
              }
            }
          }
        }

        .trainerAdditionalInfo__wrapper {
          position: relative;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          font-size: 0.9rem;

          .trainerAdditionalInfo__group {
            flex: 0 0 auto;
            display: flex;
            gap: 8px;
            flex-wrap: nowrap;

            b {
              display: inline-block;
              white-space: nowrap;
              overflow: hidden;
            }
            span {
              display: inline-block;
              flex: 1 1 0;
              white-space: nowrap;
            }
          }

          .socials {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-left: auto;
            padding-left: 1rem;

            .socials__link {
              display: flex;
              align-items: center;
              .socials__link__icon {
                height: 2rem;
                color: var(--text-contrast);
              }
            }
          }

          @media screen and (max-width: 900px) {
            max-height: none;
          }
        }
        .trainer__menu {
          position: relative;
          display: flex;
          gap: 2rem;
          padding: 8px;
          border-top: 1px solid var(--text-contrast);

          button {
            margin: 0 auto;
            font-size: 1.1rem;
            color: var(--text-contrast);
            opacity: 0.8;
            transition: opacity 120ms;

            &:hover {
              opacity: 1;
            }
          }
        }
      }

      @media screen and (max-width: 640px) {
        margin: 0;
        width: 100%;
        backdrop-filter: blur(12px);

        &::before {
          border-radius: 0;
          border: none;
          box-shadow: none;
        }
      }
    }
  }

  .trainerPage__bottom {
    flex: 1 1 300px;
    display: flex;
    flex-direction: column;
    max-width: var(--desktop-small);
    width: 100%;
    margin: 2rem auto 1rem;
    padding: 0 2rem;

    .trainerBottomSection__wrapper {
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      height: 100%;
      background-color: var(--background--card);
      backdrop-filter: blur(3px);
      border-radius: 4px;

      .trainerTeam__header {
        flex: 0 0 auto;
        padding: 8px 12px;
        font-size: 1.1rem;
        font-weight: bold;
      }
      .trainerTeam__list {
        flex: 1 1 200px;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        border-radius: 2px;
      }
    }

    @media screen and (max-width: 720px) {
      margin: 0;
      padding: 0;

      .trainerBottomSection__wrapper {
        border-radius: 0;
      }
    }
  }
}
</style>
