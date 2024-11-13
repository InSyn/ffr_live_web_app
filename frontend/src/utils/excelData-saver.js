import ExcelJS from 'exceljs';
import { translateField } from '@/utils/formFields-translator';

export const saveExcelData = (data, type) => {
  if (!data.length) {
    console.error('No data to save');
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Stats');

  const formattedData = prepareData(data, type);

  worksheet.columns = Object.keys(formattedData[0]).map((key) => {
    return {
      header: translateField(key),
      key,
    };
  });

  formattedData.forEach((row) => {
    worksheet.addRow(Object.values(row));
  });

  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `stats-${translateField(type)}-${new Date().toLocaleDateString()}.xlsx`;
    link.click();
  });
};

const prepareData = (data, type) => {
  const fields = fieldMapping[type];
  if (!fields) return {};

  return data.map((item) => {
    return fields.reduce((acc, field) => {
      acc[field] = item[field];
      return acc;
    }, {});
  });
};
const fieldMapping = {
  events: ['title', 'start_at', 'sport', 'discipline', 'country', 'region', 'location', 'season', 'organization', 'timing_provider', 'contacts'],
  athletes: [
    'rus_code',
    'lastname',
    'name',
    'gender',
    'birth_date',
    'country',
    'regions',
    'sport',
    'disciplines',
    'category',
    'is_national_team',
    'trainer',
    'socials',
  ],
  jury: ['jury_code', 'lastname', 'name', 'gender', 'birth_date', 'country', 'region', 'jury_category', 'sport', 'disciplines', 'socials'],
  trainers: [
    'trainer_id',
    'fullname',
    'gender',
    'birth_date',
    'country',
    'region',
    'sport',
    'disciplines',
    'trainer_category',
    'rank',
    'position',
    'is_national_team',
    'socials',
  ],
  organizations: ['title', 'country', 'region', 'sport', 'contacts', 'socials'],
  seminars: ['title', 'sport', 'disciplines', 'format', 'country', 'region', 'location', 'date'],
};

export const exportRegistrationApplicationAthletesToExcel = async (application, multiple = false) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Athletes');

  worksheet.columns = [
    { header: 'FFR-ID', key: 'rus_code', width: 15 },
    { header: 'Фамилия', key: 'lastname', width: 20 },
    { header: 'Имя', key: 'name', width: 20 },
    { header: 'Год', key: 'birth_date', width: 15 },
    { header: 'Пол', key: 'gender', width: 10 },
    { header: 'Категория', key: 'category', width: 15 },
    { header: 'Страна', key: 'country', width: 15 },
    { header: 'Регион(ы)', key: 'regions', width: 30 },
    { header: 'Дисциплины', key: 'disciplines', width: 30 },
    { header: 'Тренер', key: 'trainer', width: 20 },
    { header: 'Сборная', key: 'is_national_team', width: 15 },
  ];

  const athletes = (() => {
    if (multiple) {
      const athletes = application
        .map((applications) => applications.athletes)
        .flat()
        .map((athlete) => athlete.athlete);
      return athletes;
    }
    return application.athletes.map((athlete) => athlete.athlete);
  })();

  athletes.forEach((athlete) => {
    worksheet.addRow({
      name: athlete.name,
      lastname: athlete.lastname,
      birth_date: new Date(athlete.birth_date).getFullYear(),
      gender: athlete.gender,
      category: athlete.category,
      country: athlete.country,
      regions: athlete.regions.join(', '),
      disciplines: athlete.disciplines.join(', '),
      is_national_team: athlete.is_national_team ? 'Да' : 'Нет',
      rus_code: athlete.rus_code,
      sport: athlete.sport,
      trainer: athlete.trainer ? `${athlete.trainer.trainer_id}: ${athlete.trainer.fullname}` : '',
    });
  });

  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  const buffer = await workbook.xlsx.writeBuffer();

  const blob = new Blob([buffer], { type: 'application/octet-stream' });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'Athletes.xlsx';

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
};
