import express from 'express';
import * as juryController from '../controllers/jury-controller.js';
import { authenticateToken, isAdmin } from '../middleware/authentication.js';
import { createMulterMiddleware } from '../file-storage/fileStorage.js';

export const juryRouter = express.Router();

juryRouter
  .route('/')
  .get(juryController.getAllJury)
  .post(authenticateToken, isAdmin, createMulterMiddleware([{ name: 'photo_url', maxCount: 1 }]), juryController.addNewJury);

juryRouter.route('/find').get(juryController.searchJury);

juryRouter
  .route('/:code')
  .get(juryController.getJury)
  .patch(authenticateToken, isAdmin, createMulterMiddleware([{ name: 'photo_url', maxCount: 1 }]), juryController.updateJury)
  .delete(authenticateToken, isAdmin, juryController.deleteJury);

juryRouter.route('/:code/competitions').get(juryController.getJuryCompetitions);
juryRouter.route('/:code/seminars').get(juryController.getJurySeminars);
