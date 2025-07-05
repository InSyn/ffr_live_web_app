import mongoose from 'mongoose'
import { faker } from '@faker-js/faker'
import { Organization } from '../../models/organization-model.js'
import { Trainer } from '../../models/trainer-model.js'
import { Jury } from '../../models/jury-model.js'
import { Athlete } from '../../models/athlete-model.js'
import { Event } from '../../models/event-model.js'
import { Seminar } from '../../models/seminar-model.js'

const MONGODB_URI =
	process.env.MONGODB_URI ||
	'mongodb://admin:password@localhost:27017/ffr_live_dev?authSource=admin'

// 🎯 РЕАЛИСТИЧНЫЕ ДАННЫЕ FFR (Frontend constraints)
const DISCIPLINES = [
	'Могул',
	'Парный могул',
	'Акробатика',
	'Командная акробатика',
	'Синхронная Акробатика',
	'Ски-кросс',
	'Командный ски-кросс',
	'Хаф-пайп',
	'Слоуп-стайл',
	'Биг-эйр',
	'Рэйл'
]

const EVENT_TYPES = [
	'Кубок России',
	'Чемпионат России',
	'Первенство России',
	'Кубок мира',
	'Этап Кубка мира',
	'Тренировочные сборы',
	'Международные соревнования',
	'Региональные соревнования'
]

const EVENT_STATUSES = ['Завершено', 'В процессе', 'Запланировано', 'Отменено']

const COMPETITION_VENUES = [
	'Роза Хутор (Сочи)',
	'Бобровый Лог (Красноярск)',
	'Горнолыжный курорт Шерегеш',
	'Металлург (Магнитогорск)',
	'Кант (Московская область)',
	'Игора (Санкт-Петербург)',
	'Абзаково (Башкортостан)',
	'Белокуриха (Алтайский край)',
	'Мраморная гора (Кемеровская область)',
	'Южно-Сахалинск'
]

const JURY_CATEGORIES = [
	'Спортивный судья третьей категории',
	'Спортивный судья второй категории',
	'Спортивный судья первой категории',
	'Спортивный судья всероссийской категории',
	'Спортивный судья международной категории'
]

const ATHLETE_CATEGORIES = [
	'Первый юношеский разряд',
	'Второй юношеский разряд',
	'Третий юношеский разряд',
	'Третий взрослый разряд',
	'Второй взрослый разряд',
	'Первый взрослый разряд',
	'Кандидат в мастера спорта',
	'Мастер спорта',
	'Мастер спорта международного класса',
	'Заслуженный мастер спорта'
]

const TRAINER_CATEGORIES = [
	'Тренер высшей квалификационной категории',
	'Тренер первой квалификационной категории',
	'Тренер второй квалификационной категории'
]

const RUSSIAN_REGIONS = [
	'Москва',
	'Санкт-Петербург',
	'Московская область',
	'Краснодарский край',
	'Свердловская область',
	'Новосибирская область',
	'Татарстан',
	'Челябинская область',
	'Нижегородская область',
	'Самарская область',
	'Омская область',
	'Ростовская область',
	'Уфа',
	'Красноярский край',
	'Пермский край',
	'Воронежская область',
	'Волгоградская область',
	'Краснодар',
	'Саратовская область',
	'Тюменская область',
	'Тольятти',
	'Ижевск',
	'Барнаул',
	'Ульяновская область',
	'Иркутская область'
]

const RUSSIAN_CITIES = [
	'Москва',
	'Санкт-Петербург',
	'Новосибирск',
	'Екатеринбург',
	'Казань',
	'Нижний Новгород',
	'Челябинск',
	'Самара',
	'Омск',
	'Ростов-на-Дону',
	'Уфа',
	'Красноярск',
	'Воронеж',
	'Пермь',
	'Волгоград',
	'Краснодар',
	'Саратов',
	'Тюмень',
	'Тольятти',
	'Ижевск',
	'Барнаул',
	'Ульяновск',
	'Иркутск',
	'Хабаровск',
	'Ярославль',
	'Владивосток',
	'Махачкала',
	'Томск',
	'Оренбург',
	'Кемерово'
]

const FREESTYLE_ORGANIZATIONS = [
	'Федерация фристайла России',
	'ЦСКА',
	'Динамо Москва',
	'Спартак',
	'Локомотив',
	'СКА Санкт-Петербург',
	'Урал-Грейт',
	'Сибиряк Новосибирск',
	'Металлург Магнитогорск',
	'Северсталь',
	'Авангард Омск',
	'Салават Юлаев',
	'Ак Барс Казань',
	'Трактор Челябинск'
]

const SEASONS = ['2020-2021', '2021-2022', '2022-2023', '2023-2024', '2024-2025', '2025-2026']

const RUSSIAN_FIRST_NAMES_M = [
	'Александр',
	'Дмитрий',
	'Максим',
	'Сергей',
	'Андрей',
	'Алексей',
	'Артем',
	'Илья',
	'Кирилл',
	'Михаил',
	'Никита',
	'Матвей',
	'Роман',
	'Егор',
	'Арсений',
	'Иван',
	'Денис',
	'Евгений',
	'Даниил',
	'Тимофей',
	'Владислав',
	'Игорь',
	'Владимир',
	'Павел',
	'Руслан',
	'Марк',
	'Глеб',
	'Ярослав',
	'Георгий',
	'Давид'
]

const RUSSIAN_FIRST_NAMES_F = [
	'Анна',
	'Елена',
	'Ирина',
	'Ольга',
	'Татьяна',
	'Наталья',
	'Юлия',
	'Марина',
	'Светлана',
	'Анастасия',
	'Екатерина',
	'Дарья',
	'Алина',
	'Ксения',
	'Полина',
	'Валерия',
	'Виктория',
	'София',
	'Варвара',
	'Вероника',
	'Алиса',
	'Кристина',
	'Ангелина',
	'Милана',
	'Александра',
	'Елизавета',
	'Арина',
	'Диана',
	'Алёна',
	'Карина'
]

const RUSSIAN_LAST_NAMES = [
	'Иванов',
	'Смирнов',
	'Кузнецов',
	'Попов',
	'Васильев',
	'Петров',
	'Соколов',
	'Михайлов',
	'Новиков',
	'Федоров',
	'Морозов',
	'Волков',
	'Алексеев',
	'Лебедев',
	'Семенов',
	'Егоров',
	'Павлов',
	'Козлов',
	'Степанов',
	'Николаев',
	'Орлов',
	'Андреев',
	'Макаров',
	'Никитин',
	'Захаров',
	'Зайцев',
	'Соловьев',
	'Борисов',
	'Яковлев',
	'Григорьев',
	'Романов',
	'Воробьев',
	'Сергеев',
	'Фролов',
	'Козырев',
	'Панов',
	'Комаров',
	'Белов',
	'Гуляев',
	'Титов'
]

function randomFromArray(arr, count = 1) {
	const shuffled = arr.slice().sort(() => 0.5 - Math.random())
	return count === 1 ? shuffled[0] : shuffled.slice(0, count)
}

function generateFFRId() {
	return `FFR-${faker.string.numeric(4)}-${faker.string.numeric(4)}`
}

function generateJuryCode() {
	return `J${faker.string.numeric(3)}-${faker.string.numeric(2)}`
}

function generateTrainerCode() {
	return `T${faker.string.numeric(3)}-${faker.string.numeric(2)}`
}

function generateRussianName(gender) {
	const firstName =
		gender === 'Мужской'
			? randomFromArray(RUSSIAN_FIRST_NAMES_M)
			: randomFromArray(RUSSIAN_FIRST_NAMES_F)
	const lastName = randomFromArray(RUSSIAN_LAST_NAMES)

	// Женские фамилии с окончанием -а
	const femaleLastName =
		gender === 'Женский' && !lastName.endsWith('а') && !lastName.endsWith('ич')
			? lastName + 'а'
			: lastName

	return { firstName, lastName: femaleLastName }
}

async function seed() {
	try {
		await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
		console.log('Connected to MongoDB')

		// Clear existing data
		await Promise.all([
			Organization.deleteMany({}),
			Trainer.deleteMany({}),
			Jury.deleteMany({}),
			Athlete.deleteMany({}),
			Event.deleteMany({}),
			Seminar.deleteMany({})
		])
		console.log('Cleared existing data')

		// 1. Organizations (6 для тестирования пагинации)
		const organizations = []
		FREESTYLE_ORGANIZATIONS.slice(0, 6).forEach(orgName => {
			organizations.push({
				logo_url: `https://picsum.photos/120/80?random=${organizations.length + 7000}`,
				title: orgName,
				country: 'Россия',
				region: randomFromArray(RUSSIAN_REGIONS),
				sport: 'Фристайл',
				contacts: [
					`+7 ${faker.string.numeric(3)} ${faker.string.numeric(3)}-${faker.string.numeric(2)}-${faker.string.numeric(2)}`,
					`${faker.internet.username()}@${orgName.toLowerCase().replace(/\s+/g, '')}.ru`
				],
				socials: {
					vk: `https://vk.com/${faker.internet.username()}`,
					telegram: `@${faker.internet.username()}`
				},
				reports: []
			})
		})
		const orgDocs = await Organization.insertMany(organizations)
		console.log(`Seeded ${organizations.length} organizations`)

		// 2. Trainers (25 для тестирования пагинации)
		const trainers = []
		for (let i = 0; i < 25; i++) {
			const gender = randomFromArray(['Мужской', 'Женский'])
			const { firstName, lastName } = generateRussianName(gender)

			trainers.push({
				photo_url: `https://picsum.photos/200/250?random=${i + 4000}`,
				trainer_id: generateTrainerCode(),
				fullname: `${lastName} ${firstName}`,
				gender: gender,
				birth_date: faker.date.birthdate({ min: 1970, max: 1995, mode: 'year' }),
				country: 'Россия',
				region: randomFromArray(RUSSIAN_REGIONS),
				sport: 'Фристайл',
				disciplines: randomFromArray(DISCIPLINES, faker.number.int({ min: 1, max: 3 })),
				trainer_category: randomFromArray(TRAINER_CATEGORIES),
				rank: [randomFromArray(ATHLETE_CATEGORIES)],
				position: ['Старший тренер', 'Тренер', 'Тренер-преподаватель'][i % 3],
				is_national_team: faker.datatype.boolean(0.2), // 20% вероятность
				socials: {
					vk: `https://vk.com/${faker.internet.username()}`,
					telegram: `@${faker.internet.username()}`
				}
			})
		}
		const trainerDocs = await Trainer.insertMany(trainers)
		console.log(`Seeded ${trainers.length} trainers`)

		// 3. Jury (35 для тестирования пагинации)
		const juries = []
		for (let i = 0; i < 35; i++) {
			const gender = randomFromArray(['Мужской', 'Женский'])
			const { firstName, lastName } = generateRussianName(gender)

			juries.push({
				jury_code: generateJuryCode(),
				is_secretary: faker.datatype.boolean(0.15), // 15% секретарей
				photo_url: `https://picsum.photos/200/250?random=${i + 3000}`,
				name: firstName,
				lastname: lastName,
				gender: gender,
				birth_date: faker.date.birthdate({ min: 1960, max: 1995, mode: 'year' }),
				country: 'Россия',
				region: randomFromArray(RUSSIAN_REGIONS),
				jury_category: randomFromArray(JURY_CATEGORIES),
				sport: 'Фристайл',
				disciplines: randomFromArray(DISCIPLINES, faker.number.int({ min: 1, max: 4 })),
				socials: {
					vk: `https://vk.com/${faker.internet.username()}`,
					telegram: `@${faker.internet.username()}`
				}
			})
		}
		const juryDocs = await Jury.insertMany(juries)
		console.log(`Seeded ${juries.length} jury`)

		// 4. Athletes (55 для тестирования пагинации - 3 страницы по 20)
		const athletes = []
		for (let i = 0; i < 55; i++) {
			const gender = randomFromArray(['Мужской', 'Женский'])
			const { firstName, lastName } = generateRussianName(gender)
			const org = randomFromArray(orgDocs)
			const trainer = randomFromArray(trainerDocs)

			athletes.push({
				ffr_id: generateFFRId(),
				name: firstName,
				lastname: lastName,
				gender: gender,
				birth_date: faker.date.birthdate({ min: 2000, max: 2010, mode: 'year' }),
				photo_url: `https://picsum.photos/200/250?random=${i + 1000}`,
				photo_tv_url: `https://picsum.photos/400/300?random=${i + 2000}`,
				country: 'Россия',
				country_code: 'RU',
				regions: [randomFromArray(RUSSIAN_REGIONS)],
				organizations: [org.title],
				sport: 'Фристайл',
				disciplines: randomFromArray(DISCIPLINES, faker.number.int({ min: 1, max: 3 })),
				category: randomFromArray(ATHLETE_CATEGORIES),
				is_national_team: faker.datatype.boolean(0.1), // 10% в сборной
				trainer: {
					trainer_id: trainer.trainer_id,
					fullname: trainer.fullname
				},
				education: `${randomFromArray(RUSSIAN_CITIES)} спортивная школа № ${faker.number.int({ min: 1, max: 50 })}`,
				hobbies: randomFromArray(
					['Музыка', 'Чтение', 'Плавание', 'Теннис', 'Фотография', 'Путешествия'],
					2
				),
				athlete_about: `Спортсмен из ${randomFromArray(RUSSIAN_REGIONS)}, занимается фристайлом с ${faker.number.int({ min: 8, max: 15 })} лет.`,
				equipment: randomFromArray(['Head', 'Rossignol', 'Salomon', 'Atomic', 'K2'], 1),
				medals: [],
				sponsors: [],
				socials: {
					vk: `https://vk.com/${faker.internet.username()}`,
					telegram: `@${faker.internet.username()}`
				}
			})
		}
		const athleteDocs = await Athlete.insertMany(athletes)
		console.log(`Seeded ${athletes.length} athletes`)

		// 5. Events (30 для тестирования пагинации)
		const events = []
		for (let i = 0; i < 30; i++) {
			const org = randomFromArray(orgDocs)
			const selectedJury = randomFromArray(juryDocs, faker.number.int({ min: 3, max: 6 }))
			const forerunners = randomFromArray(athleteDocs, faker.number.int({ min: 2, max: 4 })).map(
				a => ({
					number: `${faker.number.int({ min: 1, max: 99 })}`,
					name: `${a.lastname} ${a.name}`,
					region_code: a.regions[0] || randomFromArray(RUSSIAN_REGIONS)
				})
			)

			const disciplines = randomFromArray(DISCIPLINES)
			const startDate = faker.date.between({
				from: '2024-12-01',
				to: '2025-08-31'
			})

			events.push({
				event_id: `EVT-${faker.string.numeric(4)}-${faker.string.numeric(2)}`,
				created_at: faker.date.recent({ days: 30 }),
				logo_image_url: `https://picsum.photos/300/200?random=${i + 5000}`,
				track_image_url: `https://picsum.photos/800/400?random=${i + 6000}`,
				calendar_code: faker.string.alphanumeric(8).toUpperCase(),
				title: `Кубок ${randomFromArray(RUSSIAN_REGIONS)} по фристайлу ${new Date(startDate).getFullYear()}`,
				international: faker.datatype.boolean(0.3),
				start_at: startDate,
				season: randomFromArray(SEASONS),
				sport: 'Фристайл',
				discipline: disciplines,
				country: 'Россия',
				region: randomFromArray(RUSSIAN_REGIONS),
				location: randomFromArray(RUSSIAN_CITIES),
				organization: org.title,
				organization_logo: org.logo_url,
				timing_provider: randomFromArray(['TimingWeb', 'Datasport', 'SkiData', 'Freestyle Timing']),
				translation_url: faker.datatype.boolean(0.4)
					? `https://stream.ffr-ski.ru/event${i + 1}`
					: '',
				jury: selectedJury.map(j => ({
					jury_code: j.jury_code,
					role: randomFromArray([
						'Главный судья',
						'Судья на старте',
						'Судья на финише',
						'Секретарь'
					]),
					name: j.name,
					lastname: j.lastname,
					category: j.jury_category
				})),
				track_info: [
					`Длина трассы: ${faker.number.int({ min: 200, max: 800 })}м`,
					`Перепад высот: ${faker.number.int({ min: 50, max: 200 })}м`
				],
				conditions: randomFromArray(['Ясно', 'Облачно', 'Снег', 'Туман'], 1),
				forerunners,
				competitions: [],
				start_protocols: [],
				result_protocols: [],
				documents: [],
				contacts: [
					`+7 ${faker.string.numeric(3)} ${faker.string.numeric(3)}-${faker.string.numeric(2)}-${faker.string.numeric(2)}`
				],
				is_public: faker.datatype.boolean(0.8),
				registration_status: faker.datatype.boolean(0.6),
				allow_registration_by_trainer: faker.datatype.boolean(0.7),
				allow_registration_by_organization: faker.datatype.boolean(0.5),
				allowed_secretaries: selectedJury.filter(j => j.is_secretary).map(j => j._id),
				athletes_groups: randomFromArray(['Мужчины', 'Женщины', 'Юноши', 'Девушки'], 2)
			})
		}
		await Event.insertMany(events)
		console.log(`Seeded ${events.length} events`)

		// 6. Seminars (12 для тестирования пагинации)
		const seminars = []
		for (let i = 0; i < 12; i++) {
			const seminarDate = faker.date.between({
				from: '2024-11-01',
				to: '2025-06-30'
			})

			seminars.push({
				title: `Семинар судей по ${randomFromArray(DISCIPLINES)} ${new Date(seminarDate).getFullYear()}`,
				sport: 'Фристайл',
				disciplines: randomFromArray(DISCIPLINES, faker.number.int({ min: 1, max: 2 })),
				format: randomFromArray(['Очный', 'Заочный', 'Смешанный']),
				country: 'Россия',
				region: randomFromArray(RUSSIAN_REGIONS),
				location: randomFromArray(RUSSIAN_CITIES),
				date: seminarDate,
				season: randomFromArray(SEASONS),
				documents: [],
				contacts: [
					`seminar${i + 1}@ffr-ski.ru`,
					`+7 ${faker.string.numeric(3)} ${faker.string.numeric(3)}-${faker.string.numeric(2)}-${faker.string.numeric(2)}`
				],
				participants: []
			})
		}
		await Seminar.insertMany(seminars)
		console.log(`Seeded ${seminars.length} seminars`)

		console.log('🎉 Database seeding completed successfully with realistic FFR data!')
		console.log('📊 Pagination testing ready:')
		console.log(`   - Athletes: ${athletes.length} (3 pages x 20)`)
		console.log(`   - Jury: ${juries.length} (2 pages x 20)`)
		console.log(`   - Trainers: ${trainers.length} (2 pages x 20)`)
		console.log(`   - Events: ${events.length} (2 pages x 20)`)
		console.log(`   - Organizations: ${organizations.length} (1 page)`)
		console.log(`   - Seminars: ${seminars.length} (1 page)`)

		await mongoose.disconnect()
	} catch (error) {
		console.error('Seeding error:', error)
		await mongoose.disconnect()
		process.exit(1)
	}
}

// Запуск seeder если файл выполняется напрямую
// Windows compatibility fix
console.log('🚀 Starting FFR Live Platform seeder...')
console.log('📂 Using MongoDB URI:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@'))
seed()

export default seed
