export const formatLastname = (str) => {
  if (!str) return "";

  return str.toString().toUpperCase();
};

export const formatFullname = (str) => {
  if (!str && typeof str !== "string") return "";
  if (str.split(" ").length < 3) return str;

  const nameArr = str.split(" ");
  nameArr[0] = nameArr[0].toUpperCase();

  return nameArr.join(" ");
};

export const getSeason = (dateStr) => {
  const date = new Date(dateStr);
  if (!date) return "";

  const year = date.getFullYear();
  const month = date.getMonth();
  if (month < 6) {
    return `${year - 1}-${year}`;
  } else {
    return `${year}-${year + 1}`;
  }
};
