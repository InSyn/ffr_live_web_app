const medalEvents = new Map([
  ['Всероссийская спартакиада', 'ВС'],
  ['Всемирная универсиада', 'ВУ'],
  ['Международные соревнования «Кубок чемпионов»', 'МСКЧ'],
  ['Кубок мира', 'КМ'],
  ['Чемпионат мира среди юниоров', 'ЧМЮ'],
  ['Чемпионат мира', 'ЧМ'],
  ['Олимпийские игры', 'ОИ'],
  ['Азиада', 'АЗ'],
  ['Русско-китайские игры', 'РКИ'],
  ['Кубок Европы', 'КЕ'],
  ['Чемпионат Европы', 'ЧЕ'],
  ['Чемпионат Европы среди юниоров', 'ЧЕЮ']
])

export const getMedalEvents = () => {
  return Array.from(medalEvents.keys()).sort((a, b) => a.localeCompare(b))
}
export const getMedalEventAbbr = evtName => {
  return medalEvents.get(evtName) || evtName
}
