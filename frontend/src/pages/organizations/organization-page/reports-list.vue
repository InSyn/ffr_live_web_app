<script>
import { formatDate } from '@/utils/data-formaters';

export default {
  name: 'reports-list',
  methods: { formatDate },
  data() {
    return {
      reports: [
        {
          id: 1,
          title: 'Отчет 1',
          content: 'Описание отчета 1',
          date: '01.01.2019',
          file: {
            url: 'https://www.example.com/file.pdf',
          },
        },
        {
          id: 2,
          title: 'Отчет 1',
          content:
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
          date: '01.01.2019',
          file: {
            url: 'https://www.example.com/file.pdf',
          },
        },
        {
          id: 3,
          title: 'Отчет 1',
          content: 'Описание отчета 1',
          date: '01.01.2019',
          file: {
            url: 'https://www.example.com/file.pdf',
          },
        },
        {
          id: 4,
          title: 'Отчет 1',
          content: 'Описание отчета 1',
          date: '01.01.2019',
          file: {
            url: 'https://www.example.com/file.pdf',
          },
        },
        {
          id: 5,
          title: 'Отчет 1',
          content: 'Описание отчета 1',
          date: '01.01.2019',
          file: {
            url: 'https://www.example.com/file.pdf',
          },
        },
        {
          id: 6,
          title: 'Отчет 1',
          content: 'Описание отчета 1',
          date: '01.01.2019',
          file: {
            url: 'https://www.example.com/file.pdf',
          },
        },
      ],
    };
  },
};
</script>

<template>
  <div class="organizationReports__wrapper">
    <div class="organizationReports__header">Отчёты организации</div>
    <ul class="organizationReports__list">
      <router-link v-for="report in reports" :key="report.id" :to="{ name: 'reportPage', params: { report_id: report.id } }">
        <li class="organizationReports__list__item">
          <div class="report__title">
            {{ report.title }}

            <div class="report__date">
              {{ formatDate(report.date) }}
            </div>
          </div>
          <div class="report__content">
            {{ report.content }}
          </div>
        </li></router-link
      >
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
      flex-direction: column;

      .report__title {
        display: flex;
        flex-wrap: nowrap;
        padding: 0.25rem 0.75rem 0.75rem;

        .report__date {
          margin-left: auto;
        }
      }
      .report__content {
        height: calc(1.3rem + 0.75rem);
        padding: 0 0.75rem;
        color: var(--text-muted);
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }

  @media screen and (max-width: 720px) {
    border-radius: 0;
  }
}
</style>
