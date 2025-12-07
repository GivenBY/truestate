"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  InfoIcon,
  RotateCcw,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/sales";

interface SaleData {
  id: number;
  transactionId: string;
  customerName: string;
  phoneNumber: string;
  customerRegion: string;
  gender: string;
  age: number;
  productCategory: string;
  finalAmount: number;
  discountPercentage: number;
  totalAmount: number;
  paymentMethod: string;
  date: string;
}

interface ApiResponse {
  data: SaleData[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  totalFinalAmount: number;
  totalDiscount: number;
}

const filterOptions = [
  {
    label: "Customer Region",
    key: "region",
    options: ["Central", "East", "North", "South", "West"],
  },
  { label: "Gender", key: "gender", options: ["Male", "Female", "Other"] },

  {
    label: "Age Group",
    key: "ageGroup",
    options: ["18-25", "26-35", "36-45", "46-60", "60+"],
  },
  {
    label: "Product Category",
    key: "productCategory",
    options: ["Beauty", "Clothing", "Electronics"],
  },
  {
    label: "Tags",
    key: "tags",
    options: [
      "accessories",
      "beauty",
      "casual",
      "cotton",
      "fashion",
      "formal",
      "fragrance-free",
      "gadgets",
      "makeup",
      "organic",
    ],
  },
  {
    label: "Payment Method",
    key: "paymentMethod",
    options: [
      "Cash",
      "Credit Card",
      "Debit Card",
      "Net Banking",
      "UPI",
      "Wallet",
    ],
  },
  {
    label: "Date",
    key: "date",
    options: [
      "Last 7 Days",
      "Last 30 Days",
      "This Month",
      "Last Month",
      "This Year",
    ],
  },
];

const sortOptions = [
  { label: "Customer Name (A-Z)", value: "customerName:asc" },
  { label: "Customer Name (Z-A)", value: "customerName:desc" },
  { label: "Amount (Low to High)", value: "finalAmount:asc" },
  { label: "Amount (High to Low)", value: "finalAmount:desc" },
  { label: "Date (Newest First)", value: "date:desc" },
  { label: "Date (Oldest First)", value: "date:asc" },
];

export default function MainContent() {
  const [salesData, setSalesData] = useState<SaleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date:desc");
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [totalFinalAmount, setTotalFinalAmount] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchSalesData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
        sort: sortBy,
      });

      if (debouncedSearchTerm) {
        params.append("search", debouncedSearchTerm);
      }

      // Process filters and convert to API format
      Object.entries(filters).forEach(([key, values]) => {
        if (values.length > 0) {
          if (key === "ageGroup") {
            // Convert age group to ageMin and ageMax
            values.forEach((ageGroup) => {
              const ageRanges: Record<string, { min: number; max: number }> = {
                "18-25": { min: 18, max: 25 },
                "26-35": { min: 26, max: 35 },
                "36-45": { min: 36, max: 45 },
                "46-60": { min: 46, max: 60 },
                "60+": { min: 60, max: 150 },
              };
              const range = ageRanges[ageGroup];
              if (range) {
                params.append("ageMin", range.min.toString());
                params.append("ageMax", range.max.toString());
              }
            });
          } else if (key === "date") {
            // Convert date options to dateMin and dateMax
            const today = new Date();
            const value = values[0];

            if (value === "Last 7 Days") {
              const date = new Date(today);
              date.setDate(date.getDate() - 7);
              params.append("dateMin", date.toISOString().split("T")[0]);
              params.append("dateMax", today.toISOString().split("T")[0]);
            } else if (value === "Last 30 Days") {
              const date = new Date(today);
              date.setDate(date.getDate() - 30);
              params.append("dateMin", date.toISOString().split("T")[0]);
              params.append("dateMax", today.toISOString().split("T")[0]);
            } else if (value === "This Month") {
              const firstDay = new Date(
                today.getFullYear(),
                today.getMonth(),
                1
              );
              params.append("dateMin", firstDay.toISOString().split("T")[0]);
              params.append("dateMax", today.toISOString().split("T")[0]);
            } else if (value === "Last Month") {
              const firstDay = new Date(
                today.getFullYear(),
                today.getMonth() - 1,
                1
              );
              const lastDay = new Date(
                today.getFullYear(),
                today.getMonth(),
                0
              );
              params.append("dateMin", firstDay.toISOString().split("T")[0]);
              params.append("dateMax", lastDay.toISOString().split("T")[0]);
            } else if (value === "This Year") {
              const firstDay = new Date(today.getFullYear(), 0, 1);
              params.append("dateMin", firstDay.toISOString().split("T")[0]);
              params.append("dateMax", today.toISOString().split("T")[0]);
            }
          } else if (key === "productCategory") {
            params.append("category", values.join(","));
          } else {
            params.append(key, values.join(","));
          }
        }
      });

      const response = await fetch(`${API_BASE_URL}?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch sales data");
      }

      const data: ApiResponse = await response.json();
      setSalesData(data.data);
      setTotalCount(data.totalCount);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
      setTotalFinalAmount(data.totalFinalAmount);
      setTotalDiscount(data.totalDiscount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching sales data:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, sortBy, debouncedSearchTerm, filters]);

  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => {
      const currentValues = prev[key] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      if (newValues.length === 0) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }

      return { ...prev, [key]: newValues };
    });
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({});
    setSearchTerm("");
    setSortBy("date:desc");
    setCurrentPage(1);
  };

  const totalUnits = totalCount;

  return (
    <div className="flex flex-col gap-4 p-4 w-full h-full overflow-auto">
      <Toaster position="bottom-center" />
      <div className="flex justify-between items-center pb-1.5 border-b">
        <h1 className="text-2xl font-bold">Sales Management System</h1>
        <div className="flex gap-4 items-center">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or phone..."
              className="pl-9 bg-zinc-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2.5 items-center flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            className="h-7"
            onClick={handleResetFilters}
          >
            <RotateCcw className="size-4" />
          </Button>

          {filterOptions.map((filter) => (
            <DropdownMenu key={filter.label}>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="h-7 gap-2">
                  {filter.label}
                  {filters[filter.key]?.length > 0 && (
                    <Badge variant="default" className="ml-1 h-4 px-1 text-xs">
                      {filters[filter.key].length}
                    </Badge>
                  )}
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {filter.options.map((option) => (
                  <DropdownMenuItem
                    key={option}
                    onClick={() => handleFilterChange(filter.key, option)}
                    className={
                      filters[filter.key]?.includes(option) ? "bg-accent" : ""
                    }
                  >
                    {option}
                    {filters[filter.key]?.includes(option) && " ✓"}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="sm" className="h-7 gap-2">
              Sort by: {sortOptions.find((opt) => opt.value === sortBy)?.label}
              <ChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setSortBy(option.value)}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex gap-4">
        <Card className="w-fit h-[62px] overflow-hidden p-0">
          <div className="flex flex-col h-full px-4 py-2 justify-between">
            <CardTitle className="text-sm font-normal flex items-center gap-2 whitespace-nowrap leading-none">
              Total units sold
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="size-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total number of units sold</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <p className="text-sm font-bold whitespace-nowrap leading-none">
              {loading ? "..." : totalUnits}
            </p>
          </div>
        </Card>
        <Card className="w-fit h-[62px] overflow-hidden p-0">
          <div className="flex flex-col h-full px-4 py-2 justify-between">
            <CardTitle className="text-sm font-normal flex items-center gap-2 whitespace-nowrap leading-none">
              Total Amount
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="size-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total revenue from all matching sales records</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <p className="text-sm font-bold whitespace-nowrap leading-none">
              {loading
                ? "..."
                : `₹${totalFinalAmount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`}
            </p>
          </div>
        </Card>

        <Card className="w-fit h-[62px] overflow-hidden p-0">
          <div className="flex flex-col h-full px-4 py-2 justify-between">
            <CardTitle className="text-sm font-normal flex items-center gap-2 whitespace-nowrap leading-none">
              Total Discount
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="size-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total discounts from all matching sales records</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <p className="text-sm font-bold whitespace-nowrap leading-none">
              {loading
                ? "..."
                : `₹${totalDiscount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`}
            </p>
          </div>
        </Card>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          Error: {error}
        </div>
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-100">
              <TableHead className="min-w-[120px]">Transaction ID</TableHead>
              <TableHead className="min-w-[150px]">Customer Name</TableHead>
              <TableHead className="min-w-[130px]">Phone Number</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Age</TableHead>
              <TableHead className="min-w-[150px]">Product Category</TableHead>
              <TableHead className="text-right">Final Amount (₹)</TableHead>
              <TableHead className="text-right">Discount (%)</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : salesData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8">
                  No data found
                </TableCell>
              </TableRow>
            ) : (
              salesData.map((row) => (
                <TableRow key={row.transactionId}>
                  <TableCell className="font-medium">
                    {row.transactionId}
                  </TableCell>
                  <TableCell>{row.customerName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{row.phoneNumber}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          navigator.clipboard.writeText(row.phoneNumber);
                          toast.success("Phone number copied!");
                        }}
                      >
                        <Copy className="size-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{row.customerRegion}</Badge>
                  </TableCell>
                  <TableCell>{row.gender}</TableCell>
                  <TableCell>{row.age}</TableCell>
                  <TableCell>{row.productCategory}</TableCell>
                  <TableCell className="text-right">
                    ₹
                    {row.finalAmount
                      ? parseFloat(row.finalAmount.toString()).toLocaleString(
                          "en-IN",
                          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                        )
                      : "0.00"}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.discountPercentage
                      ? parseFloat(row.discountPercentage.toString()).toFixed(
                          1
                        ) + "%"
                      : "0%"}
                  </TableCell>
                  <TableCell>{row.paymentMethod}</TableCell>
                  <TableCell>
                    {new Date(row.date).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {salesData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}{" "}
          to {Math.min(currentPage * pageSize, totalCount)} of {totalCount}{" "}
          entries
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1 || loading}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage(pageNum)}
                  disabled={loading}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages || loading}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
