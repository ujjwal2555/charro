# WorkZen HRMS - Interactive HR Management System Prototype

## Overview

WorkZen HRMS is a comprehensive Human Resource Management System prototype built as a full-stack web application. The system provides role-based access control for managing employees, tracking attendance, processing leave requests, generating payroll, and viewing analytics dashboards. It serves as a demonstration platform for HR workflows with four distinct user roles: Admin, HR Officer, Payroll Officer, and Employee.

The application emphasizes a clean, modern interface following Material Design principles with a professional purple and teal color palette suitable for enterprise HR software.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Application Structure

**Monorepo Architecture**: The project uses a monorepo structure with three main directories:
- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Shared TypeScript types and database schema definitions

This architecture enables code sharing between frontend and backend while maintaining clear separation of concerns.

### Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite as the build tool for fast development and optimized production builds.

**Routing**: Uses `wouter` as a lightweight client-side routing solution instead of React Router. Routes are defined in the main `App.tsx` with role-based protection.

**State Management Strategy**:
- **Authentication State**: React Context API (`AuthContext`) manages current user session and authentication state
- **Server State**: TanStack Query (React Query) handles API data fetching, caching, and synchronization
- **Local State**: React hooks for component-level state management

**UI Component Library**: Radix UI primitives with custom Tailwind CSS styling, following the shadcn/ui component architecture. All UI components are located in `client/src/components/ui/` and provide accessible, customizable building blocks.

**Styling System**: Tailwind CSS with a custom design system defined in `tailwind.config.ts`. The theme uses CSS custom properties for colors, enabling dynamic theming and consistent design tokens across the application.

**Design Philosophy**: Follows Material Design principles with custom refinements for HR/enterprise software. The design emphasizes data-heavy tables, charts, and forms without relying on imagery, focusing instead on clean information architecture.

### Backend Architecture

**Framework**: Express.js running on Node.js with TypeScript for type safety.

**API Design**: RESTful API architecture with the following endpoint categories:
- `/api/auth/*` - Authentication endpoints (login, logout, session management)
- `/api/users/*` - User CRUD operations
- `/api/attendance/*` - Attendance tracking and history
- `/api/leaves/*` - Leave request management and approval workflows
- `/api/payruns/*` - Payroll generation and payslip access
- `/api/settings/*` - System configuration (Admin only)

**Authentication & Authorization**:
- **Session Management**: Express sessions with in-memory storage using `express-session` and `memorystore`
- **Password Security**: bcrypt hashing for password storage and verification
- **Role-Based Access Control**: Middleware functions (`requireAuth`, `requireRole`) enforce permissions at the route level
- **Session Configuration**: 7-day cookie lifetime with secure settings for production

**Data Access Layer**: The `storage.ts` module implements an abstraction layer (`IStorage` interface) for all database operations, making it easy to swap storage implementations.

### Database Architecture

**ORM**: Drizzle ORM provides type-safe database queries and schema management.

**Database**: PostgreSQL via Neon serverless (configured for serverless deployment with WebSocket support).

**Schema Design** (defined in `shared/schema.ts`):
- **users** - Employee records with salary components, leave quotas, and role assignments
- **attendance** - Daily attendance records with clock in/out times and status
- **leaves** - Leave applications with approval workflow states
- **payruns** - Monthly payroll runs with embedded salary breakdowns (JSONB)
- **settings** - System-wide configuration (PF percentage, professional tax)

**Key Design Decisions**:
- Text-based primary keys (e.g., `u{timestamp}`) for human-readable IDs
- Embedded JSON for payrun items to denormalize salary calculations and improve query performance
- Cascade deletes on user foreign keys to maintain referential integrity
- Date fields stored as text in YYYY-MM-DD format for simplified querying

**Database Initialization**: The `seed.ts` module populates the database with demo accounts and sample data on first run, enabling immediate testing of all features.

### Data Flow Architecture

1. **Client Request** → React component triggers API call via TanStack Query
2. **API Layer** → Express route handler validates authentication/authorization
3. **Business Logic** → Route handler processes request, calls storage layer
4. **Data Access** → Storage implementation executes Drizzle ORM queries
5. **Database** → PostgreSQL returns data
6. **Response** → Data flows back through layers to React component
7. **UI Update** → TanStack Query updates cache and re-renders components

### Security Architecture

**Password Management**: Passwords are hashed with bcrypt (10 rounds) before storage. The original password is never stored or logged.

**Session Security**:
- HTTP-only cookies prevent XSS attacks
- Secure flag enabled in production
- SameSite=lax prevents CSRF attacks
- Session secret should be changed in production

**API Security**: All protected routes require valid session authentication. Role-specific routes use middleware to verify user permissions before processing requests.

### Build & Deployment Strategy

**Development**:
- Vite dev server with HMR for frontend
- tsx for running TypeScript server with auto-reload
- Concurrent development of frontend and backend on different ports

**Production Build**:
- Frontend: Vite builds optimized static assets to `dist/public/`
- Backend: esbuild bundles server code with external dependencies to `dist/`
- Single Node.js process serves both static files and API endpoints

**Environment Configuration**: Uses environment variables for database connection strings and session secrets. The application checks for required variables at startup.

## External Dependencies

### Frontend Libraries

**UI Framework**: React 18 with TypeScript for type-safe component development

**UI Components**: Radix UI primitives (@radix-ui/*) provide accessible, unstyled components for dialogs, dropdowns, tooltips, and form controls

**Styling**: 
- Tailwind CSS for utility-first styling
- PostCSS for CSS processing
- class-variance-authority for component variant management
- clsx & tailwind-merge for conditional class merging

**Charts & Visualization**: Recharts for rendering attendance trends, leave distribution, and payroll analytics

**Data Fetching**: TanStack Query (React Query) manages server state, caching, and background synchronization

**Form Management**: 
- react-hook-form for form state and validation
- @hookform/resolvers for schema-based validation
- Zod for TypeScript-first schema validation

**Date Handling**: date-fns for date manipulation, formatting, and calendar logic

**Routing**: wouter as a lightweight alternative to React Router

### Backend Libraries

**Web Framework**: Express.js for HTTP server and routing

**Database**:
- Drizzle ORM for type-safe database queries
- @neondatabase/serverless for PostgreSQL connection pooling
- drizzle-kit for schema migrations

**Authentication**:
- express-session for session management
- memorystore (createMemoryStore) for in-memory session storage
- connect-pg-simple for PostgreSQL session storage option (configured but not active)
- bcrypt for password hashing

**Development Tools**:
- tsx for running TypeScript in Node.js
- Vite for frontend development server
- esbuild for production bundling

### Build & Development Tools

**TypeScript**: Provides static type checking across frontend, backend, and shared code

**Vite**: Frontend build tool and development server with HMR

**ESBuild**: Fast JavaScript bundler for backend production builds

**Drizzle Kit**: Database schema migration tool

### Replit-Specific Integrations

The application includes Replit development plugins when running in the Replit environment:
- @replit/vite-plugin-runtime-error-modal for error overlay
- @replit/vite-plugin-cartographer for code navigation
- @replit/vite-plugin-dev-banner for development indicators

These are conditionally loaded only in development mode when `REPL_ID` is present.

### Third-Party Services

**Neon Database**: Serverless PostgreSQL database hosted on Neon. Requires DATABASE_URL environment variable for connection. Uses WebSocket for serverless-optimized connections.

**Note**: The application currently uses in-memory session storage. For production deployment with multiple server instances, sessions should be persisted to PostgreSQL using the included `connect-pg-simple` adapter.