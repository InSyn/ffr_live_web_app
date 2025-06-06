<script>
import axios from 'axios';
import { mapGetters } from 'vuex';
import { apiUrl } from '@/constants';
import MessageContainer from '@/components/ui-components/message-container.vue';
import { formatDate } from '@/utils/data-formaters';
import LoaderSpinner from '@/components/ui-components/loader-spinner.vue';

export default {
  name: 'createOrganizationReport-page',
  components: { LoaderSpinner, MessageContainer },
  props: ['reportId', 'orgId'],
  data() {
    return {
      report: {
        title: '',
        content: '',
        report_date: '',
      },
      files: [],

      loading: false,
      isSubmitting: false,

      messages: [],
      errors: [],
      isEditMode: false,
    };
  },
  computed: {
    ...mapGetters('authorization', {
      userData: 'getUserData',
    }),
    organizationRegion() {
      return this.userData.region || null;
    },
  },
  methods: {
    handleFilesUpload(event) {
      this.files = Array.from(event.target.files);
    },
    async fetchReportData() {
      this.loading = true;
      try {
        const response = await axios.get(`${apiUrl}/organizations/${this.organizationRegion}/reports/${this.reportId}`);
        if (response.status === 200) {
          const report = response.data.report;
          if (report.report_date) report.report_date = formatDate(report.report_date, { toDateInputFormat: true });

          this.report = report;
          this.isEditMode = true;
        }
      } catch (error) {
        this.errors.push('Не удалось загрузить данные отчёта');
      } finally {
        this.loading = false;
      }
    },
    async submitReport() {
      if (this.files.length > 5) {
        this.errors.push('Превышено максимальное количество изображений (5).');
        return;
      }

      if (!this.organizationRegion) {
        this.errors.push('Необходимо авторизоваться в качестве организации для создания отчёта.');
        return;
      }

      this.isSubmitting = true;

      const formData = new FormData();
      formData.append('title', this.report.title);
      formData.append('content', this.report.content);
      formData.append('report_date', this.report.report_date);

      this.files.forEach((file) => {
        formData.append('files', file);
      });

      try {
        const endpoint = this.reportId
          ? `${apiUrl}/organizations/${this.orgId}/reports/${this.reportId}`
          : `${apiUrl}/organizations/reports/${this.organizationRegion}`;
        const method = this.isEditMode ? 'put' : 'post';
        const response = await axios({
          method,
          url: endpoint,
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
            authorization: `Bearer ${this.userData.token}`,
          },
        });

        if (response.status === 201 || response.status === 200) {
          this.messages.push(`Отчёт ${this.isEditMode ? 'обновлён' : 'создан'} успешно`);
          this.resetForm();
          setTimeout(() => {
            this.$router.push({ name: 'organizationsPage' });
          }, 1280);
        }
      } catch (error) {
        console.error('Ошибка при создании отчёта:', error);
        this.errors.push(`Не удалось создать отчёт: ${error.response?.data?.message || error.message}`);
      } finally {
        this.isSubmitting = false;
      }
    },
    resetForm() {
      this.report.title = '';
      this.report.content = '';
      this.report.report_date = '';
      this.files = [];

      this.$refs.fileInput.value = '';
    },
  },
  mounted() {
    if (this.reportId) {
      this.fetchReportData();
    }
  },
};
</script>

<template>
  <div class="createOrganizationPage__wrapper">
    <form v-if="!loading" class="createOrganizationPage__form" @submit.prevent="submitReport" enctype="multipart/form-data">
      <h3 class="createOrganizationPage__title">{{ isEditMode ? 'Редактирование' : 'Создание' }} отчёта организации</h3>
      <div class="createOrganizationPage__control__wrapper">
        <label for="title">Заголовок:</label>
        <input type="text" id="title" v-model="report.title" required />
      </div>

      <div class="createOrganizationPage__control__wrapper">
        <label for="report_date">Дата отчёта:</label>
        <input type="date" id="report_date" v-model="report.report_date" required />
      </div>

      <div class="createOrganizationPage__control__wrapper">
        <label for="content">Текст:</label>
        <textarea id="content" v-model="report.content" required></textarea>
      </div>

      <div class="createOrganizationPage__control__wrapper">
        <label for="files">Изображения (до 5):</label>
        <input type="file" id="files" ref="fileInput" @change="handleFilesUpload" multiple accept="image/*" />
        <p v-if="files.length > 5" class="error">Не более 5 изоюражений</p>
      </div>

      <div class="createOrganizationPage__control__actions">
        <button class="actionButton" type="submit" :disabled="isSubmitting || files.length > 5">
          {{ isSubmitting ? 'Отправка...' : isEditMode ? 'Сохранить' : 'Создать' }}
        </button>
      </div>
    </form>
    <loader-spinner v-else></loader-spinner>

    <message-container :messages="messages" :errors="errors"></message-container>
  </div>
</template>

<style scoped lang="scss">
.createOrganizationPage__wrapper {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  padding: var(--padd-page);

  .createOrganizationPage__form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-width: var(--tablet-small);
    width: 100%;

    margin: auto;
    background-color: var(--background--card);
    box-shadow: var(--container-shadow-m);
    border: 1px solid var(--border-container);
    border-radius: 4px;
    padding: 1rem 1.6rem;

    .createOrganizationPage__title {
      margin-bottom: 1.25rem;
    }
    .createOrganizationPage__control__wrapper {
      display: flex;
      align-items: flex-start;

      label {
        flex: 0 0 8rem;
        padding: 3px 6px;
      }
      input,
      textarea {
        flex: 1 1 12ch;
        min-width: 0;
        max-width: 24ch;
        background-color: var(--background--card-secondary);
        border-radius: 2px;
        padding: 3px 6px;
        color: var(--text-default);
        outline: transparent;
        transition: background-color 92ms;

        &:focus {
          outline: 1px solid var(--text-default);
          background-color: var(--background--card-hover);
        }
      }
      input[type='file'],
      textarea {
        max-width: none;
      }
      textarea {
        min-height: 200px;
      }
    }
    .createOrganizationPage__control__actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }
  }
}
</style>
