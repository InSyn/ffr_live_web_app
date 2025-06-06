# DEFINITIVE MODULE IMPLEMENTATION GUIDE
*FFR Live Sports Platform - Mandatory Reference for All Module Implementations*

## 🎯 Project Identity & Vision
**Platform**: FFR Live Sports Timing & Event Management System  
**Mission**: Comprehensive sports event management for the Russian Freestyle Federation community  
**Vision**: Real-time, accessible, and professional sports timing platform with multilingual support  

## 🏗️ Architecture Overview

### Technology Stack
```
Frontend:  Vue.js 2.6.11 + Vuetify 2.4.0 + Vuex 3.4.0 + Vue Router 3.2.0
Backend:   Node.js + Express 4.17.1 + MongoDB 5.0 + Mongoose 5.13.13
Auth:      JWT-based with bcryptjs + role-based access control
Files:     Multer for file uploads, static serving via Express
Docker:    Multi-container setup (app, database, optional frontend)
```

### Core System Entities
```javascript
// Primary Domain Models
- Users (authentication, roles, permissions)
- Athletes (FFR profiles, regions, categories, results)
- Events (competitions, schedules, registrations, protocols)
- Jury (officials, assignments, certifications)
- Trainers (coaching profiles, certifications, athletes)
- Organizations (regional federations, clubs, management)
- Seminars (education, certifications, participants)
- Results (timing data, rankings, protocols)
```

## 🔐 Authentication & Authorization System

### Role Hierarchy
```javascript
const ROLES = {
  admin: 'admin',                    // Full system access
  secretary: 'secretary',            // Event management
  jury: 'jury',                     // Competition officiating
  trainer: 'trainer',               // Athlete management
  regional_organization: 'regional_organization', // Regional management
  athlete: 'athlete'                // Profile management
};
```

### JWT Implementation
```javascript
// Token Structure
{
  id: user._id,
  role: user.role,
  region: user.region,
  ffr_id: user.ffr_id,
  exp: expirationTimestamp
}

// Middleware Usage
authenticateToken → isSecretary → businessLogic
authenticateToken → hasRole('admin', 'secretary') → businessLogic
```

## 🗄️ Database Schema Architecture

### MongoDB Collections Structure
```javascript
// Users Collection
{
  username: String (required, unique),
  email: String,
  password: String (required, hashed),
  role: String (enum),
  region: String,
  ffr_id: String
}

// Events Collection
{
  event_id: String (required, unique),
  title: String (required),
  international: Boolean,
  start_at: Date,
  season: String,
  sport: String,
  discipline: String,
  country: String,
  region: String,
  location: String,
  organization: String,
  competitions: [competitionSchema],
  jury: [competingJurySchema],
  athletes_groups: [String],
  is_public: Boolean (default: true),
  registration_status: Boolean (default: false)
}

// Athletes Collection
{
  ffr_id: String (required, unique),
  name: String (required),
  lastname: String (required),
  gender: String,
  birth_date: Date,
  country: String,
  country_code: String,
  regions: [String],
  sport: String (required),
  disciplines: [String],
  category: String,
  is_national_team: Boolean
}
```

## 🎨 Frontend Architecture & Design System

### Vue.js 2 Component Structure
```vue
<template>
  <v-container class="custom-container">
    <v-row>
      <v-col cols="12" md="8">
        <!-- Content -->
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'ComponentName',
  data() {
    return {
      // Component state
    };
  },
  computed: {
    // Computed properties
  },
  methods: {
    // Component methods
  }
};
</script>

<style lang="scss" scoped>
.custom-container {
  background-color: var(--background--card);
  color: var(--text-default);
}
</style>
```

### Design System Constants
```css
/* Core Brand Colors */
:root {
  --accent: #1a9ad7;              /* Primary brand blue */
  --ffr-brand: #009eda;           /* FFR brand blue */
  --success: #46C289;             /* Success green */
  --message-error: #D94D58;       /* Error red */
  
  /* Light Theme */
  --background--primary: #dadadf;
  --background--card: rgba(242,242,248,0.92);
  --text-default: #080811;
  --text-muted: #757589;
}

/* Dark Theme Override */
.theme-dark {
  --background--primary: #2f2f34;
  --background--card: rgba(16,16,24,0.92);
  --text-default: #f2f2f7;
  --text-muted: #C2C2C7;
}
```

## 🔄 State Management (Vuex)

### Store Module Pattern
```javascript
// store/modules/[feature].js
export default {
  namespaced: true,
  state: {
    items: [],
    loading: false,
    error: null
  },
  getters: {
    getItems: (state) => state.items,
    isLoading: (state) => state.loading
  },
  mutations: {
    SET_ITEMS: (state, items) => { state.items = items; },
    SET_LOADING: (state, loading) => { state.loading = loading; },
    SET_ERROR: (state, error) => { state.error = error; }
  },
  actions: {
    async FETCH_ITEMS({ commit }) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get('/api/v1/items');
        commit('SET_ITEMS', response.data);
      } catch (error) {
        commit('SET_ERROR', error.message);
      } finally {
        commit('SET_LOADING', false);
      }
    }
  }
};
```

## 🛠️ Backend API Patterns

### Controller Structure
```javascript
// controllers/[entity]-controller.js
import { Model } from '../models/model.js';

export const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    const query = search ? { $text: { $search: search } } : {};
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { created_at: -1 }
    };
    
    const result = await Model.paginate(query, options);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const newItem = new Model(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
```

## 🌐 API Endpoint Structure

### RESTful API Conventions
```javascript
// Base URL: /api/v1/

// Standard CRUD Endpoints
GET    /api/v1/events           // Get all events (paginated)
POST   /api/v1/events           // Create new event (auth required)
GET    /api/v1/events/:id       // Get specific event
PUT    /api/v1/events/:id       // Update event (auth required)
DELETE /api/v1/events/:id       // Delete event (auth required)

// Specialized Endpoints
GET    /api/v1/events/find                    // Search events
GET    /api/v1/events/opened-registration     // Events with open registration
GET    /api/v1/events/date-search/:date       // Events by date
PATCH  /api/v1/events/:id/registration-settings // Update registration
```

## 📊 Error Handling Standards

### Backend Error Handling
```javascript
// Global error handler
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.code === 11000) {
    return res.status(409).json({
      message: 'Duplicate entry error'
    });
  }
  
  res.status(500).json({
    message: 'Internal server error'
  });
};
```

## 🚀 Performance Optimization

### Database Optimization
```javascript
// Efficient pagination
const options = {
  page: parseInt(page),
  limit: parseInt(limit),
  sort: { created_at: -1 },
  select: 'title start_at location discipline'
};
```

---

*This guide serves as the authoritative reference for all development work on the FFR Live platform. All module implementations must adhere to these patterns and standards.*