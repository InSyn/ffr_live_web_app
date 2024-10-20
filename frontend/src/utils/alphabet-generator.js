export const getAlphabetList = (srcArr, keyField) => {
  if (
    !Array.isArray(srcArr) ||
    !srcArr.length ||
    typeof !srcArr[0][keyField] === "string"
  )
    return;

  return srcArr
    .map((person) => person[keyField][0].toUpperCase())
    .filter((a, idx, arr) => arr.indexOf(a) === idx);
};
