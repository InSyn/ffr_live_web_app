export const juryCategories = new Map([
  ["Спортивный судья третьей категории", "III"],
  ["Спортивный судья второй категории", "II"],
  ["Спортивный судья первой категории", "I"],
  ["Спортивный судья всероссийской категории", "ВК"],
  ["Спортивный судья международной категории", "МСК"],
]);
export const getJuryCategoriesList = () => {
  return Array.from(juryCategories.keys());
};
export const getShortCategory = (category) => {
  return juryCategories.get(category) || category;
};

const athleteRanks = new Map([
  ["Первый юношеский разряд", "IЮ"],
  ["Второй юношеский разряд", "IIЮ"],
  ["Третий юношеский разряд", "IIIЮ"],
  ["Третий взрослый разряд", "III"],
  ["Второй взрослый разряд", "II"],
  ["Первый взрослый разряд", "I"],
  ["Кандидат в мастера спорта", "КМС"],
  ["Мастер спорта", "МС"],
  ["Мастер спорта международного класса", "МСМК"],
  ["Заслуженный мастер спорта", "ЗМС"],
]);
export const getAthletesRanksList = () => {
  return Array.from(athleteRanks.keys());
};
export const getShortAthleteRank = (rank) => {
  return athleteRanks.get(rank) || rank;
};

export const trainerCategories = [
  "Тренер высшей квалификационной категории",
  "Тренер первой квалификационной категории",
  "Тренер второй квалификационной категории",
];
