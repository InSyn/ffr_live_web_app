#!/bin/bash

# FFR Live Platform - Deployment Migration Script
# Version: 1.0
# Purpose: Automate migration from legacy to modern deployment
# Usage: ./deployment-migration-script.sh [--dry-run] [--rollback]

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="$PROJECT_DIR/migration-backups/$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$PROJECT_DIR/logs/migration-$(date +%Y%m%d_%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1${NC}" | tee -a "$LOG_FILE"
}

# Function to check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check Docker version
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
        exit 1
    fi
    
    # Check Docker Compose version
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check if running as root or with sudo
    if [[ $EUID -ne 0 ]] && ! groups | grep -q docker; then
        error "Script must be run as root or user must be in docker group"
        exit 1
    fi
    
    # Check disk space (minimum 5GB free)
    AVAILABLE_SPACE=$(df "$PROJECT_DIR" | tail -1 | awk '{print $4}')
    if [[ $AVAILABLE_SPACE -lt 5242880 ]]; then
        error "Insufficient disk space. Need at least 5GB free"
        exit 1
    fi
    
    # Check if legacy services are running
    if docker ps --format "table {{.Names}}" | grep -q "ffr_live_back"; then
        info "Legacy services detected and running"
    else
        warn "Legacy services not running - migration may not be necessary"
    fi
    
    log "Prerequisites check completed successfully"
}

# Function to create backup
create_backup() {
    log "Creating backup in $BACKUP_DIR..."
    
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$PROJECT_DIR/logs"
    
    # Backup MongoDB data
    info "Backing up MongoDB data..."
    if docker exec ffr_live_db mongodump \
        --authenticationDatabase admin \
        -u ffr_live_admin \
        -p ffrlive_042dbpwd! \
        --db ffr_live_db \
        --out /backup/pre-migration 2>/dev/null; then
        docker cp ffr_live_db:/backup/pre-migration "$BACKUP_DIR/mongodb"
        log "MongoDB backup completed"
    else
        error "Failed to backup MongoDB data"
        exit 1
    fi
    
    # Backup uploaded files
    info "Backing up uploaded files..."
    if docker cp ffr_live_back:/home/ffr_live_back/uploads "$BACKUP_DIR/uploads" 2>/dev/null; then
        log "File uploads backup completed"
    else
        warn "Failed to backup uploaded files - continuing anyway"
    fi
    
    # Backup SSL certificates (if they exist)
    if [[ -d /etc/letsencrypt ]]; then
        info "Backing up SSL certificates..."
        sudo cp -r /etc/letsencrypt "$BACKUP_DIR/ssl" 2>/dev/null || warn "Failed to backup SSL certificates"
    fi
    
    # Export current environment
    info "Exporting current environment..."
    docker exec ffr_live_back env > "$BACKUP_DIR/legacy_env.txt" 2>/dev/null || warn "Failed to export environment"
    
    # Create backup manifest
    cat > "$BACKUP_DIR/manifest.txt" <<EOF
FFR Live Platform Migration Backup
Created: $(date)
Legacy containers: $(docker ps --format "table {{.Names}}" | grep ffr_live || echo "None")
Backup contents:
- MongoDB data: $(ls -la "$BACKUP_DIR/mongodb" 2>/dev/null | wc -l) files
- Upload files: $(ls -la "$BACKUP_DIR/uploads" 2>/dev/null | wc -l) files
- SSL certificates: $(ls -la "$BACKUP_DIR/ssl" 2>/dev/null | wc -l) files
EOF
    
    log "Backup completed successfully"
}

# Function to stop legacy services
stop_legacy_services() {
    log "Stopping legacy services..."
    
    cd "$PROJECT_DIR/_legacy"
    
    if docker-compose down --remove-orphans; then
        log "Legacy services stopped successfully"
    else
        error "Failed to stop legacy services"
        exit 1
    fi
    
    cd "$PROJECT_DIR"
}

# Function to prepare new environment
prepare_new_environment() {
    log "Preparing new environment..."
    
    # Check if .env exists
    if [[ ! -f "$PROJECT_DIR/.env" ]]; then
        warn ".env file not found. Creating from template..."
        cp "$PROJECT_DIR/env.example" "$PROJECT_DIR/.env"
        error "Please edit .env file with production values and run script again"
        exit 1
    fi
    
    # Create new data volumes
    info "Creating new data volumes..."
    docker volume create ffr_db_data 2>/dev/null || true
    docker volume create ffr_db_config 2>/dev/null || true
    docker volume create ffr_redis_data 2>/dev/null || true
    
    # Prepare file uploads directory
    info "Preparing file uploads directory..."
    mkdir -p "$PROJECT_DIR/backend/uploads"
    if [[ -d "$BACKUP_DIR/uploads" ]]; then
        cp -r "$BACKUP_DIR/uploads"/* "$PROJECT_DIR/backend/uploads/" 2>/dev/null || true
    fi
    
    # Set proper permissions
    sudo chown -R 1000:1000 "$PROJECT_DIR/backend/uploads" 2>/dev/null || true
    sudo chmod -R 755 "$PROJECT_DIR/backend/uploads" 2>/dev/null || true
    
    log "New environment prepared successfully"
}

# Function to deploy new services
deploy_new_services() {
    log "Deploying new services..."
    
    cd "$PROJECT_DIR"
    
    # Build new images
    info "Building new images..."
    if docker-compose build; then
        log "Images built successfully"
    else
        error "Failed to build images"
        exit 1
    fi
    
    # Start MongoDB first
    info "Starting MongoDB..."
    if docker-compose up -d ffr_live_db; then
        log "MongoDB started successfully"
    else
        error "Failed to start MongoDB"
        exit 1
    fi
    
    # Wait for MongoDB to be ready
    info "Waiting for MongoDB to be ready..."
    sleep 30
    
    # Check MongoDB health
    if docker-compose exec ffr_live_db mongosh --eval "
        db = db.getSiblingDB('admin');
        db.auth('ffr_live_admin','ffrlive_042dbpwd!');
        db.adminCommand('ping');
    " &>/dev/null; then
        log "MongoDB is healthy"
    else
        error "MongoDB health check failed"
        exit 1
    fi
    
    # Restore data to new MongoDB
    info "Restoring data to new MongoDB..."
    if [[ -d "$BACKUP_DIR/mongodb" ]]; then
        docker cp "$BACKUP_DIR/mongodb" ffr_live_db:/backup/
        if docker-compose exec ffr_live_db mongorestore \
            --authenticationDatabase admin \
            -u ffr_live_admin \
            -p ffrlive_042dbpwd! \
            --drop \
            /backup/pre-migration; then
            log "Data restored successfully"
        else
            error "Failed to restore data"
            exit 1
        fi
    fi
    
    # Start Redis
    info "Starting Redis..."
    if docker-compose up -d redis; then
        log "Redis started successfully"
    else
        error "Failed to start Redis"
        exit 1
    fi
    
    # Start backend
    info "Starting backend..."
    if docker-compose up -d ffr_live_backend; then
        log "Backend started successfully"
    else
        error "Failed to start backend"
        exit 1
    fi
    
    # Wait for backend to be ready
    info "Waiting for backend to be ready..."
    sleep 20
    
    # Check backend health
    if curl -f http://localhost:8081/api/v1/health &>/dev/null; then
        log "Backend is healthy"
    else
        error "Backend health check failed"
        exit 1
    fi
    
    # Start frontend
    info "Starting frontend..."
    if docker-compose up -d ffr_live_frontend; then
        log "Frontend started successfully"
    else
        error "Failed to start frontend"
        exit 1
    fi
    
    # Wait for frontend to be ready
    info "Waiting for frontend to be ready..."
    sleep 15
    
    # Check frontend health
    if curl -f http://localhost:8080/ &>/dev/null; then
        log "Frontend is healthy"
    else
        error "Frontend health check failed"
        exit 1
    fi
    
    log "All services deployed successfully"
}

# Function to validate deployment
validate_deployment() {
    log "Validating deployment..."
    
    # Check all services are running
    info "Checking service status..."
    if docker-compose ps | grep -v Exit; then
        log "All services are running"
    else
        error "Some services are not running"
        docker-compose ps
        exit 1
    fi
    
    # Test database connectivity
    info "Testing database connectivity..."
    if docker-compose exec ffr_live_backend node -e "
        const mongoose = require('mongoose');
        mongoose.connect(process.env.MONGODB_URI)
          .then(() => console.log('DB Connection: OK'))
          .catch(err => { console.error('DB Connection: FAILED', err); process.exit(1); });
    " &>/dev/null; then
        log "Database connectivity test passed"
    else
        error "Database connectivity test failed"
        exit 1
    fi
    
    # Test API endpoints
    info "Testing API endpoints..."
    API_TESTS=(
        "http://localhost:8081/api/v1/health"
        "http://localhost:8081/api/v1/events/find"
        "http://localhost:8081/api/v1/athletes/find"
    )
    
    for endpoint in "${API_TESTS[@]}"; do
        if curl -f "$endpoint" &>/dev/null; then
            log "API test passed: $endpoint"
        else
            error "API test failed: $endpoint"
            exit 1
        fi
    done
    
    # Test frontend accessibility
    info "Testing frontend accessibility..."
    FRONTEND_TESTS=(
        "http://localhost:8080/"
        "http://localhost:8080/events"
        "http://localhost:8080/athletes"
    )
    
    for endpoint in "${FRONTEND_TESTS[@]}"; do
        if curl -f "$endpoint" &>/dev/null; then
            log "Frontend test passed: $endpoint"
        else
            error "Frontend test failed: $endpoint"
            exit 1
        fi
    done
    
    log "Deployment validation completed successfully"
}

# Function to perform rollback
perform_rollback() {
    log "Performing rollback to legacy system..."
    
    # Stop new services
    info "Stopping new services..."
    docker-compose down --remove-orphans 2>/dev/null || true
    
    # Start legacy services
    info "Starting legacy services..."
    cd "$PROJECT_DIR/_legacy"
    
    if docker-compose up -d; then
        log "Legacy services restored successfully"
    else
        error "Failed to restore legacy services"
        exit 1
    fi
    
    # Restore data if needed
    if [[ -d "$BACKUP_DIR/mongodb" ]]; then
        info "Restoring legacy data..."
        docker cp "$BACKUP_DIR/mongodb" ffr_live_db:/backup/
        docker exec ffr_live_db mongorestore \
            --authenticationDatabase admin \
            -u ffr_live_admin \
            -p ffrlive_042dbpwd! \
            --drop \
            /backup/pre-migration 2>/dev/null || warn "Failed to restore legacy data"
    fi
    
    # Restore file uploads
    if [[ -d "$BACKUP_DIR/uploads" ]]; then
        info "Restoring legacy file uploads..."
        docker cp "$BACKUP_DIR/uploads" ffr_live_back:/home/ffr_live_back/ 2>/dev/null || warn "Failed to restore legacy uploads"
    fi
    
    # Verify legacy system
    info "Verifying legacy system..."
    sleep 30
    
    if curl -f http://localhost:8081/api/v1/health &>/dev/null; then
        log "Legacy system rollback completed successfully"
    else
        error "Legacy system rollback failed"
        exit 1
    fi
    
    cd "$PROJECT_DIR"
}

# Function to display help
show_help() {
    cat << EOF
FFR Live Platform - Deployment Migration Script

Usage: $0 [OPTIONS]

Options:
    --dry-run       Perform a dry run without making changes
    --rollback      Rollback to legacy system
    --help          Show this help message

Examples:
    $0                  # Perform full migration
    $0 --dry-run        # Test migration without making changes
    $0 --rollback       # Rollback to legacy system

EOF
}

# Main execution
main() {
    local dry_run=false
    local rollback=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dry-run)
                dry_run=true
                shift
                ;;
            --rollback)
                rollback=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Banner
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗"
    echo "║                                                                                                                                                                              ║"
    echo "║                                        FFR Live Platform - Deployment Migration Script                                                                                      ║"
    echo "║                                                                                                                                                                              ║"
    echo "║  This script will migrate your FFR Live Platform from legacy deployment to modern production-ready infrastructure.                                                         ║"
    echo "║                                                                                                                                                                              ║"
    echo "║  IMPORTANT: This script will stop your current services during migration.                                                                                                   ║"
    echo "║             Make sure you have scheduled appropriate maintenance window.                                                                                                     ║"
    echo "║                                                                                                                                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    if [[ "$rollback" == true ]]; then
        log "Starting rollback procedure..."
        perform_rollback
        log "Rollback completed successfully"
        exit 0
    fi
    
    if [[ "$dry_run" == true ]]; then
        log "Starting dry run..."
        check_prerequisites
        log "Dry run completed successfully - no changes made"
        exit 0
    fi
    
    # Confirmation prompt
    echo -e "${YELLOW}Are you sure you want to proceed with the migration? (y/N)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        log "Migration cancelled by user"
        exit 0
    fi
    
    log "Starting FFR Live Platform migration..."
    
    # Execute migration steps
    check_prerequisites
    create_backup
    stop_legacy_services
    prepare_new_environment
    deploy_new_services
    validate_deployment
    
    log "Migration completed successfully!"
    
    # Success message
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗"
    echo "║                                                                                                                                                                              ║"
    echo "║                                              MIGRATION COMPLETED SUCCESSFULLY!                                                                                              ║"
    echo "║                                                                                                                                                                              ║"
    echo "║  Your FFR Live Platform has been successfully migrated to the modern deployment infrastructure.                                                                             ║"
    echo "║                                                                                                                                                                              ║"
    echo "║  New Services:                                                                                                                                                               ║"
    echo "║    - Backend:    http://localhost:8081/api/v1/health                                                                                                                        ║"
    echo "║    - Frontend:   http://localhost:8080/                                                                                                                                     ║"
    echo "║    - Database:   Internal access only (security improved)                                                                                                                   ║"
    echo "║                                                                                                                                                                              ║"
    echo "║  Backup Location: $BACKUP_DIR"
    echo "║  Migration Log:   $LOG_FILE"
    echo "║                                                                                                                                                                              ║"
    echo "║  Next Steps:                                                                                                                                                                 ║"
    echo "║    1. Monitor services for 24 hours                                                                                                                                         ║"
    echo "║    2. Update monitoring scripts with new container names                                                                                                                     ║"
    echo "║    3. Configure SSL certificates if needed                                                                                                                                   ║"
    echo "║    4. Remove legacy backup after verification                                                                                                                                ║"
    echo "║                                                                                                                                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Execute main function
main "$@" 
