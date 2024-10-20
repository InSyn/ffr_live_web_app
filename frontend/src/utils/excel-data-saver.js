import ExcelJS from "exceljs";
import { translateField } from "@/utils/formFields-translator";

export const saveExcelData = (data, type) => {
  if (!data.length) {
    console.error("No data to save");
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Stats");

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
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `stats-${translateField(
      type
    )}-${new Date().toLocaleDateString()}.xlsx`;
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
  events: [
    "title",
    "start_at",
    "sport",
    "discipline",
    "country",
    "region",
    "location",
    "season",
    "organization",
    "timing_provider",
    "contacts",
  ],
  athletes: [
    "rus_code",
    "lastname",
    "name",
    "gender",
    "birth_date",
    "country",
    "regions",
    "sport",
    "disciplines",
    "category",
    "is_national_team",
    "trainer",
    "socials",
  ],
  jury: [
    "jury_code",
    "lastname",
    "name",
    "gender",
    "birth_date",
    "country",
    "region",
    "jury_category",
    "sport",
    "disciplines",
    "socials",
  ],
  trainers: [
    "trainer_id",
    "fullname",
    "gender",
    "birth_date",
    "country",
    "region",
    "sport",
    "disciplines",
    "trainer_category",
    "rank",
    "position",
    "is_national_team",
    "socials",
  ],
  organizations: ["title", "country", "region", "sport", "contacts", "socials"],
  seminars: [
    "title",
    "sport",
    "disciplines",
    "format",
    "country",
    "region",
    "location",
    "date",
  ],
};
