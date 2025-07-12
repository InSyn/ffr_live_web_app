# Docker Compose Configuration Comparison

**Legacy vs Production-Ready Configuration**

---

## 🎯 CONFIGURATION OVERVIEW

### Files Compared

- **Legacy:** `_legacy/docker-compose.yml`
- **Production:** `docker-compose.prod.yml`
- **Reference:** `docker-compose.dev.yml` (working configuration)

### Migration Strategy

✅ **Preserve** legacy container names and port mappings  
✅ **Use** working patterns from docker-compose.dev.yml  
✅ **Add** production optimizations and security  
✅ **Minimize** migration effort and breaking changes  

---

## 📊 DETAILED COMPARISON

### Service Names & Container Names

| Component | Legacy | Production | Status |
|-----------|--------|------------|---------|
| Backend | `ffr_live_back` | `ffr_live_back` | ✅ **PRESERVED** |
| Frontend | `ffr_live_front` | `ffr_live_front` | ✅ **PRESERVED** |
| Database | `live_db` / `ffr_live_db` | `live_db` / `ffr_live_db` | ✅ **PRESERVED** |
| Redis | N/A | `live_cache` / `ffr_live_cache` | ➕ **ADDED** |

### Port Mappings

| Service | Legacy | Production | Status |
|---------|--------|------------|---------|
| Frontend | `8083:80` | `8083:80` | ✅ **PRESERVED** |
| Backend | `127.0.0.1:8081:8080` | `127.0.0.1:8081:8080` | ✅ **PRESERVED** |
| Backend HTTPS | `127.0.0.1:8082:443` | `127.0.0.1:8082:443` | ✅ **PRESERVED** |
| Database | `27017:27017` | ❌ **REMOVED** | 🔒 **SECURITY IMPROVEMENT** |

### Docker Images

| Service | Legacy | Production | Status |
|---------|--------|------------|---------|
| MongoDB | `mongo:5.0-focal` | `mongo:7.0` | ⬆️ **UPGRADED** |
| Redis | N/A | `redis:7-alpine` | ➕ **ADDED** |
| Backend | Custom build | Custom build (production target) | ⬆️ **IMPROVED** |
| Frontend | Custom build | Custom build (production target) | ⬆️ **IMPROVED** |

---

## 🔧 KEY IMPROVEMENTS

### Security Enhancements

1. **MongoDB Port Removal**
   - **Legacy:** `ports: ["27017:27017"]` - Database exposed to host
   - **Production:** `# ports: ["27017:27017"]` - Database internal only
   - **Impact:** 🔒 **Critical security improvement**

2. **Production Build Targets**
   - **Legacy:** No build target specified
   - **Production:** `target: production` - Optimized production builds
   - **Impact:** 🚀 **Better performance, smaller images**

3. **Health Checks Added**
   - **Legacy:** No health monitoring
   - **Production:** Health checks for all services
   - **Impact:** 📈 **Better reliability monitoring**

### Performance Improvements

1. **Redis Cache**
   - **Legacy:** No caching layer
   - **Production:** Redis with memory limits and eviction policy
   - **Impact:** 🚀 **Improved application performance**

2. **MongoDB 7.0**
   - **Legacy:** MongoDB 5.0-focal
   - **Production:** MongoDB 7.0 with authentication
   - **Impact:** 🚀 **Better performance, security, and features**
   - **⚠️ Risk:** Major version jump (5.0 → 7.0) - requires data migration testing

3. **Named Volumes**
   - **Legacy:** Host mounts `/data/db:/data/db`
   - **Production:** Named volumes `mongodb_data:/data/db`
   - **Impact:** 📈 **Better data management**

### Operational Improvements

1. **Structured Logging**
   - **Legacy:** No log management
   - **Production:** `./backend/logs:/app/logs`
   - **Impact:** 📊 **Better monitoring and debugging**

2. **Environment Variables**
   - **Legacy:** Basic environment setup
   - **Production:** Complete environment with JWT_SECRET, REDIS_PASSWORD
   - **Impact:** 🔧 **More flexible configuration**

---

## 🔄 MIGRATION IMPACT

### What Stays the Same

✅ **Container Names:** No changes to existing container names  
✅ **Port Mappings:** Frontend (8083), Backend (8081) remain the same  
✅ **SSL Certificates:** Same volume mount for Let's Encrypt  
✅ **File Uploads:** Same volume mount pattern  
✅ **Network:** Same `app-network` bridge network  

### What Changes

⬆️ **MongoDB:** Port 27017 no longer exposed (security improvement)  
➕ **Redis:** New caching service added  
🔒 **Security:** Health checks and production optimizations  
📈 **Performance:** Updated to latest stable versions  

### Breaking Changes

⚠️ **MongoDB Access:** External tools can no longer connect directly to port 27017  
⚠️ **Dependencies:** Applications must be updated to use Redis cache  

### 🔐 MongoDB Authentication

**CRITICAL:** MongoDB uses authentication in both legacy and production setups.

```bash
# Database credentials
DB_USER=ffr_live_admin
DB_PWD=ffrlive_042dbpwd!
DB_NAME=ffr_live_db

# For any manual database operations, authenticate first:
docker exec ffr_live_db mongosh --eval "
  db = db.getSiblingDB('admin');
  db.auth('ffr_live_admin','ffrlive_042dbpwd!');
  db = db.getSiblingDB('ffr_live_db');
  // Your database operations here
"
```

**All migration scripts and manual operations include proper authentication.**

### 📊 MongoDB Version Migration (5.0 → 7.0)

**IMPORTANT:** This is a major version jump requiring careful testing.

#### Option 1: Direct Migration (Higher Risk)

```bash
# Test thoroughly before production
docker-compose -f docker-compose.prod.yml up -d
# Validate all data integrity
```

#### Option 2: Staged Migration (Recommended)

```yaml
# Phase 1: Use MongoDB 6.0 first
database:
  image: mongo:6.0
  
# Phase 2: Later upgrade to 7.0 after validation
database:
  image: mongo:7.0
```

#### Option 3: Conservative Approach (Safest)

```yaml
# Keep MongoDB 5.0 for now, plan upgrade separately
database:
  image: mongo:5.0
```

**Recommendation:** Start with MongoDB 5.0 or 6.0 for production deployment. The primary security benefit (removing exposed port 27017) is achieved regardless of version.

---

## 🚀 DEPLOYMENT COMMANDS

### Current Deployment (Legacy)

```bash
cd _legacy
docker-compose up -d
```

### New Deployment (Production)

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Migration Process

```bash
# 1. Stop legacy services
cd _legacy && docker-compose down

# 2. Start production services
cd .. && docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔍 CONFIGURATION VALIDATION

### Environment Variables Required

```bash
# Legacy requirements (still needed)
DB_USER=admin
DB_PWD=strongpassword
DB=ffr_live_dev
API_URL=http://localhost:8081/api/v1
SERVER_URL=http://localhost:8081
PROJECT_MODE=production

# New requirements (must be added)
JWT_SECRET=your-jwt-secret-key
REDIS_PASSWORD=your-redis-password
```

### Service Dependencies

```bash
# Legacy: Simple chain
ffr_live_back -> live_db
ffr_live_front -> (independent)

# Production: Enhanced dependencies
ffr_live_back -> live_db + live_cache
ffr_live_front -> ffr_live_back
```

---

## 📋 MIGRATION CHECKLIST

### Pre-Migration

- [ ] Review current .env file
- [ ] Add missing environment variables (JWT_SECRET, REDIS_PASSWORD)
- [ ] Backup current data
- [ ] Test new configuration in staging

### During Migration

- [ ] Stop legacy services: `cd _legacy && docker-compose down`
- [ ] Start production services: `docker-compose -f docker-compose.prod.yml up -d`
- [ ] Verify all services are running
- [ ] Test application functionality

### Post-Migration

- [ ] Update monitoring scripts (container names remain same)
- [ ] Remove external MongoDB access scripts
- [ ] Configure Redis cache utilization
- [ ] Update backup scripts for new volume names

---

## 🛠️ TROUBLESHOOTING

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Backend won't start | Missing JWT_SECRET | Add to .env file |
| Redis connection failed | Missing REDIS_PASSWORD | Add to .env file |
| Database connection failed | Authentication issue | Check DB_USER/DB_PWD |
| Frontend 502 error | Backend not ready | Wait for backend health check |

### Verification Commands

```bash
# Check all services
docker-compose -f docker-compose.prod.yml ps

# Check health status
docker inspect ffr_live_back | grep Health -A 5
docker inspect ffr_live_front | grep Health -A 5

# Test connectivity
curl -f http://localhost:8081/api/v1/health
curl -f http://localhost:8083/

# Check logs
docker-compose -f docker-compose.prod.yml logs ffr_live_back
```

---

## 📞 QUICK REFERENCE

### Service URLs (No Changes)

- **Frontend:** <http://localhost:8083>
- **Backend:** <http://localhost:8081>
- **Database:** Internal only (security improvement)

### Container Names (No Changes)

- `ffr_live_back` - Backend service
- `ffr_live_front` - Frontend service
- `ffr_live_db` - MongoDB database
- `ffr_live_cache` - Redis cache (new)

### Docker Commands

```bash
# Start production services
docker-compose -f docker-compose.prod.yml up -d

# Stop production services
docker-compose -f docker-compose.prod.yml down

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart specific service
docker-compose -f docker-compose.prod.yml restart ffr_live_back
```

---

**Summary:** The new production configuration preserves all legacy compatibility while adding essential production improvements like security hardening, health checks, and performance optimization through Redis caching.
