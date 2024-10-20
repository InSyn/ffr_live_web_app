import multer from "multer";
import path, { join } from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, "uploads/images");
    } else if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/msword" ||
      file.mimetype.startsWith("application/vnd") ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      cb(null, "uploads/documents");
    } else {
      cb(new Error("Данный формат не поддерживается"), false);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf" ||
    file.mimetype === "application/msword" ||
    file.mimetype.startsWith("application/vnd")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Данный формат не поддерживается"), false);
  }
};

export const createMulterMiddleware = (fields) => {
  return multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 25 },
  }).fields(fields);
};

export const removeOldFile = async (oldPath) => {
  try {
    const stats = await fs.promises.stat(oldPath);
    if (stats.isFile()) {
      await fs.promises.unlink(oldPath);
    }
  } catch (err) {
    console.error("Failed to delete old file:", err);
  }
};

export const flushDocuments = async (target) => {
  if (target.documents === undefined || !target.documents.length) {
    return;
  }

  const deletionPromises = target.documents.map(async (doc) => {
    const fullPath = join(__dirname, "..", doc.file.url);
    try {
      await removeOldFile(fullPath);
    } catch (err) {
      console.error(`Failed to delete file ${fullPath}:`, err);
    }
  });

  try {
    await Promise.all(deletionPromises);
  } catch (err) {
    console.error("Error deleting seminar documents:", err);
  }
};
