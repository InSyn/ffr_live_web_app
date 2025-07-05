import multer from 'multer'

export const multerErrorHandler = (err, req, res, next) => {
	if (err instanceof multer.MulterError) {
		if (err.code === 'LIMIT_FILE_SIZE') {
			return res.status(400).json({
				status: 'Err',
				message: 'Файл не должен превышать 30 МБ'
			})
		}
		return res.status(400).json({
			status: 'Err',
			message: err.message
		})
	} else if (err) {
		return res.status(500).json({
			status: 'Err',
			message: `Ошибка загрузки файла: ${err.message}`
		})
	}

	next()
}
