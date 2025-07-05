import { Athlete } from '../models/athlete-model.js'
import { Event } from '../models/event-model.js'
import { formatLastname } from '../utils/formatters.js'
import { deleteFileIfExists, extractFilesByPrefix, parseJsonFields } from '../utils/filesUtils.js'

const getLastAthleteCode = async () => {
	const lastAthlete = await Athlete.findOne().sort({ _id: -1 })
	const lastIndex = lastAthlete ? lastAthlete.ffr_id : null

	return (Number(lastIndex) + 1).toString().padStart(4, '0') || '0001'
}

export const getAllAthletes = async (req, res) => {
	try {
		const athletes = await Athlete.find().sort({ lastname: 1, name: 1 })
		res.status(200).json({
			status: 'success',
			athletes
		})
	} catch (e) {
		res.status(404).json({
			status: 'Err',
			message: 'Спортсмены не найдены',
			err: e
		})
	}
}

export const searchAthletes = async (req, res) => {
	try {
		const query = buildAthleteQuery(req)
		const options = {
			page: parseInt(req.query.page) || 1,
			limit: parseInt(req.query.limit) || 20,
			sort: { lastname: 1, name: 1 }
		}

		console.log('🔍 Search Athletes Query:', JSON.stringify(query, null, 2))
		console.log('🔍 Search Parameters:', req.query)

		const result = await Athlete.paginate(query, options)

		console.log(`🔍 Found ${result.docs.length} athletes, total: ${result.totalDocs}`)
		if (result.docs.length > 0) {
			console.log('🔍 Sample athletes:')
			result.docs.slice(0, 3).forEach(athlete => {
				console.log(`  - ${athlete.lastname} ${athlete.name} (${athlete.ffr_id})`)
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

// Вспомогательная функция для построения запроса (следуя паттерну buildEventQuery)
const buildAthleteQuery = req => {
	const query = {}

	// FFR ID точный поиск
	if (req.query.ffr_id) {
		query.ffr_id = req.query.ffr_id
	}

	// Текстовый поиск по имени (паттерн из architectural-guide)
	if (req.query.name) {
		const parts = req.query.name.trim().split(' ')
		if (parts.length === 1) {
			query.$or = [{ lastname: new RegExp(parts[0], 'i') }, { name: new RegExp(parts[0], 'i') }]
		} else {
			query.lastname = new RegExp(parts[0], 'i')
			query.name = new RegExp(parts[1], 'i')
		}
	}

	// Точные фильтры
	if (req.query.gender) query.gender = req.query.gender
	if (req.query.sport) query.sport = req.query.sport
	if (req.query.category) query.category = req.query.category

	// Год рождения
	if (req.query.year) {
		const year = parseInt(req.query.year, 10)
		const startOfYear = new Date(Date.UTC(year, 0, 1))
		const endOfYear = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999))
		query.birth_date = {
			$gte: startOfYear,
			$lte: endOfYear
		}
	}

	// Regex фильтры для массивов
	if (req.query.country) query.country = new RegExp(req.query.country, 'i')
	if (req.query.region) query.regions = new RegExp(req.query.region, 'i')
	if (req.query.discipline) query.disciplines = new RegExp(req.query.discipline, 'i')

	return query
}

export const addNewAthlete = async (req, res) => {
	try {
		const photo_url = req.files.photo_url
			? `/uploads/images/${req.files.photo_url[0].filename}`
			: ''
		const photo_tv_url = req.files.photo_tv_url
			? `/uploads/images/${req.files.photo_tv_url[0].filename}`
			: ''
		const sponsorsFiles = extractFilesByPrefix(req.files, 'sponsor')

		const parsedFields = parseJsonFields(req.body, [
			'regions',
			'organizations',
			'disciplines',
			'trainer',
			'equipment',
			'hobbies',
			'medals',
			'socials'
		])

		const athlete = new Athlete({
			ffr_id: req.body.ffr_id ? req.body.ffr_id : await getLastAthleteCode(),
			name: req.body.name,
			lastname: formatLastname(req.body.lastname),
			gender: req.body.gender,
			birth_date: req.body.birth_date,
			photo_url,
			photo_tv_url,
			country: req.body.country,
			sport: req.body.sport,
			category: req.body.category,
			is_national_team: req.body.is_national_team,
			education: req.body.education,
			athlete_about: req.body.athlete_about,
			sponsors: req.body.sponsors
				? JSON.parse(req.body.sponsors).map((sponsor, idx) => ({
						...sponsor,
						logo_url: sponsorsFiles[`sponsor${idx}_logo`] || ''
					}))
				: [],
			...parsedFields
		})

		await athlete.save()

		res.status(200).json({
			status: 'success',
			athlete
		})
	} catch (e) {
		console.error('ADD ERR', e)
		res.status(500).json({
			status: 'Err',
			message: `Не удалось добавить спортсмена: ${e.message}`,
			err: e
		})
	}
}

export const updateAthlete = async (req, res) => {
	const athleteId = req.params.code

	try {
		const athlete = await Athlete.findOne({ ffr_id: athleteId })
		if (!athlete) {
			return res.status(404).json({
				status: 'Err',
				message: 'Спортсмен с таким кодом не найден'
			})
		}

		const originalPhotoUrl = athlete.photo_url
		const originalPhotoTvUrl = athlete.photo_tv_url
		const originalSponsorLogos = athlete.sponsors.map(sponsor => sponsor.logo_url)

		const photo_url = req.files.photo_url
			? `/uploads/images/${req.files.photo_url[0].filename}`
			: athlete.photo_url
		const photo_tv_url = req.files.photo_tv_url
			? `/uploads/images/${req.files.photo_tv_url[0].filename}`
			: athlete.photo_tv_url
		const sponsorsFiles = extractFilesByPrefix(req.files, 'sponsor')

		const parsedFields = parseJsonFields(req.body, [
			'regions',
			'organizations',
			'disciplines',
			'trainer',
			'equipment',
			'hobbies',
			'medals',
			'socials'
		])

		const updatedSponsors = req.body.sponsors
			? JSON.parse(req.body.sponsors).map((sponsor, idx) => ({
					...sponsor,
					logo_url: sponsorsFiles[`sponsor${idx}_logo`] || sponsor.logo_url
				}))
			: athlete.sponsors

		athlete.set({
			ffr_id: req.body.ffr_id || athlete.ffr_id,
			name: req.body.name || athlete.name,
			lastname: formatLastname(req.body.lastname) || athlete.lastname,
			gender: req.body.gender || athlete.gender,
			birth_date: req.body.birth_date || athlete.birth_date,
			country: req.body.country || athlete.country,
			sport: req.body.sport || athlete.sport,
			category: req.body.category || athlete.category,
			photo_url,
			photo_tv_url,
			sponsors: updatedSponsors,
			is_national_team:
				req.body.is_national_team !== undefined
					? req.body.is_national_team
					: athlete.is_national_team,
			education: req.body.education || athlete.education,
			athlete_about: req.body.athlete_about || athlete.athlete_about,
			...parsedFields
		})

		await athlete.save()

		if (photo_url !== originalPhotoUrl && originalPhotoUrl) {
			await deleteFileIfExists(originalPhotoUrl)
		}
		if (photo_tv_url !== originalPhotoTvUrl && originalPhotoTvUrl) {
			await deleteFileIfExists(originalPhotoTvUrl)
		}

		await Promise.all(
			originalSponsorLogos.map(async (logo, idx) => {
				const newLogo = updatedSponsors[idx]?.logo_url
				if (newLogo && logo !== newLogo) {
					await deleteFileIfExists(logo)
				}
			})
		)

		res.status(200).json({
			status: 'success',
			athlete
		})
	} catch (e) {
		console.error('UPDATE ERR', e)
		res.status(500).json({
			status: 'Err',
			message: `Не удалось обновить данные спортсмена: ${e.message}`,
			err: e.message
		})
	}
}

export const getAthlete = async (req, res) => {
	try {
		const athlete = await Athlete.findOne({ ffr_id: req.params.code })

		res.status(200).json({
			status: 'success',
			athlete
		})
	} catch (e) {
		res.status(404).json({
			status: 'Err',
			message: 'Athlete not found',
			err: e
		})
	}
}

export const getAthleteCompetitions = async (req, res) => {
	try {
		const events = await Event.find(
			{
				'competitions.competitors.ffr_id': req.params.code
			},
			{
				created_at: 0,
				description: 0,
				organization: 0,
				timing_provider: 0,
				'competitions.races': 0
			}
		).sort({ start_at: -1 })

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

export const getAthleteTvPhotoUrl = async (req, res) => {
	try {
		const athlete = await Athlete.findOne({ ffr_id: req.params.code })
		if (!athlete || !athlete.photo_tv_url) {
			return res.status(404).json({
				status: 'Err',
				message: 'Фотография для трансляции не найдена!'
			})
		}

		res.redirect(302, athlete.photo_tv_url)
	} catch (e) {
		console.error('GET TV PHOTO URL ERR', e)
		res.status(500).json({
			status: 'Err',
			message: 'Не удалось получить URL фото TV',
			err: e.message
		})
	}
}

export const deleteAthlete = async (req, res) => {
	const athleteId = req.params.code

	try {
		const athlete = await Athlete.findOne({ ffr_id: athleteId })
		if (!athlete) {
			return res.status(404).json({
				status: 'Err',
				message: 'Спортсмен с таким кодом не найден'
			})
		}
		if (athlete.photo_url) {
			await deleteFileIfExists(athlete.photo_url)
		}
		if (athlete.photo_tv_url) {
			await deleteFileIfExists(athlete.photo_tv_url)
		}
		if (athlete.sponsors && athlete.sponsors.length > 0) {
			await Promise.all(athlete.sponsors.map(sponsor => deleteFileIfExists(sponsor.logo_url)))
		}
		await Athlete.deleteOne({ ffr_id: athleteId })
		res.status(200).json({
			status: 'success',
			message: 'Спортсмен успешно удален!'
		})
	} catch (e) {
		console.error('DELETE ERR', e)
		res.status(500).json({
			status: 'Err',
			message: `Не удалось удалить данные спортсмена: ${e.message}`,
			err: e.message
		})
	}
}
