# TruEstate Sales Management System

## Overview

A full-stack sales management application built with Next.js and Express.js that provides comprehensive data filtering, sorting, and search capabilities. The system handles 5000+ sales records with real-time statistics and server-side pagination for optimal performance. Features a responsive UI built with React 19 and Tailwind CSS, backed by PostgreSQL database running in Docker.

## Tech Stack

**Frontend**: Next.js 16.0.7, React 19, TypeScript, Tailwind CSS, Shadcn/ui  
**Backend**: Node.js, Express.js 5.2.1, JavaScript (ES Modules)  
**Database**: PostgreSQL 16 (Docker), Sequelize ORM 6.37.7  
**Package Manager**: pnpm (Monorepo workspace)

## Search Implementation Summary

**Frontend Implementation:**

- Dual-state approach: `searchTerm` (immediate input) and `debouncedSearchTerm` (API trigger)
- 500ms debounce delay using `useEffect` with cleanup to prevent excessive API calls
- Search triggers on debounced value change, optimizing network requests

**Backend Implementation:**

- Searches across `customerName` and `phoneNumber` fields using Sequelize `Op.or`
- Case-insensitive partial matching with `Op.iLike` operator (`%search%`)
- Integrated with WHERE clause alongside other filters

**Code Location:**

- Frontend: `/frontend/components/MainContent.tsx` (lines 30-45, useEffect for debounce)
- Backend: `/backend/src/services/sales.service.js` (buildWhereClause function)

## Filter Implementation Summary

**Frontend Implementation:**

- Multi-select dropdowns for: Region, Gender, Age Group, Product Category, Tags, Payment Method, Date Range
- Age groups (18-25, 26-35, etc.) converted to `ageMin`/`ageMax` parameters
- Date ranges (Last 7/30/90 Days, etc.) converted to `dateMin`/`dateMax` ISO strings
- Product category mapped to `category` query parameter
- Filter changes trigger immediate API call via `useEffect` dependency

**Backend Implementation:**

- Multi-select filters use Sequelize `Op.in` for array matching (region, gender, paymentMethod)
- Tags filter uses `Op.iLike` with wildcards for comma-separated string matching
- Age/date range filters use `Op.between` for numeric/date comparisons
- All filters combined with AND logic in single WHERE clause

**Code Location:**

- Frontend: `/frontend/components/MainContent.tsx` (filter conversion logic, lines 80-120)
- Backend: `/backend/src/services/sales.service.js` (buildWhereClause function, lines 40-90)

## Sorting Implementation Summary

**Frontend Implementation:**

- Sort options: Customer Name, Final Amount, Transaction Date
- Each option has ascending/descending variants (A-Z/Z-A, Low/High, Newest/Oldest)
- Sort format sent to API: `field:direction` (e.g., `customerName:asc`, `finalAmount:desc`)
- Sort state triggers re-fetch via `useEffect` dependency

**Backend Implementation:**

- Validates sort fields against allowed list: `customerName`, `finalAmount`, `date`
- Parses format `field:direction` and applies to Sequelize query order clause
- Defaults to newest first (`date:desc`) if no sort specified
- Sorting applied after filtering, before pagination

**Code Location:**

- Frontend: `/frontend/components/MainContent.tsx` (sort state and handler)
- Backend: `/backend/src/services/sales.service.js` (lines 110-125, sort validation and application)

## Pagination Implementation Summary

**Frontend Implementation:**

- Server-side pagination with 10 records per page (fixed limit)
- Displays page buttons (up to 5 visible) with Previous/Next controls
- Shows current range (e.g., "1-10 of 5000") and total count
- Page changes trigger API call with updated `page` parameter
- Aggregates (total amount, discount) remain fixed across pages

**Backend Implementation:**

- Calculates `offset` from page number: `(page - 1) * limit`
- Separate aggregate query (`COUNT`, `SUM`) runs on all matching records (ignores pagination)
- Main data query applies `limit` and `offset` for page-specific results
- Returns: `data`, `currentPage`, `totalPages`, `totalRecords`, `totalFinalAmount`, `totalDiscount`

**Code Location:**

- Frontend: `/frontend/components/MainContent.tsx` (pagination controls, lines 200-250)
- Backend: `/backend/src/services/sales.service.js` (getAllSales function, lines 15-50)
- Backend: `/backend/src/controllers/sales.controller.js` (response formatting)

## Setup Instructions

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Docker

### Installation Steps

1. **Clone and Install Dependencies**

```bash
git clone https://github.com/givenby/TruEstate
cd truestate
pnpm install
```

2. **Start PostgreSQL Database**

```bash
docker run --name truestate-postgres \
  -e POSTGRES_USER=truestate_user \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -e POSTGRES_DB=truestate_sales_db \
  -p 5432:5432 \
  -d postgres:16
```

3. **Configure Backend Environment**  
   Create `backend/.env`:

```env
PORT=3001
DB_HOST=localhost
DB_USER=truestate_user
DB_PASSWORD=mysecretpassword
DB_NAME=truestate_sales_db
```

4. **Seed Database**

```bash
cd backend
node src/utils/seed.js
```

5. **Start Servers**

```bash
# Terminal 1 - Backend
cd backend
node src/index.js

# Terminal 2 - Frontend
cd frontend
pnpm dev
```

6. **Access Application**

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api/sales

---

**Full Architecture Details**: See `/docs/architecture.md`
