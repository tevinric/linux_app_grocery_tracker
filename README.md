# Grocery Inventory Tracker

A full-stack web application for tracking grocery inventory with low-stock alerts. Built with React, Flask, PostgreSQL, and Docker. Designed for easy deployment on Linux servers with complete Docker containerization.

## Features

- Add, edit, and delete grocery items
- Track item quantities and descriptions
- Dashboard showing items with low stock (2 units or less)
- Responsive web interface
- RESTful API backend
- Fully containerized with Docker Compose
- Persistent data storage with Docker volumes
- Production-ready nginx reverse proxy
- Health checks for all services

## Technology Stack

- **Frontend**: React 18 with Vite
- **Backend**: Python Flask with Gunicorn
- **Database**: PostgreSQL 16
- **Deployment**: Docker & Docker Compose
- **Web Server**: Nginx (reverse proxy for frontend and API)

## Project Structure

```
linux_app_grocery_tracker/
├── backend/
│   ├── app.py              # Flask application
│   ├── database.py         # Database connection
│   ├── requirements.txt    # Python dependencies
│   ├── Dockerfile          # Backend container
│   └── .env.example        # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API service
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── Dockerfile          # Frontend container
│   ├── nginx.conf          # Nginx configuration
│   ├── package.json        # Node dependencies
│   └── .env.example        # Frontend env template
├── docker-compose.yml      # Docker orchestration
├── init.sql                # Database initialization
└── README.md               # This file
```

## Prerequisites

Before starting, ensure your Ubuntu server has:
- Ubuntu 20.04 LTS or later
- Terminal/SSH access
- Sudo privileges

## Complete Installation Guide

### Step 1: Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

### Step 2: Install Docker

```bash
# Install required packages
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package index
sudo apt update

# Install Docker
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Verify Docker installation
sudo docker --version

# Add your user to docker group (optional, to run docker without sudo)
sudo usermod -aG docker $USER

# Note: Log out and back in for group changes to take effect
```

### Step 3: Install Docker Compose

Docker Compose v2 is included with modern Docker installations as a plugin. Verify it's installed:

```bash
# Verify Docker Compose installation
docker compose version

# If not installed, install Docker Compose plugin
sudo apt update
sudo apt install -y docker-compose-plugin

# Verify again
docker compose version
```

Note: This guide uses `docker compose` (v2 syntax). If you have the older standalone version, you can use `docker-compose` (with hyphen) instead.

### Step 4: Clone or Transfer Project Files

If you're setting up from scratch, ensure all project files are in your server directory.

```bash
# Navigate to your project directory
cd /path/to/linux_app_grocery_tracker

# Verify all files are present
ls -la
```

### Step 5: Configure Environment Variables

```bash
# Copy environment template
cp .env.example .env

# IMPORTANT: Edit and change the default passwords!
nano .env
```

**CRITICAL**: You MUST change these passwords before deploying to production!

Default configuration (CHANGE PASSWORDS):
- **Database Name**: `grocery_db`
- **Admin User**: `admin` / `CHANGE_ME_STRONG_PASSWORD_123`
- **App User**: `app_user` / `CHANGE_ME_APP_PASSWORD_456`

The `.env` file contains:
```env
POSTGRES_DB=grocery_db
POSTGRES_USER=admin
POSTGRES_PASSWORD=CHANGE_ME_STRONG_PASSWORD_123

DB_HOST=postgres
DB_NAME=grocery_db
DB_USER=app_user
DB_PASSWORD=CHANGE_ME_APP_PASSWORD_456
DB_PORT=5432

VITE_API_URL=/api
```

**Note**: After changing `DB_PASSWORD` in the `.env` file, you must also update the password in `init.sql` to match (see next step).

### Step 6: Update Database Initialization Script

Copy the init_example.sql file to new location using:

```bash
cp init_example.sql init.sql
```

You will need to make changes to the init.sql file thereafter to update the password

The `init.sql` file creates the application user and tables. The password in this file MUST match the `DB_PASSWORD` in your `.env` file.

```bash
# Edit init.sql
nano init.sql
```

Find this line:
```sql
CREATE USER app_user WITH PASSWORD 'app_password';
```

Change `'app_password'` to match your `DB_PASSWORD` from the `.env` file. For example:
```sql
CREATE USER app_user WITH PASSWORD 'CHANGE_ME_APP_PASSWORD_456';
```

Next step is to initialise the required DB tables. 

To do this run the following command to step into the postgres container, login as the admin user and then run the sql script:

```bash
docker compose exec -T postgres psql -U admin -d grocery_db < init.sql
```


Save and close the file.

### Step 7: Configure Firewall and Open Ports

```bash
# Check if UFW firewall is active
sudo ufw status

# If firewall is active, allow necessary ports
sudo ufw allow 22/tcp      # SSH (if not already allowed)
sudo ufw allow 80/tcp      # HTTP (Frontend)
sudo ufw allow 443/tcp     # HTTPS (if you plan to use SSL later)
sudo ufw allow 5000/tcp    # Backend API (optional, for direct access)

# Reload firewall
sudo ufw reload

# Verify rules
sudo ufw status numbered
```

### Step 8: Build and Start the Application

```bash
# Navigate to project directory
cd /path/to/linux_app_grocery_tracker

# Build and start all containers (this may take several minutes on first run)
docker compose up -d --build

# Verify all containers are running
docker compose ps
```

You should see three containers running with "healthy" status:
- `grocery_postgres` (PostgreSQL 16 database)
- `grocery_backend` (Flask API with Gunicorn)
- `grocery_frontend` (React + Nginx)

The first startup may take 30-60 seconds as the services wait for health checks to pass.

### Step 9: Verify Installation

```bash
# Check container logs (follow mode - press Ctrl+C to exit)
docker compose logs -f

# Check individual service logs
docker compose logs backend
docker compose logs frontend
docker compose logs postgres

# Test backend API health endpoint
curl http://localhost:5000/api/health

# Expected response: {"status":"healthy"}
```

### Step 10: Access the Application

Open your web browser and navigate to:
- **Local access**: `http://localhost`
- **Remote access**: `http://YOUR_SERVER_IP`

You should see the Grocery Inventory Tracker interface.

### Step 11: Test the Application

1. **Add a new item**: Fill out the form and click "Add Item"
2. **View items**: All items appear in the list below
3. **Low stock alert**: Items with quantity ≤ 2 appear in the dashboard
4. **Edit item**: Click "Edit" button on any item
5. **Delete item**: Click "Delete" button (with confirmation)

The application comes pre-populated with sample grocery items for testing.

## Database Information

### Users and Permissions

The application uses two PostgreSQL users:

1. **Admin User** (`admin`)
   - Superuser with full privileges
   - Used for database administration
   - Credentials: `admin` / `admin_password`

2. **Application User** (`app_user`)
   - Limited privileges (SELECT, INSERT, UPDATE, DELETE)
   - Used by the Flask backend
   - Credentials: `app_user` / `app_password`

### Database Schema

**Table**: `grocery_items`

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| name | VARCHAR(255) | Item name (required) |
| description | TEXT | Item description (optional) |
| quantity | INTEGER | Current quantity (default: 0) |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### Accessing the Database

```bash
# Connect to PostgreSQL container
docker exec -it grocery_postgres psql -U admin -d grocery_db

# Common SQL commands:
# List all tables
\dt

# View all items
SELECT * FROM grocery_items;

# View low stock items
SELECT * FROM grocery_items WHERE quantity <= 2;

# Exit psql
\q
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/groceries` | Get all items |
| GET | `/api/groceries/low-stock` | Get items with quantity ≤ 2 |
| GET | `/api/groceries/<id>` | Get single item |
| POST | `/api/groceries` | Create new item |
| PUT | `/api/groceries/<id>` | Update item |
| DELETE | `/api/groceries/<id>` | Delete item |

## Docker Commands Reference

### Starting and Stopping

```bash
# Start all services
docker compose up -d

# Stop services (containers remain)
docker compose stop

# Stop and remove containers (data persists in volumes)
docker compose down

# Stop and remove everything INCLUDING DATA (⚠️ CAREFUL!)
docker compose down -v
```

### Viewing Logs and Status

```bash
# View logs (all services)
docker compose logs

# Follow logs in real-time
docker compose logs -f

# View logs for specific service
docker compose logs -f backend

# Check container status
docker compose ps

# View resource usage
docker stats
```

### Restarting and Rebuilding

```bash
# Restart all services
docker compose restart

# Restart specific service
docker compose restart backend

# Rebuild and restart after code changes
docker compose up -d --build

# Rebuild specific service
docker compose up -d --build frontend
```

### Executing Commands

```bash
# Access backend container shell
docker compose exec backend bash

# Access database
docker compose exec postgres psql -U admin -d grocery_db

# Run one-off command
docker compose exec backend python -c "print('Hello')"
```

## Troubleshooting

### Port Already in Use

If port 80, 5000, or 5432 is already in use:

```bash
# Check what's using the port
sudo lsof -i :80
sudo lsof -i :5000
sudo lsof -i :5432

# Stop the conflicting service or change ports in docker-compose.yml
```

### Container Won't Start

```bash
# View detailed logs
docker compose logs backend
docker compose logs postgres

# Check container status
docker compose ps -a

# Remove containers and rebuild
docker compose down
docker compose up -d --build

# If issues persist, clean rebuild
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

### Database Connection Issues

```bash
# Check if PostgreSQL is ready
docker compose exec postgres pg_isready -U admin -d grocery_db

# Verify environment variables
docker compose exec backend env | grep DB_

# Check database logs
docker compose logs postgres

# Restart backend
docker compose restart backend

# Verify app_user password in init.sql matches DB_PASSWORD in .env
```

### Frontend Can't Connect to Backend

```bash
# Check backend is running
curl http://localhost:5000/api/health

# Check nginx configuration
docker compose exec frontend cat /etc/nginx/conf.d/default.conf

# View frontend logs
docker compose logs frontend

# Verify all services are healthy
docker compose ps

# Check if services can communicate
docker compose exec frontend wget -O- http://backend:5000/api/health
```

### Permission Denied Errors

```bash
# If you get permission denied for docker commands:
sudo usermod -aG docker $USER

# Log out and back in, or run:
newgrp docker
```

## External Access Configuration

### Option 1: Direct IP Access

If your server has a public IP:

```bash
# Allow port 80 in firewall
sudo ufw allow 80/tcp

# Access via: http://YOUR_SERVER_IP
```

### Option 2: Domain Name Setup

If you have a domain name:

1. Point your domain's A record to your server IP
2. Update nginx configuration for the domain
3. Consider adding SSL with Let's Encrypt:

```bash
# Install certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com
```

### Option 3: Port Forwarding (Home Network)

If running on home network:

1. Log into your router admin panel
2. Set up port forwarding:
   - External Port: 80 → Internal Port: 80 → Server IP
3. Access via: `http://YOUR_PUBLIC_IP`

## Application Maintenance

### Updating the Application

```bash
# Pull latest changes (if using git)
git pull

# Rebuild and restart with zero downtime
docker compose up -d --build

# Or rebuild specific service
docker compose up -d --build backend

# Check updated services
docker compose ps
```

### Backing Up Data

```bash
# Create backups directory
mkdir -p backups

# Backup database (SQL format)
docker compose exec -T postgres pg_dump -U admin grocery_db > backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup
ls -lh backups/

# Keep only last 30 days of backups
find backups/ -name "backup_*.sql" -mtime +30 -delete
```

### Restoring from Backup

```bash
# Stop the application
docker compose down

# Start only PostgreSQL
docker compose up -d postgres

# Wait for database to be ready
sleep 10

# Restore from backup
cat backups/backup_20250128_120000.sql | docker compose exec -T postgres psql -U admin grocery_db

# Start all services
docker compose up -d

# Verify restoration
docker compose exec postgres psql -U admin -d grocery_db -c "SELECT COUNT(*) FROM grocery_items;"
```

### Automated Backup Script

Create `/usr/local/bin/backup-grocery.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/path/to/grocery-tracker/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
cd /path/to/grocery-tracker

# Create backup
docker compose exec -T postgres pg_dump -U admin grocery_db > "$BACKUP_DIR/backup_$TIMESTAMP.sql"

# Keep only last 30 days
find "$BACKUP_DIR" -name "backup_*.sql" -mtime +30 -delete

echo "Backup completed: backup_$TIMESTAMP.sql"
```

Make executable and schedule:
```bash
sudo chmod +x /usr/local/bin/backup-grocery.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-grocery.sh") | crontab -
```

## Security Recommendations

### Production Security Checklist

- [ ] Change all default passwords in `.env` and `init.sql`
- [ ] Remove external port mappings for PostgreSQL (port 5432)
- [ ] Remove external port mapping for backend (port 5000) - only expose via nginx
- [ ] Enable HTTPS with SSL certificates (Let's Encrypt)
- [ ] Configure firewall to allow only HTTP/HTTPS
- [ ] Set up automated backups
- [ ] Implement rate limiting on nginx
- [ ] Regular security updates for Docker images
- [ ] Monitor logs for suspicious activity
- [ ] Use strong passwords (16+ characters, mixed case, numbers, symbols)

### Removing Direct Database Access

For production, edit `docker-compose.yml` and comment out:

```yaml
services:
  postgres:
    # ports:
    #   - "5432:5432"  # Comment this out

  backend:
    # ports:
    #   - "5000:5000"  # Comment this out
```

All traffic will go through nginx on port 80 (and 443 for HTTPS).

## Monitoring and Logs

### Checking Resource Usage

```bash
# View resource consumption
docker stats

# Check disk usage
docker system df

# Check volume size
docker volume inspect grocery_tracker_postgres_data
```

### Managing Logs

```bash
# Check log sizes
docker compose ps -q | xargs docker inspect --format='{{.Name}} {{.LogPath}}' | xargs -I {} du -h {}

# Clean up old logs
docker system prune -a

# Configure log rotation (add to docker-compose.yml)
# See docker-compose.yml for log rotation configuration
```

## Uninstalling

```bash
# Stop and remove containers, networks (keeps data in volumes)
docker compose down

# Stop and remove EVERYTHING including data (⚠️ CAREFUL!)
docker compose down -v

# Remove Docker images
docker rmi linux_app_grocery_tracker-backend
docker rmi linux_app_grocery_tracker-frontend
docker rmi postgres:16-alpine

# Remove project directory (if needed)
cd ..
rm -rf linux_app_grocery_tracker
```

## Development

### Running Locally Without Docker

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
export DB_HOST=localhost
python app.py
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Quick Reference

### Essential Commands

| Task | Command |
|------|---------|
| Start application | `docker compose up -d` |
| Stop application | `docker compose down` |
| View logs | `docker compose logs -f` |
| Check status | `docker compose ps` |
| Restart service | `docker compose restart backend` |
| Rebuild | `docker compose up -d --build` |
| Backup database | `docker compose exec -T postgres pg_dump -U admin grocery_db > backup.sql` |
| Access database | `docker compose exec postgres psql -U admin -d grocery_db` |
| View resources | `docker stats` |

### Application URLs

- Frontend: `http://localhost` or `http://YOUR_SERVER_IP`
- Backend API: `http://localhost:5000/api` (internal only after production hardening)
- Health Check: `http://localhost:5000/api/health`

### Important Files

- `docker-compose.yml` - Container orchestration
- `.env` - Environment variables (CREATE THIS FROM .env.example)
- `init.sql` - Database initialization script
- `backend/app.py` - Flask API application
- `frontend/nginx.conf` - Nginx reverse proxy configuration

## How Everything Works Together

### Architecture Flow

1. **User accesses the application** via browser at `http://server-ip`
2. **Nginx (frontend container)** receives the request on port 80
3. **For static files** (/, /assets/*), nginx serves the React app
4. **For API requests** (/api/*), nginx proxies to the backend container
5. **Backend (Flask)** processes the request and queries PostgreSQL
6. **PostgreSQL** returns data from the `grocery_items` table
7. **Backend** returns JSON response to nginx
8. **Nginx** forwards response to the browser
9. **React app** updates the UI with the data

### Data Persistence

- Database data is stored in a Docker volume named `postgres_data`
- This volume persists even when containers are stopped or removed
- Only `docker compose down -v` will delete the volume and data
- The volume is stored in `/var/lib/docker/volumes/` on the host

### Container Communication

- All containers are on the same Docker network (`grocery-network`)
- Containers communicate using service names (e.g., `backend`, `postgres`)
- The frontend doesn't directly connect to PostgreSQL (security)
- Health checks ensure services start in the correct order

## Support

For issues or questions:

1. **Check the Troubleshooting section** above
2. **Review logs**: `docker compose logs -f`
3. **Verify status**: `docker compose ps`
4. **Check resources**: `docker stats`
5. **Verify environment**: Ensure `.env` matches `init.sql` password

## License

This project is provided as-is for educational and personal use.
