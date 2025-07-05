import dotenv from 'dotenv'
import * as http from 'http'
import mongoose from 'mongoose'
import { app } from './app.js'
import { ensureUploadsDirExists } from './utils/checkFolder.js'
import { checkAdminPresence } from './utils/checkAdmin.js'
import logger from './utils/logger.js'

dotenv.config({ path: './.env' })

const httpServer = http.createServer(app)

// Add connection options
const dbOptions = {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverSelectionTimeoutMS: 5000,
	socketTimeoutMS: 45000
}

// Improve error handling
mongoose
	.connect(
		`mongodb://${process.env.DB_USER}:${process.env.DB_PWD}@${process.env.DB_HOSTNAME}:${process.env.DB_PORT}/${process.env.DB}?authSource=admin`,
		dbOptions
	)
	.then(async () => {
		logger.info('Database connected successfully')
		await checkAdminPresence()
	})
	.catch(error => {
		logger.error('Database connection failed', {
			error: error.message,
			code: error.code
		})
		process.exit(1) // Exit on critical database connection failure
	})

// Add graceful shutdown
process.on('SIGTERM', () => {
	logger.info('SIGTERM received. Closing HTTP server...')
	httpServer.close(() => {
		logger.info('HTTP server closed')
		mongoose.connection.close(false, () => {
			logger.info('Database connection closed')
			process.exit(0)
		})
	})
})

httpServer.listen(process.env.PORT, () => {
	logger.info(`HTTP server started on port ${process.env.PORT}`)
})

ensureUploadsDirExists()
