import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Get current file's directory in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs')
if (!fs.existsSync(logsDir)) {
	fs.mkdirSync(logsDir)
}

// Simple timestamp function
const getTimestamp = () => new Date().toISOString()

// Format log message
const formatLog = (level, message, data = {}) => {
	const logEntry = {
		timestamp: getTimestamp(),
		level,
		message,
		...data
	}
	return JSON.stringify(logEntry)
}

// Write to file
const writeToFile = logEntry => {
	const logFile = path.join(logsDir, `${process.env.NODE_ENV || 'development'}.log`)
	fs.appendFileSync(logFile, logEntry + '\n')
}

// Main logger object
const logger = {
	error: (message, data) => {
		const logEntry = formatLog('ERROR', message, data)
		console.error(logEntry)
		writeToFile(logEntry)
	},

	warn: (message, data) => {
		const logEntry = formatLog('WARN', message, data)
		console.warn(logEntry)
		writeToFile(logEntry)
	},

	info: (message, data) => {
		const logEntry = formatLog('INFO', message, data)
		console.info(logEntry)
		writeToFile(logEntry)
	},

	debug: (message, data) => {
		if (process.env.NODE_ENV !== 'production') {
			const logEntry = formatLog('DEBUG', message, data)
			console.debug(logEntry)
			writeToFile(logEntry)
		}
	}
}

export default logger
