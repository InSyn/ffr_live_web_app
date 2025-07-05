# Дорожная Карта: Унификация Поиска для Всех Сущностей

**Версия:** 1.0
**Статус:** Активная задача
**Цель:** Привести все сущностные страницы к единому архитектурному стандарту поиска

---

## 🎯 **Эталонная Реализация: Events Page**

### **Архитектурный Паттерн (ADR-001)**

```vue
<!-- calendar-page/index.vue -->
<template>
  <div class="calendar-page content-wrapper">
    <aside class="calendar-page__sidebar">
      <search />
    </aside>
    <div class="calendar-page__content">
      <mobile-search-trigger />
      <search-results />
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    ...mapGetters('search', ['searchResults', 'isSearching'])
  },
  methods: {
    ...mapActions('search', ['setSearchMode', 'clearSearch', 'performSearch'])
  },
  created() {
    this.setSearchMode('events')
    this.performSearch()
  },
  destroyed() {
    this.clearSearch()
  }
}
</script>
```

### **Ключевые Принципы**

1. **Реактивные данные** через Vuex getters (`searchResults`, `isSearching`)
2. **Централизованные действия** через Vuex actions (`performSearch`, `setSearchMode`)
3. **Единые компоненты** (`<search>`, `<search-results>`, `<mobile-search-trigger>`)
4. **Правильный lifecycle** (`created()` + `destroyed()`)

---

## 📋 **Статус Миграции по Сущностям**

| Сущность | Статус | Backend API | Frontend | Приоритет |
|:---------|:-------|:------------|:---------|:----------|
| **Events** | ✅ Эталон | `GET /api/v1/events/find` | Полностью мигрирован | - |
| **Athletes** | 🔄 В работе | ❌ Нестандартный формат | ❌ Гибридный подход | **1 (Текущая)** |
| **Jury** | ❌ Требует анализа | ❓ Требует проверки | ❓ Требует проверки | **2** |
| **Trainers** | ❌ Требует анализа | ❓ Требует проверки | ❓ Требует проверки | **3** |
| **Organizations** | ❌ Требует анализа | ❓ Требует проверки | ❓ Требует проверки | **4** |
| **Seminars** | ❌ Требует анализа | ❓ Требует проверки | ❓ Требует проверки | **5** |

---

## 🚨 **Текущая Задача: Athletes Migration**

### **Критические Проблемы Backend**

#### **1. Нестандартный Формат Ответа**

```javascript
// ТЕКУЩИЙ searchAthletes (неправильно)
res.status(200).json({
  status: 'success',
  results: athletes.length,
  athletes
})

// ТРЕБУЕТСЯ (стандарт mongoose-paginate-v2)
const options = {
  page: parseInt(req.query.page) || 1,
  limit: parseInt(req.query.limit) || 20,
  sort: { lastname: 1, name: 1 }
}
const result = await Athlete.paginate(query, options)

res.status(200).json({
  docs: result.docs,
  totalDocs: result.totalDocs,
  limit: result.limit,
  totalPages: result.totalPages,
  page: result.page
})
```

#### **2. Отсутствие buildAthleteQuery Функции**

Нужна унификация логики построения запросов аналогично `buildEventQuery`:

```javascript
const buildAthleteQuery = req => {
  const query = {}
  
  if (req.query.ffr_id) query.ffr_id = req.query.ffr_id
  if (req.query.name) {
    const parts = req.query.name.trim().split(' ')
    if (parts.length === 1) {
      query.$or = [
        { lastname: new RegExp(parts[0], 'i') }, 
        { name: new RegExp(parts[0], 'i') }
      ]
    } else {
      query.lastname = new RegExp(parts[0], 'i')
      query.name = new RegExp(parts[1], 'i')
    }
  }
  if (req.query.gender) query.gender = req.query.gender
  if (req.query.category) query.category = req.query.category
  if (req.query.discipline) query.disciplines = new RegExp(req.query.discipline, 'i')
  if (req.query.region) query.regions = new RegExp(req.query.region, 'i')
  
  return query
}
```

### **Проблемы Frontend**

#### **1. Гибридный State Management**

```javascript
// ПРОБЛЕМА: Смешивание модулей
...mapGetters('athletes', { athletesList: 'getAthletes' }),
...mapGetters('search', ['isSearching']),

// РЕШЕНИЕ: Только search модуль
...mapGetters('search', ['searchResults', 'isSearching'])
```

#### **2. Кастомная Логика Рендеринга**

```vue
<!-- ПРОБЛЕМА: Кастомная логика в template -->
<div v-for="char in getAlphabetList(getAthletesList, 'lastname')" :key="char">
  <athlete-list-item 
    v-for="athlete in getAthletesList.filter(a => a.lastname[0].toUpperCase() === char)"
    :key="athlete._id"
    :item="athlete"
  />
</div>

<!-- РЕШЕНИЕ: Использовать унифицированный компонент -->
<search-results />
```

#### **3. Ручные Event Listeners**

```javascript
// ПРОБЛЕМА: Ручные слушатели
this.$root.$on('mobile-search-loading', this.setLoadingState)
this.$root.$on('mobile-search-results', this.showSearchResults)

// РЕШЕНИЕ: Реактивные getters из Vuex
computed: {
  ...mapGetters('search', ['searchResults', 'isSearching'])
}
```

---

## 🛠️ **Пошаговый План Реализации**

### **Этап 1: Backend Стандартизация**

#### **1.1. Обновить athlete-controller.js**

```javascript
import { Athlete } from '../models/athlete-model.js'

const buildAthleteQuery = req => {
  // Реализовать логику построения запроса
}

export const searchAthletes = async (req, res) => {
  try {
    const query = buildAthleteQuery(req)
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      sort: { lastname: 1, name: 1 }
    }
    
    const result = await Athlete.paginate(query, options)
    
    res.status(200).json({
      docs: result.docs,
      totalDocs: result.totalDocs,
      limit: result.limit,
      totalPages: result.totalPages,
      page: result.page
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: `Ошибка во время поиска: ${error.message}`
    })
  }
}
```

#### **1.2. Проверить Athlete Model**

Убедиться что модель поддерживает mongoose-paginate-v2:

```javascript
import mongoosePaginate from 'mongoose-paginate-v2'

athleteSchema.plugin(mongoosePaginate)
```

### **Этап 2: Frontend Рефакторинг**

#### **2.1. Упростить pages/athletes/index.vue**

```vue
<template>
  <div class="athletesPage__wrapper content-wrapper">
    <aside class="athletesPage__sidebar">
      <search />
    </aside>
    <div class="athletesPage__content">
      <mobile-search-trigger />
      <search-results />
    </div>
  </div>
</template>

<script>
import Search from '@/components/ui-components/search/index.vue'
import MobileSearchTrigger from '@/components/ui-components/search/mobile-search-trigger.vue'
import SearchResults from '@/components/ui-components/search/search-results.vue'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'AllAthletesPage',
  components: {
    Search,
    MobileSearchTrigger,
    SearchResults
  },
  computed: {
    ...mapGetters('search', ['searchResults', 'isSearching'])
  },
  methods: {
    ...mapActions('search', ['setSearchMode', 'clearSearch', 'performSearch'])
  },
  created() {
    this.setSearchMode('athletes')
    this.performSearch()
  },
  destroyed() {
    this.clearSearch()
  }
}
</script>
```

#### **2.2. Обновить Search Results Component**

Убедиться что `search-results.vue` поддерживает athletes:

```javascript
// components/ui-components/search/search-results.vue
switch (this.searchMode) {
  case 'events':
    return EventListItem
  case 'athletes':
    return AthleteListItem  // Добавить поддержку
  // ...
}
```

#### **2.3. Настроить Search Filters**

Проверить конфигурацию в `store/data/search-filters.js`:

```javascript
athletes: {
  ffr_id: '',
  discipline: '',
  name: '',
  gender: '',
  year: '',
  category: '',
  region: ''
}
```

### **Этап 3: QA & Тестирование**

#### **3.1. Backend Tests**

```javascript
// Создать тесты для searchAthletes
describe('GET /api/v1/athletes/find', () => {
  test('should return paginated athletes', async () => {
    const response = await request(app)
      .get('/api/v1/athletes/find?page=1&limit=10')
      .expect(200)
    
    expect(response.body).toHaveProperty('docs')
    expect(response.body).toHaveProperty('totalDocs')
    expect(response.body).toHaveProperty('totalPages')
  })
})
```

#### **3.2. Frontend Tests**

```javascript
// Обновить тесты страницы Athletes
describe('AllAthletesPage', () => {
  test('should dispatch setSearchMode on created', () => {
    // Тест lifecycle
  })
  
  test('should use search results from store', () => {
    // Тест реактивности
  })
})
```

---

## 📊 **Следующие Сущности: Анализ и Планирование**

### **Jury (Приоритет 2)**

- **Backend:** Проверить `GET /api/v1/jury/find`
- **Frontend:** Анализ `pages/jury/index.vue`
- **Ожидаемые проблемы:** Аналогичные Athletes

### **Trainers (Приоритет 3)**

- **Backend:** Проверить `GET /api/v1/trainers/find`
- **Frontend:** Анализ `pages/trainers/index.vue`

### **Organizations (Приоритет 4)**

- **Backend:** Проверить `GET /api/v1/organizations/find`
- **Frontend:** Анализ `pages/organizations/index.vue`

### **Seminars (Приоритет 5)**

- **Backend:** Проверить `GET /api/v1/seminars/find`
- **Frontend:** Анализ `pages/seminars/index.vue`

---

## ✅ **Критерии Готовности (Definition of Done)**

### **Backend**

- [ ] Контроллер возвращает стандартный формат mongoose-paginate-v2
- [ ] Функция `buildQuery` извлечена и унифицирована
- [ ] Добавлены unit тесты для поиска
- [ ] Проверена производительность запросов

### **Frontend**

- [ ] Страница использует только Vuex модуль `search`
- [ ] Удалена вся локальная логика состояния
- [ ] Использует компоненты `<search>`, `<search-results>`, `<mobile-search-trigger>`
- [ ] Правильный lifecycle (created/destroyed)
- [ ] Адаптивный дизайн работает корректно

### **QA**

- [ ] Все поисковые фильтры работают
- [ ] Пагинация функционирует
- [ ] Мобильная версия работает
- [ ] Нет регрессии в UX
- [ ] Покрытие тестами увеличено

---

## 🎯 **Ожидаемые Результаты**

1. **Унифицированная архитектура** для всех сущностных страниц
2. **Сокращение дублирования кода** на 70-80%
3. **Улучшение maintainability** за счет централизации логики
4. **Консистентный UX** на всех страницах
5. **Основа для будущих улучшений** (Vue 3 migration, новые функции)
