export const sports = [
  {
    code: 'FS',
    name: 'Freestyle',
    name_rus: 'Фристайл',
    disciplines: [
      { code: 'MO', name_rus: 'Могул' },
      { code: 'DM', name_rus: 'Парный могул' },
      { code: 'AE', name_rus: 'Акробатика' },
      { code: 'AET', name_rus: 'Командная акробатика' },
      { code: 'AES', name_rus: 'Синхронная Акробатика' },
      { code: 'SX', name_rus: 'Ски-кросс' },
      { code: 'SXT', name_rus: 'Командный ски-кросс' },
      { code: 'HP', name_rus: 'Хаф-пайп' },
      { code: 'SS', name_rus: 'Слоуп-стайл' },
      { code: 'BA', name_rus: 'Биг-эйр' },
      { code: 'RE', name_rus: 'Рэйл' }
    ]
  }
  // {
  //   code: 'SB',
  //   name: 'Snowboard',
  //   name_rus: 'Сноуборд',
  //   disciplines: [
  //     { code: 'HP', name_rus: 'Хаф-пайп' },
  //     { code: 'SS', name_rus: 'Слоуп-стайл' },
  //     { code: 'BA', name_rus: 'Биг-эйр' },
  //     { code: 'RE', name_rus: 'Рэйл' },
  //     { code: 'PSL', name_rus: 'Параллельный слалом' },
  //     { code: 'PGS', name_rus: 'Параллельный слалом гигант' },
  //     { code: 'PRT', name_rus: 'Командный параллельный слалом' },
  //     { code: 'GS', name_rus: 'Слалом гигант' },
  //     { code: 'SL', name_rus: 'Слалом' },
  //     { code: 'SBX', name_rus: 'Сноуборд-кросс' },
  //     { code: 'BXT', name_rus: 'Командный сноуборд-кросс' },
  //   ],
  // },
]

export const checkCompetitionDiscipline = (competition, dscCodesArr) => {
  if (!competition || !dscCodesArr || !dscCodesArr.length) return false

  const dscName = (competition && competition.discipline_code) || ''
  return dscCodesArr.some(dscCode => dscName === dscCode)
}

export const getDisciplines = athleteSport => {
  if (!athleteSport) return
  const sport = sports.find(sport => {
    return sport.name_rus.toLowerCase() === athleteSport.toString().toLowerCase()
  })
  if (!sport) return []

  return sport.disciplines
}

export const getDisciplineCode = discipline => {
  if (!discipline) return ''

  const sport = sports.find(spt =>
    spt.disciplines.some(dsc => dsc.name_rus.toLowerCase() === discipline.toLowerCase())
  )
  if (!sport) return ''

  const dscCode = sport.disciplines.find(
    dsc => dsc.name_rus.toLowerCase() === discipline.toLowerCase()
  ).code
  if (!dscCode) return ''

  return dscCode
}

export const isQualification = competition => {
  if (!competition) return false

  const stage = competition.stage ? competition.stage.split(' ')[0] : ''
  return stage === 'Квалификация'
}
export const isQualificationOfDisciplines = (competition, dscCodes) => {
  return isQualification(competition) && checkCompetitionDiscipline(competition, dscCodes)
}

export const isFinal = competition => {
  if (!competition) return false

  const stage = competition.stage ? competition.stage.split(' ')[0] : ''
  return stage.toLowerCase() === 'финал'
}
export const isFinalOfDisciplines = (competition, dscCodes) => {
  return isFinal(competition) && checkCompetitionDiscipline(competition, dscCodes)
}
