export const getInputType = (key) => {
  switch (key) {
    case "start_at":
      return "dateTime-local";
    case "birth_date":
    case "date":
      return "date";
    case "international":
      return "checkbox";
    case "is_national_team":
      return "checkbox";

    default:
      return "text";
  }
};
