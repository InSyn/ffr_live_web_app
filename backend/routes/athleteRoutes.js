import express from 'express'
import * as athleteController from '../controllers/athlete-controller.js'
import { authenticateToken, isAdmin } from '../middleware/authentication.js'
import { createMulterMiddleware } from '../file-storage/fileStorage.js'

export const athleteRouter = express.Router()

const multerFields = [
	{ name: 'photo_url', maxCount: 1 },
	{ name: 'photo_tv_url', maxCount: 1 }
]

for (let i = 0; i < 5; i++) {
	multerFields.push({ name: `sponsor${i}_logo`, maxCount: 1 })
}

athleteRouter
	.route('/')
	.get(athleteController.getAllAthletes)
	.post(
		authenticateToken,
		isAdmin,
		createMulterMiddleware(multerFields),
		athleteController.addNewAthlete
	)

athleteRouter.route('/find').get(athleteController.searchAthletes)

athleteRouter.route('/tv-photo-url/:code').get(athleteController.getAthleteTvPhotoUrl)

athleteRouter
	.route('/:code')
	.get(athleteController.getAthlete)
	.patch(
		authenticateToken,
		isAdmin,
		createMulterMiddleware(multerFields),
		athleteController.updateAthlete
	)
	.delete(authenticateToken, isAdmin, athleteController.deleteAthlete)

athleteRouter.route('/:code/competitions').get(athleteController.getAthleteCompetitions)
