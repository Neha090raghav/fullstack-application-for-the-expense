import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { addExpenseAsync } from "./expensesSlice";
import { RootState } from "../../app/store";

interface ExpenseFormProps {
  onSuccess?: () => void;
}

const categories = [
  "Rent",
  "Groceries",
  "Electricity",
  "Internet",
  "Restaurants",
  "Travel",
  "Fuel",
  "Shopping",
  "Movies",
  "Subscriptions",
  "Medical",
  "Gym",
  "Gifts",
  "Insurance",
  "Others",
];

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSuccess }) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state: RootState) => state.expenses);

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

 
  const sanitizeInput = (value: string) => value.replace(/[<>]/g, "").trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

 
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setError("Amount must be a valid number greater than zero.");
      return;
    }

    if (!category) {
      setError("Please select a category.");
      return;
    }

   
    if (description && !/^[a-zA-Z0-9\s.,'-]{0,100}$/.test(description)) {
      setError(
        "Description can only include letters, numbers, spaces, and punctuation (max 100 characters)."
      );
      return;
    }

   
    const sanitizedExpense = {
      amount: amountValue,
      category: sanitizeInput(category),
      description: sanitizeInput(description),
      date: new Date().toISOString(),
      status: "pending" as const,
    };

    try {
      await dispatch(addExpenseAsync(sanitizedExpense)).unwrap();
    
      setAmount("");
      setCategory("");
      setDescription("");
      if (onSuccess) onSuccess();
    } catch (err) {
      setError("Failed to add expense. Please try again.");
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        width: "100%",
        maxWidth: 400,
        mx: "auto",
        mt: 4,
      }}
    >
      <TextField
        label="Amount (₹)"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        fullWidth
        required
        inputProps={{ min: "0", step: "0.01" }}
      />

      <Autocomplete
        options={categories}
        value={category}
        onChange={(_, newValue) => setCategory(newValue || "")}
        renderInput={(params) => (
          <TextField {...params} label="Category" required fullWidth />
        )}
      />

      <TextField
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        multiline
        rows={2}
        inputProps={{ maxLength: 100 }}
      />

      {error && (
        <Box sx={{ color: "error.main", fontSize: 14, textAlign: "center" }}>
          {error}
        </Box>
      )}

      <Button
        type="submit"
        variant="contained"
        disabled={loading}
        sx={{ mt: 1, py: 1.2, fontWeight: 600 }}
      >
        {loading ? (
          <>
            <CircularProgress size={22} color="inherit" sx={{ mr: 1 }} />
            Adding...
          </>
        ) : (
          "Add Expense"
        )}
      </Button>
    </Box>
  );
};

export default ExpenseForm;
