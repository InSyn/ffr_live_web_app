import mongoose from 'mongoose'
import { documentSchema } from './document-model.js'

const registeredAthlete = {
	athlete: { type: mongoose.Schema.Types.ObjectId, ref: 'Athlete' },
	group: String
}

export const onlineRegistrationSchema = new mongoose.Schema({
	event_id: String,
	creator_id: String,
	creator_role: String,
	creator_username: String,
	region: String,
	created_at: Date,
	athletes: [registeredAthlete],
	athletes_groups: [String],
	documents: [documentSchema]
})

export const OnlineRegistration = mongoose.model('OnlineRegistration', onlineRegistrationSchema)
