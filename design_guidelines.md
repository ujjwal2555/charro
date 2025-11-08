# HRMS Prototype Design Guidelines

## Design Approach
**System-Based**: Material Design principles with custom refinements for HR/enterprise software
**Aesthetic**: Clean, modern HR dashboard with soft purple/teal accent palette

## Visual Identity
- **Color Palette**: Soft purple and teal accents for primary actions and highlights
- **Design Philosophy**: Professional, trustworthy, data-focused with approachable warmth
- **No images required**: This is a data-heavy enterprise application - focus on clean UI, charts, and information architecture

## Typography
- **Headings**: Medium weight (500-600) for dashboard titles and section headers
- **Body**: Regular weight (400) for tables, forms, and content
- **Data/Numbers**: Tabular figures for financial data and metrics
- **Hierarchy**: Clear distinction between page titles, section headers, card titles, and body text

## Layout System
**Spacing**: Use Tailwind units of 2, 4, 6, and 8 consistently (p-4, gap-6, m-8)
**Grid**: Dashboard cards in 2-4 column grid (responsive), tables full-width within containers
**Sidebar**: Persistent navigation on desktop (collapsible on mobile), 64-72px width when collapsed

## Component Library

### Navigation
- **Header**: Fixed top bar with logo, role badge, notification bell, user avatar, role switcher dropdown
- **Sidebar**: Icon-only collapsed state, full labels expanded, active state clearly indicated
- **Breadcrumbs**: For nested pages (Employee → Profile, Payroll → Payslip)

### Dashboard Cards
- **Metric Cards**: Large number with label, small icon/trend indicator, subtle shadow on hover
- **Chart Cards**: Title, date range selector, chart area, legend positioned contextually
- **Layout**: 4-column grid on desktop, 2-column tablet, stacked mobile

### Data Tables
- **Structure**: Sticky header, zebra striping optional, row hover state
- **Actions**: Inline action buttons (icon-only) aligned right, visible on row hover
- **Bulk Actions**: Checkbox column, action bar appears when items selected
- **Pagination**: Bottom-aligned with page size selector

### Forms
- **Input Fields**: Clean borders, focus states with accent color, label above field
- **Validation**: Inline error messages below field in red, disable submit when invalid
- **Modals**: Centered overlay with backdrop blur, max-width 600px, clear header/footer separation
- **Buttons**: Primary (accent color), Secondary (outline), Destructive (red outline)

### Calendar & Timeline
- **Attendance Calendar**: Monthly grid view, color-coded day tiles (Present=green, Absent=red, Leave=blue, Half=yellow)
- **Daily Detail**: Side drawer on day click showing time entries and notes
- **Leave Timeline**: Visual timeline showing leave periods with status badges

### Payslip
- **Layout**: Printable A4 format, company header simulation, line-item breakdown table
- **Typography**: Monospace for amounts, clear section dividers
- **Actions**: Print button triggers window.print(), download simulated

### Notifications
- **Toast**: Top-right corner, auto-dismiss 3-4s, success/error/info variants
- **Bell Dropdown**: Last 10 notifications, mark as read interaction, time stamps
- **Badges**: Small red circle count on bell icon

### Role Switcher
- **Login Page**: Large demo account cards with role icon, name, email
- **In-App Switcher**: Header dropdown showing current role with ability to switch instantly
- **Visual Indicator**: Always-visible role badge in header (color-coded by role)

### Charts (Recharts)
- **Line Chart**: Attendance trend over 30 days, grid lines, tooltips on hover
- **Pie Chart**: Leave distribution by type, legend with percentages
- **Bar Chart**: Monthly payroll costs, labeled axes, responsive width

## Micro-interactions
- **Minimal Animations**: Subtle fade-in for modals, slide-in for toasts, smooth hover transitions
- **Loading States**: Skeleton screens for tables, spinner for async actions
- **Focus Management**: Modal focus trap, keyboard navigation highlighted

## Responsive Breakpoints
- **Mobile (<768px)**: Stacked layouts, hamburger sidebar, single-column cards
- **Tablet (768-1024px)**: 2-column grids, compact sidebar
- **Desktop (>1024px)**: Full multi-column layouts, expanded sidebar

## Accessibility
- **ARIA Labels**: All interactive elements properly labeled
- **Keyboard Navigation**: Tab order logical, ESC closes modals, Enter submits forms
- **Color Contrast**: WCAG AA minimum for all text and interactive elements
- **Focus Indicators**: Visible outline on keyboard focus

## Empty States
- **Pattern**: Icon + message + CTA button
- **Examples**: "No attendance yet — Clock in now", "No pending leaves", "No payslips generated"
- **Position**: Centered within containing card or table area

## Role-Based UI Patterns
- **Disabled Actions**: Grayed out with tooltip explaining permission requirement
- **Hidden Features**: Entire menu items/pages hidden for unauthorized roles
- **Conditional Workflows**: Different action sets per role (Employee applies, HR approves)