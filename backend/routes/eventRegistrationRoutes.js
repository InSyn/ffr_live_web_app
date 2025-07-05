import express from 'express'
import * as eventRegistrationController from '../controllers/event-registration-controller.js'
import { authenticateToken, hasRole } from '../middleware/authentication.js'
import { createMulterMiddleware } from '../file-storage/fileStorage.js'

export const onlineRegistrationRouter = express.Router()

const multerFields = []
for (let i = 0; i < 8; i++) {
	multerFields.push({
		name: `document${i}`,
		maxCount: 1
	})
}

onlineRegistrationRouter
	.route('/registered-applications')
	.get(
		authenticateToken,
		hasRole('trainer', 'regional_organization'),
		eventRegistrationController.findRegisteredApplicationsByUser
	)

onlineRegistrationRouter
	.route('/registered-applications/:id')
	.get(
		authenticateToken,
		hasRole('trainer', 'regional_organization'),
		eventRegistrationController.getRegistrationById
	)
	.put(
		authenticateToken,
		hasRole('trainer', 'regional_organization'),
		createMulterMiddleware(multerFields),
		eventRegistrationController.updateRegistration
	)
	.delete(
		authenticateToken,
		hasRole('trainer', 'regional_organization'),
		eventRegistrationController.deleteRegistration
	)

onlineRegistrationRouter
	.route('/:event_id')
	.get(eventRegistrationController.getAllEventRegistrations)

onlineRegistrationRouter
	.route('/')
	.post(
		authenticateToken,
		createMulterMiddleware(multerFields),
		eventRegistrationController.addRegistration
	)
