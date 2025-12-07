# TruEstate Sales Management System - Architecture Documentation

## Overview

The TruEstate Sales Management System is a full-stack web application built to manage and analyze sales data with advanced filtering, sorting, searching, and pagination capabilities.

## Technology Stack

### Frontend

- **Framework**: Next.js 16.0.7 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui (Radix UI primitives)
- **State Management**: React Hooks (useState, useEffect, useCallback)
- **Build Tool**: Turbopack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js 5.2.1
- **Language**: JavaScript (ES Modules)
- **ORM**: Sequelize 6.37.7
- **Database**: PostgreSQL 16
- **Environment**: Docker (PostgreSQL container)

### Package Manager

- **pnpm** (Workspace configuration for monorepo)

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                         │
│  (Next.js Frontend - Port 3000)                            │
│  - React Components                                         │
│  - State Management                                         │
│  - API Client                                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP/REST API
                     │
┌────────────────────▼────────────────────────────────────────┐
│                     API Layer                               │
│  (Express.js Backend - Port 3001)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Routes Layer                                        │  │
│  │  - /api/sales (GET)                                  │  │
│  └───────────────────┬──────────────────────────────────┘  │
│                      │                                      │
│  ┌───────────────────▼──────────────────────────────────┐  │
│  │  Controllers Layer                                    │  │
│  │  - Request validation                                 │  │
│  │  - Query parameter processing                         │  │
│  │  - Response formatting                                │  │
│  └───────────────────┬──────────────────────────────────┘  │
│                      │                                      │
│  ┌───────────────────▼──────────────────────────────────┐  │
│  │  Services Layer                                       │  │
│  │  - Business logic                                     │  │
│  │  - Query building                                     │  │
│  │  - Data transformation                                │  │
│  └───────────────────┬──────────────────────────────────┘  │
│                      │                                      │
│  ┌───────────────────▼──────────────────────────────────┐  │
│  │  Models Layer (Sequelize ORM)                        │  │
│  │  - Sale model definition                              │  │
│  │  - Database schema mapping                            │  │
│  └───────────────────┬──────────────────────────────────┘  │
└────────────────────┬─┴──────────────────────────────────────┘
                     │
                     │ SQL Queries
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   Data Layer                                │
│  (PostgreSQL Database - Docker Container)                   │
│  - Sales table (5000 records)                              │
│  - Indexes for optimization                                 │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

### Sales Table

```sql
CREATE TABLE "Sales" (
  id SERIAL PRIMARY KEY,
  transactionId VARCHAR(255) UNIQUE NOT NULL,
  date DATE NOT NULL,
  paymentMethod VARCHAR(255),
  orderStatus VARCHAR(255),
  deliveryType VARCHAR(255),
  storeId VARCHAR(255),
  storeLocation VARCHAR(255),
  salespersonId VARCHAR(255),
  employeeName VARCHAR(255),
  customerId VARCHAR(255),
  customerName VARCHAR(255),
  phoneNumber VARCHAR(255),
  gender VARCHAR(255),
  age INTEGER,
  customerRegion VARCHAR(255),
  customerType VARCHAR(255),
  productId VARCHAR(255),
  productName VARCHAR(255),
  brand VARCHAR(255),
  productCategory VARCHAR(255),
  tags TEXT,
  quantity INTEGER,
  pricePerUnit DECIMAL(10,2),
  discountPercentage DECIMAL(5,2),
  totalAmount DECIMAL(10,2),
  finalAmount DECIMAL(10,2),
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

**Indexes:**

- Primary key on `id`
- Unique index on `transactionId`
- Index on `date` for efficient sorting

## API Design

### Endpoint: GET /api/sales

**Query Parameters:**

| Parameter       | Type    | Description                  | Example                  |
| --------------- | ------- | ---------------------------- | ------------------------ |
| `page`          | integer | Page number (default: 1)     | `page=1`                 |
| `pageSize`      | integer | Items per page (default: 10) | `pageSize=10`            |
| `sort`          | string  | Sort field and direction     | `sort=customerName:asc`  |
| `search`        | string  | Search term for name/phone   | `search=john`            |
| `region`        | string  | Comma-separated regions      | `region=North,South`     |
| `gender`        | string  | Comma-separated genders      | `gender=Male,Female`     |
| `category`      | string  | Comma-separated categories   | `category=Electronics`   |
| `tags`          | string  | Comma-separated tags         | `tags=gadgets,wireless`  |
| `paymentMethod` | string  | Comma-separated methods      | `paymentMethod=UPI,Cash` |
| `ageMin`        | integer | Minimum age                  | `ageMin=25`              |
| `ageMax`        | integer | Maximum age                  | `ageMax=45`              |
| `dateMin`       | string  | Start date (YYYY-MM-DD)      | `dateMin=2023-01-01`     |
| `dateMax`       | string  | End date (YYYY-MM-DD)        | `dateMax=2023-12-31`     |

**Response Format:**

```json
{
  "data": [...],
  "totalCount": 5000,
  "currentPage": 1,
  "totalPages": 500,
  "totalFinalAmount": 28434795.55,
  "totalDiscount": 9517606.45
}
```

## Key Features Implementation

### 1. Search Functionality

- **Debounced input**: 500ms delay before API call
- **Dual state**: `searchTerm` (immediate) and `debouncedSearchTerm` (API)
- **Backend**: Case-insensitive search on `customerName` and `phoneNumber` using `ILIKE`

### 2. Filtering

- **Multi-select filters**: Region, Gender, Category, Payment Method
- **Tags filtering**: Partial match using `ILIKE` on comma-separated values
- **Age range**: Min/Max boundaries
- **Date range**: Predefined ranges (Last 7/30 days, This Month, etc.)
- **Frontend conversion**: User-friendly options → API parameters

### 3. Sorting

- **Sortable fields**: Customer Name, Final Amount, Date
- **Bidirectional**: Ascending and Descending
- **Backend mapping**: Frontend field names mapped to database columns

### 4. Pagination

- **Server-side**: Database-level LIMIT/OFFSET
- **10 items per page**: Configurable page size
- **Smart navigation**: Up to 5 page buttons with ellipsis logic

### 5. Aggregate Statistics

- **Total Units Sold**: Count of all matching records
- **Total Amount**: SUM of `finalAmount` across all matching records
- **Total Discount**: Calculated as (totalAmount - finalAmount)
- **Fixed values**: Aggregates remain constant across pages
- **Filter-aware**: Updates based on active filters

## Data Flow

### Read Operation (Sales List)

```
1. User Action (Frontend)
   ↓
2. State Update (React)
   - Search: Debounced (500ms)
   - Filters: Immediate
   - Sort: Immediate
   - Page: Immediate
   ↓
3. API Request
   - Build query parameters
   - Convert frontend values to API format
   - Fetch from /api/sales
   ↓
4. Backend Processing
   - Validate parameters
   - Build WHERE clause (filters + search)
   - Build ORDER clause (sorting)
   - Apply pagination (LIMIT/OFFSET)
   - Calculate aggregates (SUM queries)
   ↓
5. Database Query
   - Main query: findAndCountAll
   - Aggregate query: SUM(finalAmount), SUM(totalAmount)
   ↓
6. Response
   - Transform data
   - Return JSON with data + metadata
   ↓
7. Frontend Update
   - Update state
   - Re-render UI
   - Show loading/error states
```

## Performance Optimizations

### Frontend

1. **useCallback**: Memoize `fetchSalesData` function
2. **Debounced Search**: Reduce API calls during typing
3. **Smart Dependencies**: Prevent unnecessary re-renders
4. **Conditional Rendering**: Loading and error states

### Backend

1. **Database Indexes**: On frequently queried/sorted fields
2. **Sequelize ORM**: Efficient query building
3. **Single Query Optimization**: findAndCountAll for pagination
4. **Selective Fields**: Option to limit returned columns

### Database

1. **Connection Pooling**: Managed by Sequelize
2. **Query Optimization**: Proper WHERE and ORDER clauses
3. **LIMIT/OFFSET**: Server-side pagination

## Error Handling

### Frontend

- Try-catch blocks for API calls
- Error state display
- Graceful fallbacks (show "0" for missing values)

### Backend

- Input validation (page numbers, age ranges)
- SQL error catching
- Detailed error messages in development
- Generic messages in production

### Database

- Connection retry logic
- Transaction support (prepared for future)

## Security Considerations

1. **CORS Configuration**: Whitelisted origins
2. **Input Validation**: Type checking and range validation
3. **SQL Injection Prevention**: Sequelize parameterized queries
4. **Environment Variables**: Sensitive data in .env
5. **Docker Network**: Database isolated in container

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│         Production Environment          │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │   Vercel (Frontend)               │  │
│  │   - Next.js SSR/SSG               │  │
│  │   - CDN Distribution              │  │
│  │   - Automatic HTTPS               │  │
│  └──────────────┬────────────────────┘  │
│                 │                        │
│  ┌──────────────▼───────────────────┐   │
│  │   Backend API Server             │   │
│  │   - Node.js + Express            │   │
│  │   - PM2 Process Manager          │   │
│  │   - Nginx Reverse Proxy          │   │
│  └──────────────┬───────────────────┘   │
│                 │                        │
│  ┌──────────────▼───────────────────┐   │
│  │   PostgreSQL Database            │   │
│  │   - Managed Service or Docker    │   │
│  │   - Automated Backups            │   │
│  │   - Connection Pooling           │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## Development Environment

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- pnpm package manager

### Setup

```bash
# Install dependencies
pnpm install

# Start PostgreSQL
docker start truestate-postgres

# Start backend (port 3001)
cd backend && node src/index.js

# Start frontend (port 3000)
cd frontend && pnpm dev
```

## Folder Structure

### Backend (`/backend`)

```
backend/
├── src/
│   ├── index.js                 # Entry point, Express server setup
│   ├── config/
│   │   └── db.config.js         # Sequelize configuration & connection
│   ├── models/
│   │   └── sale.js              # Sale model definition (Sequelize)
│   ├── routes/
│   │   └── sales.routes.js      # API route definitions
│   ├── controllers/
│   │   └── sales.controller.js  # Request handlers, validation
│   ├── services/
│   │   └── sales.service.js     # Business logic, query building
│   └── utils/
│       └── seed.js              # Database seeding script
├── .env                         # Environment variables
├── package.json                 # Dependencies & scripts
└── README.md                    # Backend documentation
```

### Frontend (`/frontend`)

```
frontend/
├── app/
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Home page (wraps MainContent)
│   └── globals.css              # Global styles, Tailwind directives
├── components/
│   ├── MainContent.tsx          # Main dashboard component
│   ├── sidebar.tsx              # Sidebar navigation
│   └── ui/                      # Shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── table.tsx
│       └── ...                  # Other UI primitives
├── hooks/
│   └── use-mobile.ts            # Custom hook for responsive detection
├── lib/
│   └── utils.ts                 # Utility functions (cn, etc.)
├── public/                      # Static assets
├── package.json                 # Dependencies & scripts
├── next.config.ts               # Next.js configuration
├── tsconfig.json                # TypeScript configuration
└── README.md                    # Frontend documentation
```

### Root (`/`)

```
truestate/
├── backend/                     # Backend application
├── frontend/                    # Frontend application
├── docs/
│   └── architecture.md          # This file
├── .vscode/                     # VS Code workspace settings
│   ├── settings.json
│   ├── extensions.json
│   └── launch.json
├── .gitignore                   # Root-level Git ignore
├── .editorconfig                # Editor configuration
├── .prettierrc                  # Prettier configuration
├── pnpm-workspace.yaml          # pnpm workspace definition
├── package.json                 # Root package.json
└── README.md                    # Project overview
```

## Module Responsibilities

### Backend Modules

#### `src/index.js` (Entry Point)

- Initialize Express application
- Configure middleware (CORS, body-parser, express.json)
- Register routes
- Start server on configured port
- Database connection initialization

#### `src/config/db.config.js` (Database Configuration)

- Sequelize instance creation
- Database connection parameters
- Connection pooling settings
- Dialect configuration (PostgreSQL)

#### `src/models/sale.js` (Data Model)

- Define Sale model schema using Sequelize
- Map database columns to model attributes
- Define data types and constraints
- Table name configuration

#### `src/routes/sales.routes.js` (Route Definitions)

- Define API endpoints
- Map HTTP methods to controllers
- Route: `GET /api/sales` → `getAllSales` controller

#### `src/controllers/sales.controller.js` (Request Handlers)

- **Responsibilities:**

  - Extract and validate query parameters (page, search, filters, sort)
  - Validate age ranges (min ≤ max)
  - Parse multi-value parameters (comma-separated strings → arrays)
  - Call service layer methods
  - Format response with pagination metadata
  - Handle errors and send appropriate HTTP status codes

- **Key Function:** `getAllSales(req, res)`
  - Input: Request with query parameters
  - Output: JSON response with data, pagination, aggregates

#### `src/services/sales.service.js` (Business Logic)

- **Responsibilities:**

  - Build complex Sequelize queries
  - Construct WHERE clauses from filters
  - Handle multi-select filters (region, gender, category, paymentMethod)
  - Special tags filtering (ILIKE for comma-separated values)
  - Age/date range filtering
  - Search functionality (customerName, phoneNumber)
  - Sorting logic with field validation
  - Pagination calculation (offset, limit)
  - Aggregate calculations (COUNT, SUM)

- **Key Functions:**
  - `getAllSales(filters, page, pageSize, sort, search)` - Main query orchestration
  - `buildWhereClause(filters, search)` - Construct WHERE conditions

#### `src/utils/seed.js` (Database Seeding)

- Read CSV data file
- Parse records
- Insert data into database using Sequelize
- Handle duplicates and errors
- Used for development/testing data setup

### Frontend Modules

#### `app/page.tsx` (Home Page)

- Root page component
- Renders MainContent component
- Server component wrapper

#### `app/layout.tsx` (Root Layout)

- Define HTML structure
- Import global styles
- Configure fonts
- Provide context/providers if needed

#### `components/MainContent.tsx` (Main Component)

- **Responsibilities:**

  - State management for all filters, search, sort, pagination
  - API integration (fetch sales data)
  - Debounced search implementation
  - Filter state to query parameter conversion
  - Data rendering in table format
  - Pagination controls
  - Display aggregate statistics
  - Loading and error states

- **State Variables:**

  - `salesData` - Array of sale records
  - `searchTerm`, `debouncedSearchTerm` - Search state
  - `filters` - Object containing all filter values
  - `sortBy` - Current sort option
  - `currentPage` - Active page number
  - `totalPages`, `totalRecords` - Pagination metadata
  - `totalFinalAmount`, `totalDiscount` - Aggregates
  - `isLoading`, `error` - UI states

- **Key Functions:**
  - `fetchSalesData()` - API call with memoization
  - `handleSearchChange()` - Update search state
  - `handleFilterChange()` - Update filter state
  - `handleSortChange()` - Update sort state
  - `handlePageChange()` - Navigate pages

#### `components/ui/*` (UI Components)

- Reusable Shadcn/ui components
- Built on Radix UI primitives
- Styled with Tailwind CSS
- Accessible and composable

**Key Components:**

- `Button` - Interactive buttons
- `Card` - Content containers
- `Table` - Data table structure
- `Input` - Text input fields
- `Select` - Dropdown selects
- `DropdownMenu` - Multi-select menus
- `Badge` - Tag/label displays

#### `hooks/use-mobile.ts`

- Custom React hook
- Detect mobile/tablet breakpoints
- Returns boolean for responsive logic

#### `lib/utils.ts`

- Utility functions
- `cn()` - Class name merging (clsx + tailwind-merge)
- Other helper functions
