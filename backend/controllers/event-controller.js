import { nanoid } from 'nanoid'
import { Event, CupEvent } from '../models/event-model.js'
import { deleteFileIfExists, extractFilesByPrefix, parseJsonFields } from '../utils/filesUtils.js'

const buildEventQuery = req => {
	const query = {}

	// ✅ ИСПРАВЛЕНО: Frontend отправляет 'title', backend ищет по 'title' в БД
	if (req.query.title) query.title = new RegExp(req.query.title, 'i')
	// ✅ ИСПРАВЛЕНО: Frontend отправляет 'discipline', backend ищет по 'discipline' в БД (не disciplines)
	if (req.query.discipline) query.discipline = new RegExp(req.query.discipline, 'i')
	if (req.query.season) query.season = req.query.season

	const dateQuery = {}
	// ✅ ИСПРАВЛЕНИЕ: Точная дата - фильтр событий на конкретный день с UTC
	if (req.query.date) {
		const inputDate = req.query.date
		// Принудительно используем UTC для избежания сдвигов часовых поясов
		const selectedDate = new Date(inputDate + 'T00:00:00.000Z')
		const startOfDay = new Date(selectedDate)
		startOfDay.setUTCHours(0, 0, 0, 0)
		const endOfDay = new Date(selectedDate)
		endOfDay.setUTCHours(23, 59, 59, 999)

		console.log(
			`🔍 Date Search - Input: ${inputDate}, Start: ${startOfDay.toISOString()}, End: ${endOfDay.toISOString()}`
		)

		dateQuery.$gte = startOfDay
		dateQuery.$lte = endOfDay
	} else {
		// Диапазон дат - существующая логика с UTC исправлением
		if (req.query.date_from) {
			const fromDate = new Date(req.query.date_from + 'T00:00:00.000Z')
			dateQuery.$gte = fromDate
		}
		if (req.query.date_to) {
			const toDate = new Date(req.query.date_to + 'T00:00:00.000Z')
			toDate.setUTCHours(23, 59, 59, 999)
			dateQuery.$lte = toDate
		}
	}

	if (Object.keys(dateQuery).length > 0) {
		query.start_at = dateQuery
	}

	if (req.query.location) query.location = new RegExp(req.query.location, 'i')
	if (req.query.calendar_code) query.calendar_code = req.query.calendar_code

	return query
}

export const getAllEvents = async (req, res) => {
	try {
		const events = await Event.find({}, { competitions: 0 }).sort({ start_at: -1 })

		res.status(200).json({
			status: 'success',
			events
		})
	} catch (error) {
		res.status(500).json({
			status: 'Err',
			message: `Ошибка во время поиска: ${error.message}`,
			error
		})
	}
}

export const searchEvents = async (req, res) => {
	try {
		const query = buildEventQuery(req)
		const options = {
			page: parseInt(req.query.page) || 1,
			limit: parseInt(req.query.limit) || 20,
			sort: { start_at: -1 }
		}

		// ✅ УЛУЧШЕННОЕ ЛОГИРОВАНИЕ: Показываем детали поиска
		console.log('🔍 Search Events Query:', JSON.stringify(query, null, 2))
		console.log('🔍 Search Parameters:', req.query)

		const result = await Event.paginate(query, options)

		// ✅ УЛУЧШЕННОЕ ЛОГИРОВАНИЕ: Показываем результаты с датами
		if (result.docs.length > 0) {
			console.log('🔍 Found events with dates:')
			result.docs.forEach(event => {
				console.log(`  - ${event.title}: ${event.start_at}`)
			})
		} else {
			console.log('🔍 No events found for query')
		}

		res.status(200).json({
			docs: result.docs,
			totalDocs: result.totalDocs,
			limit: result.limit,
			totalPages: result.totalPages,
			page: result.page
		})
	} catch (error) {
		res.status(500).json({
			status: 'error',
			message: `Ошибка во время поиска: ${error.message}`
		})
	}
}

export const getEventByDate = async (req, res) => {
	try {
		// ✅ ИСПРАВЛЕНИЕ: Корректная работа с UTC для избежания сдвигов часовых поясов
		const inputDate = req.params.date
		const date = new Date(inputDate + 'T00:00:00.000Z') // Принудительно UTC
		const year = date.getUTCFullYear()
		const month = date.getUTCMonth()

		// Получаем ТОЛЬКО события за месяц для календарных индикаторов
		const startDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0))
		const endDate =
			month === 11
				? new Date(Date.UTC(year + 1, 0, 0, 23, 59, 59, 999))
				: new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999))

		console.log(
			`📅 Calendar Search - Input: ${inputDate}, Start: ${startDate.toISOString()}, End: ${endDate.toISOString()}`
		)

		const events = await Event.find({
			start_at: {
				$gte: startDate,
				$lte: endDate
			}
		}).sort({
			start_at: -1
		})

		console.log(`📅 Found ${events.length} events for month ${month + 1}/${year}`)

		res.status(200).json({
			status: 'success',
			events
		})
	} catch (e) {
		res.status(404).json({
			status: 'Err',
			message: 'События не найдены',
			err: e
		})
	}
}

export const getEventsWithRegistration = async (req, res) => {
	try {
		const events = await Event.find({ registration_status: true }).sort({ start_at: -1 })
		res.status(200).json({
			status: 'success',
			events
		})
	} catch (error) {
		res.status(500).json({
			status: 'Err',
			message: 'Нет соревнований с открытой онлайн-регистрацией',
			error
		})
	}
}

export const getEvent = async (req, res) => {
	try {
		const event = await Event.findOne({ event_id: req.params.id })

		if (!event) {
			return res.status(404).json({ message: 'Event not found' })
		}

		res.status(200).json({
			status: 'success',
			event
		})
	} catch (e) {
		res.status(404).json({
			status: 'Err',
			message: e.message
		})
	}
}

export const addNewEvent = async (req, res) => {
	try {
		const logo_image_url = req.files.logo_image_url
			? `/uploads/images/${req.files.logo_image_url[0].filename}`
			: null
		const documentFiles = extractFilesByPrefix(req.files, 'document')
		const startProtocolsFiles = extractFilesByPrefix(req.files, 'start_protocol')
		const resultProtocolsFiles = extractFilesByPrefix(req.files, 'result_protocol')

		const parsedFields = parseJsonFields(req.body, [
			'jury',
			'track_info',
			'conditions',
			'forerunners',
			'competitions',
			'contacts',
			'allowed_secretaries',
			'athletes_groups'
		])

		const event = new Event({
			...req.body,
			event_id: nanoid(5),
			created_at: Date.now(),
			logo_image_url,
			...parsedFields,
			documents: req.body.documents
				? JSON.parse(req.body.documents).map((doc, idx) => ({
						...doc,
						file: documentFiles[`document${idx}`] || ''
					}))
				: [],
			start_protocols: req.body.start_protocols
				? JSON.parse(req.body.start_protocols).map((doc, idx) => ({
						...doc,
						file: startProtocolsFiles[`start_protocol${idx}`] || ''
					}))
				: [],
			result_protocols: req.body.result_protocols
				? JSON.parse(req.body.result_protocols).map((doc, idx) => ({
						...doc,
						file: resultProtocolsFiles[`result_protocol${idx}`] || ''
					}))
				: []
		})

		await event.save()
		res.status(200).json({
			status: 'success',
			event
		})
	} catch (e) {
		res.status(400).json({ message: e.message })
	}
}

export const updateEvent = async (req, res) => {
	try {
		const event = await Event.findOne({ event_id: req.params.id })
		if (!event) {
			return res.status(404).json({ message: 'Event not found' })
		}
		const originalLogoUrl = event.logo_image_url
		const logo_image_url = req.files.logo_image_url
			? `/uploads/images/${req.files.logo_image_url[0].filename}`
			: event.logo_image_url

		const documentFiles = extractFilesByPrefix(req.files, 'document')
		const startProtocolsFiles = extractFilesByPrefix(req.files, 'start_protocol')
		const resultProtocolsFiles = extractFilesByPrefix(req.files, 'result_protocol')

		const parsedFields = parseJsonFields(req.body, [
			'jury',
			'track_info',
			'conditions',
			'forerunners',
			'competitions',
			'contacts',
			'allowed_secretaries',
			'athletes_groups'
		])

		const updatedEventData = {
			...req.body,
			logo_image_url,
			...parsedFields,
			documents: req.body.documents
				? JSON.parse(req.body.documents).map((doc, idx) => ({
						...doc,
						file: documentFiles[`document${idx}`] || doc.file
					}))
				: event.documents,
			start_protocols: req.body.start_protocols
				? JSON.parse(req.body.start_protocols).map((doc, idx) => ({
						...doc,
						file: startProtocolsFiles[`start_protocol${idx}`] || doc.file
					}))
				: event.start_protocols,
			result_protocols: req.body.result_protocols
				? JSON.parse(req.body.result_protocols).map((doc, idx) => ({
						...doc,
						file: resultProtocolsFiles[`result_protocol${idx}`] || doc.file
					}))
				: event.result_protocols
		}
		const updatedEvent = await Event.findOneAndUpdate(
			{ event_id: req.params.id },
			updatedEventData,
			{ new: true }
		)

		if (logo_image_url !== originalLogoUrl && originalLogoUrl) {
			await deleteFileIfExists(originalLogoUrl)
		}

		res.status(200).json({
			status: 'success',
			event: updatedEvent
		})
	} catch (e) {
		res.status(500).json({ message: e.message })
	}
}

export const updateEventRegistrationSettings = async (req, res) => {
	try {
		const { event_id } = req.params

		const updateFields = {}

		if ('registration_status' in req.body)
			updateFields.registration_status = req.body.registration_status
		if ('allow_registration_by_trainer' in req.body)
			updateFields.allow_registration_by_trainer = req.body.allow_registration_by_trainer
		if ('allow_registration_by_organization' in req.body)
			updateFields.allow_registration_by_organization = req.body.allow_registration_by_organization
		if ('allowed_secretaries' in req.body)
			updateFields.allowed_secretaries = req.body.allowed_secretaries
		if ('athletes_groups' in req.body) updateFields.athletes_groups = req.body.athletes_groups

		if (Object.keys(updateFields).length === 0) {
			return res.status(400).json({ status: 'Err', message: 'Нет данных для обновления' })
		}

		const updatedEvent = await Event.findOneAndUpdate(
			{ event_id },
			{ $set: updateFields },
			{ new: true }
		)

		if (!updatedEvent) {
			return res.status(404).json({ status: 'Err', message: 'Событие не найдено' })
		}
		res.status(200).json({ status: 'success', event: updatedEvent })
	} catch (e) {
		res
			.status(500)
			.json({ status: 'Err', message: `Не удалось обновить событие: ${e.message}`, err: e })
	}
}

export const updateEventResults = async (req, res) => {
	const { event_id } = req.body

	try {
		const event = await Event.findOne({ event_id })

		if (!event) {
			return res.status(404).json({ message: 'Событие не найдено' })
		}

		const updateFields = {}

		if (req.body.competitions !== undefined) {
			updateFields.competitions = req.body.competitions
		}
		if (req.body.jury !== undefined) {
			updateFields.jury = req.body.jury
		}
		if (req.body.forerunners !== undefined) {
			updateFields.forerunners = req.body.forerunners
		}
		if (req.body.track_info !== undefined) {
			updateFields.track_info = req.body.track_info
		}
		if (req.body.conditions !== undefined) {
			updateFields.conditions = req.body.conditions
		}

		await Event.updateOne(
			{ event_id },
			{
				$set: updateFields
			}
		)

		res.status(200).json({ status: 'success', message: 'Результаты успешно обновлены' })
	} catch (error) {
		res
			.status(500)
			.json({ status: 'error', message: `Ошибка при обновлении результатов: ${error.message}` })
	}
}

export const deleteEvent = async (req, res) => {
	try {
		const event = await Event.findOne({ event_id: req.params.id })
		if (event.logo_image_url) {
			deleteFileIfExists(event.logo_image_url)
		}
		await Event.findOneAndDelete({ event_id: req.params.id })
		res.status(200).json({
			status: 'success',
			message: 'Event deleted successfully!'
		})
	} catch (e) {
		res.status(500).json({ message: e.message })
	}
}

export const addRace = async (req, res) => {
	try {
		const event = await Event.findOne({ event_id: req.params.id })
		const competition = event.competitions.find(c => c._id.toString() === req.body.competition_id)
		competition.races.push(req.body.race)
		await event.save()
		res.status(200).json({ message: 'Race added successfully' })
	} catch (e) {
		res.status(500).json({ message: e.message })
	}
}

export const getRaces = async (req, res) => {
	try {
		const event = await Event.findOne({ event_id: req.params.id })
		res.status(200).json({ races: event.races })
	} catch (e) {
		res.status(500).json({ message: e.message })
	}
}

export const getRace = async (req, res) => {
	try {
		const event = await Event.findOne({ event_id: req.params.id })
		const race = event.races.id(req.params.race_id)
		res.status(200).json({ race })
	} catch (e) {
		res.status(500).json({ message: e.message })
	}
}

export const updateRace = async (req, res) => {
	try {
		await Event.updateOne(
			{ 'competitions.races._id': req.params.race_id },
			{ $set: { 'competitions.$[].races.$[race]': req.body.race } },
			{ arrayFilters: [{ 'race._id': req.params.race_id }] }
		)
		res.status(200).json({ message: 'Race updated successfully' })
	} catch (e) {
		res.status(500).json({ message: e.message })
	}
}

export const deleteRace = async (req, res) => {
	try {
		const event = await Event.findOne({ event_id: req.params.id })
		const competition = event.competitions.find(c => c._id.toString() === req.body.competition_id)
		competition.races.pull(req.params.race_id)
		await event.save()
		res.status(200).json({ message: 'Race deleted successfully' })
	} catch (e) {
		res.status(500).json({ message: e.message })
	}
}

export const getCupEvents = async (req, res) => {
	try {
		const cupEvents = await CupEvent.find().populate('cup_events')
		res.status(200).json({
			status: 'success',
			cupEvents
		})
	} catch (e) {
		res.status(404).json({
			status: 'Err',
			message: e.message
		})
	}
}
