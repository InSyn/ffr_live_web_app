import express from 'express'
import * as seminarController from '../controllers/seminar-controller.js'
import { createMulterMiddleware } from '../file-storage/fileStorage.js'
import { authenticateToken, isSecretary } from '../middleware/authentication.js'

export const seminarRouter = express.Router()

const documentFields = []
for (let i = 0; i < 8; i++) {
	documentFields.push({
		name: `document${i}`,
		maxCount: 1
	})
}

seminarRouter
	.route('/')
	.get(seminarController.getSeminars)
	.post(
		authenticateToken,
		isSecretary,
		createMulterMiddleware(documentFields),
		seminarController.createSeminar
	)

seminarRouter.route('/find').get(seminarController.searchSeminars)

seminarRouter
	.route('/:id')
	.get(seminarController.getSeminar)
	.patch(
		authenticateToken,
		isSecretary,
		createMulterMiddleware(documentFields),
		seminarController.updateSeminar
	)
	.delete(authenticateToken, isSecretary, seminarController.deleteSeminar)

seminarRouter.route('/date-search/:date').get(seminarController.getSeminarsByDate)

seminarRouter
	.route('/:id/participants')
	.patch(authenticateToken, isSecretary, seminarController.updateSeminarParticipants)
