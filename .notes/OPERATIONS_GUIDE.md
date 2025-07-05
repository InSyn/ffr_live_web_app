# FFR Live Platform: Unified Operations Guide

**Version:** 1.0
**Audience:** Developers, DevOps Engineers, System Administrators
**Purpose:** This document provides a single, authoritative source for setting up the development environment, deploying to production, and performing routine maintenance.

---

## Part 1: Local Development Setup

### 1.1. Prerequisites

- **Node.js**: `>=18.12.0` (LTS recommended)
- **npm**: `>=8.0.0` (comes with Node.js)
- **Docker**: `>=20.10.0`
- **Docker Compose**: `>=2.0.0`
- **Git**: `>=2.30.0`

_For Node.js version management, we recommend using `nvm` (macOS/Linux) or `nvm-windows`._

### 1.2. Quick Start (Dockerized Environment)

This is the easiest and recommended method for getting started.

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd ffr-live-platform
    ```

2.  **Create environment file:**

    ```bash
    cp env.example .env
    # Review and edit .env with your local settings
    ```

3.  **Start the development environment:**

    ```bash
    # This command starts the backend, database, and other services via Docker.
    npm run dev:back
    ```

4.  **Install and run the frontend locally:**

    ```bash
    # This provides the best frontend hot-reloading experience.
    npm run install:front
    npm run dev:front
    ```

5.  **Access the application:**
    - **Frontend:** `http://localhost:8080`
    - **Backend API:** `http://localhost:8081`

### 1.3. Development Workflow

- **Code Quality:** Run `npm run lint` to check for and fix style issues. This is also enforced automatically by a pre-commit hook.
- **Testing:** Run `npm run test` to execute both frontend and backend unit tests.
- **Git Workflow:** We use **Conventional Commits**. Your commit messages should be formatted like `feat: add new feature` or `fix(auth): resolve login bug`. This is validated by a `commit-msg` hook.

### 1.4. Troubleshooting

- **Port Conflicts:** If a port is in use, use `lsof -i :<port>` (macOS/Linux) or `netstat -ano | findstr :<port>` (Windows) to find the conflicting process ID (PID) and terminate it.
- **Docker Issues:** Ensure the Docker daemon is running. For permission issues on Linux, you may need to add your user to the `docker` group.
- **Fresh Install:** To resolve dependency issues, run `npm run clean` to remove all `node_modules` directories, then `npm run install:all`.

---

## Part 2: Production Deployment (Ubuntu)

This section details deploying the application to a production Ubuntu server.

### 2.1. Server Prerequisites

- **Ubuntu 20.04 LTS** or newer
- **Required Packages:** `docker.io`, `docker-compose`, `nodejs` (v18+), `nginx`, `certbot`.
- **Domain Name:** A domain pointing to your server's IP address.
- **Firewall:** `ufw` configured to allow SSH (22), HTTP (80), and HTTPS (443).

### 2.2. Initial Server Setup

1.  **Create Application Directory:**
    ```bash
    sudo mkdir -p /var/www/ffr-live
    sudo chown $USER:$USER /var/www/ffr-live
    cd /var/www/ffr-live
    ```
2.  **Clone Repository:**
    ```bash
    git clone <repository-url> .
    ```
3.  **Create Production Environment File:**
    ```bash
    cp env.example .env.production
    # VERY IMPORTANT: Edit .env.production with strong, secure passwords and secrets.
    ```
4.  **Create Production Docker Compose File:**
    Create a `docker-compose.production.yml` file. This should define the `backend`, `database`, and `cache` services. **Crucially, do not expose the database or cache ports to the host.** The backend port should only be exposed to `127.0.0.1`. Refer to the `UBUNTU_DEPLOYMENT_GUIDE.md` for a complete example.

### 2.3. Frontend Build

1.  **Install Dependencies:**
    ```bash
    cd frontend
    npm ci --production=false
    ```
2.  **Create Production Environment File:**
    Create `frontend/.env.production` and set `VUE_APP_API_BASE_URL` to your production domain (e.g., `https://your-domain.com/api`).
3.  **Build Static Files:**
    ```bash
    npm run build
    ```
4.  **Copy to Web Directory:**
    ```bash
    sudo mkdir -p /var/www/ffr-live/frontend
    sudo cp -r dist/* /var/www/ffr-live/frontend/
    sudo chown -R www-data:www-data /var/www/ffr-live/frontend
    ```

### 2.4. Nginx Configuration & SSL

1.  **Create Nginx Site Configuration:**
    Create a new site file in `/etc/nginx/sites-available/ffr-live`. This configuration should:
    - Listen on port 80 and redirect to HTTPS.
    - Listen on port 443 for SSL traffic.
    - Serve the static frontend files from `/var/www/ffr-live/frontend`.
    - Proxy all requests to `/api/` to the backend service at `http://127.0.0.1:8081`.
    - Include security headers and gzip compression.
2.  **Enable the Site:**
    ```bash
    sudo ln -s /etc/nginx/sites-available/ffr-live /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl reload nginx
    ```
3.  **Obtain SSL Certificate:**
    ```bash
    sudo certbot --nginx -d your-domain.com
    ```
    Certbot will automatically update your Nginx configuration and set up a cron job for renewal.

### 2.5. Deploy Application

1.  **Start Services with Docker Compose:**
    ```bash
    cd /var/www/ffr-live
    docker-compose -f docker-compose.production.yml up -d
    ```
2.  **Verify Deployment:**
    Check `docker ps` to ensure containers are running. Check the logs with `docker-compose -f docker-compose.production.yml logs -f backend`. Test the frontend and API endpoints.

---

## Part 3: Maintenance & Updates

This section outlines the process for safely updating the live production application.

### 3.1. Routine Maintenance

- **Backups:** A backup script (`scripts/backup.sh`) should be created to dump the MongoDB database and store it in the `backups/` directory. This script should be run regularly via a cron job.
- **Log Rotation:** Configure `logrotate` for the Nginx logs (`/var/log/nginx/ffr-live.*.log`) to prevent them from consuming excessive disk space.
- **Monitoring:** Use tools like `htop` and `docker stats` for real-time resource monitoring.

### 3.2. Safe Update Procedure (Zero Downtime)

This process ensures the application remains available during an update.

1.  **Create Safety Backup (MANDATORY):**
    Before any changes, run your backup script.

    ```bash
    cd /var/www/ffr-live
    ./scripts/backup.sh
    ```

2.  **Update Application Code:**

    ```bash
    git fetch origin
    git pull origin main
    ```

3.  **Update Backend Service:**
    If backend dependencies (`package.json`) have changed, be sure to audit them.

    ```bash
    # Re-build the backend image and restart the container
    docker-compose -f docker-compose.production.yml build backend
    docker-compose -f docker-compose.production.yml up -d backend
    ```

    The rolling update mechanism will replace the old container with the new one without downtime.

4.  **Update Frontend Service:**
    If frontend code has changed:

    ```bash
    # Build new frontend files
    cd /var/www/ffr-live/frontend
    npm run build

    # Use an atomic switch to prevent serving a mix of old and new files
    sudo mv /var/www/ffr-live/frontend /var/www/ffr-live/frontend_old
    sudo cp -r dist /var/www/ffr-live/frontend
    sudo chown -R www-data:www-data /var/www/ffr-live/frontend
    sudo rm -rf /var/www/ffr-live/frontend_old
    ```

5.  **Post-Update Verification:**
    - Check the application logs for any errors.
    - Test critical API endpoints and frontend functionality.
    - Monitor server resources.

### 3.3. Rollback Procedure

If an update introduces critical issues, follow these steps to roll back.

- **Backend Rollback:**
  1.  Check out the previous stable commit with `git checkout <commit-hash>`.
  2.  Re-run the backend update process from step 3.2.3. Docker will build an image from the older code and deploy it.
- **Frontend Rollback:**
  If you retained the `frontend_old` directory, you can perform a quick rollback by swapping the directories back and deleting the broken one.
- **Database Rollback (Emergency Only):**
  If a data migration caused a catastrophic failure, stop the application, and restore the database from the backup you created in step 3.2.1 using `mongorestore`. **This is a last resort and will result in data loss since the backup was taken.**
