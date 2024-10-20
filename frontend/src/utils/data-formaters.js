export const formatDate = (dateString, options) => {
  const date = new Date(dateString);
  if (!date) return "invalid date";

  if (options) {
    if (options.full) {
      return date.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (options.toInputFormat) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
  }

  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const getAthleteName = (athlete) => {
  if (!athlete) return;

  return (
    (athlete.lastname ? athlete.lastname + " " : "") +
    (athlete.name ? athlete.name : "")
  );
};

export const formatBirthDate = (birth_date) => {
  if (!birth_date) return "";

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

  // Adjust age if the current date is before the birthday this year
  if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
    age--;
  }

  return age;
};

// export function set_accuracy(val, precision) {
//   let suffix = null;
//
//   if (typeof val === "string" && val.split(" ").length > 1) {
//     suffix = val.split(" ")[1];
//     val = val.split(" ")[0];
//   }
//
//   const digits = precision.toString().length - 1;
//   let res = (Math.round(precision * +val) / precision).toString().split(".");
//
//   if (digits > 0) {
//     if (res[1]) {
//       for (let i = 0; i < digits - res[1].length; i++) {
//         res[1] += "0";
//       }
//     } else {
//       res.push([]);
//       for (let i = 0; i < digits; i++) {
//         res[1] += "0";
//       }
//     }
//   } else res = res[0];
//   res = res.join(".");
//
//   return `${res}${suffix ? " " + suffix : ""}`;
// }
