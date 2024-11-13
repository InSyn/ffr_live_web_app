const translationMap = new Map([
  //--------Роли--------//
  ['athlete', 'Спортсмен'],
  ['jury', 'Судья'],
  ['trainer', 'Тренер'],
  ['regional_organization', 'Организация'],
  ['admin', 'Админ'],
  //----------------------//

  //----Поля событий----//
  ['sport', 'Вид спорта'],
  ['discipline', 'Дисциплина'],
  ['disciplines', 'Дисциплины'],
  ['season', 'Сезон'],
  ['date', 'Дата'],
  ['country', 'Страна'],
  ['location', 'Место проведения'],
  ['region', 'Регион'],
  ['regions', 'Регион'],
  ['title', 'Название'],
  ['image_url', 'Изображение'],
  ['start_at', 'Дата начала'],
  ['description', 'Описание'],
  ['organization', 'Организатор'],
  ['timing_provider', 'Сервис'],
  ['calendar_code', 'Код ЕКП'],
  ['international', 'Международное'],
  ['is_public', 'Видят все'],
  ['translation_url', 'Ссылка трансляции'],
  //-------------------------------------//

  //        Поля ID        //
  ['rus_code', 'FFR-ID'],
  ['jury_code', 'FFR-ID'],
  ['trainer_id', 'FFR-ID'],
  //                    //

  //---Поля спортсменов/персонала---//
  ['name', 'Имя'],
  ['lastname', 'Фамилия'],
  ['fullname', 'ФИО'],
  ['gender', 'Пол'],
  ['year', 'Год рождения'],
  ['category', 'Разряд'],
  ['jury_category', 'Категория'],
  ['trainer_category', 'Категория'],
  ['birth_date', 'День рождения'],
  ['age', 'Возраст'],
  ['organizations', 'Школы'],
  ['trainer', 'Тренер'],
  ['education', 'Образование'],
  ['socials', 'Соц. сети'],
  ['sponsors', 'Спонсоры'],
  ['is_national_team', 'Сборная'],
  ['equipment', 'Инвентарь'],
  ['hobbies', 'Хобби'],
  ['athleteAbout', 'О себе'],
  ['medals', 'Медали'],
  //------------------------//

  ['rank', 'Звание'],
  ['position', 'Должность'],

  ['man', 'Мужчина'],
  ['woman', 'Женщина'],
  ['men', 'Мужчины'],
  ['women', 'Женщины'],

  ['photo_url', 'Фото'],
  ['photo_tv_url', 'Фото для ТВ'],
  ['logo_url', 'Логотип'],

  ['contacts', 'Контакты'],
  ['documents', 'Документы'],
  ['format', 'Формат'],
  ['level', 'Уровень'],
]);

export const translateField = (field_name) => {
  return translationMap.get(field_name) || field_name;
};
