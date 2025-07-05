import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
import { athleteTrainerSchema } from './trainer-model.js'

const sponsorSchema = new mongoose.Schema({
	logo_url: String,
	sponsor_link: String
})
const medalEventSchema = new mongoose.Schema({
	name: String,
	gold: mongoose.Schema.Types.Mixed,
	silver: mongoose.Schema.Types.Mixed,
	bronze: mongoose.Schema.Types.Mixed
})

export const forerunnerSchema = new mongoose.Schema({
	number: String,
	name: String,
	region_code: String
})

export const competingAthleteSchema = new mongoose.Schema({
	local_id: String,
	bib: mongoose.Schema.Types.Mixed,

	ffr_id: String,
	name: String,
	lastname: String,
	country: String,
	region: String,
	country_code: String,
	region_code: String
})
export const athleteSchema = new mongoose.Schema({
	ffr_id: { type: String, required: true, unique: true },

	name: { type: String, required: true },
	lastname: { type: String, required: true },
	gender: String,
	birth_date: Date,

	photo_url: String,
	photo_tv_url: String,

	country: String,
	country_code: String,
	regions: [String],
	organizations: [String],

	sport: { type: String, required: true },
	disciplines: [String],
	category: String,
	is_national_team: Boolean,
	trainer: athleteTrainerSchema,
	education: String,
	hobbies: [String],
	athleteAbout: String,

	equipment: [String],
	medals: [medalEventSchema],
	sponsors: [sponsorSchema],
	socials: {
		vk: String,
		telegram: String
	}
})

athleteSchema.index({
	ffr_id: 1,
	name: 'text',
	lastname: 'text'
})

// Добавляем плагин пагинации для стандартизации API
athleteSchema.plugin(mongoosePaginate)

export const Athlete = mongoose.model('Athlete', athleteSchema)
