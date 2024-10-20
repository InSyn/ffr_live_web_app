<script>
import { mapActions } from "vuex";
import { uploadsFolderUrl } from "@/store/constants";
import { formatDate } from "@/utils/data-formaters";
import CountryFlag from "@/components/ui-components/country-flag.vue";
import { getRegionCode } from "@/store/data/russia-regions";
import { getCountryCode } from "@/store/data/countries";

export default {
  name: "index",
  components: { CountryFlag },
  computed: {
    uploadsFolderUrl() {
      return uploadsFolderUrl;
    },
  },
  props: {
    event_id: String,
  },
  data() {
    return {
      event: null,
      loading: true,
    };
  },
  methods: {
    getCountryCode,
    getRegionCode,
    formatDate,
    ...mapActions("events", {
      loadEvent: "LOAD_EVENT_BY_ID",
    }),
    async loadEventData() {
      this.loading = true;
      try {
        const eventData = await this.loadEvent(this.event_id);
        if (eventData) {
          this.event = eventData;
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
  },

  mounted() {
    this.loadEventData();
  },
};
</script>

<template>
  <div class="eventOnlineRegistration__page">
    <div v-if="event" class="eventOnlineRegistration__wrapper">
      <h3 class="eventOnlineRegistration__body__title">Онлайн заявка</h3>
      <div class="eventOnlineRegistration__body__body">
        <div class="eventData__wrapper">
          <div class="eventImage__wrapper">
            <img
              :src="uploadsFolderUrl + event.logo_image_url"
              alt="EVENT_IMG"
              height="80px"
            />
          </div>
          <div class="eventInfo__wrapper">
            <div class="eventInfo__top">
              <div class="eventInfo__title">{{ event.title }}</div>
              <div class="eventInfo__sport">
                <country-flag
                  :country-code="getCountryCode(event.country)"
                  :region-code="getRegionCode(event.region)"
                  height="1rem"
                  rounding="2px"
                ></country-flag>
                {{ event.sport }}
              </div>
            </div>
            <div class="eventInfo__middle">
              <div class="eventInfo__discipline">{{ event.discipline }}</div>
              <div class="eventInfo__code">{{ event.calendar_code }}</div>
            </div>
            <div class="eventInfo__bottom">
              <div class="eventInfo__region">
                {{ [event.region, event.location].join(", ") }}
              </div>
              <div class="eventInfo__date">
                {{ formatDate(event.start_at) }}
              </div>
            </div>
          </div>
        </div>
        <div class="registrationAthletes__wrapper">
          <div class="registrationAthletes__groups__wrapper">
            <div class="registrationAthletes__groups__title">Группы</div>
            <div class="registrationAthletes__groups__body"></div>
          </div>
          <div class="registrationAthletes__availableAthletes__wrapper">
            <div class="registrationAthletes__availableAthletes__title">
              Спортсмены
            </div>
            <div class="registrationAthletes__availableAthletes__body"></div>
          </div>
        </div>
        <div class="attachedDocuments__wrapper">DOCUMENTS</div>
        <div class="registrationStats__wrapper">STATS</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.eventOnlineRegistration__page {
  padding: var(--padd-page);

  .eventOnlineRegistration__wrapper {
    display: flex;
    flex-direction: column;
    max-width: var(--tablet-default);
    margin: 2rem auto;
    padding: var(--padd-entityPage-card);

    background-color: var(--background--card);
    border-radius: 4px;

    .eventOnlineRegistration__body__title {
      flex: 0 0 auto;
    }

    .eventOnlineRegistration__body__body {
      flex: 0 0 auto;
      display: flex;
      flex-direction: column;
      padding: 0.25rem;
      border-top: 1px solid var(--background--primary-hover);
      border-bottom: 1px solid var(--background--primary-hover);

      .eventData__wrapper {
        flex: 0 0 auto;
        display: flex;
        flex-wrap: nowrap;
        gap: 0 1.25rem;
        margin-bottom: 1.25rem;
        padding: 0.25rem;

        .eventImage__wrapper {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 4px;
          height: 80ox;
          img {
            display: block;
            max-height: 100%;
            max-width: 100%;
          }
        }
        .eventInfo__wrapper {
          flex: 1 1 200px;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;

          .eventInfo__top {
            flex: 0 0 auto;
            display: flex;
            gap: 1.25rem;
            flex-wrap: nowrap;
            font-weight: bold;

            .eventInfo__title {
              flex: 1 1 0;
            }
            .eventInfo__sport {
              flex: 0 0 auto;
              display: flex;
              flex-wrap: nowrap;
              gap: 0.5rem;
            }
          }
          .eventInfo__middle {
            display: flex;
            .eventInfo__discipline {
              flex: 1 0 0;
            }
            .eventInfo__code {
              flex: 0 0 auto;
            }
          }
          .eventInfo__bottom {
            display: flex;
            .eventInfo__region {
              flex: 1 0 0;
            }
            .eventInfo__date {
              flex: 0 0 auto;
            }
          }
        }
      }

      .registrationAthletes__wrapper {
        flex: 1 1 200px;
        display: flex;
        flex-wrap: wrap;
        gap: 1.25rem 0.75rem;
        padding: 0.5rem;

        .registrationAthletes__groups__wrapper {
          flex: 1 1 150px;
          display: flex;
          flex-direction: column;

          .registrationAthletes__groups__title {
            flex: 0 0 auto;
            margin: 0 0.75rem 0.5rem;
          }
          .registrationAthletes__groups__body {
          }
        }
        .registrationAthletes__availableAthletes__wrapper {
          flex: 1 1 150px;
          display: flex;
          flex-direction: column;
          border-left: 1px solid var(--background--primary-hover);

          .registrationAthletes__availableAthletes__title {
            flex: 0 0 auto;
            margin: 0 0.75rem 0.5rem;
          }
          .registrationAthletes__availableAthletes__body {
          }
        }
      }
      .attachedDocuments__wrapper {
        flex: 0 0 auto;
        padding: 0.25rem;
        border-top: 1px solid var(--background--primary-hover);
      }
      .registrationStats__wrapper {
        flex: 0 0 auto;
        padding: 0.25rem;
        border-top: 1px solid var(--background--primary-hover);
      }
    }
  }
}
</style>
