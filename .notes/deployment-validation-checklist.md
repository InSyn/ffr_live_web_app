# FFR Live Platform - Deployment Validation Checklist

**Version:** 1.0  
**Date:** January 2025  
**Purpose:** Systematic validation of deployment migration with MCP integration

---

## 🎯 VALIDATION OVERVIEW

This checklist provides systematic validation steps for the FFR Live Platform migration from legacy to modern deployment infrastructure. It includes both automated testing and manual verification procedures.

### Validation Phases

1. **Pre-Migration Validation** - Verify legacy system state
2. **Migration Process Validation** - Monitor migration execution
3. **Post-Migration Validation** - Comprehensive system testing
4. **Performance Validation** - Ensure performance standards
5. **Security Validation** - Verify security improvements

---

## 📋 PRE-MIGRATION VALIDATION

### Legacy System Assessment

- [ ] **Service Status Check**

  ```bash
  docker ps --format "table {{.Names}}\t{{.Status}}"
  # Expected: ffr_live_back, ffr_live_front, ffr_live_db running
  ```

- [ ] **Database Connectivity Test**

  ```bash
  docker exec ffr_live_db mongo --eval "db.adminCommand('ping')"
  # Expected: { "ok" : 1 }
  ```

- [ ] **API Health Check**

  ```bash
  curl -f http://localhost:8081/api/v1/health
  # Expected: HTTP 200 response
  ```

- [ ] **Frontend Accessibility**

  ```bash
  curl -I http://localhost:8083/
  # Expected: HTTP 200 response
  ```

- [ ] **Data Integrity Verification**

  ```bash
  # Count records in each collection
  docker exec ffr_live_db mongo ffr_live_dev --eval "
    print('Events:', db.events.count());
    print('Athletes:', db.athletes.count());
    print('Jury:', db.jury.count());
  "
  ```

### Environment Documentation

- [ ] **Current Environment Variables**

  ```bash
  docker exec ffr_live_back env | grep -E "(DB_|API_|NODE_)" > legacy_env.txt
  ```

- [ ] **Current Resource Usage**

  ```bash
  docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
  ```

- [ ] **Current Volume Mounts**

  ```bash
  docker inspect ffr_live_back | grep -A 10 "Mounts"
  docker inspect ffr_live_db | grep -A 10 "Mounts"
  ```

---

## 🔄 MIGRATION PROCESS VALIDATION

### Backup Verification

- [ ] **MongoDB Backup Created**

  ```bash
  ls -la migration-backups/*/mongodb/
  # Expected: Database dump files present
  ```

- [ ] **File Uploads Backup Created**

  ```bash
  ls -la migration-backups/*/uploads/
  # Expected: Upload files present
  ```

- [ ] **Backup Integrity Check**

  ```bash
  # Verify backup can be restored
  docker run --rm -v $(pwd)/migration-backups:/backup mongo:7.0 \
    mongorestore --dry-run /backup/*/mongodb/
  ```

### Service Shutdown Verification

- [ ] **Legacy Services Stopped**

  ```bash
  docker ps --format "table {{.Names}}" | grep ffr_live || echo "No legacy services running"
  # Expected: No legacy services listed
  ```

- [ ] **Port Availability**

  ```bash
  netstat -tlnp | grep -E ":(8081|8083|27017)"
  # Expected: No processes listening on these ports
  ```

### New Environment Setup

- [ ] **Docker Volumes Created**

  ```bash
  docker volume ls | grep -E "(ffr_db_data|ffr_redis_data)"
  # Expected: Named volumes present
  ```

- [ ] **Environment File Ready**

  ```bash
  test -f .env && echo "Environment file present" || echo "Environment file missing"
  ```

---

## ✅ POST-MIGRATION VALIDATION

### Service Health Checks

- [ ] **All Services Running**

  ```bash
  docker-compose ps
  # Expected: All services in "Up" state
  ```

- [ ] **Container Health Status**

  ```bash
  docker inspect ffr_live_backend | grep -A 5 "Health"
  docker inspect ffr_live_frontend | grep -A 5 "Health"
  docker inspect ffr_live_db | grep -A 5 "Health"
  # Expected: All showing healthy status
  ```

- [ ] **Resource Limits Applied**

  ```bash
  docker inspect ffr_live_backend | grep -A 10 "Resources"
  # Expected: Memory and CPU limits configured
  ```

### Database Validation

- [ ] **Database Connection Test**

  ```bash
  docker-compose exec ffr_live_backend node -e "
    const mongoose = require('mongoose');
    mongoose.connect(process.env.MONGODB_URI)
      .then(() => console.log('✅ Database connected'))
      .catch(err => console.error('❌ Database connection failed:', err));
  "
  ```

- [ ] **Data Migration Verification**

  ```bash
  # Compare record counts before/after
  docker exec ffr_live_db mongosh --eval "
    db = db.getSiblingDB('ffr_live_dev');
    print('Events:', db.events.countDocuments());
    print('Athletes:', db.athletes.countDocuments());
    print('Jury:', db.jury.countDocuments());
  "
  ```

- [ ] **Database Performance Test**

  ```bash
  # Test query performance
  docker exec ffr_live_db mongosh --eval "
    db = db.getSiblingDB('ffr_live_dev');
    const start = Date.now();
    db.events.find({}).limit(10).toArray();
    print('Query time:', Date.now() - start, 'ms');
  "
  ```

### API Validation

- [ ] **Health Endpoint**

  ```bash
  curl -f http://localhost:8081/api/v1/health
  # Expected: HTTP 200 with health status
  ```

- [ ] **Authentication Endpoints**

  ```bash
  curl -X POST http://localhost:8081/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrongpassword"}'
  # Expected: HTTP 401 or 400 (not 500)
  ```

- [ ] **Search Endpoints**

  ```bash
  curl -f "http://localhost:8081/api/v1/events/find?page=1&limit=10"
  curl -f "http://localhost:8081/api/v1/athletes/find?page=1&limit=10"
  curl -f "http://localhost:8081/api/v1/jury/find?page=1&limit=10"
  # Expected: HTTP 200 with paginated results
  ```

- [ ] **File Upload Endpoint**

  ```bash
  # Test file upload functionality
  echo "test" > test.txt
  curl -X POST http://localhost:8081/api/v1/upload \
    -F "file=@test.txt" \
    -H "Authorization: Bearer your-test-token"
  rm test.txt
  # Expected: HTTP 200 or 401 (authentication required)
  ```

### Frontend Validation

- [ ] **Homepage Accessibility**

  ```bash
  curl -I http://localhost:8080/
  # Expected: HTTP 200
  ```

- [ ] **Static Asset Loading**

  ```bash
  curl -I http://localhost:8080/css/app.css
  curl -I http://localhost:8080/js/app.js
  # Expected: HTTP 200 for both
  ```

- [ ] **Route Accessibility**

  ```bash
  curl -I http://localhost:8080/events
  curl -I http://localhost:8080/athletes
  curl -I http://localhost:8080/jury
  # Expected: HTTP 200 for all
  ```

---

## 🔍 DOCKER MCP VALIDATION

### Container Status Validation

- [ ] **List All Containers**

  ```bash
  # Use Docker MCP: list-containers
  # Expected: All new containers running, no legacy containers
  ```

- [ ] **Backend Container Logs**

  ```bash
  # Use Docker MCP: get-logs with container_name="ffr_live_backend"
  # Expected: No error messages, successful startup logs
  ```

- [ ] **Frontend Container Logs**

  ```bash
  # Use Docker MCP: get-logs with container_name="ffr_live_frontend"
  # Expected: Nginx started successfully, no errors
  ```

- [ ] **Database Container Logs**

  ```bash
  # Use Docker MCP: get-logs with container_name="ffr_live_db"
  # Expected: MongoDB started, authentication enabled
  ```

### Service Connectivity Testing

- [ ] **Backend Service Test**

  ```bash
  # Use Docker MCP to verify backend is responding
  docker exec ffr_live_backend curl -f http://localhost:8080/api/v1/health
  ```

- [ ] **Database Service Test**

  ```bash
  # Use Docker MCP to verify database connectivity
  docker exec ffr_live_db mongosh --eval "db.adminCommand('ping')"
  ```

---

## 🚀 PERFORMANCE VALIDATION

### Response Time Testing

- [ ] **API Response Times**

  ```bash
  # Test API performance
  for i in {1..10}; do
    curl -w "%{time_total}\n" -o /dev/null -s http://localhost:8081/api/v1/events/find
  done | awk '{sum+=$1} END {print "Average:", sum/NR, "seconds"}'
  # Expected: Average < 0.2 seconds
  ```

- [ ] **Frontend Load Times**

  ```bash
  # Test frontend performance
  curl -w "%{time_total}\n" -o /dev/null -s http://localhost:8080/
  # Expected: < 3 seconds
  ```

### Resource Usage Monitoring

- [ ] **Container Resource Usage**

  ```bash
  docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
  # Expected: All containers within configured limits
  ```

- [ ] **Database Performance**

  ```bash
  # Monitor database performance
  docker exec ffr_live_db mongosh --eval "db.serverStatus().connections"
  # Expected: Reasonable connection count
  ```

### Load Testing

- [ ] **Concurrent Request Test**

  ```bash
  # Simple load test
  for i in {1..20}; do
    curl -s http://localhost:8081/api/v1/health > /dev/null &
  done
  wait
  echo "Load test completed"
  ```

---

## 🔐 SECURITY VALIDATION

### Container Security

- [ ] **Non-Root User Verification**

  ```bash
  docker exec ffr_live_backend whoami
  docker exec ffr_live_frontend whoami
  # Expected: Non-root user (backend, nginx, etc.)
  ```

- [ ] **Port Exposure Check**

  ```bash
  docker port ffr_live_db 2>/dev/null || echo "Database port not exposed (✅ Security improvement)"
  # Expected: No MongoDB port exposed to host
  ```

- [ ] **Security Options Check**

  ```bash
  docker inspect ffr_live_backend | grep -A 5 "SecurityOpt"
  # Expected: "no-new-privileges:true"
  ```

### Network Security

- [ ] **Internal Network Connectivity**

  ```bash
  # Test internal network communication
  docker exec ffr_live_backend ping -c 1 ffr_live_db
  # Expected: Successful ping
  ```

- [ ] **External Access Prevention**

  ```bash
  # Verify database is not accessible from outside
  curl -f mongodb://localhost:27017/ 2>/dev/null || echo "Database properly isolated (✅)"
  ```

### Authentication Security

- [ ] **JWT Token Validation**

  ```bash
  # Test invalid token rejection
  curl -H "Authorization: Bearer invalid-token" http://localhost:8081/api/v1/protected-endpoint
  # Expected: HTTP 401 Unauthorized
  ```

---

## 🎯 FUNCTIONAL VALIDATION

### Search Functionality

- [ ] **Events Search**

  ```bash
  curl -f "http://localhost:8081/api/v1/events/find?name=test&page=1&limit=5"
  # Expected: HTTP 200 with search results
  ```

- [ ] **Athletes Search**

  ```bash
  curl -f "http://localhost:8081/api/v1/athletes/find?name=test&page=1&limit=5"
  # Expected: HTTP 200 with search results
  ```

- [ ] **Advanced Search Filters**

  ```bash
  curl -f "http://localhost:8081/api/v1/events/find?region=Moscow&category=Senior&page=1&limit=5"
  # Expected: HTTP 200 with filtered results
  ```

### Data Integrity Tests

- [ ] **Database Schema Validation**

  ```bash
  # Check database schema is intact
  docker exec ffr_live_db mongosh --eval "
    db = db.getSiblingDB('ffr_live_dev');
    print('Collections:', db.getCollectionNames());
    print('Events indexes:', db.events.getIndexes().length);
    print('Athletes indexes:', db.athletes.getIndexes().length);
  "
  ```

- [ ] **File Upload Integrity**

  ```bash
  # Check uploaded files are accessible
  ls -la backend/uploads/ | head -10
  # Expected: Files present and accessible
  ```

### Integration Testing

- [ ] **Frontend-Backend Integration**

  ```bash
  # Test full stack integration
  curl -f http://localhost:8080/events
  # Expected: Frontend loads and displays events
  ```

- [ ] **Database Integration**

  ```bash
  # Test database operations through API
  curl -f "http://localhost:8081/api/v1/events/find?page=1&limit=1"
  # Expected: Returns data from database
  ```

---

## 🚨 ROLLBACK VALIDATION

### Rollback Readiness

- [ ] **Backup Verification**

  ```bash
  # Verify backup can be restored
  ls -la migration-backups/*/
  # Expected: Complete backup present
  ```

- [ ] **Legacy Code Availability**

  ```bash
  # Verify legacy deployment files are available
  ls -la _legacy/
  # Expected: Legacy docker-compose.yml and configurations present
  ```

### Rollback Testing (Optional)

- [ ] **Test Rollback Procedure**

  ```bash
  # Test rollback script (in test environment)
  ./deployment-migration-script.sh --rollback
  # Expected: Successful rollback to legacy system
  ```

---

## 📊 VALIDATION REPORT TEMPLATE

```markdown
# FFR Live Platform Migration Validation Report

**Migration Date:** [DATE]
**Validation Performed By:** [NAME]
**Validation Date:** [DATE]

## Summary
- [ ] Pre-migration validation: ✅ PASSED / ❌ FAILED
- [ ] Migration process validation: ✅ PASSED / ❌ FAILED
- [ ] Post-migration validation: ✅ PASSED / ❌ FAILED
- [ ] Performance validation: ✅ PASSED / ❌ FAILED
- [ ] Security validation: ✅ PASSED / ❌ FAILED
- [ ] Functional validation: ✅ PASSED / ❌ FAILED

## Key Metrics
- **API Response Time:** [X]ms (target: <200ms)
- **Frontend Load Time:** [X]s (target: <3s)
- **Database Query Time:** [X]ms (target: <100ms)
- **Memory Usage:** [X]% (target: <80%)
- **CPU Usage:** [X]% (target: <70%)

## Issues Identified
1. [Issue description]
   - Severity: High/Medium/Low
   - Status: Open/Resolved
   - Resolution: [Description]

## Recommendations
1. [Recommendation]
2. [Recommendation]

## Overall Status
✅ MIGRATION SUCCESSFUL - System ready for production
❌ MIGRATION FAILED - Rollback required
⚠️ MIGRATION PARTIALLY SUCCESSFUL - Issues require attention

## Sign-off
- Technical Lead: [NAME] [DATE]
- Database Admin: [NAME] [DATE]
- QA Lead: [NAME] [DATE]
```

---

## 🔧 TROUBLESHOOTING GUIDE

### Common Issues

| Issue | Symptoms | Solution |
|-------|----------|----------|
| **Database connection failed** | Backend health check fails | Check environment variables, verify MongoDB is running |
| **Frontend not loading** | HTTP 502/503 errors | Check backend is running, verify nginx configuration |
| **File uploads not working** | Upload errors | Check volume mounts, verify permissions |
| **High memory usage** | Container OOM kills | Increase memory limits, optimize queries |
| **Slow response times** | API timeouts | Check database indexes, optimize queries |

### Diagnostic Commands

```bash
# Check container logs
docker-compose logs --tail=50 [service_name]

# Check container resource usage
docker stats --no-stream [container_name]

# Check container networking
docker exec [container_name] ping [other_container_name]

# Check database connectivity
docker exec ffr_live_db mongosh --eval "db.adminCommand('ping')"

# Check API health
curl -v http://localhost:8081/api/v1/health
```

---

This comprehensive validation checklist ensures thorough testing of the FFR Live Platform migration, covering all aspects from basic functionality to security and performance validation.
