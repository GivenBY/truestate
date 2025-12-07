# TruEstate Sales Management System - Backend

Node.js + Express backend API for the TruEstate Sales Management System with PostgreSQL database integration.

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.2.1
- **Database**: PostgreSQL 16 (Docker)
- **ORM**: Sequelize 6.37.7
- **Language**: JavaScript (ES Modules)

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.config.js          # Database configuration
│   ├── controllers/
│   │   └── sales.controller.js   # Request handlers
│   ├── models/
│   │   └── sale.js               # Sequelize Sale model
│   ├── routes/
│   │   └── sales.routes.js       # API route definitions
│   ├── services/
│   │   └── sales.service.js      # Business logic
│   ├── utils/
│   │   └── seed.js               # Database seeding script
│   └── index.js                  # Application entry point
├── .env                          # Environment variables
├── package.json
└── README.md
```

## Prerequisites

- Node.js 18+ installed
- Docker installed and running
- pnpm package manager

## Installation

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Start PostgreSQL container:**

   ```bash
   docker start truestate-postgres
   ```

   If the container doesn't exist, create it:

   ```bash
   docker run --name truestate-postgres \
     -e POSTGRES_USER=truestate_user \
     -e POSTGRES_PASSWORD=mysecretpassword \
     -e POSTGRES_DB=truestate_sales_db \
     -p 5432:5432 \
     -d postgres:16
   ```

3. **Configure environment variables:**

   Create or verify `.env` file:

   ```env
   PORT=3001
   DB_HOST=localhost
   DB_USER=truestate_user
   DB_PASSWORD=mysecretpassword
   DB_NAME=truestate_sales_db
   ```

4. **Seed the database:**
   ```bash
   node src/utils/seed.js
   ```

## Running the Server

### Development

```bash
node src/index.js
```

### With auto-reload (using nodemon)

```bash
pnpm add -D nodemon
nodemon src/index.js
```

Server will start on: **http://localhost:3001**

## API Documentation

### Base URL

```
http://localhost:3001/api
```

### Endpoints

#### GET /api/sales

Fetch paginated sales data with filtering, sorting, and search capabilities.

**Query Parameters:**

| Parameter       | Type    | Required | Description                               | Example                         |
| --------------- | ------- | -------- | ----------------------------------------- | ------------------------------- |
| `page`          | integer | No       | Page number (default: 1)                  | `page=1`                        |
| `pageSize`      | integer | No       | Items per page (default: 10)              | `pageSize=10`                   |
| `sort`          | string  | No       | Sort field:direction (default: date:desc) | `sort=customerName:asc`         |
| `search`        | string  | No       | Search in name/phone                      | `search=john`                   |
| `region`        | string  | No       | Comma-separated regions                   | `region=North,South`            |
| `gender`        | string  | No       | Comma-separated genders                   | `gender=Male,Female`            |
| `category`      | string  | No       | Comma-separated categories                | `category=Electronics,Clothing` |
| `tags`          | string  | No       | Comma-separated tags                      | `tags=gadgets,wireless`         |
| `paymentMethod` | string  | No       | Comma-separated methods                   | `paymentMethod=UPI,Cash`        |
| `ageMin`        | integer | No       | Minimum age                               | `ageMin=25`                     |
| `ageMax`        | integer | No       | Maximum age                               | `ageMax=45`                     |
| `dateMin`       | string  | No       | Start date (YYYY-MM-DD)                   | `dateMin=2023-01-01`            |
| `dateMax`       | string  | No       | End date (YYYY-MM-DD)                     | `dateMax=2023-12-31`            |

**Sortable Fields:**

- `customerName` - Customer name
- `finalAmount` - Final sale amount
- `date` - Transaction date

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "transactionId": "TXN001",
      "customerName": "John Doe",
      "phoneNumber": "9876543210",
      "customerRegion": "North",
      "gender": "Male",
      "age": 32,
      "productCategory": "Electronics",
      "finalAmount": "4838.40",
      "discountPercentage": "4.00",
      "totalAmount": "5040.00",
      "paymentMethod": "Credit Card",
      "date": "2023-09-28",
      ...
    }
  ],
  "totalCount": 5000,
  "currentPage": 1,
  "totalPages": 500,
  "totalFinalAmount": 28434795.55,
  "totalDiscount": 9517606.45
}
```

**Example Requests:**

```bash
# Get first page
curl http://localhost:3001/api/sales?page=1&pageSize=10

# Search for customers
curl http://localhost:3001/api/sales?search=john

# Filter by region and gender
curl http://localhost:3001/api/sales?region=North,South&gender=Male

# Sort by amount (high to low)
curl http://localhost:3001/api/sales?sort=finalAmount:desc

# Filter by age range
curl http://localhost:3001/api/sales?ageMin=25&ageMax=45

# Filter by date range
curl http://localhost:3001/api/sales?dateMin=2023-01-01&dateMax=2023-12-31

# Filter by tags
curl http://localhost:3001/api/sales?tags=gadgets,wireless

# Combined filters
curl "http://localhost:3001/api/sales?page=1&pageSize=10&region=North&sort=customerName:asc&search=john"
```

## Architecture

### Layered Architecture

1. **Routes Layer** (`routes/sales.routes.js`)

   - Define API endpoints
   - Map HTTP methods to controllers

2. **Controllers Layer** (`controllers/sales.controller.js`)

   - Handle HTTP requests/responses
   - Validate query parameters
   - Format API responses
   - Error handling

3. **Services Layer** (`services/sales.service.js`)

   - Business logic
   - Build complex queries
   - Data aggregation
   - Filter and search logic

4. **Models Layer** (`models/sale.js`)
   - Database schema definition
   - Sequelize model configuration
   - Table relationships

### Database Operations

#### Search Implementation

```javascript
// Case-insensitive search on multiple fields
{
  [Op.or]: [
    { customerName: { [Op.iLike]: `%${search}%` } },
    { phoneNumber: { [Op.iLike]: `%${search}%` } }
  ]
}
```

#### Multi-Select Filters

```javascript
// IN operator for array values
{
  customerRegion: { [Op.in]: ['North', 'South'] }
}
```

#### Tags Filtering

```javascript
// Partial match for comma-separated values
{
  [Op.or]: [
    { tags: { [Op.iLike]: '%gadgets%' } },
    { tags: { [Op.iLike]: '%wireless%' } }
  ]
}
```

#### Range Filters

```javascript
// Age range
{
  age: {
    [Op.gte]: minAge,
    [Op.lte]: maxAge
  }
}

// Date range
{
  date: {
    [Op.gte]: new Date('2023-01-01'),
    [Op.lt]: new Date('2023-12-31')
  }
}
```

#### Aggregations

```javascript
// Calculate totals across all records
await Sale.findAll({
  where,
  attributes: [
    [sequelize.fn("SUM", sequelize.col("finalAmount")), "totalFinalAmount"],
    [sequelize.fn("SUM", sequelize.col("totalAmount")), "totalAmount"],
  ],
  raw: true,
});
```

## Database Schema

The `Sales` table contains 5000 records with the following structure:

- `id` - Primary key
- `transactionId` - Unique transaction identifier
- `date` - Transaction date
- `customerName` - Customer full name
- `phoneNumber` - Customer phone
- `customerRegion` - Geographic region (North, South, East, West, Central)
- `gender` - Customer gender
- `age` - Customer age
- `productCategory` - Product category (Electronics, Clothing, Beauty)
- `tags` - Comma-separated tags
- `paymentMethod` - Payment method (Cash, UPI, Credit Card, etc.)
- `finalAmount` - Final amount after discount
- `totalAmount` - Amount before discount
- `discountPercentage` - Discount percentage applied
- And more...

## Error Handling

### Validation Errors (400)

```json
{
  "message": "Invalid pagination parameters. Page and pageSize must be positive integers."
}
```

### Server Errors (500)

```json
{
  "message": "Internal Server Error while processing sales query.",
  "details": "Error description"
}
```

## CORS Configuration

CORS is configured to allow requests from:

- `http://localhost:3000` (Frontend development)
- `http://192.168.1.10:3000` (Network access)

Update in `src/index.js` for production:

```javascript
app.use(
  cors({
    origin: ["https://your-production-domain.com"],
    methods: ["GET", "POST"],
  })
);
```

## Environment Variables

| Variable      | Description       | Default            |
| ------------- | ----------------- | ------------------ |
| `PORT`        | Server port       | 3001               |
| `DB_HOST`     | PostgreSQL host   | localhost          |
| `DB_USER`     | Database user     | truestate_user     |
| `DB_PASSWORD` | Database password | mysecretpassword   |
| `DB_NAME`     | Database name     | truestate_sales_db |
