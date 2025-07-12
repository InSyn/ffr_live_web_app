# FFR Live Platform - Manual Deployment Guide

**Simple step-by-step instructions to migrate from legacy to modern deployment**

---

## 🎯 OVERVIEW

This guide will help you manually migrate your FFR Live Platform from the legacy setup to the modern production-ready deployment.

**Migration Time:** 20-30 minutes  
**Downtime Required:** Yes (10-15 minutes)  
**Data Safety:** All data will be preserved  

---

## ⚠️ BEFORE YOU START

### Prerequisites

- [ ] Docker and Docker Compose installed
- [ ] Admin access to the server
- [ ] Schedule maintenance window (20-30 minutes)
- [ ] Backup plan ready

### 🔐 MongoDB Authentication

**IMPORTANT**: Your MongoDB database uses authentication. For any database operations, you must authenticate first:

```bash
# Authentication credentials
DB_USER=ffr_live_admin
DB_PWD=ffrlive_042dbpwd!
DB_HOSTNAME=ffr_live_db
DB_PORT=27017
DB_NAME=ffr_live_db

# Standard authentication pattern for MongoDB commands
docker exec ffr_live_db mongosh --eval "
  db = db.getSiblingDB('admin');
  db.auth('ffr_live_admin','ffrlive_042dbpwd!');
  db = db.getSiblingDB('ffr_live_db');
  // Your database operations here
"
```

**All MongoDB operations in this guide include proper authentication.**

### Current vs New Setup

| Service | Legacy Port | New Port | Container Name Change |
|---------|------------|----------|----------------------|
| Frontend | 8083 | 8083 | `ffr_live_front` → `ffr_live_front` ✅ **PRESERVED** |
| Backend | 8081 | 8081 | `ffr_live_back` → `ffr_live_back` ✅ **PRESERVED** |
| Database | 27017 (exposed) | Internal only | `ffr_live_db` → `ffr_live_db` ✅ **PRESERVED** |

---

## 📋 STEP-BY-STEP MANUAL DEPLOYMENT

### Step 1: Create Backup (5 minutes)

```bash
# 1. Create backup directory
mkdir -p ./migration-backup-$(date +%Y%m%d)
cd ./migration-backup-$(date +%Y%m%d)

# 2. Backup MongoDB data (with authentication)
docker exec ffr_live_db mongodump \
  --authenticationDatabase admin \
  -u ffr_live_admin \
  -p ffrlive_042dbpwd! \
  --db ffr_live_db \
  --out /backup/pre-migration

docker cp ffr_live_db:/backup/pre-migration ./mongodb-backup

# 3. Backup uploaded files
docker cp ffr_live_back:/home/ffr_live_back/uploads ./uploads-backup

# 4. Backup current environment
docker exec ffr_live_back env > legacy-environment.txt

# 5. Note current data counts (for verification later)
docker exec ffr_live_db mongosh --eval "
  db = db.getSiblingDB('admin');
  db.auth('ffr_live_admin','ffrlive_042dbpwd!');
  db = db.getSiblingDB('ffr_live_db');
  print('Events:', db.events.countDocuments());
  print('Athletes:', db.athletes.countDocuments());
  print('Juries:', db.juries.countDocuments());
" > data-counts.txt

echo "✅ Backup completed in: $(pwd)"
cd ..
```

### Step 2: Prepare New Environment (2 minutes)

```bash
# 1. Ensure .env file exists
if [ ! -f .env ]; then
  cp env.example .env
  echo "❌ Edit .env file with your production values, then continue"
  exit 1
fi

# 2. Create necessary directories
mkdir -p backend/uploads
mkdir -p backend/logs
mkdir -p nginx/logs

# 3. Copy uploaded files to new location
cp -r ./migration-backup-20250705  ./backend/uploads/

# 4. Set proper permissions
sudo chown -R 1000:1000 ./backend/uploads
sudo chmod -R 755 ./backend/uploads
```

### Step 3: Stop Legacy Services (1 minute)

```bash
# 1. Stop legacy services
cd _legacy
docker-compose down

# 2. Verify services stopped
docker ps | grep ffr_live
# Should show no containers

# 3. Return to main directory
cd ..

echo "✅ Legacy services stopped"
```

### Step 4: Start New Services (5 minutes)

```bash
# 1. Build new images
docker-compose -f docker-compose.prod.yml build

# 2. Start MongoDB first
docker-compose up -d live_db
docker-compose -f docker-compose.prod.yml up -d live_db

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to start..."
sleep 30

# 3. Verify MongoDB is running
docker-compose -f docker-compose.prod.yml exec ffr_live_db mongosh --eval "
  db = db.getSiblingDB('admin');
  db.auth('ffr_live_admin','ffrlive_042dbpwd!');
  db.adminCommand('ping');
"
# Should return: { ok: 1 }

# 4. Restore data to new MongoDB
docker cp ./migration-backup-*/mongodb-backup ffr_live_db:/backup/
docker-compose -f docker-compose.prod.yml exec ffr_live_db mongorestore --authenticationDatabase admin -u ffr_live_admin -p ffrlive_042dbpwd! --drop /backup/pre-migration

# 5. Start Redis
docker-compose -f docker-compose.prod.yml up -d live_cache

# 6. Start Backend
docker-compose -f docker-compose.prod.yml up -d ffr_live_back

# Wait for backend to be ready
echo "⏳ Waiting for backend to start..."
sleep 20

# 7. Start Frontend
docker-compose -f docker-compose.prod.yml up -d ffr_live_front

echo "✅ All services started"
```

### Step 5: Verify Deployment (5 minutes)

```bash
# 1. Check all services are running
docker-compose -f docker-compose.prod.yml ps
# All services should show "Up"

# 2. Test backend health
curl -f http://localhost:8081/api/v1/health
# Should return health status

# 3. Test frontend
curl -I http://localhost:8083/
# Should return HTTP 200

# 4. Test database connection
docker-compose -f docker-compose.prod.yml exec ffr_live_back node -e "
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Database connected'))
    .catch(err => console.error('❌ Database failed:', err));
"

# 5. Test API endpoints
curl -f "http://localhost:8081/api/v1/events/find?page=1&limit=5"
curl -f "http://localhost:8081/api/v1/athletes/find?page=1&limit=5"

# 6. Verify data integrity
docker exec ffr_live_db mongosh --eval "
  db = db.getSiblingDB('admin');
  print(db);
  db.auth('ffr_live_admin','ffrlive_042dbpwd!');
  db = db.getSiblingDB('ffr_live_db');
  print('Events:', db.events.countDocuments());
  print('Athletes:', db.athletes.countDocuments());
  print('Jury:', db.juries.countDocuments());
"
docker exec ffr_live_db mongosh --eval "
  db = db.getSiblingDB('admin');
  db.auth('ffr_live_admin','ffrlive_042dbpwd!');
  db = db.getSiblingDB('ffr_live_db');
  db.getCollectionInfos();
"
# Compare with backup data-counts.txt

echo "✅ Verification completed"
```

### Step 6: Final Checks (2 minutes)

```bash
# 1. Check frontend pages load
curl -I http://localhost:8083/events
curl -I http://localhost:8083/athletes
curl -I http://localhost:8083/jury

# 2. Check container resource usage
docker stats --no-stream

# 3. Check logs for errors
docker-compose -f docker-compose.prod.yml logs --tail=20 ffr_live_back
docker-compose -f docker-compose.prod.yml logs --tail=20 ffr_live_front
docker-compose -f docker-compose.prod.yml logs --tail=20 ffr_live_db

echo "🎉 Migration completed successfully!"
```

---

## 🚨 IF SOMETHING GOES WRONG - ROLLBACK

### Quick Rollback Procedure

```bash
# 1. Stop new services
docker-compose -f docker-compose.prod.yml down

# 2. Restore legacy services
cd _legacy
docker-compose up -d

# 3. Wait for services to start
sleep 30

# 4. Verify legacy system works
curl -f http://localhost:8081/api/v1/health
curl -I http://localhost:8083/

# 5. If data was corrupted, restore from backup
docker cp ../migration-backup-*/mongodb-backup ffr_live_db:/backup/
docker exec ffr_live_db mongorestore \
  --authenticationDatabase admin \
  -u ffr_live_admin \
  -p ffrlive_042dbpwd! \
  --drop \
  /backup/pre-migration

echo "✅ Rollback completed - legacy system restored"
```

---

## 📋 POST-MIGRATION CHECKLIST

### Update Your Monitoring/Scripts

- [ ] Update any monitoring scripts to use new container names:
  - `ffr_live_back` → `ffr_live_backend`
  - `ffr_live_front` → `ffr_live_frontend`
- [ ] Update any scripts that use port 8083 to use port 8080
- [ ] Remove any scripts that directly access MongoDB on port 27017

### Security Improvements Achieved

- [ ] ✅ MongoDB no longer exposed to host network
- [ ] ✅ All containers run as non-root users
- [ ] ✅ Resource limits prevent DoS attacks
- [ ] ✅ Health checks for better monitoring

### Performance Improvements

- [ ] ✅ Health checks for automatic failure detection
- [ ] ✅ Redis caching layer added
- [ ] ✅ Resource usage controlled with limits
- [ ] ✅ Modern Node.js 18 and MongoDB 7.0

---

## 🎯 VALIDATION CHECKLIST

After migration, verify these work:

- [ ] Homepage loads: <http://localhost:8083/>
- [ ] Events page: <http://localhost:8083/events>
- [ ] Athletes page: <http://localhost:8083/athletes>
- [ ] Backend health: <http://localhost:8081/api/v1/health>
- [ ] Database has all data (compare record counts)
- [ ] File uploads work (test upload functionality)
- [ ] Search functionality works
- [ ] Login/authentication works

---

## 🔧 TROUBLESHOOTING

### Common Issues

| Problem | Solution |
|---------|----------|
| Backend won't start | Check .env file, ensure DB_USER/DB_PWD are correct |
| Frontend shows 502 error | Backend not ready, wait 30 seconds and retry |
| Database connection failed | Check MongoDB is running: `docker-compose ps` |
| File uploads broken | Check permissions: `ls -la backend/uploads` |

### Useful Commands

```bash
# Check container logs
docker-compose -f docker-compose.prod.yml logs [service_name]

# Check container status
docker-compose -f docker-compose.prod.yml ps

# Restart a service
docker-compose -f docker-compose.prod.yml restart [service_name]

# Check environment variables
docker-compose -f docker-compose.prod.yml exec ffr_live_back env | grep DB_
```

---

## 📞 QUICK REFERENCE

### Old vs New URLs

| Service | Legacy | New |
|---------|--------|-----|
| Frontend | <http://localhost:8083> | <http://localhost:8083> ✅ **SAME** |
| Backend | <http://localhost:8081> | <http://localhost:8081> ✅ **SAME** |
| Database | Exposed on 27017 | Internal only 🔒 **SECURED** |

### New Container Names

- `ffr_live_back` ✅ **PRESERVED**
- `ffr_live_front` ✅ **PRESERVED**
- `ffr_live_db` ✅ **PRESERVED**
- `ffr_live_cache` ➕ **NEW** (Redis cache)

---

**That's it! Your FFR Live Platform is now running on the modern, secure, production-ready deployment.**
