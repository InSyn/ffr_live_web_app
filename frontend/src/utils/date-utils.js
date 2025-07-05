/**
 * Date Utilities - Стандартизированная работа с датами в UTC
 * Решает проблемы timezone и дублирования кода в календарных компонентах
 */

/**
 * Преобразует дату в UTC format для избежания timezone сдвигов
 * @param {string|Date} date - Исходная дата
 * @returns {Date} - Дата в UTC формате
 */
export const toUTCDate = date => {
	if (!date) return new Date()

	// Если уже строка в ISO формате с UTC - используем как есть
	if (typeof date === 'string' && date.includes('T00:00:00.000Z')) {
		return new Date(date)
	}

	// Принудительно добавляем UTC суффикс для корректной обработки
	const dateString =
		typeof date === 'string' ? date.split('T')[0] : date.toISOString().split('T')[0]
	return new Date(dateString + 'T00:00:00.000Z')
}

/**
 * Сравнивает две даты по дню/месяцу/году в UTC
 * @param {string|Date} date1 - Первая дата
 * @param {string|Date} date2 - Вторая дата
 * @returns {boolean} - Совпадают ли даты
 */
export const isSameUTCDate = (date1, date2) => {
	const utcDate1 = toUTCDate(date1)
	const utcDate2 = toUTCDate(date2)

	return (
		utcDate1.getUTCDate() === utcDate2.getUTCDate() &&
		utcDate1.getUTCMonth() === utcDate2.getUTCMonth() &&
		utcDate1.getUTCFullYear() === utcDate2.getUTCFullYear()
	)
}

/**
 * Проверяет, относится ли дата события к указанному дню календаря
 * @param {Object} event - Объект события
 * @param {number} calendarDay - День календаря (1-31)
 * @param {string} calendarDate - Дата календаря в формате YYYY-MM-DD
 * @returns {boolean} - Относится ли событие к этому дню
 */
export const isEventOnCalendarDay = (event, calendarDay, calendarDate) => {
	const eventDateString = event.start_at === undefined ? event.date : event.start_at
	if (!eventDateString) return false

	const eventDate = toUTCDate(eventDateString)
	const calendarDateUTC = toUTCDate(calendarDate)

	// Точное совпадение: день, месяц и год
	return (
		eventDate.getUTCDate() === parseInt(calendarDay) &&
		eventDate.getUTCMonth() === calendarDateUTC.getUTCMonth() &&
		eventDate.getUTCFullYear() === calendarDateUTC.getUTCFullYear()
	)
}

/**
 * Форматирует дату в строку YYYY-MM-DD для API запросов
 * @param {string|Date} date - Исходная дата
 * @returns {string} - Дата в формате YYYY-MM-DD
 */
export const formatDateForAPI = date => {
	return toUTCDate(date).toISOString().split('T')[0]
}

/**
 * Проверяет, является ли день текущим днём
 * @param {number} day - День для проверки (1-31)
 * @param {string} calendarDate - Дата календаря в формате YYYY-MM-DD
 * @returns {boolean} - Является ли день текущим
 */
export const isCurrentDay = (day, calendarDate) => {
	const today = new Date()
	const calendarDateUTC = toUTCDate(calendarDate)

	return (
		day === today.getDate() &&
		today.getMonth() === calendarDateUTC.getUTCMonth() &&
		today.getFullYear() === calendarDateUTC.getUTCFullYear()
	)
}
