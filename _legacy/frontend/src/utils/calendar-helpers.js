export const getDaysOfMonth = (year, month) => {
  // Get the last day of the month by setting the date to 0 of the next month
  const daysInMonth = new Date(year, month, 0).getDate();

  // Create an array of days
  const daysArray = [];
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(i);
  }

  return daysArray;
};
