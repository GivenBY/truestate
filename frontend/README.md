# TruEstate Sales Management System - Frontend

Modern, responsive Next.js frontend for the TruEstate Sales Management System with advanced filtering, searching, and data visualization.

## Technology Stack

- **Framework**: Next.js 16.0.7 (App Router)
- **React**: 19.x
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui (Radix UI)
- **Build Tool**: Turbopack

## Project Structure

```
frontend/
├── app/
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout with sidebar
│   └── page.tsx              # Home page
├── components/
│   ├── MainContent.tsx       # Main sales dashboard
│   ├── sidebar.tsx           # Navigation sidebar
│   └── ui/                   # Shadcn UI components
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── table.tsx
│       └── ...
├── hooks/
│   └── use-mobile.ts         # Mobile detection hook
├── lib/
│   └── utils.ts              # Utility functions
├── public/                   # Static assets
├── components.json           # Shadcn configuration
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── package.json
```

## Prerequisites

- Node.js 18+ installed
- pnpm package manager
- Backend API running on port 3001

## Installation

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Configure API endpoint:**

   In `frontend/.env`, verify the API base URL:

   ```typescript
   NEXT_PUBLIC_API_BASE_URL = "http://localhost:3001/api/sales";
   ```

## Running the Application

### Development Mode

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
pnpm build
pnpm start
```

### Linting

```bash
pnpm lint
```

## Features

### 1. Sales Dashboard

**Key Metrics (Fixed Totals):**

- Total Units Sold
- Total Amount (across all records)
- Total Discount (across all records)

### 2. Advanced Search

- **Debounced Input**: 500ms delay to reduce API calls
- **Search Fields**: Customer name and phone number
- **Case-insensitive**: Matches partial strings
- **Real-time Updates**: Results update as you type

### 3. Multi-Select Filters

**Available Filters:**

| Filter           | Options                                                                                  |
| ---------------- | ---------------------------------------------------------------------------------------- |
| Customer Region  | Central, East, North, South, West                                                        |
| Gender           | Male, Female, Other                                                                      |
| Age Group        | 18-25, 26-35, 36-45, 46-60, 60+                                                          |
| Product Category | Beauty, Clothing, Electronics                                                            |
| Tags             | accessories, beauty, casual, cotton, fashion, formal, gadgets, makeup, organic, wireless |
| Payment Method   | Cash, Credit Card, Debit Card, Net Banking, UPI, Wallet                                  |
| Date             | Last 7 Days, Last 30 Days, This Month, Last Month, This Year                             |

**Filter Behavior:**

- Multiple selections within same filter (OR logic)
- All filters combined with AND logic
- Active filter count shown in badge
- Visual checkmark for selected options
- Reset all filters with one click

### 4. Sorting

**Sortable Columns:**

- Customer Name (A-Z, Z-A)
- Final Amount (Low to High, High to Low)
- Date (Newest First, Oldest First)

### 5. Pagination

- 10 records per page
- Smart page navigation (up to 5 visible page buttons)
- Previous/Next buttons
- Shows current range (e.g., "Showing 1 to 10 of 5000 entries")

### 6. Data Table

**Columns:**

- Transaction ID
- Customer Name
- Phone Number (with copy button)
- Region (badge)
- Gender
- Age
- Product Category
- Final Amount (formatted currency)
- Discount Percentage
- Payment Method
- Date

**Features:**

- Responsive design
- Fixed header
- Hover effects
- Loading skeleton
- Empty state
- Error handling

## Component Architecture

### MainContent Component

The main dashboard component with complete state management:

```typescript
// State Management
const [salesData, setSalesData] = useState<SaleData[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [totalCount, setTotalCount] = useState(0);
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [searchTerm, setSearchTerm] = useState("");
const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
const [sortBy, setSortBy] = useState("date:desc");
const [filters, setFilters] = useState<Record<string, string[]>>({});
const [totalFinalAmount, setTotalFinalAmount] = useState(0);
const [totalDiscount, setTotalDiscount] = useState(0);
```

### Custom Hooks

#### useCallback for fetchSalesData

```typescript
const fetchSalesData = useCallback(async () => {
  // API call with all parameters
}, [currentPage, pageSize, sortBy, debouncedSearchTerm, filters]);
```

#### Debounced Search

```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearchTerm(searchTerm);
  }, 500);
  return () => clearTimeout(timer);
}, [searchTerm]);
```

## Styling

### Tailwind CSS Configuration

Custom theme with:

- Dark mode support
- Custom color palette
- Responsive breakpoints
- Custom animations

### Shadcn/ui Components

Pre-built, accessible components:

- Fully typed with TypeScript
- Customizable with Tailwind
- Accessible by default (ARIA)
- Dark mode compatible

## API Integration

### Data Fetching

```typescript
const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
const data: ApiResponse = await response.json();
```

### Query Parameter Building

```typescript
const params = new URLSearchParams({
  page: currentPage.toString(),
  pageSize: pageSize.toString(),
  sort: sortBy,
});

// Add search
if (debouncedSearchTerm) {
  params.append("search", debouncedSearchTerm);
}

// Add filters
Object.entries(filters).forEach(([key, values]) => {
  // Special handling for age groups, dates, etc.
});
```

## State Management Strategy

### Local Component State

- All state managed with React hooks
- No external state management library needed
- Optimized with useCallback and useMemo

### Data Flow

```
User Action → State Update → useEffect → fetchSalesData → API Call → State Update → Re-render
```

## Performance Optimization

1. **Debounced Search**: Reduces API calls by 90%
2. **useCallback**: Prevents unnecessary function recreations
3. **Memoization**: Efficient dependency tracking
4. **Conditional Rendering**: Loading and error states
5. **Turbopack**: Fast development builds

## Responsive Design

### Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Mobile Features

- Collapsible sidebar
- Horizontal scroll for table
- Touch-friendly buttons
- Optimized filter menu

## Error Handling

### Loading States

```typescript
{loading ? (
  <TableCell colSpan={11} className="text-center py-8">
    Loading...
  </TableCell>
) : salesData.length === 0 ? (
  <TableCell colSpan={11} className="text-center py-8">
    No data found
  </TableCell>
) : (
  // Render data
)}
```

### Error Display

```typescript
{
  error && (
    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
      Error: {error}
    </div>
  );
}
```

### Graceful Fallbacks

```typescript
{
  row.finalAmount
    ? parseFloat(row.finalAmount.toString()).toLocaleString()
    : "0.00";
}
```

## Accessibility

- **Semantic HTML**: Proper heading hierarchy
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Visible focus indicators
- **Color Contrast**: WCAG AA compliant

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## Development Tips

1. **Hot Reload**: Changes reflect immediately
2. **TypeScript**: Enable strict mode for type safety
3. **Console Errors**: Monitor browser console
4. **React DevTools**: Use for debugging
