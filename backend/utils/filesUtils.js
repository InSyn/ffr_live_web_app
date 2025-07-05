import fs from 'fs'
import { fileURLToPath } from 'url'
import * as path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const extractFilesByPrefix = (files, prefix) => {
	const extractedFiles = {}
	for (const key in files) {
		if (key.startsWith(prefix)) {
			extractedFiles[key] = `/uploads/images/${files[key][0].filename}`
		}
	}
	return extractedFiles
}

export const parseJsonFields = (body, fields) => {
	const parsedData = {}
	fields.forEach(field => {
		parsedData[field] = body[field] ? JSON.parse(body[field]) : null
	})
	return parsedData
}

export const deleteFileIfExists = async filePath => {
	try {
		const fullPath = path.join(__dirname, '..', filePath)

		const stats = await fs.promises.stat(fullPath)
		if (stats.isFile()) {
			await fs.promises.unlink(fullPath)
		}
	} catch (error) {
		console.error(`Failed to delete file: ${filePath}`, error)
	}
}

export const flushDocuments = async target => {
	if (!target.documents || !target.documents.length) {
		return
	}

	const deletionPromises = target.documents.map(doc => {
		const fullPath = path.join(__dirname, '..', doc.file.url)
		return deleteFileIfExists(fullPath)
	})

	try {
		await Promise.all(deletionPromises)
	} catch (err) {
		console.error('Error deleting documents:', err)
	}
}
