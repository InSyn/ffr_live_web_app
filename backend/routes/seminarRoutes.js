import express from "express";
import * as seminarController from "../controllers/seminar-controller.js";
import { createMulterMiddleware } from "../file-storage/fileStorage.js";
import { authenticateToken, isAdmin } from "../middleware/authentication.js";

export const seminarRouter = express.Router();

const documentFields = [];
for (let i = 0; i < 8; i++) {
  documentFields.push({
    name: `document${i}`,
    maxCount: 1,
  });
}

seminarRouter
  .route("/")
  .get(seminarController.getSeminars)
  .post(
    authenticateToken,
    isAdmin,
    createMulterMiddleware(documentFields),
    seminarController.createSeminar
  );

seminarRouter.route("/find").get(seminarController.searchSeminars);

seminarRouter
  .route("/:id")
  .get(seminarController.getSeminar)
  .patch(
    authenticateToken,
    isAdmin,
    createMulterMiddleware(documentFields),
    seminarController.updateSeminar
  )
  .delete(authenticateToken, isAdmin, seminarController.deleteSeminar);

seminarRouter
  .route("/date-search/:date")
  .get(seminarController.getSeminarsByDate);

seminarRouter
  .route("/:id/participants")
  .patch(
    authenticateToken,
    isAdmin,
    seminarController.updateSeminarParticipants
  );
