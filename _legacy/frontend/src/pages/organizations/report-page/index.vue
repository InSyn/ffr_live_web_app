<script>
import { apiUrl, backendRootUrl } from '@/constants';
import axios from 'axios';
import LoaderSpinner from '@/components/ui-components/loader-spinner.vue';
import { formatDate } from '@/utils/data-formaters';
import ImagesList from '@/pages/organizations/report-page/images-list.vue';
import DOMPurify from 'dompurify';
import linkifyHtml from 'linkify-html';

export default {
  name: 'index',
  components: { ImagesList, LoaderSpinner },
  props: {
    report_id: String,
    org_id: String,
  },
  data() {
    return {
      organization: null,
      report: null,

      loading: false,
    };
  },
  computed: {
    backendRootUrl() {
      return backendRootUrl;
    },
    formattedContent() {
      const contentWithLineBreaks = this.report.content.replace(/\n/g, '<br>');
      const linkifiedContent = linkifyHtml(contentWithLineBreaks, {
        defaultProtocol: 'https',
        target: '_blank',
        attributes: {
          rel: 'noopener noreferrer',
        },
      });
      return DOMPurify.sanitize(linkifiedContent, {
        ADD_ATTR: ['target', 'rel'],
      });
    },
  },
  methods: {
    formatDate,
    async getOrganizationData() {
      this.loading = true;

      try {
        const response = await axios.get(apiUrl + `/organizations/${this.org_id}`);

        if (response.status === 200) {
          this.organization = response.data.organization;

          await this.getReportData();
        }
      } catch (e) {
        if (e) console.error(e.message);
      } finally {
        this.loading = false;
      }
    },
    async getReportData() {
      try {
        const response = await axios.get(apiUrl + `/organizations/${this.org_id}/reports/${this.report_id}`);

        if (response.status === 200) {
          this.report = response.data.report;
        }
      } catch (e) {
        if (e) console.error(e.message);
      }
    },
  },

  mounted() {
    this.getOrganizationData();
  },
};
</script>

<template>
  <div class="reportPage__wrapper">
    <loader-spinner v-if="(!organization || !report) && loading"></loader-spinner>
    <div v-else-if="organization && report" class="report__wrapper">
      <div class="reportPage__title">Отчёт организации</div>
      <div class="reportPage__subtitle">
        <span class="organization__name">{{ report.title }}</span>
        <span class="report__date">{{ formatDate(report.report_date) }}</span>
      </div>
      <div class="reportPage__content" v-html="formattedContent"></div>
      <div v-if="report.files.length" class="reportPage__images__wrapper">
        <images-list :images="report.files"></images-list>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.reportPage__wrapper {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  padding: var(--padd-page);
  overflow-y: auto;

  .report__wrapper {
    flex: 0 0 300px;
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: var(--tablet-default);

    margin: auto;
    padding: 0.75rem 1.25rem;
    background-color: var(--background--card);
    box-shadow: var(--container-shadow-m);
    border: 1px solid var(--border-container);
    border-radius: 4px;

    .reportPage__title {
      flex: 0 0 auto;
      margin-bottom: 0.75rem;
      padding-bottom: 0.5rem;
      font-size: 1.2rem;
      border-bottom: 1px solid var(--border-container);
    }
    .reportPage__subtitle {
      flex: 0 0 auto;
      display: flex;
      flex-wrap: nowrap;
      margin-bottom: 1.25rem;
      font-size: 1.1rem;

      & > * {
        flex: 0 0 auto;
        display: inline-block;
      }
      .report__date {
        margin-left: auto;
      }
    }
    .reportPage__content {
      flex: 0 0 auto;
      overflow-y: auto;
      padding: 0.5rem 0;

      :deep(a) {
        text-decoration: underline;
        color: var(--ffr-brand) !important;

        &:hover {
          text-decoration: none;
        }
      }
    }
    .reportPage__images__wrapper {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      padding: 0.75rem 0 0;
      border-top: 1px solid var(--border-container);
    }

    @media screen and (max-width: 720px) {
      flex: 1 1 0;
      justify-content: center;
      margin: 0;
      border-radius: 0;

      .reportPage__title {
        font-size: 1.8rem;
      }
      .reportPage__subtitle {
        font-size: 1.8rem;
      }
      .reportPage__content {
        font-size: 1.2rem;
      }
    }
  }
}
</style>
