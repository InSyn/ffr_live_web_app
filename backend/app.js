import express from 'express'
// Test comment
import cors from 'cors'
import { fileURLToPath } from 'url'
import * as path from 'path'
import logger from './utils/logger.js'

import { authRouter } from './routes/authRoutes.js'
import { eventRouter } from './routes/eventRoutes.js'
import { athleteRouter } from './routes/athleteRoutes.js'
import { juryRouter } from './routes/juryRoutes.js'
import { seminarRouter } from './routes/seminarRoutes.js'
import { organizationRouter } from './routes/organizationRoutes.js'
import { trainerRouter } from './routes/trainerRoutes.js'
import { statisticsRouter } from './routes/statisticsRoutes.js'
import { multerErrorHandler } from './middleware/multerErrorHandler.js'
import { onlineRegistrationRouter } from './routes/eventRegistrationRoutes.js'

const __filename = fileURLToPath(import.meta.url)
export const __dirname = path.dirname(__filename)

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// CORS configuration for production domain
const corsOptions = {
	origin: [
		'http://localhost:8080',
		'http://localhost:3000',
		'https://live-result.ffr-ski.ru',
		'https://api-live-result.ffr-ski.ru'
	],
	credentials: true,
	optionsSuccessStatus: 200
}

app.use(cors(corsOptions))

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/v1/events', eventRouter)
app.use('/api/v1/event-online-registration', onlineRegistrationRouter)
app.use('/api/v1/athletes', athleteRouter)
app.use('/api/v1/jury', juryRouter)
app.use('/api/v1/trainers', trainerRouter)
app.use('/api/v1/seminars', seminarRouter)
app.use('/api/v1/organizations', organizationRouter)
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/stats', statisticsRouter)

app.use(multerErrorHandler)

app.use((req, res, next) => {
	req.socket.on('error', error => {
		logger.error('Request socket error', { error: error.message })
	})
	res.socket.on('error', error => {
		logger.error('Response socket error', { error: error.message })
	})
	next()
})

export { app }
