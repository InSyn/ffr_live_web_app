import ExcelJS from 'exceljs';
import { translateField } from '@/utils/formFields-translator';
import { getShortAthleteRank } from '@/store/data/sport-data-sets';
import { backendRootUrl } from '@/constants';
import { getRegionCode } from '@/store/data/russia-regions';

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
    'ffr_id',
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
    'organizations',
    'education',
    'photo_url',
    'photo_tv_url',
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
    { header: 'FFR-ID', key: 'ffr_id', width: 15 },
    { header: 'Фамилия', key: 'lastname', width: 20 },
    { header: 'Имя', key: 'name', width: 20 },
    { header: 'Год', key: 'birth_date', width: 15 },
    { header: 'Пол', key: 'gender', width: 10 },
    { header: 'Школы', key: 'organizations', width: 30 },
    { header: 'Категория', key: 'category', width: 15 },
    { header: 'Страна', key: 'country', width: 15 },
    { header: 'Регион(ы)', key: 'regions', width: 30 },
    { header: 'Рег. код(ы)', key: 'regions_code', width: 5 },
    { header: 'Рег. флаг', key: 'regionFlag_url', width: 15 },
    { header: 'Дисциплины', key: 'disciplines', width: 30 },
    { header: 'Тренер', key: 'trainer', width: 20 },
    { header: 'Образование', key: 'education', width: 20 },
    { header: 'Сборная', key: 'is_national_team', width: 15 },
    { header: 'Фото', key: 'photo_url', width: 20 },
    { header: 'Фото(url)', key: 'photo_url_fullPath', width: 20 },
    { header: 'Фото ТВ', key: 'photo_tv_url', width: 20 },
    { header: 'Фото ТВ(url)', key: 'photo_tv_url_fullPath', width: 20 },
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

  athletes
    .filter((athlete) => !!athlete)
    .forEach((athlete) => {
      worksheet.addRow({
        name: athlete.name,
        lastname: athlete.lastname,
        birth_date: new Date(athlete.birth_date).getFullYear(),
        gender: athlete.gender,
        category: athlete.category ? getShortAthleteRank(athlete.category) : '',
        country: athlete.country,
        regions: athlete.regions ? athlete.regions.join(', ') : '',
        regions_code: athlete.regions
          ? athlete.regions
              .map((regionName) => (regionName ? getRegionCode(regionName) : ''))
              .filter((regionCode) => !!regionCode)
              .join(', ')
          : '',
        regionFlag_url: athlete.regions,
        disciplines: athlete.disciplines ? athlete.disciplines.join(', ') : '',
        is_national_team: athlete.is_national_team ? 'Да' : 'Нет',
        ffr_id: athlete.ffr_id,
        sport: athlete.sport,
        trainer: athlete.trainer ? `${athlete.trainer.trainer_id}: ${athlete.trainer.fullname}` : '',
        organizations: athlete.organizations ? athlete.organizations.join(', ') : '',
        education: athlete.education,
        photo_url: athlete.photo_url,
        photo_url_fullPath: backendRootUrl + athlete.photo_url,
        photo_tv_url: athlete.photo_tv_url,
        photo_tv_url_fullPath: backendRootUrl + athlete.photo_tv_url,
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
