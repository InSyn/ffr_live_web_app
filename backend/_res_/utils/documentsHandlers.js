import { resolve } from 'path';
import { deleteFileIfExists } from './filesUtils.js';

export const parseDocuments = (reqBody) => {
  return reqBody.documents ? JSON.parse(reqBody.documents) : [];
};

export const extractDocumentFiles = (reqFiles) => {
  const documentFiles = {};
  if (reqFiles) {
    for (const fileKey in reqFiles) {
      if (fileKey.startsWith('document')) {
        const file = reqFiles[fileKey][0];
        documentFiles[fileKey] = {
          url: `/uploads/documents/${file.filename}`,
        };
      }
    }
  }
  return documentFiles;
};

export const createEntityDocuments = (documents, documentFiles) => {
  return documents.map((doc, idx) => {
    const fileKey = `document${idx}`;
    const documentFile = documentFiles[fileKey] || {};
    return {
      title: doc.title || '',
      created_at: new Date(),
      file: {
        url: documentFile.url || '',
      },
    };
  });
};

export const updateDocuments = async (documents, documentFiles) => {
  return Promise.all(
    documents
      .map(async (doc, idx) => {
        const fileKey = `document${idx}`;
        const documentFile = documentFiles[fileKey] || {};

        const fileUrl = documentFile.url || (doc.file && doc.file.url);

        if (!fileUrl) {
          return null;
        }

        if (documentFile.url && doc.file && doc.file.url) {
          await deleteFileIfExists(resolve(__dirname, '..', doc.file.url));
        }

        return {
          title: doc.title || '',
          created_at: doc.created_at ? new Date(doc.created_at) : new Date(),
          file: {
            url: fileUrl,
          },
        };
      })
      .filter((doc) => doc !== null)
  );
};
