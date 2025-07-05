export const formatDate = (dateString, options) => {
  const date = new Date(dateString);
  if (!date) return 'invalid date';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  if (options) {
    if (options.full)
      return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    if (options.toInputFormat) {
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    if (options.toDateInputFormat) {
      return `${year}-${month}-${day}`;
    }
  }

  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const getAthleteName = (athlete) => {
  if (!athlete) return;

  return (athlete.lastname ? athlete.lastname + ' ' : '') + (athlete.name ? athlete.name : '');
};

export const formatBirthDate = (birth_date) => {
  if (!birth_date) return '';

  const dateObj = new Date(Date.parse(birth_date));

  return dateObj.getFullYear();
};

export const getAgeFromBirthdate = (birthDateString) => {
  if (!birthDateString || !new Date(birthDateString)) return;

  const birthDate = new Date(birthDateString);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  const dayDifference = today.getDate() - birthDate.getDate();

  if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
    age--;
  }

  return age;
};

export const concatStringsWithComma = (strArr) => {
  return strArr.filter((str) => !!str).join(', ');
};
