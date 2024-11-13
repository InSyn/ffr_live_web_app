<script>
import { mapGetters } from 'vuex';
import { apiUrl } from '@/constants';
import axios from 'axios';

export default {
  name: 'createOrganizationReport-page',
  data() {
    return {
      report: {
        title: '',
        content: '',
        report_date: '',
      },
      files: [],
      isSubmitting: false,
    };
  },
  computed: {
    ...mapGetters('authorization', {
      userData: 'getUserData',
    }),
    organizationId() {
      return this.userData.organizationId || null;
    },
  },
  methods: {
    handleFilesUpload(event) {
      this.files = Array.from(event.target.files);
    },
    async submitReport() {
      if (this.files.length > 5) {
        alert('You can upload up to 5 photos.');
        return;
      }

      if (!this.organizationId) {
        alert('Organization ID not found.');
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
        const response = await axios.post(`${apiUrl}/organizations/${this.organizationId}/reports`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.status === 201) {
          alert('Отчёт создан успешно');
          this.resetForm();
        }
      } catch (error) {
        console.error('Ошибка при создании отчёта:', error);
        alert(`Не удалось создать отчёт: ${error.response?.data?.message || error.message}`);
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
};
</script>

<template>
  <div class="createOrganizationPage__wrapper">
    <form class="createOrganizationPage__form" @submit.prevent="submitReport" enctype="multipart/form-data">
      <h3 class="createOrganizationPage__title">Создание отчёта организации</h3>
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
          {{ isSubmitting ? 'Отправка...' : 'Создать' }}
        </button>
      </div>
    </form>
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
