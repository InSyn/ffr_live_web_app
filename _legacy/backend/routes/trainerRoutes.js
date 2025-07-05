import express from 'express';
import * as trainerController from '../controllers/trainers-controller.js';
import { authenticateToken, isAdmin } from '../middleware/authentication.js';
import { createMulterMiddleware } from '../file-storage/fileStorage.js';

export const trainerRouter = express.Router();

trainerRouter
  .route('/')
  .get(trainerController.getAllTrainers)
  .post(authenticateToken, isAdmin, createMulterMiddleware([{ name: 'photo_url', maxCount: 1 }]), trainerController.addNewTrainer);

trainerRouter.route('/find').get(trainerController.searchTrainers);

trainerRouter
  .route('/:code')
  .get(trainerController.getTrainer)
  .patch(authenticateToken, isAdmin, createMulterMiddleware([{ name: 'photo_url', maxCount: 1 }]), trainerController.updateTrainer)
  .delete(authenticateToken, isAdmin, trainerController.deleteTrainer);
trainerRouter.route('/:code/athletes').get(trainerController.getTrainerTeam);
trainerRouter.route('/:code/seminars').get(trainerController.getTrainerSeminars);
