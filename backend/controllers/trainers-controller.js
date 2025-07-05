import { Trainer } from '../models/trainer-model.js'
import { Athlete } from '../models/athlete-model.js'
import { formatFullname } from '../utils/formatters.js'
import { Seminar } from '../models/seminar-model.js'
import { deleteFileIfExists, parseJsonFields } from '../utils/filesUtils.js'

const buildTrainerQuery = req => {
	const query = {}

	// Текстовый поиск по fullname (следуя паттерну из architectural-guide)
	if (req.query.fullname) {
		query.fullname = new RegExp(req.query.fullname, 'i')
	}

	// Точные фильтры
	if (req.query.trainer_id) query.trainer_id = req.query.trainer_id
	if (req.query.discipline) query.disciplines = req.query.discipline
	if (req.query.gender) query.gender = req.query.gender
	if (req.query.region) query.region = new RegExp(req.query.region, 'i')

	return query
}

const getLastTrainerCode = async () => {
	const lastTrainer = await Trainer.findOne().sort({ _id: -1 })
	const lastIndex = lastTrainer ? lastTrainer.trainer_id : null

	return lastIndex ? Number(lastIndex) + 1 : '200001'
}

export const getAllTrainers = async (req, res) => {
	try {
		const trainers = await Trainer.find().sort({ fullname: 1 })
		res.status(200).json({
			status: 'success',
			trainers
		})
	} catch (e) {
		res.status(404).json({
			status: 'Err',
			message: 'Тренеры не найдены',
			err: e
		})
	}
}

export const getTrainer = async (req, res) => {
	try {
		const trainer = await Trainer.findOne({ trainer_id: req.params.code })

		res.status(200).json({
			status: 'success',
			trainer
		})
	} catch (e) {
		res.status(404).json({
			status: 'Err',
			message: 'Тренер с таким кодом не найден',
			err: e
		})
	}
}

export const searchTrainers = async (req, res) => {
	try {
		const query = buildTrainerQuery(req)
		const options = {
			page: parseInt(req.query.page) || 1,
			limit: parseInt(req.query.limit) || 20,
			sort: { fullname: 1 }
		}

		console.log('🔍 Search Trainers Query:', JSON.stringify(query, null, 2))
		console.log('🔍 Search Parameters:', req.query)

		const result = await Trainer.paginate(query, options)

		console.log(`🔍 Found ${result.docs.length} trainers, total: ${result.totalDocs}`)
		if (result.docs.length > 0) {
			console.log('🔍 Sample trainers:')
			result.docs.slice(0, 3).forEach(trainer => {
				console.log(`  - ${trainer.fullname} (${trainer.trainer_id})`)
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

export const addNewTrainer = async (req, res) => {
	try {
		const photoUrl = req.files.photo_url ? `/uploads/images/${req.files.photo_url[0].filename}` : ''
		const parsedFields = parseJsonFields(req.body, ['disciplines', 'rank', 'position', 'socials'])

		const trainer = new Trainer({
			photo_url: photoUrl,
			trainer_id: req.body.trainer_id || (await getLastTrainerCode()),
			fullname: formatFullname(req.body.fullname),
			birth_date: req.body.birth_date,
			gender: req.body.gender,
			country: req.body.country,
			region: req.body.region,
			sport: req.body.sport,
			trainer_category: req.body.trainer_category,
			is_national_team: req.body.is_national_team,
			...parsedFields
		})

		await trainer.save()

		res.status(200).json({
			status: 'success',
			trainer
		})
	} catch (e) {
		console.error('ADD ERR', e)
		res.status(404).json({
			status: 'Err',
			message: `Не удалось добавить тренера: ${e.message}`,
			err: e
		})
	}
}

export const updateTrainer = async (req, res) => {
	try {
		const trainer = await Trainer.findOne({ trainer_id: req.params.code })
		if (!trainer) {
			return res.status(404).json({
				status: 'Err',
				message: 'Тренер с таким кодом не найден'
			})
		}

		const originalPhotoUrl = trainer.photo_url
		const photoUrl = req.files.photo_url
			? `/uploads/images/${req.files.photo_url[0].filename}`
			: trainer.photo_url
		const parsedFields = parseJsonFields(req.body, ['disciplines', 'rank', 'position', 'socials'])

		trainer.set({
			photo_url: photoUrl,
			trainer_id: req.body.trainer_id || trainer.trainer_id,
			fullname: req.body.fullname || trainer.fullname,
			birth_date: req.body.birth_date || trainer.birth_date,
			gender: req.body.gender || trainer.gender,
			country: req.body.country || trainer.country,
			region: req.body.region || trainer.region,
			sport: req.body.sport || trainer.sport,
			trainer_category: req.body.trainer_category || trainer.trainer_category,
			is_national_team:
				req.body.is_national_team !== undefined
					? req.body.is_national_team
					: trainer.is_national_team,
			...parsedFields
		})

		await trainer.save()

		if (photoUrl !== originalPhotoUrl && originalPhotoUrl) {
			await deleteFileIfExists(originalPhotoUrl)
		}

		res.status(200).json({
			status: 'success',
			trainer
		})
	} catch (e) {
		console.error('UPDATE ERR', e)
		res.status(500).json({
			status: 'Err',
			message: `Не удалось обновить тренера: ${e.message}`,
			err: e.message
		})
	}
}

export const deleteTrainer = async (req, res) => {
	try {
		const trainer = await Trainer.findOne({ trainer_id: req.params.code })
		if (!trainer) {
			return res.status(404).json({
				status: 'Err',
				message: 'Тренер с таким кодом не найден'
			})
		}

		if (trainer.photo_url) {
			await deleteFileIfExists(trainer.photo_url)
		}

		await trainer.deleteOne()

		res.status(200).json({
			status: 'success',
			data: 'Тренер был успешно удален'
		})
	} catch (e) {
		console.error('DELETE ERR', e)
		res.status(500).json({
			status: 'Err',
			message: 'Не удалось удалить тренера',
			err: e.message
		})
	}
}

export const getTrainerTeam = async (req, res) => {
	try {
		const trainer = await Trainer.findOne({ trainer_id: req.params.code })
		if (!trainer) {
			return res.status(404).json({
				status: 'Err',
				message: 'Тренер с таким кодом не найден'
			})
		}

		const athletes = await Athlete.find(
			{ 'trainer.trainer_id': { $eq: req.params.code } },
			{
				gender: 0,
				organizations: 0,
				is_national_team: 0,
				trainer: 0,
				education: 0,
				hobbies: 0,
				athleteAbout: 0,
				equipment: 0,
				medals: 0,
				sponsors: 0,
				socials: 0
			}
		).sort({
			lastname: 1,
			name: 1
		})

		res.status(200).json({
			status: 'success',
			athletes
		})
	} catch (e) {
		console.error('Error fetching athletes by trainer ID:', e)
		res.status(500).json({
			status: 'Err',
			message: `Не удалось загрузить спортсменов: ${e.message}`,
			error: e.message
		})
	}
}

export const getTrainerSeminars = async (req, res) => {
	try {
		const seminars = await Seminar.find(
			{ 'participants.code': req.params.code },
			{ participants: 0, contacts: 0 }
		).sort({ date: -1 })

		res.status(200).json({
			status: 'success',
			seminars
		})
	} catch (e) {
		res.status(500).json({
			status: 'Err',
			message: `Не удалось получить список семинаров тренера: ${e.message}`,
			err: e
		})
	}
}
