export const addFieldValue = (target, field, event) => {
  if (typeof target !== 'object' || event.target.value === undefined) return;

  const fieldValue = event.target.value.toString().trim();
  target[field].push(fieldValue);

  event.target.value = '';
};

export const setFieldValue = (target, field, value, idx) => {
  if (typeof target !== 'object') return;
  if (idx === undefined && target[field] === value) return;

  if (idx !== undefined) {
    target[field][idx] = value;
    return;
  }
  target[field] = value;
};

export const removeFieldValue = (target, field, idx) => {
  if (typeof target !== 'object') return;

  if (idx !== undefined) {
    target[field].splice(idx, 1);
    return;
  }
  target[field].splice(idx, 1);
};
