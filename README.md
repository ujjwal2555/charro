# WorkZen HRMS - Human Resource Management System

A comprehensive, full-stack HR management platform built with React, Express, and PostgreSQL.

## Features

- **Role-Based Access Control**: Admin, HR Officer, Payroll Officer, and Employee roles
- **Employee Management**: Complete employee lifecycle management
- **Attendance Tracking**: Clock in/out system with attendance history
- **Leave Management**: Leave request submission and approval workflow
- **Payroll Processing**: Automated payroll generation with detailed breakdowns
- **Analytics Dashboard**: Visual insights into HR metrics

## Quick Start

### Option 1: Use Existing Cloud Database (Easiest)

If you're using the Replit-hosted version or have a Neon database:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file (copy from `.env.example`):
   ```env
   DATABASE_URL=your_existing_database_url
   SESSION_SECRET=your-secret-key
   NODE_ENV=development
   ```

3. Run the application:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5000`

### Option 2: Local Windows Setup

For complete local hosting on Windows, see **[WINDOWS_SETUP.md](WINDOWS_SETUP.md)** for detailed instructions.

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@workzen.com | admin123 |
| HR Officer | hr@workzen.com | hr123 |
| Payroll Officer | payroll@workzen.com | payroll123 |
| Employee | john@workzen.com | employee123 |

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: Radix UI, shadcn/ui
- **Charts**: Recharts
- **Authentication**: Session-based with bcrypt

## Project Structure

```
workzen-hrms/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities and helpers
│   │   └── hooks/          # Custom React hooks
├── server/                 # Express backend
│   ├── routes.ts           # API endpoints
│   ├── storage.ts          # Data access layer
│   └── index.ts            # Server entry point
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema definitions
└── db/                     # Database files
    └── seed.ts             # Demo data seeder
```

## Available Scripts

- `npm run dev` - Start development server (frontend + backend)
- `npm run build` - Build for production
- `npm start` - Run production server
- `npm run db:push` - Sync database schema and seed data
- `npm run check` - TypeScript type checking

## Key Features by Role

### Admin
- Manage all employees
- View system-wide analytics
- Configure system settings
- Access all modules

### HR Officer
- Employee onboarding and management
- Attendance monitoring
- Leave request approvals
- Employee analytics

### Payroll Officer
- Generate monthly payrolls
- View salary breakdowns
- Access payslip history
- Payroll analytics

### Employee
- View personal dashboard
- Clock in/out for attendance
- Submit leave requests
- View payslips

## Development

### Prerequisites
- Node.js 18 or higher
- PostgreSQL 14 or higher (for local hosting)

### Setup Development Environment

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure `.env` file
4. Initialize database: `npm run db:push`
5. Start development server: `npm run dev`

### Database Migrations

The project uses Drizzle Kit for database migrations:

```bash
npm run db:push
```

This command will:
1. Create all database tables
2. Seed demo data (if not already seeded)
3. Set up initial user accounts

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Set production environment variables:
   ```env
   NODE_ENV=production
   DATABASE_URL=your_production_database_url
   SESSION_SECRET=strong-random-secret-key
   ```

3. Start the server:
   ```bash
   npm start
   ```

## Windows Compatibility

✅ **This application is fully compatible with Windows!**

All npm scripts use `cross-env` for cross-platform environment variable support. You can run this application on Windows without any code modifications.

For detailed Windows setup instructions, see [WINDOWS_SETUP.md](WINDOWS_SETUP.md).

## License

MIT License - Feel free to use this project for learning or commercial purposes.

## Support

For issues or questions, please refer to the documentation or create an issue in the repository.
