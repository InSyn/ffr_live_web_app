import { OnlineRegistration } from '../models/onlineRegistration-model.js'
import { User } from '../models/user-model.js'
import {
	createEntityDocuments,
	extractDocumentFiles,
	parseDocuments,
	updateDocuments
} from '../utils/documentsHandlers.js'
import { flushDocuments } from '../utils/filesUtils.js'

export const getAllEventRegistrations = async (req, res) => {
	const event_id = req.params.event_id

	try {
		const registrations = await OnlineRegistration.find({ event_id })
			.sort({ created_at: -1 })
			.populate({
				path: 'athletes.athlete',
				model: 'Athlete',
				select:
					'ffr_id name lastname gender birth_date country regions sport disciplines category organizations education is_national_team trainer photo_url photo_tv_url'
			})
		res.status(200).json({
			status: 'success',
			registrations
		})
	} catch (e) {
		res.status(404).json({
			status: 'Err',
			message: 'Не удалось получить список онлайн заявок',
			err: e
		})
	}
}
export const getRegistrationById = async (req, res) => {
	try {
		const registration = await OnlineRegistration.findById(req.params.id).populate({
			path: 'athletes.athlete',
			model: 'Athlete',
			select:
				'ffr_id name lastname gender birth_date country regions sport disciplines category organizations education is_national_team trainer photo_url photo_tv_url'
		})
		res.status(200).json({
			status: 'success',
			registration
		})
	} catch (e) {
		res.status(404).json({
			status: 'Err',
			message: 'Не удалось загрузить данные заявки',
			err: e
		})
	}
}
export const findRegisteredApplicationsByUser = async (req, res) => {
	const { id } = req.user

	try {
		const registrations = await OnlineRegistration.find({ creator_id: id }).sort({ created_at: -1 })
		res.status(200).json({
			status: 'success',
			registrations
		})
	} catch (e) {
		res.status(404).json({
			status: 'Err',
			message: 'Не удалось получить список онлайн заявок',
			err: e
		})
	}
}

export const addRegistration = async (req, res) => {
	const { event_id, creator_role, creator_username, athletes, athletes_groups } = JSON.parse(
		req.body.registration_data
	)

	const user = await User.findOne({ username: creator_username })
	if (!user) {
		return res.status(400).send({ message: 'Пользователь с таким именем не найден' })
	}

	try {
		const documents = parseDocuments(req.body)
		const documentFiles = extractDocumentFiles(req.files)
		const savedDocuments = createEntityDocuments(documents, documentFiles)

		const registration = new OnlineRegistration({
			event_id,
			creator_id: user._id,
			creator_role,
			creator_username,
			region: user.region,
			created_at: new Date(),
			athletes,
			athletes_groups,
			documents: savedDocuments
		})

		await registration.save()

		res.status(200).json({
			status: 'success',
			registration
		})
	} catch (e) {
		console.error('ADD ERR', e)
		res.status(404).json({
			status: 'Err',
			message: `Ошибка отправки онлайн заявки: ${e.message}`,
			err: e
		})
	}
}

export const updateRegistration = async (req, res) => {
	const registrationId = req.params.id
	const { athletes } = JSON.parse(req.body.registration_data)

	try {
		const registration = await OnlineRegistration.findById(registrationId)
		if (!registration) {
			return res.status(404).json({
				status: 'Err',
				message: 'Заявка не найдена'
			})
		}

		const documents = parseDocuments(req.body)
		const documentFiles = extractDocumentFiles(req.files)

		const updatedDocuments = await updateDocuments(documents, documentFiles)

		registration.set({
			athletes: athletes || registration.athletes,
			documents: updatedDocuments
		})

		await registration.save()

		res.status(200).json({
			status: 'success',
			message: 'Заявка обновлена успешно',
			registration
		})
	} catch (e) {
		console.error('UPDATE ERR', e)
		res.status(500).json({
			status: 'Err',
			message: `Ошибка обновления онлайн заявки: ${e.message}`,
			err: e
		})
	}
}

export const deleteRegistration = async (req, res) => {
	const registrationId = req.params.id

	try {
		const registration = await OnlineRegistration.findById(registrationId)
		if (!registration) {
			return res.status(404).json({ message: 'Регистрация не найдена' })
		}

		await flushDocuments(registration)

		await registration.remove()

		res.status(200).json({
			status: 'success',
			message: 'Заявка удалена успешно'
		})
	} catch (e) {
		console.error('DELETE ERR', e)
		res.status(500).json({
			status: 'Err',
			message: `Ошибка удаления онлайн заявки: ${e.message}`,
			err: e
		})
	}
}
