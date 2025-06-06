<script>
import { formatDate } from '@/utils/data-formaters';
import axios from 'axios';
import { apiUrl } from '@/constants';
import { mapGetters } from 'vuex';

export default {
  name: 'reports-list',
  props: {
    organizationId: String,
    organizationRegion: String,
  },
  computed: {
    ...mapGetters('authorization', {
      userData: 'getUserData',
    }),
    isReportsOwner() {
      return this.userData.role === 'regional_organization' && this.userData.region === this.organizationRegion;
    },
  },
  methods: {
    formatDate,
    async loadOrganizationReports() {
      try {
        const response = await axios.get(`${apiUrl}/organizations/${this.organizationId}/reports`);
        if (response.status === 200) {
          this.reports = response.data.reports;
        }
      } catch (err) {
        if (err) {
          console.error(err);
        }
      }
    },
  },
  data() {
    return {
      reports: [],
    };
  },

  mounted() {
    this.loadOrganizationReports();
  },
};
</script>

<template>
  <div class="organizationReports__wrapper">
    <div class="organizationReports__header">Отчёты организации</div>
    <ul class="organizationReports__list">
      <li v-for="report in reports" :key="report._id" class="organizationReports__list__item">
        <router-link class="report__link" :to="{ name: 'reportPage', params: { report_id: report._id } }">
          <div class="report__title">
            {{ report.title }}
            <div class="report__date">
              {{ formatDate(report.report_date) }}
            </div>
          </div>
          <div class="report__content">
            {{ report.content }}
          </div>
        </router-link>
        <router-link
          v-if="isReportsOwner"
          class="report__link-edit"
          :to="{ name: 'createReportPage', params: { reportId: report._id, orgId: organizationId } }"
        >
          <button type="button" class="actionButton" @click.stop>Редактировать</button>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.organizationReports__wrapper {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  height: 100%;
  background-color: var(--background--card);
  box-shadow: var(--container-shadow-m);
  border: 1px solid var(--border-container);
  border-radius: 4px;

  .organizationReports__header {
    flex: 0 0 auto;
    padding: 8px 12px;
    border-bottom: 1px solid var(--border-container);
    font-size: 1.1rem;
    font-weight: bold;
  }
  .organizationReports__list {
    flex: 1 1 200px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;

    .organizationReports__list__item {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      flex-wrap: nowrap;
      transition: background-color 92ms;

      .report__link {
        flex: 1 1 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;

        .report__title {
          flex: 0 0 auto;
          display: flex;
          flex-wrap: nowrap;
          padding: 0.5rem 0.75rem 0.75rem;

          .report__date {
            margin-left: auto;
          }
        }
        .report__content {
          flex: 0 0 auto;
          height: calc(1.3rem + 0.75rem);
          padding: 0 0.75rem 0.25rem;
          color: var(--text-muted);
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }
      .report__link-edit {
        flex: 0 0 auto;
        margin: auto 0.75rem;
      }
      &:hover {
        background-color: var(--background--card-hover);
      }
    }
  }

  @media screen and (max-width: 720px) {
    border-radius: 0;
  }
}
</style>
