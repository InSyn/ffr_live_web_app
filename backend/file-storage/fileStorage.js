import multer from 'multer'
import * as path from 'node:path'

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		if (file.mimetype.startsWith('image/')) {
			cb(null, 'uploads/images')
		} else if (
			file.mimetype === 'application/pdf' ||
			file.mimetype === 'application/msword' ||
			file.mimetype.startsWith('application/vnd') ||
			file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
		) {
			cb(null, 'uploads/documents')
		} else {
			cb(new Error('Данный формат не поддерживается'), false)
		}
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
		cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
	}
})

const allowedMimeTypes = [
	'image/jpeg',
	'image/png',
	'image/gif',
	'application/pdf',
	'application/msword',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'application/vnd.ms-excel',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]
const fileFilter = (req, file, cb) => {
	if (allowedMimeTypes.includes(file.mimetype)) {
		cb(null, true)
	} else {
		const errorMessage = `Неподдерживаемый формат: ${file.mimetype}`
		console.error(errorMessage)
		cb(new Error(errorMessage), false)
	}
}

export const createMulterMiddleware = fields => {
	return multer({
		storage,
		fileFilter,
		limits: { fileSize: 1024 * 1024 * 30 }
	}).fields(fields)
}
