import { Event } from '../models/event-model.js'
import { Athlete } from '../models/athlete-model.js'
import { Jury } from '../models/jury-model.js'
import { Trainer } from '../models/trainer-model.js'
import { Organization } from '../models/organization-model.js'
import { Seminar } from '../models/seminar-model.js'

export const getOverallDbStats = async (req, res) => {
	try {
		const events = await Event.find()
		const eventsCount = events.length
		const athletes = await Athlete.find()
		const athletesCount = athletes.length
		const jury = await Jury.find()
		const juryCount = jury.length
		const trainers = await Trainer.find()
		const trainersCount = trainers.length
		const organizations = await Organization.find()
		const organizationsCount = organizations.length
		const seminars = await Seminar.find()
		const seminarsCount = seminars.length

		res.status(200).json({
			status: 'success',
			statistics: {
				events: eventsCount,
				athletes: athletesCount,
				jury: juryCount,
				trainers: trainersCount,
				organizations: organizationsCount,
				seminars: seminarsCount
			}
		})
	} catch (e) {
		res.status(404).json({
			status: 'Err',
			message: 'Statistics not found ',
			err: e
		})
	}
}
