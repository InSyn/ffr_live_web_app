import { Event } from '../models/event-model.js'
import { Jury } from '../models/jury-model.js'
import { formatLastname } from '../utils/formatters.js'
import { Seminar } from '../models/seminar-model.js'
import { User } from '../models/user-model.js'
import { deleteFileIfExists, parseJsonFields } from '../utils/filesUtils.js'

const getLastJuryCode = async () => {
	const lastJury = await Jury.findOne().sort({ _id: -1 })
	const lastIndex = lastJury ? lastJury.jury_code : null

	return lastIndex ? Number(lastIndex) + 1 : '100001'
}

const buildJuryQuery = req => {
	const query = {}

	if (req.query.jury_code) query.jury_code = req.query.jury_code

	if (req.query.name) {
		const parts = req.query.name.split(' ')
		if (parts.length === 1) {
			query.$or = [{ lastname: new RegExp(parts[0], 'i') }, { name: new RegExp(parts[0], 'i') }]
		} else {
			query.lastname = new RegExp(parts[0], 'i')
			query.name = new RegExp(parts[1], 'i')
		}
	}

	if (req.query.sport) query.sport = req.query.sport
	if (req.query.discipline) query.disciplines = req.query.discipline
	if (req.query.gender) query.gender = req.query.gender
	if (req.query.age) {
		const age = parseInt(req.query.age)
		const currentDate = new Date()
		const minBirthDate = new Date(
			currentDate.getFullYear() - (age + 1),
			currentDate.getMonth(),
			currentDate.getDate()
		)
		const maxBirthDate = new Date(
			currentDate.getFullYear() - age,
			currentDate.getMonth(),
			currentDate.getDate()
		)
		query.birth_date = { $gte: minBirthDate, $lt: maxBirthDate }
	}
	if (req.query.jury_category) query.jury_category = req.query.jury_category
	if (req.query.region) query.region = new RegExp(req.query.region, 'i')

	return query
}

export const getAllJury = async (req, res) => {
	try {
		const jury = await Jury.find({}, { seminars: 0 }).sort({
			lastname: 1,
			name: 1
		})
		res.status(200).json({
			status: 'success',
			jury
		})
	} catch (e) {
		res.status(404).json({
			status: 'Err',
			message: 'Jury not found ',
			err: e
		})
	}
}
export const getSecretaries = async (req, res) => {
	try {
		const jury = await Jury.find({ isSecretary: true }, { seminars: 0 }).sort({
			lastname: 1,
			name: 1
		})
		res.status(200).json({
			status: 'success',
			jury
		})
	} catch (e) {
		res.status(404).json({
			status: 'Err',
			message: 'Секретари не найдены',
			err: e
		})
	}
}

export const getJury = async (req, res) => {
	try {
		const jury = await Jury.findOne({ jury_code: req.params.code })

		res.status(200).json({
			status: 'success',
			jury
		})
	} catch (e) {
		res.status(404).json({
			status: 'Err',
			message: 'Jury not found',
			err: e
		})
	}
}

export const searchJury = async (req, res) => {
	try {
		const query = buildJuryQuery(req)
		const options = {
			page: parseInt(req.query.page) || 1,
			limit: parseInt(req.query.limit) || 20,
			sort: { lastname: 1, name: 1 }
		}

		console.log('🔍 Search Jury Query:', JSON.stringify(query, null, 2))
		console.log('🔍 Search Parameters:', req.query)

		const result = await Jury.paginate(query, options)

		console.log(`🔍 Found ${result.docs.length} jury, total: ${result.totalDocs}`)
		if (result.docs.length > 0) {
			console.log('🔍 Sample jury:')
			result.docs.slice(0, 3).forEach(jury => {
				console.log(`  - ${jury.lastname} ${jury.name} (${jury.jury_code})`)
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

export const addNewJury = async (req, res) => {
	try {
		const photoUrl = req.files.photoUrl ? `/uploads/images/${req.files.photoUrl[0].filename}` : ''
		const parsedFields = parseJsonFields(req.body, ['disciplines', 'socials', 'seminars'])

		const jury = new Jury({
			jury_code: req.body.jury_code || (await getLastJuryCode()),
			photo_url: photoUrl,
			name: req.body.name,
			lastname: formatLastname(req.body.lastname),
			gender: req.body.gender,
			birth_date: req.body.birth_date,
			country: req.body.country,
			region: req.body.region,
			jury_category: req.body.jury_category,
			sport: req.body.sport,
			...parsedFields
		})

		await jury.save()

		res.status(200).json({
			status: 'success',
			jury
		})
	} catch (e) {
		console.error('ADD ERR', e)
		res.status(500).json({
			status: 'Err',
			message: 'Не удалось добавить судью:' + e.message,
			err: e
		})
	}
}

export const updateJury = async (req, res) => {
	try {
		const jury = await Jury.findOne({ jury_code: req.params.code })
		if (!jury) {
			return res.status(404).json({
				status: 'Err',
				message: 'Судья с таким кодом не найден'
			})
		}

		const originalPhotoUrl = jury.photo_url
		const photoUrl = req.files.photo_url
			? `/uploads/images/${req.files.photo_url[0].filename}`
			: jury.photo_url
		const parsedFields = parseJsonFields(req.body, ['disciplines', 'socials'])

		jury.set({
			jury_code: req.body.jury_code || jury.jury_code,
			photo_url: photoUrl,
			name: req.body.name || jury.name,
			lastname: req.body.lastname || jury.lastname,
			gender: req.body.gender || jury.gender,
			birth_date: req.body.birth_date || jury.birth_date,
			country: req.body.country || jury.country,
			region: req.body.region || jury.region,
			jury_category: req.body.jury_category || jury.jury_category,
			sport: req.body.sport || jury.sport,
			...parsedFields
		})

		await jury.save()

		if (photoUrl !== originalPhotoUrl && originalPhotoUrl) {
			await deleteFileIfExists(originalPhotoUrl)
		}

		res.status(200).json({
			status: 'success',
			jury
		})
	} catch (e) {
		console.error('UPDATE ERR', e)
		res.status(500).json({
			status: 'Err',
			message: 'Не удалось обновить данные судьи',
			err: e.message
		})
	}
}

export const setSecretaryRole = async (req, res) => {
	try {
		const jury = await Jury.findOne({ jury_code: req.params.code })
		const juryUser = await User.findOne({ ffr_id: req.params.code })
		if (!jury || !juryUser) {
			return res.status(404).json({
				status: 'Err',
				message: jury ? 'Аккаунт судьи не найден' : 'Судья не найден'
			})
		}

		jury.isSecretary = !jury.isSecretary
		await jury.save()
		juryUser.role = jury.isSecretary ? 'secretary' : 'jury'
		await juryUser.save()

		res.status(200).json({
			status: 'success',
			jury
		})
	} catch (e) {
		console.error('UPDATE ERR', e)
		res.status(500).json({
			status: 'Err',
			message: 'Не удалось изменить роль судьи',
			err: e.message
		})
	}
}

export const deleteJury = async (req, res) => {
	try {
		const jury = await Jury.findOne({
			jury_code: req.params.code
		})
		if (!jury) {
			return res.status(404).json({
				status: 'Err',
				message: 'Судья с таким кодом не найден'
			})
		}

		if (jury.photo_url) await deleteFileIfExists(jury.photo_url)

		await Jury.deleteOne({ jury_code: req.params.code })

		res.status(200).json({
			status: 'success',
			data: 'Судья был успешно удален'
		})
	} catch (e) {
		res.status(404).json({
			status: 'Err',
			message: 'Не удалось удалить судью',
			err: e.message
		})
	}
}

export const getJuryCompetitions = async (req, res) => {
	try {
		const events = await Event.find(
			{ 'jury.jury_code': req.params.code },
			{
				_id: 1,
				title: 1,
				start_at: 1,
				discipline: 1,
				event_id: 1,
				'jury.$': 1
			}
		).sort({ start_at: -1 })

		const juryCompetitions = events.map(event => ({
			_id: event._id,
			title: event.title,
			start_at: event.start_at,
			discipline: event.discipline,
			event_id: event.event_id,
			jury: event.jury.find(j => j.jury_code === req.params.code)
		}))

		res.status(200).json({
			status: 'success',
			events: juryCompetitions
		})
	} catch (e) {
		res.status(404).json({
			status: 'Err',
			message: 'Не удалось получить список соревнований судьи',
			err: e
		})
	}
}

export const getJurySeminars = async (req, res) => {
	try {
		const seminars = await Seminar.find(
			{ 'participants.jury_code': req.params.code },
			{
				_id: 1,
				title: 1,
				start_at: 1,
				discipline: 1,
				seminar_id: 1,
				'participants.$': 1
			}
		).sort({ start_at: -1 })

		const jurySeminars = seminars.map(seminar => ({
			_id: seminar._id,
			title: seminar.title,
			start_at: seminar.start_at,
			discipline: seminar.discipline,
			seminar_id: seminar.seminar_id,
			participant: seminar.participants.find(p => p.jury_code === req.params.code)
		}))

		res.status(200).json({
			status: 'success',
			seminars: jurySeminars
		})
	} catch (e) {
		res.status(404).json({
			status: 'Err',
			message: 'Не удалось получить список семинаров судьи',
			err: e
		})
	}
}
