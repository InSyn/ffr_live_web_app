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

export const prepareFormData = (data, dateFields = []) => {
  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    const value = data[key];

    if (key === 'documents') return;

    if (Array.isArray(value) || typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
    } else if (dateFields.includes(key)) {
      formData.append(key, new Date(value).toISOString());
    } else {
      formData.append(key, value);
    }
  });

  return formData;
};

export const addDocumentsToFormData = (formData, documents) => {
  if (!documents.length) return;

  const filteredDocuments = documents.filter((doc) => doc.file?.url || doc.file?.newFile);

  formData.append(
    'documents',
    JSON.stringify(
      filteredDocuments.map((doc) => {
        const file = doc.file?.newFile ? {} : doc.file;
        return {
          title: doc.title,
          file: file,
        };
      })
    )
  );

  filteredDocuments.forEach((doc, index) => {
    if (doc.file?.newFile) {
      formData.append(`document${index}`, doc.file?.newFile);
    }
  });
};

export const addImagesToFormData = (formData, images) => {
  for (const imageKey in images) {
    formData.append(imageKey, images[imageKey]);
  }
};
