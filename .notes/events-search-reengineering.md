# FFR Live Platform: Events Search System Reengineering

**Version:** 1.0
**Date:** 2025-01-15
**Purpose:** Complete analysis and redesign of calendar/search system

---

## 🚨 CURRENT PROBLEMS (Critical Analysis)

### 1. **Calendar Page Issues**

- ❌ Переключение месяца не обновляет список соревнований
- ❌ Соревнования показываются не под своими датами  
- ❌ При первой загрузке страницы список соревнований пуст
- ❌ Поиск сломан, соревнования не обновляются

### 2. **Root Causes (Multi-Agent Analysis)**

#### **Backend Agent - API Issues:**

```
- buildEventQuery() function inconsistencies
- Date handling UTC vs local timezone problems
- Route handler parameter validation missing
- mongoose-paginate-v2 format not unified
```

#### **Frontend Agent - State Management Issues:**

```
- Race conditions between loadCalendarEvents and performSearch
- Mixed calendar/search result display logic
- searchQueryWithoutDates filtering problems  
- updateFilters logic causing infinite loops
```

#### **QA Agent - Data Flow Issues:**

```
- Calendar date selection vs search date filters conflict
- No clear separation between calendar display and search results
- Loading states not properly managed
- Error handling inconsistent
```

---

## 📋 SYSTEM ARCHITECTURE (From Scratch)

### **1. Data Flow Design**

```mermaid
graph TD
    A[Calendar Page Load] --> B[setSearchMode('events')]
    B --> C[loadCalendarEvents(currentMonth)]
    C --> D[Display Month Events]
    
    E[User Clicks Day] --> F[setDateFilter(selectedDate)]
    F --> G[performSearch(dateFilter)]
    G --> H[Display Filtered Events]
    
    I[User Changes Month] --> J[updateCalendarDate(newMonth)]
    J --> K[loadCalendarEvents(newMonth)]
    K --> L[clearDateFilter()]
    L --> D
```

### **2. Component Responsibility Matrix**

| Component | Purpose | Data Source | Actions |
|-----------|---------|-------------|---------|
| **calendar-page/index.vue** | Page controller | Vuex getters | dispatch actions |
| **calendar-carousel.vue** | Calendar UI | props from parent | emit events |
| **search/index.vue** | Search form | Vuex search state | update filters |
| **search-results.vue** | Results display | Vuex search results | pagination |

### **3. State Management (ADR-001 Compliance)**

```javascript
// NEW: search.js state structure
const state = {
  // Search functionality
  searchMode: '',
  searchQuery: {},
  searchResults: [],
  isSearching: false,
  
  // Calendar-specific state
  calendarEvents: [],        // Month events for calendar display
  calendarDate: null,        // Currently selected calendar date
  isLoadingCalendar: false,
  
  // Pagination
  currentPage: 1,
  totalPages: 0,
  totalResults: 0
}
```

---

## 🔧 TECHNICAL IMPLEMENTATION PLAN

### **Phase 1: Backend API Standardization**

#### **1.1 Fix event-controller.js**

```javascript
// ✅ STANDARDIZED: buildEventQuery function
const buildEventQuery = (req) => {
  const query = { is_public: true } // Only public events
  
  // Date handling (consistent UTC)
  if (req.query.date) {
    const targetDate = new Date(req.query.date)
    query.start_at = {
      $gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
      $lt: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1)
    }
  }
  
  if (req.query.date_from && req.query.date_to) {
    query.start_at = {
      $gte: new Date(req.query.date_from),
      $lte: new Date(req.query.date_to)
    }
  }
  
  // Text search
  if (req.query.name) {
    query.name = new RegExp(req.query.name, 'i')
  }
  
  // Other filters
  if (req.query.discipline) query.disciplines = new RegExp(req.query.discipline, 'i')
  if (req.query.season) query.season = req.query.season
  if (req.query.place) query.place = new RegExp(req.query.place, 'i')
  if (req.query.ekp_code) query.ekp_code = new RegExp(req.query.ekp_code, 'i')
  
  return query
}

// ✅ STANDARDIZED: Search endpoint
export const searchEvents = async (req, res) => {
  try {
    const query = buildEventQuery(req)
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      sort: { start_at: 1 },
      select: 'name disciplines season place ekp_code start_at photo_url'
    }
    
    const result = await Event.paginate(query, options)
    
    res.status(200).json({
      docs: result.docs,
      totalDocs: result.totalDocs,
      limit: result.limit,
      totalPages: result.totalPages,
      page: result.page
    })
  } catch (error) {
    console.error('Search events error:', error)
    res.status(500).json({
      status: 'error',
      message: `Ошибка поиска событий: ${error.message}`
    })
  }
}

// ✅ NEW: Calendar-specific endpoint
export const getCalendarEvents = async (req, res) => {
  try {
    const { year, month } = req.params
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)
    
    const events = await Event.find({
      is_public: true,
      start_at: { $gte: startDate, $lte: endDate }
    })
    .select('name start_at photo_url')
    .sort({ start_at: 1 })
    .lean()
    
    res.status(200).json({
      events: events,
      month: month,
      year: year,
      count: events.length
    })
  } catch (error) {
    console.error('Calendar events error:', error)
    res.status(500).json({
      status: 'error',
      message: `Ошибка загрузки календарных событий: ${error.message}`
    })
  }
}
```

#### **1.2 Add routes**

```javascript
// eventRoutes.js additions
router.get('/calendar/:year/:month', getCalendarEvents)
router.get('/find', searchEvents) // existing
```

### **Phase 2: Frontend State Management Redesign**

#### **2.1 New search.js module structure**

```javascript
// ✅ CLEAN STATE: search.js
const state = {
  // Core search state
  searchMode: '',
  searchQuery: {},
  searchResults: [],
  isSearching: false,
  
  // Calendar state
  calendarEvents: [],
  calendarDate: null,
  isLoadingCalendar: false,
  
  // Results metadata
  currentPage: 1,
  totalPages: 0,
  totalResults: 0,
  error: null
}

const getters = {
  // Search getters
  searchResults: state => state.searchResults,
  isSearching: state => state.isSearching,
  hasSearchResults: state => state.searchResults.length > 0,
  
  // Calendar getters
  calendarEvents: state => state.calendarEvents,
  isLoadingCalendar: state => state.isLoadingCalendar,
  hasCalendarEvents: state => state.calendarEvents.length > 0,
  
  // Combined getters
  displayResults: state => {
    // If we have a date filter, show search results
    if (state.searchQuery.date) {
      return state.searchResults
    }
    // Otherwise show calendar events
    return state.calendarEvents
  },
  
  isLoading: state => state.isSearching || state.isLoadingCalendar
}

const mutations = {
  // Search mutations
  SET_SEARCH_MODE(state, mode) {
    state.searchMode = mode
  },
  
  SET_SEARCH_QUERY(state, query) {
    state.searchQuery = { ...state.searchQuery, ...query }
  },
  
  SET_SEARCH_RESULTS(state, { docs, totalPages, page, totalDocs }) {
    state.searchResults = docs
    state.totalPages = totalPages
    state.currentPage = page
    state.totalResults = totalDocs
  },
  
  SET_IS_SEARCHING(state, isSearching) {
    state.isSearching = isSearching
  },
  
  // Calendar mutations
  SET_CALENDAR_EVENTS(state, events) {
    state.calendarEvents = events
  },
  
  SET_CALENDAR_DATE(state, date) {
    state.calendarDate = date
  },
  
  SET_IS_LOADING_CALENDAR(state, isLoading) {
    state.isLoadingCalendar = isLoading
  },
  
  // Clear mutations
  CLEAR_SEARCH_RESULTS(state) {
    state.searchResults = []
    state.currentPage = 1
    state.totalPages = 0
    state.totalResults = 0
  },
  
  CLEAR_CALENDAR_EVENTS(state) {
    state.calendarEvents = []
  },
  
  CLEAR_DATE_FILTER(state) {
    const { date, ...queryWithoutDate } = state.searchQuery
    state.searchQuery = queryWithoutDate
  },
  
  SET_ERROR(state, error) {
    state.error = error
  }
}

const actions = {
  // Initialize calendar page
  async initializeCalendarPage({ commit, dispatch }, date = null) {
    commit('SET_SEARCH_MODE', 'events')
    commit('CLEAR_SEARCH_RESULTS')
    commit('CLEAR_DATE_FILTER')
    
    const targetDate = date || new Date()
    await dispatch('loadCalendarEvents', targetDate)
  },
  
  // Load events for calendar display (month view)
  async loadCalendarEvents({ commit }, date) {
    commit('SET_IS_LOADING_CALENDAR', true)
    commit('SET_ERROR', null)
    
    try {
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      
      const response = await this.$axios.get(`/api/v1/calendar/${year}/${month}`)
      
      commit('SET_CALENDAR_EVENTS', response.data.events)
      commit('SET_CALENDAR_DATE', date)
    } catch (error) {
      commit('SET_ERROR', error.message)
      commit('SET_CALENDAR_EVENTS', [])
    } finally {
      commit('SET_IS_LOADING_CALENDAR', false)
    }
  },
  
  // Perform search (date-specific or filtered)
  async performSearch({ commit, state }) {
    commit('SET_IS_SEARCHING', true)
    commit('SET_ERROR', null)
    commit('CLEAR_SEARCH_RESULTS')
    
    try {
      const searchParams = new URLSearchParams()
      
      Object.entries(state.searchQuery).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (key === 'date' || key === 'date_from' || key === 'date_to') {
            searchParams.append(key, formatDateForAPI(value))
          } else {
            searchParams.append(key, value)
          }
        }
      })
      
      const url = `/api/v1/${state.searchMode}/find?${searchParams.toString()}`
      const response = await this.$axios.get(url)
      
      commit('SET_SEARCH_RESULTS', {
        docs: response.data.docs,
        totalPages: response.data.totalPages,
        page: response.data.page,
        totalDocs: response.data.totalDocs
      })
      
      // Clear calendar events when showing search results
      commit('CLEAR_CALENDAR_EVENTS')
      
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_IS_SEARCHING', false)
    }
  },
  
  // Update search filters
  updateFilters({ commit, dispatch, state }, filters) {
    commit('SET_SEARCH_QUERY', filters)
    
    // Only search if we have meaningful filters
    const hasFilters = Object.values(filters).some(value => 
      value !== null && value !== undefined && value !== ''
    )
    
    if (hasFilters) {
      dispatch('performSearch')
    }
  },
  
  // Set date filter and search
  setDateFilter({ commit, dispatch }, date) {
    commit('SET_SEARCH_QUERY', { date })
    dispatch('performSearch')
  },
  
  // Clear date filter and return to calendar view
  clearDateFilter({ commit, dispatch, state }) {
    commit('CLEAR_DATE_FILTER')
    commit('CLEAR_SEARCH_RESULTS')
    
    if (state.calendarDate) {
      dispatch('loadCalendarEvents', state.calendarDate)
    }
  },
  
  // Set search mode
  setSearchMode({ commit }, mode) {
    commit('SET_SEARCH_MODE', mode)
  },
  
  // Clear all search state
  clearSearch({ commit }) {
    commit('CLEAR_SEARCH_RESULTS')
    commit('CLEAR_CALENDAR_EVENTS')
    commit('SET_SEARCH_QUERY', {})
    commit('SET_ERROR', null)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
```

### **Phase 3: Component Refactoring**

#### **3.1 calendar-page/index.vue (Clean Implementation)**

```vue
<template>
  <div class="page-wrapper content-wrapper">
    <aside class="page-sidebar">
      <search />
    </aside>
    <div class="page-content">
      <mobile-search-trigger />
      <calendar-carousel 
        :selected-date="calendarDate"
        @date-selected="handleDateSelected"
        @month-changed="handleMonthChanged"
      />
      <search-results />
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import Search from '@/components/ui-components/search/index.vue'
import MobileSearchTrigger from '@/components/ui-components/search/mobile-search-trigger.vue'
import CalendarCarousel from '@/components/ui-components/calendar-carousel.vue'
import SearchResults from '@/components/ui-components/search/search-results.vue'

export default {
  name: 'CalendarPage',
  components: {
    Search,
    MobileSearchTrigger,
    CalendarCarousel,
    SearchResults
  },
  
  computed: {
    ...mapState('search', ['calendarDate']),
    ...mapGetters('search', ['isLoading', 'displayResults'])
  },
  
  methods: {
    ...mapActions('search', [
      'initializeCalendarPage',
      'setDateFilter', 
      'loadCalendarEvents',
      'clearDateFilter'
    ]),
    
    handleDateSelected(date) {
      this.setDateFilter(date)
    },
    
    handleMonthChanged(date) {
      this.clearDateFilter()
      this.loadCalendarEvents(date)
    }
  },
  
  async created() {
    await this.initializeCalendarPage()
  },
  
  destroyed() {
    // Clean up when leaving page
    this.$store.dispatch('search/clearSearch')
  }
}
</script>
```

#### **3.2 calendar-carousel.vue (Event Emitter)**

```vue
<template>
  <div class="calendar-carousel">
    <header class="calendar-header">
      <button @click="previousMonth" class="nav-button">‹</button>
      <h2 class="month-title">{{ monthName }} {{ year }}</h2>
      <button @click="nextMonth" class="nav-button">›</button>
    </header>
    
    <div class="calendar-grid">
      <div 
        v-for="day in daysInMonth" 
        :key="day"
        class="day-button"
        :class="{ 
          'day-button--selected': isSelectedDay(day),
          'day-button--has-events': hasEventsOnDay(day)
        }"
        @click="selectDay(day)"
      >
        {{ day }}
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'CalendarCarousel',
  
  props: {
    selectedDate: {
      type: Date,
      default: () => new Date()
    }
  },
  
  data() {
    return {
      currentDate: new Date(this.selectedDate)
    }
  },
  
  computed: {
    ...mapGetters('search', ['calendarEvents']),
    
    year() {
      return this.currentDate.getFullYear()
    },
    
    monthName() {
      return this.currentDate.toLocaleDateString('ru-RU', { month: 'long' })
    },
    
    daysInMonth() {
      const lastDay = new Date(this.year, this.currentDate.getMonth() + 1, 0).getDate()
      return Array.from({ length: lastDay }, (_, i) => i + 1)
    }
  },
  
  methods: {
    selectDay(day) {
      const selectedDate = new Date(this.year, this.currentDate.getMonth(), day)
      this.$emit('date-selected', selectedDate)
    },
    
    previousMonth() {
      this.currentDate = new Date(this.year, this.currentDate.getMonth() - 1, 1)
      this.$emit('month-changed', this.currentDate)
    },
    
    nextMonth() {
      this.currentDate = new Date(this.year, this.currentDate.getMonth() + 1, 1)
      this.$emit('month-changed', this.currentDate)
    },
    
    isSelectedDay(day) {
      if (!this.selectedDate) return false
      
      return this.selectedDate.getDate() === day &&
             this.selectedDate.getMonth() === this.currentDate.getMonth() &&
             this.selectedDate.getFullYear() === this.year
    },
    
    hasEventsOnDay(day) {
      const dayDate = new Date(this.year, this.currentDate.getMonth(), day)
      
      return this.calendarEvents.some(event => {
        const eventDate = new Date(event.start_at)
        return eventDate.toDateString() === dayDate.toDateString()
      })
    }
  },
  
  watch: {
    selectedDate: {
      handler(newDate) {
        if (newDate) {
          this.currentDate = new Date(newDate)
        }
      },
      immediate: true
    }
  }
}
</script>
```

#### **3.3 search-results.vue (Unified Display)**

```vue
<template>
  <div class="search-results">
    <div v-if="isLoading" class="loading-state">
      <loader-spinner />
      <p>Загрузка...</p>
    </div>
    
    <div v-else-if="hasResults" class="results-container">
      <header class="results-header">
        <h3>{{ resultsTitle }}</h3>
        <p class="results-count">{{ resultsCount }}</p>
      </header>
      
      <div class="results-grid">
        <competition-list-item
          v-for="event in displayResults"
          :key="event._id"
          :competition="event"
        />
      </div>
    </div>
    
    <div v-else class="empty-state">
      <p>{{ emptyMessage }}</p>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import LoaderSpinner from '@/components/ui-components/loader-spinner.vue'
import CompetitionListItem from '@/pages/events/competition-list-item.vue'

export default {
  name: 'SearchResults',
  components: {
    LoaderSpinner,
    CompetitionListItem
  },
  
  computed: {
    ...mapState('search', ['searchQuery']),
    ...mapGetters('search', [
      'displayResults',
      'isLoading',
      'hasSearchResults',
      'hasCalendarEvents'
    ]),
    
    hasResults() {
      return this.displayResults.length > 0
    },
    
    resultsTitle() {
      if (this.searchQuery.date) {
        return `События на ${new Date(this.searchQuery.date).toLocaleDateString('ru-RU')}`
      }
      return 'События месяца'
    },
    
    resultsCount() {
      const count = this.displayResults.length
      return `${count} ${this.pluralize(count, ['событие', 'события', 'событий'])}`
    },
    
    emptyMessage() {
      if (this.searchQuery.date) {
        return 'На выбранную дату событий не найдено'
      }
      return 'В этом месяце событий не запланировано'
    }
  },
  
  methods: {
    pluralize(count, forms) {
      const cases = [2, 0, 1, 1, 1, 2]
      return forms[(count % 100 > 4 && count % 100 < 20) ? 2 : cases[Math.min(count % 10, 5)]]
    }
  }
}
</script>
```

---

## 🚀 IMPLEMENTATION ROADMAP

### **Step 1: Backend Foundation (Day 1)**

- [ ] Fix buildEventQuery function
- [ ] Add calendar-specific endpoint
- [ ] Test API endpoints with Postman
- [ ] Verify UTC date handling

### **Step 2: State Management Redesign (Day 2)**

- [ ] Backup current search.js
- [ ] Implement new state structure
- [ ] Add all required getters/mutations/actions
- [ ] Test state management in isolation

### **Step 3: Component Integration (Day 3)**

- [ ] Refactor calendar-page/index.vue
- [ ] Update calendar-carousel.vue
- [ ] Implement unified search-results.vue
- [ ] Fix search/index.vue filtering

### **Step 4: Testing & Validation (Day 4)**

- [ ] Test month switching
- [ ] Test date selection
- [ ] Test search functionality
- [ ] Test loading states
- [ ] Browser MCP validation

### **Step 5: Production Deployment (Day 5)**

- [ ] Remove console.log statements
- [ ] Performance optimization
- [ ] Error handling review
- [ ] Documentation update

---

## ✅ SUCCESS CRITERIA

### **Functional Requirements**

- ✅ Month switching loads correct events
- ✅ Date selection filters events for that day
- ✅ Search functionality works independently
- ✅ Calendar and search results display correctly
- ✅ Loading states provide feedback

### **Technical Requirements**

- ✅ Follows ADR-001 centralized state pattern
- ✅ Uses semantic design tokens
- ✅ snake_case for all database fields
- ✅ mongoose-paginate-v2 standard API format
- ✅ MCP tools validation passes

### **Quality Gates**

- ✅ No regression in existing functionality
- ✅ Performance: <200ms API response
- ✅ Zero console errors
- ✅ Mobile responsive design
- ✅ Accessibility standards met

---

**This plan provides complete system redesign with clear implementation steps, following all architectural standards and quality requirements.**
