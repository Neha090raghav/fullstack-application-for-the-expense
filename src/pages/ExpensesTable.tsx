import React, { useState, useMemo } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Box,
  TextField,
  Paper,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";

export interface Expense {
  id: string;
  userEmail?: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  status: "pending" | "approved" | "rejected";
}

interface ExpensesTableProps {
  expenses: Expense[];
  showUserEmail?: boolean;
  onStatusChange?: (id: string, status: "approved" | "rejected") => void;
}

const DEFAULT_ROWS_PER_PAGE = 10;

const ExpensesTable: React.FC<ExpensesTableProps> = ({
  expenses,
  showUserEmail = false,
  onStatusChange,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(expenses.map((e) => e.category)));
    return unique.sort();
  }, [expenses]);

  const sortedExpenses = useMemo(() => {
  return [...expenses].sort((a, b) => {
   
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}, [expenses]);

const filteredExpenses = useMemo(() => {
  return sortedExpenses.filter((exp) => {
    const matchesCategory = categoryFilter ? exp.category === categoryFilter : true;
    const matchesDate = dateFilter ? exp.date.startsWith(dateFilter) : true;
    return matchesCategory && matchesDate;
  });
}, [sortedExpenses, categoryFilter, dateFilter]);

  const totalPages = Math.ceil(filteredExpenses.length / rowsPerPage);

  const paginatedExpenses = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredExpenses.slice(start, start + rowsPerPage);
  }, [filteredExpenses, page, rowsPerPage]);

  if (!expenses.length)
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        Loading...
      </Box>
    );

  const handleRowsPerPageChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setRowsPerPage(event.target.value as number);
    setPage(0);
  };

  return (
    <Paper sx={{ p: 2 }}>
      {/* Filters */}
      <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
        <Autocomplete
          options={categories}
          value={categoryFilter}
          onChange={(_, value) => {
            setCategoryFilter(value);
            setPage(0);
          }}
          renderInput={(params) => <TextField {...params} label="Category" />}
          sx={{ minWidth: 200 }}
        />
        <TextField
          type="date"
          label="Date"
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value);
            setPage(0);
          }}
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      
      <Box sx={{ maxHeight: "60vh", overflowY: "auto", border: "1px solid #e0e0e0" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              {showUserEmail && <TableCell sx={{ fontWeight: "bold" }}>User Email</TableCell>}
              <TableCell sx={{ fontWeight: "bold" }}>Category</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
              {onStatusChange && <TableCell sx={{ fontWeight: "bold" }} align="center">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedExpenses.map((exp) => (
              <TableRow key={exp.id}>
                {showUserEmail && <TableCell>{exp.userEmail}</TableCell>}
                <TableCell>{exp.category}</TableCell>
                <TableCell>₹{exp.amount.toFixed(2)}</TableCell>
                <TableCell>{exp.description}</TableCell>
                <TableCell>{exp.date}</TableCell>
                <TableCell
                  sx={{
                    color:
                      exp.status === "approved"
                        ? "green"
                        : exp.status === "rejected"
                        ? "red"
                        : "orange",
                    fontWeight: "bold",
                  }}
                >
                  {exp.status.toUpperCase()}
                </TableCell>
                {onStatusChange && exp.status === "pending" && (
                  <TableCell align="center">
                    <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => onStatusChange(exp.id, "approved")}
                        sx={{ minWidth: 90, textTransform: "none", fontWeight: "bold" }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => onStatusChange(exp.id, "rejected")}
                        sx={{ minWidth: 90, textTransform: "none", fontWeight: "bold" }}
                      >
                        Reject
                      </Button>
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

     
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
        <Typography>
          Showing {paginatedExpenses.length ? page * rowsPerPage + 1 : 0} -{" "}
          {page * rowsPerPage + paginatedExpenses.length} of {filteredExpenses.length} records
        </Typography>

        <Box display="flex" alignItems="center" gap={1}>
          <Button
            variant="outlined"
            size="small"
            disabled={page === 0}
            onClick={() => setPage((prev) => prev - 1)}
          >
            &lt;
          </Button>
          <Button
            variant="outlined"
            size="small"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((prev) => prev + 1)}
          >
            &gt;
          </Button>

         <Select
  value={rowsPerPage}
  onChange={(event) => setRowsPerPage(Number(event.target.value))}
  size="small"
  sx={{ ml: 2 }}
>
  {[5, 10, 20, 50].map((n) => (
    <MenuItem key={n} value={n}>
      {n} / page
    </MenuItem>
  ))}
</Select>

        </Box>
      </Box>
    </Paper>
  );
};

export default ExpensesTable;
