# WorkZen HRMS - Windows Local Hosting Guide

## Prerequisites

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **PostgreSQL** (v14 or higher)
   - Download from: https://www.postgresql.org/download/windows/
   - During installation, remember your postgres password
   - Default port: 5432

## Setup Instructions

### Step 1: Install Dependencies

Open Command Prompt or PowerShell in the project directory:

```bash
npm install
```

### Step 2: Setup PostgreSQL Database

1. Open **pgAdmin** or use **psql** command line
2. Create a new database named `workzen_hrms`:

```sql
CREATE DATABASE workzen_hrms;
```

### Step 3: Configure Environment Variables

Create a `.env` file in the project root directory:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/workzen_hrms
SESSION_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

Replace `YOUR_PASSWORD` with your PostgreSQL password.

### Step 4: Initialize Database

Run database migrations and seed demo data:

```bash
npm run db:push
```

This will create all tables and populate with demo users and data.

### Step 5: Start the Application

```bash
npm run dev
```

The application will start on: **http://localhost:5000**

## Demo Login Credentials

- **Admin**: admin@workzen.com / admin123
- **HR Officer**: hr@workzen.com / hr123
- **Payroll Officer**: payroll@workzen.com / payroll123
- **Employee**: john@workzen.com / employee123

## Troubleshooting

### Database Connection Issues

If you see "Connection refused" errors:

1. Verify PostgreSQL service is running:
   - Open Services (Win+R → `services.msc`)
   - Find "postgresql-x64-XX" service
   - Ensure it's Running

2. Check your DATABASE_URL in `.env` file
3. Verify PostgreSQL port (default: 5432)

### Port Already in Use

If port 5000 is already taken:

1. Find and kill the process using port 5000:
   ```bash
   netstat -ano | findstr :5000
   taskkill /PID <PID_NUMBER> /F
   ```

2. Or change the port in `server/index.ts` (line with `PORT`)

### Missing Dependencies

If you see module errors:

```bash
npm clean-install
```

## Production Deployment

For production hosting:

1. Build the application:
   ```bash
   npm run build
   ```

2. Start production server:
   ```bash
   npm start
   ```

3. Update `.env`:
   ```env
   NODE_ENV=production
   SESSION_SECRET=change-to-a-strong-random-string
   ```

## Database Backup

To backup your database:

```bash
pg_dump -U postgres workzen_hrms > backup.sql
```

To restore:

```bash
psql -U postgres workzen_hrms < backup.sql
```

## Support

For issues or questions, refer to the project documentation or contact support.
