import { Seminar } from '../models/seminar-model.js'
import {
	createEntityDocuments,
	extractDocumentFiles,
	parseDocuments,
	updateDocuments
} from '../utils/documentsHandlers.js'
import { getSeason } from '../utils/formatters.js'
import { flushDocuments, parseJsonFields } from '../utils/filesUtils.js'

const buildSeminarQuery = req => {
	const query = {}

	// Текстовый поиск по локации (следуя паттерну из architectural-guide)
	if (req.query.location) {
		query.location = new RegExp(req.query.location, 'i')
	}

	// Точные фильтры
	if (req.query.discipline) query.disciplines = req.query.discipline
	if (req.query.season) query.season = req.query.season
	if (req.query.region) query.region = new RegExp(req.query.region, 'i')

	// Даты диапазона
	const dateQuery = {}
	if (req.query.date_from) {
		dateQuery.$gte = new Date(req.query.date_from)
	}
	if (req.query.date_to) {
		const endDate = new Date(req.query.date_to)
		endDate.setUTCHours(23, 59, 59, 999)
		dateQuery.$lte = endDate
	}
	if (Object.keys(dateQuery).length > 0) {
		query.date = dateQuery
	}

	return query
}

export const searchSeminars = async (req, res) => {
	try {
		const query = buildSeminarQuery(req)
		const options = {
			page: parseInt(req.query.page) || 1,
			limit: parseInt(req.query.limit) || 20,
			sort: { date: -1 }
		}

		console.log('🔍 Search Seminars Query:', JSON.stringify(query, null, 2))
		console.log('🔍 Search Parameters:', req.query)

		const result = await Seminar.paginate(query, options)

		console.log(`🔍 Found ${result.docs.length} seminars, total: ${result.totalDocs}`)
		if (result.docs.length > 0) {
			console.log('🔍 Sample seminars:')
			result.docs.slice(0, 3).forEach(seminar => {
				console.log(`  - ${seminar.title} (${seminar.location})`)
			})
		}

		res.status(200).json({
			docs: result.docs,
			totalDocs: result.totalDocs,
			limit: result.limit,
			totalPages: result.totalPages,
			page: result.page
		})
	} catch (error) {
		console.error('Ошибка во время поиска:', error)
		res.status(500).json({
			status: 'error',
			message: `Ошибка во время поиска: ${error.message}`
		})
	}
}

export const getSeminars = async (req, res) => {
	try {
		const seminars = await Seminar.find().sort({ date: -1 })
		res.status(200).json({
			status: 'success',
			seminars
		})
	} catch (e) {
		res.status(404).json({
			status: 'Err',
			message: 'Competitors not found ',
			err: e
		})
	}
}

export const getSeminarsByDate = async (req, res) => {
	try {
		const date = new Date(req.params.date)
		const year = date.getFullYear()
		const month = date.getMonth()
		const startDate = new Date(year, month, 1)
		const endDate =
			month === 11
				? new Date(year + 1, 0, 0, 23, 59, 59, 999)
				: new Date(year, month + 1, 0, 23, 59, 59, 999)

		const seminars = await Seminar.find({ date: { $gte: startDate, $lte: endDate } }).sort({
			date: -1
		})

		res.status(200).json({
			status: 'success',
			seminars
		})
	} catch (e) {
		res.status(404).json({
			status: 'Err',
			message: 'Семинары не найдены',
			err: e
		})
	}
}

export const createSeminar = async (req, res) => {
	try {
		const parsedFields = parseJsonFields(req.body, ['disciplines', 'contacts'])
		const documents = parseDocuments(req.body)
		const documentFiles = extractDocumentFiles(req.files)
		const seminarDocuments = createEntityDocuments(documents, documentFiles)

		const seminar = new Seminar({
			title: req.body.title,
			sport: req.body.sport,
			format: req.body.format,
			country: req.body.country,
			region: req.body.region,
			location: req.body.location,
			date: new Date(req.body.date),
			season: req.body.date ? getSeason(req.body.date) : '',
			documents: seminarDocuments,
			...parsedFields
		})

		await seminar.save()

		res.status(201).json({
			status: 'success',
			seminar
		})
	} catch (error) {
		console.error('Не удалось создать семинар:', error)
		res.status(500).json({
			status: 'error',
			message: `Не удалось создать семинар: ${error.message}`,
			error: error.message
		})
	}
}

export const getSeminar = async (req, res) => {
	try {
		const seminar = await Seminar.findById(req.params.id)

		res.status(200).json({
			status: 'success',
			seminar
		})
	} catch (e) {
		res.status(404).json({
			status: 'Err',
			message: 'Семинар не найден',
			err: e
		})
	}
}

export const updateSeminar = async (req, res) => {
	try {
		const seminar = await Seminar.findById(req.params.id)
		if (!seminar) {
			return res.status(404).json({
				status: 'Err',
				message: 'Семинар с указанным id не найден'
			})
		}

		const documentFiles = extractDocumentFiles(req.files)
		const documents = req.body.documents ? JSON.parse(req.body.documents) : seminar.documents
		const updatedDocuments = await updateDocuments(documents, documentFiles)

		const parsedFields = parseJsonFields(req.body, ['disciplines', 'contacts'])

		seminar.set({
			title: req.body.title || seminar.title,
			sport: req.body.sport || seminar.sport,
			format: req.body.format || seminar.format,
			country: req.body.country || seminar.country,
			region: req.body.region || seminar.region,
			location: req.body.location || seminar.location,
			date: req.body.date ? new Date(req.body.date) : seminar.date,
			season: req.body.date ? getSeason(req.body.date) : seminar.season,
			documents: updatedDocuments,
			...parsedFields
		})

		await seminar.save()

		res.status(200).json({
			status: 'success',
			seminar
		})
	} catch (error) {
		console.error('Error updating seminar:', error)
		res.status(500).json({
			status: 'error',
			message: 'Не удалось обновить данные семинара',
			error: error.message
		})
	}
}

export const updateSeminarParticipants = async (req, res) => {
	try {
		const seminar = await Seminar.findById(req.params.id)
		if (!seminar) {
			return res.status(404).json({
				status: 'error',
				message: 'Семинар с указанным id не найден'
			})
		}

		const participants = req.body.participants ? JSON.parse(req.body.participants) : []
		seminar.participants = participants

		await seminar.save()

		res.status(200).json({
			status: 'success',
			seminar
		})
	} catch (error) {
		console.error('Error updating seminar participants:', error)
		res.status(500).json({
			status: 'error',
			message: `Не удалось обновить участников семинара: ${error.message}`,
			error: error.message
		})
	}
}

export const deleteSeminar = async (req, res) => {
	try {
		const seminar = await Seminar.findById(req.params.id)
		if (!seminar) {
			return res.status(404).json({
				status: 'error',
				message: 'Семинар с указанным id не найден'
			})
		}

		await flushDocuments(seminar)
		await seminar.deleteOne()

		res.status(200).json({
			status: 'success',
			data: 'Семинар был успешно удален'
		})
	} catch (error) {
		console.error('Error deleting seminar:', error)
		res.status(500).json({
			status: 'error',
			message: 'Не удалось удалить семинар',
			error: error.message
		})
	}
}
