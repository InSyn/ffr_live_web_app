<template>
  <div v-if="athlete" class="athletePage__wrapper">
    <div class="athleteCard__top__wrapper">
      <bg-mountains class="mountains_bg"></bg-mountains>

      <div class="athleteCard__top__content">
        <div class="athleteInfo__wrapper">
          <div class="athleteInfo__header">
            <div class="athletePhoto__wrapper">
              <img v-if="athlete['photo_url']" class="athleteImage" :src="uploadsFolderUrl() + `${athlete['photo_url']}`" alt="Event Logo" />
              <athlete-photo-filler-icon v-else class="athletePhotoFiller__icon" :gender="athlete.gender"></athlete-photo-filler-icon>

              <edit-button class="editAthlete__button" type="athlete" :code="athlete_code"></edit-button>
            </div>
            <div class="athleteMainInfo__wrapper">
              <div class="athleteMainInfo__header">
                <div class="athleteFederation__wrapper">
                  <img class="athleteFederation__logo" src="../../../assets/logo/FFR_logo_mini.png" alt="FFR_logo" />
                  <span>Федерация фристайла России</span>
                </div>

                <div class="athleteSport">
                  {{ athlete.sport }}
                  <country-flag class="athleteCountryFlag" :country-code="getCountryCode(athlete['country'])" height="1.25rem"></country-flag>
                </div>
              </div>
              <div class="athleteMainInfo__middle">
                <div class="athleteName__wrapper">
                  <div class="athleteName">
                    {{ athlete.lastname + ' ' + athlete.name }}
                  </div>

                  <div class="nationalTeamLogo__wrapper" v-if="athlete['is_national_team']">
                    Сборная России
                    <img class="nationalTeamLogo" src="../../../assets/logo/okr.png" alt="NT_Logo" />
                  </div>
                </div>

                <athlete-medals :medals="athlete['medals']"></athlete-medals>
              </div>
              <div class="athleteMainInfo__bottom">
                <div class="athleteRegions__wrapper">
                  <div class="athleteRegions__flags">
                    <country-flag
                      class="regionFlag"
                      v-for="(region, idx) in athlete['regions']"
                      :key="idx"
                      is-region-flag="true"
                      :country-code="getCountryCode(athlete.country)"
                      :region-code="getRegionCode(region)"
                      width="calc(8px + 1rem)"
                      rounding="2px"
                    ></country-flag>
                  </div>
                  <div class="athleteRegions">
                    <span>
                      {{ athlete.regions.join(', ') }}
                    </span>
                  </div>
                </div>
                <div v-if="athlete.trainer" class="athleteTrainer">
                  <router-link
                    v-if="athlete?.trainer?.trainer_id"
                    class="athleteTrainer__link"
                    :to="{
                      name: 'trainerPage',
                      params: { trainer_id: athlete.trainer.trainer_id },
                    }"
                  >
                    Тренер:&nbsp; {{ athlete.trainer?.fullname }}
                  </router-link>
                  <span v-else> Тренер:&nbsp; {{ athlete.trainer?.fullname }} </span>
                </div>
              </div>
            </div>
          </div>

          <div class="athleteAdditionalInfo__wrapper">
            <div class="athleteAdditionalInfoSection mainSection">
              <div v-if="athlete.ffr_id" class="athleteInfo__group">
                <b> FFR-ID: </b>
                <span> {{ athlete.ffr_id }}</span>
              </div>
              <div v-if="athlete.birth_date" class="athleteInfo__group">
                <b> Год рождения: </b>
                <span>
                  {{ new Date(Date.parse(athlete.birth_date)).getFullYear() }}
                </span>
              </div>
              <div v-if="athlete.gender" class="athleteInfo__group">
                <b> Пол: </b>
                <span> {{ athlete.gender.toUpperCase()[0] }}</span>
              </div>
              <div v-if="athlete.category" class="athleteInfo__group">
                <b> Разряд: </b>
                <span> {{ athlete.category }}</span>
              </div>
              <div v-if="athlete.organizations.length" class="athleteInfo__group">
                <b> Школа: </b>
                <div class="organizations__wrapper">
                  <span v-for="(org, idx) in athlete.organizations" :key="idx">
                    {{ org }}
                  </span>
                </div>
              </div>
              <div v-if="athlete.disciplines.length" class="athleteInfo__group">
                <b> Дисциплины: </b>
                <div class="disciplines__wrapper">
                  {{ athlete.disciplines.map((disciplineName) => getDisciplineCode(disciplineName) || disciplineName).join(', ') }}
                </div>
              </div>
            </div>
            <div class="athleteAdditionalInfoSection secondarySection">
              <div v-if="athlete.education" class="athleteInfo__group">
                <b> Образование: </b>
                <span> {{ athlete.education }}</span>
              </div>
              <div v-if="athlete.hobbies.length" class="athleteInfo__group">
                <b> Хобби: </b>
                <div class="athleteHobbies__wrapper">
                  {{ athlete.hobbies.join(', ') }}
                </div>
              </div>
              <!--              <div v-if="athlete.athleteAbout" class="athleteInfo__group">-->
              <!--                <b> О себе: </b>-->
              <!--                <span> {{ athlete.athleteAbout }}</span>-->
              <!--              </div>-->
            </div>
            <div class="athleteAdditionalInfoSection equipmentSection">
              <div v-if="athlete.equipment.length" class="athleteInfo__group">
                <div class="athleteEquipment__wrapper">
                  <div class="athleteEquipment__item" v-for="(equipment, equip_idx) in athlete.equipment" :key="equip_idx">
                    {{ equipment }}
                  </div>
                </div>
              </div>
            </div>
            <div class="athleteAdditionalInfoSection aboutSection">
              <div v-if="athlete.athleteAbout" class="athleteInfo__group">
                <b> О себе: </b>
                <span> {{ athlete.athleteAbout }}</span>
              </div>
            </div>
          </div>

          <div class="athleteSocials__section">
            <div class="sponsors__wrapper">
              <div class="sponsors__header">Спонсоры:&nbsp;</div>
              <div class="sponsor__item__wrapper" v-for="(sponsor, idx) in athlete['sponsors']" :key="idx">
                <a class="sponsor__item" :href="sponsor['sponsor_link']" target="_blank">
                  <img class="sponsorLogo__image" :alt="`sponsor${idx}_logo`" :src="uploadsFolderUrl() + sponsor['logo_url']" />
                </a>
              </div>
            </div>
            <div class="socials">
              <a class="socials__link" v-if="athlete.socials.vk" :href="athlete.socials.vk" target="_blank">
                <socials-vk-icon class="socials__link__icon"></socials-vk-icon>
              </a>
              <a class="socials__link" v-if="athlete.socials.telegram" :href="athlete.socials.telegram" target="_blank">
                <socials-telegram-icon class="socials__link__icon"></socials-telegram-icon>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="athleteCard__bottom">
      <div class="athleteCompetitions__wrapper">
        <div class="athleteCompetitions__title">Соревнования участника</div>

        <div class="athleteCompetitions__list">
          <athlete-event-item
            v-for="(event, i) in athleteCompetitions"
            :key="event._id"
            :event="event"
            :competitions="athleteCompetitions"
            :index="i"
            :athlete-code="athlete_code"
          ></athlete-event-item>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { apiUrl, backendRootUrl } from '@/constants';
import { mdiImage } from '@mdi/js';
import AthletePhotoFillerIcon from '@/assets/svg/athletePhotoFiller-icon.vue';
import CountryFlag from '@/components/ui-components/country-flag.vue';
import AthleteEventItem from '@/pages/athletes/athlete-page/athleteEventItem.vue';
import { getRegionCode } from '@/store/data/russia-regions';
import { getDisciplineCode } from '@/store/data/sports';
import SocialsVkIcon from '@/components/icons/socials-vk-icon.vue';
import SocialsTelegramIcon from '@/components/icons/socials-telegram-icon.vue';
import EditButton from '@/components/ui-components/edit-button.vue';
import AthleteMedals from '@/pages/athletes/athlete-page/athleteMedals.vue';
import { getShortAthleteRank } from '@/store/data/sport-data-sets';
import BgMountains from '@/assets/riv/bg-mountains.vue';
import { getCountryCode } from '@/store/data/countries';

export default {
  name: 'index',
  props: ['athlete_code'],
  components: {
    BgMountains,
    AthleteMedals,
    EditButton,
    SocialsTelegramIcon,
    SocialsVkIcon,
    AthleteEventItem,
    CountryFlag,
    AthletePhotoFillerIcon,
  },
  data() {
    return {
      athlete: null,
      athleteCompetitions: [],

      athleteIsLoading: false,
      updateTimeoutId: null,

      imageFillerIcon: mdiImage,
    };
  },
  methods: {
    getCountryCode,
    getShortAthleteRank,
    getDisciplineCode,
    getRegionCode,
    async getAthleteById(id) {
      try {
        const data = await axios.get(apiUrl + '/athletes/' + id);
        console.log(data);
        if (data.status === 200) {
          const eventData = data.data.data;
          if (eventData) this.athlete = { ...eventData };
        }
        await this.getAthleteCompetitions();

        this.athleteIsLoading = false;
      } catch (err) {
        if (err) {
          console.error(err);
        }
        this.athleteIsLoading = false;
      }
    },
    async getAthleteCompetitions() {
      try {
        const response = await axios.get(apiUrl + `/athletes/${this.athlete_code}/competitions`);
        if (response.status === 200) {
          this.athleteCompetitions = response.data.events;
        }
      } catch (err) {
        if (err) {
          this.errors.push(err.response.data.message);
        }
      }
    },

    uploadsFolderUrl() {
      return backendRootUrl;
    },
  },
  mounted() {
    console.log(this.$route);
    if (this.$route.params.athlete_code) {
      try {
        this.athleteIsLoading = true;
        this.getAthleteById(this.$route.params.athlete_code);
      } catch (e) {
        this.athleteIsLoading = false;
        throw new Error(e);
      }
    }
  },
};
</script>

<style scoped lang="scss">
.athletePage__wrapper {
  position: relative;
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  .athleteCard__top__wrapper {
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

    .athleteCard__top__content {
      z-index: 2;
      position: relative;
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
        box-shadow: 0 0 6px -2px rgb(255, 255, 255) inset, 0 16px 32px 0 rgba(12, 14, 46, 0.48), -4px -8px 24px 0 rgba(255, 255, 255, 0.14) inset;
        border-radius: 12px;

        content: '';
      }

      .athleteInfo__wrapper {
        position: relative;
        flex: 1 1 0;
        display: flex;
        flex-direction: column;
        padding: var(--padd-entityPage-card);

        .athleteInfo__header {
          flex: 1 1 auto;
          position: relative;
          display: flex;
          gap: 0.5rem 1rem;
          padding: 1rem;
          border-bottom: 1px solid var(--text-contrast);

          .athletePhoto__wrapper {
            position: relative;
            flex: 0 0 auto;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: center;

            height: 168px;
            aspect-ratio: 1;
            background-color: var(--background--image);
            border: 2px solid var(--text-contrast);
            border-radius: 50%;

            .athleteImage {
              flex: 1 1 0;
              max-width: 100%;
              max-height: 100%;
              border-radius: 50%;
            }

            .athletePhotoFiller__icon {
              height: 100%;
              aspect-ratio: 1;
              color: var(--text-default);
            }

            .editAthlete__button {
              position: absolute;
              bottom: 0;
              right: 0;
            }

            @media screen and (max-width: 1200px) {
              width: 144px;
              height: 144px;
            }
            @media screen and (max-width: 900px) {
              width: 122px;
              height: 122px;
            }
            @media screen and (max-width: 720px) {
              width: 108px;
              height: 108px;
            }
            @media screen and (max-width: 480px) {
              width: 96px;
              height: 96px;
            }
          }

          .athleteMainInfo__wrapper {
            flex: 1 1 0;
            display: flex;
            flex-direction: column;
            gap: 2rem 1.75rem;

            .athleteMainInfo__header {
              flex: 0 0 auto;
              display: flex;
              align-items: center;
              flex-wrap: wrap;
              gap: 0.5rem 1rem;

              .athleteFederation__wrapper {
                flex: 1 1 0;
                display: flex;
                align-items: center;
                font-size: 1.1rem;

                .athleteFederation__logo {
                  height: 2rem;
                  margin-right: 1rem;
                }
              }

              .athleteSport {
                flex: 0 0 auto;
                display: flex;
                align-items: center;
                margin-left: auto;
                font-size: 1.2rem;

                .athleteCountryFlag {
                  margin-left: 12px;
                }
              }
            }

            .athleteMainInfo__middle {
              flex: 0 0 auto;
              display: flex;
              margin-left: 0.75rem;

              .athleteName__wrapper {
                flex: 1 1 0;
                display: flex;
                flex-wrap: wrap;
                flex-direction: column;

                .athleteName {
                  flex: 0 0 auto;
                  font-size: 1.75rem;
                  font-weight: bold;
                }

                .nationalTeamLogo__wrapper {
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  font-size: 1rem;
                  white-space: nowrap;

                  .nationalTeamLogo {
                    height: 1.25rem;
                  }
                }
              }
            }

            .athleteMainInfo__bottom {
              flex: 0 0 auto;
              display: flex;
              align-items: center;
              flex-wrap: wrap;
              gap: 0.5rem 1.25rem;
              margin-top: auto;
              font-size: 1.1rem;

              .athleteRegions__wrapper {
                flex: 1 1 auto;
                display: flex;
                align-items: center;
                gap: 1rem;

                .athleteRegions__flags {
                  display: flex;
                  flex-wrap: nowrap;
                  gap: 0.5rem;
                }

                .athleteRegions {
                  flex: 1 1 auto;
                  display: flex;
                  flex-wrap: wrap;
                  gap: 4px;
                }
              }

              .athleteTrainer {
                flex: 0 0 auto;
                margin-left: auto;

                .athleteTrainer__link {
                  color: var(--text-contrast);

                  &:hover {
                    color: var(--text-contrast-hovered);
                    text-decoration: underline;
                  }
                }
              }
            }
          }
        }

        .athleteAdditionalInfo__wrapper {
          display: grid;
          grid-template-areas:
            'main secondary equipment'
            'about about about';
          grid-template-columns: 2fr 1fr auto;
          grid-gap: 0.75rem 1.25rem;
          padding: 0.75rem 1rem;

          .athleteAdditionalInfoSection {
            display: flex;
            flex-direction: column;
            gap: 0.25rem 0.5rem;
            font-size: 0.9rem;

            &.mainSection {
              grid-area: main;
              display: grid;
              grid-template-columns: auto auto;
              grid-auto-rows: min-content;
            }

            &.secondarySection {
              grid-area: secondary;
            }

            &.equipmentSection {
              grid-area: equipment;
              justify-self: flex-end;
            }
            &.aboutSection {
              grid-area: about;
            }

            .athleteInfo__group {
              flex: 0 1 auto;
              display: flex;
              flex-wrap: nowrap;
              gap: 8px;

              b {
                flex: 0 0 auto;
                display: inline-block;
                overflow: hidden;
                width: 11ch;
              }

              span {
                flex: 1 1 0;
                display: inline-block;
              }

              .organizations__wrapper {
                flex: 1 1 0;
                display: flex;
                flex-direction: column;
              }

              .disciplines__wrapper {
                flex: 1 1 0;
                display: flex;
                gap: 8px;

                span {
                  flex: 0 0 auto;
                }
              }

              .athleteHobbies__wrapper {
                display: flex;
                flex-direction: column;
                gap: 4px;

                .athleteHobbies__item {
                  flex: 0 0 auto;
                }
              }

              .athleteEquipment__wrapper {
                display: flex;
                flex-direction: column;
                gap: 0.5rem 1rem;

                .athleteEquipment__item {
                  flex: 0 0 auto;
                }

                @media screen and (max-width: 640px) {
                  flex-direction: row;
                }
              }
            }
          }

          @media screen and (max-width: 900px) {
            grid-template-areas:
              'main main equipment'
              'secondary secondary equipment';
          }
          @media screen and (max-width: 640px) {
            grid-template-areas:
              'main main main'
              'secondary secondary secondary'
              'equipment equipment equipment';
          }
        }

        .athleteSocials__section {
          display: flex;
          flex-wrap: nowrap;
          gap: 1.75rem;
          padding: 8px;
          border-top: 1px solid var(--text-contrast);

          .sponsors__wrapper {
            flex: 1 1 auto;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 0.5rem 0.75rem;

            .sponsors__header {
              flex: 0 0 auto;
              align-self: flex-start;
            }

            .sponsor__item__wrapper {
              flex: 1 0 auto;
              display: flex;
              max-width: 20%;
              min-width: fit-content;

              .sponsor__item {
                display: block;
                margin: 0 auto;

                .sponsorLogo__image {
                  display: block;
                  max-height: 32px;

                  @media screen and (max-width: 1200px) {
                    max-height: 24px;
                  }
                  @media screen and (max-width: 720px) {
                    max-height: 18px;
                  }
                  @media screen and (max-width: 480px) {
                    max-height: 16px;
                  }
                }
              }
            }
          }

          .socials {
            flex: 0 0 auto;
            display: flex;
            align-items: center;
            gap: 8px;
            padding-left: 1rem;
            border-left: 1px solid var(--text-contrast);

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

  .athleteCard__bottom {
    flex: 1 1 300px;
    display: flex;
    flex-direction: column;
    max-width: var(--desktop-small);
    width: 100%;
    margin: 0.75rem auto 0.5rem;
    padding: 0 2rem;

    .athleteCompetitions__wrapper {
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      height: 100%;
      background-color: var(--background--card);
      backdrop-filter: blur(3px);
      border-radius: 4px;

      .athleteCompetitions__title {
        flex: 0 0 auto;
        padding: 8px 12px;
        font-size: 1.1rem;
        font-weight: bold;
      }

      .athleteCompetitions__list {
        flex: 1 1 200px;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        border-radius: 2px;
      }
    }

    @media screen and (max-width: 640px) {
      margin: 0;
      padding: 0;
    }
  }
}
</style>
