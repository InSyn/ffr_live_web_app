# FFR Live Platform - Deployment Migration Plan

**Version:** 1.0  
**Date:** January 2025  
**Purpose:** Migrate from legacy deployment to modern production-ready infrastructure

---

## 🎯 EXECUTIVE SUMMARY

### Current State (Legacy)

- **Container Names:** `ffr_live_back`, `ffr_live_front`, `ffr_live_db`
- **Node.js Version:** 16-alpine (outdated)
- **MongoDB Version:** 5.0-focal (outdated)
- **Security:** Basic setup, MongoDB exposed to host
- **Architecture:** Simple 3-container setup without reverse proxy
- **Monitoring:** No health checks or resource limits

### Target State (Modern)

- **Container Names:** `ffr_live_backend`, `ffr_live_frontend`, `ffr_live_db`
- **Node.js Version:** 18-alpine (latest LTS)
- **MongoDB Version:** 7.0 (latest stable)
- **Security:** Hardened with non-root users, no external DB access
- **Architecture:** 6-container setup with Nginx reverse proxy, Redis, SSL
- **Monitoring:** Health checks, resource limits, logging

### Migration Benefits

✅ **Security:** Hardened containers, no-new-privileges, non-root users  
✅ **Performance:** Resource limits, health checks, Redis caching  
✅ **Reliability:** Proper dependency management, SSL termination  
✅ **Monitoring:** Comprehensive logging, metrics, health endpoints  
✅ **Scalability:** Modular architecture, easy horizontal scaling  

---

## 📊 DETAILED COMPARISON ANALYSIS

### Backend Changes

| Component | Legacy | Modern | Impact |
|-----------|---------|---------|---------|
| **Base Image** | `node:alpine` | `node:18-alpine` | Security updates, ES modules support |
| **Build Strategy** | Single-stage | Multi-stage | Smaller production image |
| **Security** | Root user | Non-root user (1001) | Security hardening |
| **Health Check** | None | Integrated | Reliability monitoring |
| **Resource Limits** | None | CPU: 1.0, Memory: 512M | Performance control |
| **Port Binding** | `127.0.0.1:8081:8080` | `8081:8080` | Consistent networking |

### Frontend Changes

| Component | Legacy | Modern | Impact |
|-----------|---------|---------|---------|
| **Base Image** | `node:16-alpine` | `node:18-alpine` | Security updates |
| **Build Args** | 3 variables | 4 variables (NODE_ENV added) | Better environment control |
| **Security** | Basic | Hardened nginx config | Security improvement |
| **Health Check** | None | Integrated | Reliability monitoring |
| **Resource Limits** | None | CPU: 0.5, Memory: 128M | Performance control |
| **Port Binding** | `8083:80` | `8080:80` | Standardized ports |

### Database Changes

| Component | Legacy | Modern | Impact |
|-----------|---------|---------|---------|
| **Image** | `mongo:5.0-focal` | `mongo:7.0` | Latest features, security |
| **Data Volume** | Host mount `/data/db` | Named volume `ffr_db_data` | Better data management |
| **Security** | Port exposed `27017:27017` | **No port exposure** | **Critical security fix** |
| **Health Check** | None | Integrated | Reliability monitoring |
| **Resource Limits** | None | CPU: 1.0, Memory: 1G | Performance control |
| **Auth** | Basic | `--auth --bind_ip_all` | Enhanced security |

### New Services Added

| Service | Purpose | Benefits |
|---------|---------|---------|
| **Nginx** | Reverse proxy, SSL termination | Security, performance, caching |
| **Redis** | Session storage, caching | Performance, scalability |
| **Certbot** | SSL certificate management | Security, automated renewals |

---

## 🚨 CRITICAL MIGRATION CONSIDERATIONS

### Data Preservation Requirements

1. **MongoDB Data:** Must preserve all existing data during migration
2. **File Uploads:** Preserve all uploaded files in `/backend/uploads`
3. **SSL Certificates:** Migrate existing Let's Encrypt certificates
4. **Environment Variables:** Update to new format with additional variables

### Breaking Changes

1. **Container Names:** All container names changed (impacts monitoring/scripts)
2. **Port Mappings:** Frontend port changed from 8083 to 8080
3. **Database Access:** MongoDB no longer exposed to host (impacts external tools)
4. **Volume Mounts:** Changed from host mounts to named volumes

### Security Improvements

1. **MongoDB:** No longer exposed to host network
2. **Containers:** All run as non-root users
3. **SSL:** Proper certificate management with automated renewals
4. **Resource Limits:** Prevent resource exhaustion attacks

---

## 📋 PRE-MIGRATION CHECKLIST

### Environment Assessment

- [ ] **Current uptime requirements** - Plan maintenance window
- [ ] **Data backup verification** - Ensure recent backups exist
- [ ] **Dependencies mapping** - Document external connections
- [ ] **Monitoring setup** - Prepare for new container names
- [ ] **SSL certificate status** - Check expiration dates
- [ ] **Database size assessment** - Estimate migration time

### Infrastructure Preparation

- [ ] **Docker version** - Ensure Docker Compose v2+ installed
- [ ] **Disk space** - Verify sufficient space for new images
- [ ] **Network configuration** - Ensure required ports available
- [ ] **System resources** - Verify CPU/Memory requirements
- [ ] **Backup storage** - Prepare backup location

### Code Preparation

- [ ] **Environment file** - Update `.env` with new variables
- [ ] **DNS records** - Prepare for potential changes
- [ ] **External integrations** - Update any hardcoded URLs
- [ ] **Monitoring scripts** - Update container references

---

## 🔧 STEP-BY-STEP MIGRATION PROCEDURE

### Phase 1: Preparation (Low Risk)

```bash
# 1. Create backup of current system
cd /path/to/ffr_live_web_app
mkdir -p ./migration-backups/$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./migration-backups/$(date +%Y%m%d_%H%M%S)"

# 2. Backup MongoDB data
docker exec ffr_live_db mongodump --out /backup/pre-migration
docker cp ffr_live_db:/backup/pre-migration $BACKUP_DIR/mongodb

# 3. Backup uploaded files
docker cp ffr_live_back:/home/ffr_live_back/uploads $BACKUP_DIR/uploads

# 4. Backup SSL certificates (if they exist)
sudo cp -r /etc/letsencrypt $BACKUP_DIR/ssl

# 5. Export current environment
docker exec ffr_live_back env > $BACKUP_DIR/legacy_env.txt

# 6. Stop legacy services (maintenance window starts)
docker-compose -f _legacy/docker-compose.yml down

# 7. Create new environment file
cp env.example .env
# Edit .env with production values
```

### Phase 2: Data Migration (Medium Risk)

```bash
# 1. Prepare new data volumes
docker volume create ffr_db_data
docker volume create ffr_db_config
docker volume create ffr_redis_data

# 2. Start only MongoDB with new setup
docker-compose up -d ffr_live_db
sleep 30  # Wait for MongoDB to initialize

# 3. Restore data to new MongoDB
docker exec -i ffr_live_db mongorestore --drop --authenticationDatabase admin \
  -u $DB_USER -p $DB_PWD /backup/pre-migration

# 4. Prepare file uploads directory
mkdir -p ./backend/uploads
cp -r $BACKUP_DIR/uploads/* ./backend/uploads/

# 5. Set proper permissions
sudo chown -R 1000:1000 ./backend/uploads
sudo chmod -R 755 ./backend/uploads
```

### Phase 3: Service Deployment (High Risk)

```bash
# 1. Build new images
docker-compose build

# 2. Start core services
docker-compose up -d ffr_live_db redis

# 3. Start backend
docker-compose up -d ffr_live_backend

# 4. Verify backend health
curl -f http://localhost:8081/api/v1/health || exit 1

# 5. Start frontend
docker-compose up -d ffr_live_frontend

# 6. Verify frontend health
curl -f http://localhost:8080/ || exit 1

# 7. Start nginx (if using reverse proxy)
docker-compose up -d nginx
```

### Phase 4: Validation (Critical)

```bash
# 1. Health check all services
docker-compose ps
docker-compose logs --tail=50

# 2. Database connectivity test
docker exec ffr_live_backend node -e "
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('DB Connection: OK'))
    .catch(err => console.error('DB Connection: FAILED', err));
"

# 3. Application functionality test
curl -X GET http://localhost:8081/api/v1/events/find
curl -X GET http://localhost:8081/api/v1/athletes/find

# 4. Frontend accessibility test
curl -I http://localhost:8080/
curl -I http://localhost:8080/events
curl -I http://localhost:8080/athletes

# 5. File upload test
curl -X POST -F "file=@test.jpg" http://localhost:8081/api/v1/upload
```

### Phase 5: Monitoring Setup

```bash
# 1. Configure log rotation
docker-compose exec ffr_live_backend mkdir -p /app/logs
docker-compose exec nginx mkdir -p /var/log/nginx

# 2. Set up monitoring
docker-compose logs -f --tail=100 > ./logs/migration.log &

# 3. Configure alerting (optional)
# Set up monitoring dashboards for new container names
```

---

## 🔄 ROLLBACK PROCEDURE

### Emergency Rollback (if migration fails)

```bash
# 1. Stop new services immediately
docker-compose down

# 2. Restore legacy containers
cd _legacy
docker-compose up -d

# 3. Restore data if corrupted
docker exec ffr_live_db mongorestore --drop /backup/pre-migration

# 4. Restore file uploads
docker cp $BACKUP_DIR/uploads ffr_live_back:/home/ffr_live_back/

# 5. Verify legacy system functionality
curl -f http://localhost:8081/api/v1/health
```

### Planned Rollback (if issues discovered post-migration)

```bash
# 1. Schedule maintenance window
# 2. Export any new data created since migration
# 3. Follow emergency rollback procedure
# 4. Merge new data with legacy system
```

---

## 🔐 SECURITY CONSIDERATIONS

### Pre-Migration Security Review

- [ ] **Legacy vulnerabilities** - Document current security issues
- [ ] **Access controls** - Review who has deployment access
- [ ] **Network security** - Audit current firewall rules
- [ ] **SSL certificates** - Verify current certificate validity

### Post-Migration Security Validation

- [ ] **Port exposure** - Verify MongoDB not accessible externally
- [ ] **Container security** - Confirm all containers run as non-root
- [ ] **SSL configuration** - Test HTTPS functionality
- [ ] **Resource limits** - Verify DoS protection active

---

## 📈 PERFORMANCE MONITORING

### Key Metrics to Monitor

| Metric | Legacy | Modern | Target |
|--------|---------|---------|---------|
| **Memory Usage** | Unlimited | Limited | <80% of limit |
| **CPU Usage** | Unlimited | Limited | <70% of limit |
| **Response Time** | Variable | Monitored | <200ms |
| **Database Connections** | Unlimited | Pool managed | <50 concurrent |
| **Disk I/O** | Unmonitored | Tracked | <80% capacity |

### Monitoring Commands

```bash
# Resource usage monitoring
docker stats --no-stream

# Health check status
docker-compose ps
docker inspect ffr_live_backend | grep -i health

# Log analysis
docker-compose logs --tail=100 ffr_live_backend
docker-compose logs --tail=100 ffr_live_frontend
docker-compose logs --tail=100 ffr_live_db
```

---

## 🚀 POST-MIGRATION OPTIMIZATION

### Immediate Optimizations

1. **SSL Certificate Setup**

   ```bash
   # Generate SSL certificates
   docker-compose run --rm certbot certonly --webroot \
     -w /var/www/certbot -d yourdomain.com
   ```

2. **Database Indexing**

   ```bash
   # Run database optimization
   docker exec ffr_live_db mongo --eval "
     db.adminCommand('setParameter', 1, 'internalQueryPlanEvaluationWorks', 200000);
   "
   ```

3. **Cache Warming**

   ```bash
   # Pre-populate Redis cache
   docker exec ffr_live_redis redis-cli FLUSHALL
   # Run cache warming scripts
   ```

### Long-term Improvements

- [ ] **CDN Setup** - Implement content delivery network
- [ ] **Database Sharding** - Plan for horizontal scaling
- [ ] **Load Balancing** - Implement multiple backend instances
- [ ] **Monitoring Dashboard** - Set up comprehensive monitoring

---

## 📞 EMERGENCY CONTACTS & PROCEDURES

### Migration Day Support

- **Technical Lead:** [Contact Information]
- **Database Admin:** [Contact Information]
- **Infrastructure Team:** [Contact Information]
- **Business Stakeholder:** [Contact Information]

### Escalation Procedures

1. **Minor Issues:** Continue with migration, document for post-migration fix
2. **Major Issues:** Pause migration, assess impact, decide on rollback
3. **Critical Issues:** Immediate rollback, emergency team activation

### Communication Plan

- **Pre-migration:** Notify stakeholders 48 hours before
- **During migration:** Status updates every 30 minutes
- **Post-migration:** Success/failure notification within 1 hour
- **Follow-up:** Complete report within 24 hours

---

## ✅ SUCCESS CRITERIA

### Migration Considered Successful When

- [ ] All services running with new container names
- [ ] Database connectivity confirmed
- [ ] All existing data preserved and accessible
- [ ] File uploads functional
- [ ] API endpoints responding correctly
- [ ] Frontend accessible and functional
- [ ] SSL certificates active (if applicable)
- [ ] Health checks passing
- [ ] Performance metrics within acceptable ranges
- [ ] No data loss reported
- [ ] All stakeholders notified of completion

### Performance Acceptance Criteria

- [ ] **API Response Time:** <200ms for 95% of requests
- [ ] **Frontend Load Time:** <3 seconds for initial page load
- [ ] **Database Query Time:** <100ms for 90% of queries
- [ ] **Memory Usage:** <80% of allocated resources
- [ ] **CPU Usage:** <70% of allocated resources
- [ ] **Uptime:** >99.9% availability

---

This migration plan ensures a smooth transition from the legacy deployment to the modern, production-ready infrastructure while preserving all data and functionality. The plan includes comprehensive backup procedures, step-by-step migration steps, rollback procedures, and success criteria to ensure a successful deployment.
