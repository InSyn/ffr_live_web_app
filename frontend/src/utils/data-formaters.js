export const formatDate = (dateString, options) => {
	const date = new Date(dateString)
	if (isNaN(date)) return 'invalid date'

	// ✅ ИСПРАВЛЕНИЕ: Используем UTC методы для корректного отображения дат
	const year = date.getUTCFullYear()
	const month = String(date.getUTCMonth() + 1).padStart(2, '0')
	const day = String(date.getUTCDate()).padStart(2, '0')
	const hours = String(date.getUTCHours()).padStart(2, '0')
	const minutes = String(date.getUTCMinutes()).padStart(2, '0')

	if (options) {
		if (options.full) {
			return `${day}.${month}.${year}, ${hours}:${minutes}`
		}
		if (options.toInputFormat) {
			return `${year}-${month}-${day}T${hours}:${minutes}`
		}
		if (options.toDateInputFormat) {
			return `${year}-${month}-${day}`
		}
	}

	return `${day}.${month}.${year}`
}

export const getAthleteName = athlete => {
	if (!athlete) return

	return (athlete.lastname ? athlete.lastname + ' ' : '') + (athlete.name ? athlete.name : '')
}

export const formatBirthDate = birthDate => {
	if (!birthDate) return ''

	const dateObj = new Date(Date.parse(birthDate))

	return dateObj.getFullYear()
}

export const getAgeFromBirthdate = birthDateString => {
	if (!birthDateString || !new Date(birthDateString)) return

	const birthDate = new Date(birthDateString)
	const today = new Date()

	let age = today.getFullYear() - birthDate.getFullYear()
	const monthDifference = today.getMonth() - birthDate.getMonth()
	const dayDifference = today.getDate() - birthDate.getDate()

	if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
		age--
	}

	return age
}

export const concatStringsWithComma = strArr => {
	return strArr.filter(str => !!str).join(', ')
}
