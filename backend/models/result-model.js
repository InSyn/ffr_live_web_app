import mongoose from 'mongoose'

export const resultSchema = new mongoose.Schema({
	race_id: String,
	competitor_id: String,
	marks: [
		{
			judge_id: String,
			value: mongoose.Schema.Types.Mixed
		}
	],
	value: mongoose.Schema.Types.Mixed,
	gap: mongoose.Schema.Types.Mixed,
	trick_name: String
})
