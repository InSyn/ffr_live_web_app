<template>
  <div v-if="organization" class="organizationPage__wrapper">
    <div class="organizationCard__top__wrapper">
      <bg-mountains class="mountains_bg"></bg-mountains>

      <div class="organizationCard__top__content">
        <div class="organizationInfo__wrapper">
          <div class="organizationInfo__header">
            <div class="organizationImage__wrapper">
              <img
                v-if="organization['logo_url']"
                class="organizationImage"
                :src="uploadsFolderUrl + `${organization['logo_url']}`"
                alt="Event Logo"
              />
              <competition-image-filler-icon
                v-else
                class="imageFiller__icon"
              ></competition-image-filler-icon>

              <edit-button
                class="editOrganization__button"
                type="organization"
                :code="org_id"
              ></edit-button>
            </div>

            <div class="organizationMainInfo__wrapper">
              <div class="organizationMainInfo__top">
                <div
                  class="organizationFederation__wrapper"
                  v-if="
                    organization['sport'] &&
                    organization['sport'].toLowerCase() === 'фристайл'
                  "
                >
                  <img
                    class="athleteFederation__logo"
                    src="../../../assets/logo/FFR_logo_mini.png"
                    alt="FFR_logo"
                  />
                  <span>Федерация фристайла России</span>
                </div>
                <div
                  class="organizationFederation__wrapper"
                  v-if="
                    organization['sport'] &&
                    organization['sport'].toLowerCase() === 'сноуборд'
                  "
                >
                  <img
                    class="athleteFederation__logo"
                    src="../../../assets/logo/FSR_logo_mini.png"
                    alt="FSR_logo"
                  />
                  <span>Федерация сноуборда России</span>
                </div>
                <div class="organizationSport">
                  {{ organization.sport }}
                  <country-flag
                    class="countryFlag"
                    :country-code="getCountryCode(organization.country)"
                    height="1.25rem"
                  ></country-flag>
                </div>
              </div>

              <div class="organizationTitle__wrapper">
                <div class="organizationName">
                  {{ organization.title }}
                </div>
              </div>

              <div class="organizationInfo__secondLine">
                <div class="organizationRegionInfo__wrapper">
                  <country-flag
                    class="regionFlag"
                    is-region-flag="true"
                    :country-code="getCountryCode(organization.country)"
                    :region-code="getRegionCode(organization.region)"
                    height="1.25rem"
                  ></country-flag>
                  {{ organization.region }}
                </div>
                <div class="organizationContacts__wrapper">
                  <div
                    v-for="(contact, idx) in organization.contacts"
                    :key="idx"
                    class="organizationContacts__item"
                  >
                    {{ contact }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="organizationAdditionalInfo__wrapper">
            <div class="socials">
              <span>Социальные сети:</span>
              <a
                class="socials__link"
                v-if="organization.socials.vk"
                :href="organization.socials.vk"
                target="_blank"
              >
                <socials-vk-icon class="socials__link__icon"></socials-vk-icon>
              </a>
              <a
                class="socials__link"
                v-if="organization.socials.telegram"
                :href="organization.socials.telegram"
                target="_blank"
              >
                <socials-telegram-icon
                  class="socials__link__icon"
                ></socials-telegram-icon>
              </a>
            </div>
          </div>
          <div class="organization__menu">
            <button class="organization__menu__item" type="button">
              Команда
            </button>
            <button class="organization__menu__item" type="button" disabled>
              Заявки
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="organizationCard__bottom">
      <div class="organizationTeam__wrapper">
        <div class="organizationTeam__header">Команда</div>

        <div class="organizationTeam__list">
          <athlete-list-item
            v-for="(athlete, idx) in team"
            :key="idx"
            :athlete="athlete"
            :idx="idx"
          ></athlete-list-item>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SocialsVkIcon from "@/components/icons/socials-vk-icon.vue";
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
import { getDisciplineCode } from "@/store/data/sports";
import { getRegionCode } from "@/store/data/russia-regions";
import axios from "axios";
import { databaseUrl, uploadsFolderUrl } from "@/store/constants";
import CompetitionImageFillerIcon from "@/assets/svg/competitionImageFiller-icon.vue";
import AthleteListItem from "@/pages/athletes/athlete-listItem.vue";
import BgMountains from "@/assets/riv/bg-mountains.vue";

export default {
  name: "index",
  props: ["org_id"],
  components: {
    BgMountains,
    AthleteListItem,
    CompetitionImageFillerIcon,
    EditButton,
    SocialsTelegramIcon,
    CountryFlag,
    SocialsVkIcon,
  },
  data() {
    return {
      organization: null,
      team: [],

      loadingState: false,
      updateTimeoutId: null,

      imageFillerIcon: mdiImage,
    };
  },
  computed: {
    uploadsFolderUrl() {
      return uploadsFolderUrl;
    },
  },
  methods: {
    getAthleteName,
    formatBirthDate,
    getAgeFromBirthdate,
    getCountryCode,
    getDisciplineCode,
    getRegionCode,
    async getOrganizationById(id) {
      try {
        const response = await axios.get(`${databaseUrl}/organizations/${id}`);

        if (response.status === 200) {
          const organizationData = response.data["organization"];
          if (organizationData) this.organization = { ...organizationData };
        }

        this.loadingState = false;

        await this.getOrganizationTeam(id);
      } catch (err) {
        if (err) {
          console.error(err);
        }
        this.loadingState = false;
      }
    },
    async getOrganizationTeam(id) {
      try {
        const response = await axios.get(
          `${databaseUrl}/organizations/${id}/athletes`
        );

        if (response.status === 200) {
          const organizationTeam = response.data["athletes"];
          if (organizationTeam.length) this.team = [...organizationTeam];
        }
      } catch (err) {
        if (err) {
          console.error(err);
        }
      }
    },
  },

  mounted() {
    if (this.$route.params.org_id) {
      try {
        this.loadingState = true;
        this.getOrganizationById(this.$route.params.org_id);
      } catch (e) {
        this.loadingState = false;
        throw new Error(e);
      }
    }
  },
};
</script>

<style scoped lang="scss">
.organizationPage__wrapper {
  position: relative;
  flex: 1 1 0;
  display: flex;
  flex-direction: column;

  .organizationCard__top__wrapper {
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
    .organizationCard__top__content {
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
      .organizationInfo__wrapper {
        position: relative;
        flex: 1 1 0;
        display: flex;
        flex-direction: column;
        padding: var(--padd-entityPage-card);

        .organizationInfo__header {
          flex: 1 1 auto;
          position: relative;
          display: flex;
          gap: 1.5rem;
          padding: 1rem;
          border-bottom: 1px solid var(--text-contrast);

          .organizationImage__wrapper {
            position: relative;
            flex: 0 0 auto;
            display: flex;
            flex-wrap: wrap;
            align-items: flex-start;
            justify-content: center;

            width: 180px;
            height: 180px;

            .organizationImage {
              flex: 1 1 0;
              max-width: 100%;
              max-height: 100%;
            }
            .imageFiller__icon {
              width: 192px;
              color: var(--text-default);
            }
            .editOrganization__button {
              position: absolute;
              bottom: 0;
              right: 0;
            }

            @media screen and (max-width: 1200px) {
              width: 148px;
              height: 148px;
            }
            @media screen and (max-width: 900px) {
              width: 120px;
              height: 120px;
            }
            @media screen and (max-width: 720px) {
              width: 98px;
              height: 98px;
            }
            @media screen and (max-width: 480px) {
              width: 86px;
              height: 86px;
            }
          }
          .organizationMainInfo__wrapper {
            flex: 1 1 0;
            display: flex;
            flex-direction: column;
            gap: 1.75rem;

            .organizationMainInfo__top {
              display: flex;
              align-items: flex-start;

              .organizationFederation__wrapper {
                display: flex;
                align-items: center;
                font-size: 1.1rem;

                .athleteFederation__logo {
                  height: 2rem;
                  margin-right: 1rem;
                }
              }
              .organizationSport {
                flex: 0 0 auto;
                display: flex;
                align-items: center;
                margin-left: auto;
                font-size: 1.2rem;

                .countryFlag {
                  margin-left: 0.5rem;
                }
              }
            }
            .organizationTitle__wrapper {
              flex: 0 0 auto;
              display: flex;
              align-items: center;
              margin-left: 0.5rem;

              .organizationName {
                font-size: 1.5rem;
                font-weight: bold;
                text-wrap: balance;
              }
            }
            .organizationInfo__secondLine {
              display: flex;
              flex-wrap: wrap;
              align-items: flex-start;
              gap: 1rem;
              margin-top: auto;
              padding: 8px;

              .organizationRegionInfo__wrapper {
                display: flex;
                align-items: center;
                font-size: 1.25rem;
                font-weight: 300;

                .regionFlag {
                  margin-right: 0.5rem;
                }
              }
              .organizationContacts__wrapper {
                display: flex;
                flex-direction: column;
                margin-left: auto;

                .organizationContacts__item {
                  flex: 0 0 auto;
                  font-weight: 300;
                }
              }
            }
          }
        }

        .organizationAdditionalInfo__wrapper {
          display: flex;
          gap: 1rem;
          padding: 1rem;

          .socials {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-left: auto;
            font-size: 1.1rem;
            font-weight: 300;

            .socials__link {
              display: flex;
              align-items: center;
              .socials__link__icon {
                height: 2rem;
                color: var(--text-contrast);
              }
            }
          }
        }
        .organization__menu {
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
          button[disabled] {
            font-weight: 300;
            color: var(--text-muted);
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

  .organizationCard__bottom {
    flex: 1 1 300px;
    display: flex;
    flex-direction: column;
    max-width: var(--desktop-small);
    width: 100%;
    margin: 2rem auto 1rem;
    padding: 0 2rem;

    .organizationTeam__wrapper {
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      height: 100%;
      background-color: var(--background--card);
      backdrop-filter: blur(3px);
      border-radius: 4px;

      .organizationTeam__header {
        flex: 0 0 auto;
        padding: 8px 12px;
        font-size: 1.1rem;
        font-weight: bold;
      }
      .organizationTeam__list {
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

      .organizationTeam__wrapper {
        border-radius: 0;
      }
    }
  }
}
</style>
