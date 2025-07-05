import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

export const athleteTrainerSchema = new mongoose.Schema({
	trainer_id: String,
	fullname: String
})

export const trainerSchema = new mongoose.Schema({
	photo_url: String,
	trainer_id: { type: String, unique: true, required: true },
	fullname: String,
	gender: String,
	birth_date: Date || null,
	country: String,
	region: String,
	sport: String,
	disciplines: [String],
	trainer_category: String,
	rank: [String],
	position: [String],
	is_national_team: Boolean,
	socials: {
		vk: String,
		telegram: String
	}
})

trainerSchema.index({
	trainer_id: 1,
	fullname: 'text',
	region: 1
})

// Добавляем плагин пагинации для стандартизации API
trainerSchema.plugin(mongoosePaginate)

export const Trainer = mongoose.model('Trainer', trainerSchema)
