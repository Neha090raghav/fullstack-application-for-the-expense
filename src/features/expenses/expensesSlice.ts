import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { db, auth } from "../../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";

export interface Expense {
  id: string;
  userId?: string;
  userEmail?: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
  status: "pending" | "approved" | "rejected";
}

interface ExpenseState {
  items: Expense[];
  loading: boolean;
  error: string | null;
}

const initialState: ExpenseState = {
  items: [],
  loading: false,
  error: null,
};

const sanitizeText = (text: string | undefined): string =>
  text ? text.replace(/[<>]/g, "").trim() : "";

export const fetchExpenses = createAsyncThunk(
  "expenses/fetchAll",
  async (isAdmin: boolean, { rejectWithValue }) => {
    try {
      let q;
      if (isAdmin) {
        q = collection(db, "expenses");
      } else {
        const uid = auth.currentUser?.uid;
        if (!uid) throw new Error("User not authenticated");
        q = query(collection(db, "expenses"), where("userId", "==", uid));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId ?? undefined,
          userEmail: data.userEmail ?? undefined,
          amount: data.amount,
          category: data.category,
          description: data.description,
          date: data.date,
          status: data.status,
        } as Expense;
      });
    } catch (error: any) {
      if (process.env.NODE_ENV === "development") console.error(error);
      return rejectWithValue(error.message || "Failed to fetch expenses");
    }
  }
);

export const addExpenseAsync = createAsyncThunk(
  "expenses/addExpense",
  async (
    expense: Omit<Expense, "id" | "userId" | "userEmail" | "status">,
    { rejectWithValue }
  ) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const sanitizedExpense = {
        amount: expense.amount,
        category: sanitizeText(expense.category),
        description: sanitizeText(expense.description),
        date: expense.date,
        status: "pending",
        userId: user.uid,
        userEmail: user.email ?? "",
        createdAt: serverTimestamp(),
      };

      if (process.env.NODE_ENV === "development") {
        console.log("Expense being sent to Firestore:", sanitizedExpense);
      }

      const docRef = await addDoc(collection(db, "expenses"), sanitizedExpense);

      return {
        id: docRef.id,
        ...sanitizedExpense,
      } as Expense;
    } catch (error: any) {
      if (process.env.NODE_ENV === "development") console.error(error);
      return rejectWithValue(error.message || "Failed to add expense");
    }
  }
);


export const updateExpenseStatusAsync = createAsyncThunk(
  "expenses/updateStatus",
  async (
    { id, status }: { id: string; status: "approved" | "rejected" },
    { rejectWithValue }
  ) => {
    try {
      const expenseRef = doc(db, "expenses", id);
      await updateDoc(expenseRef, { status });
      return { id, status };
    } catch (error: any) {
      console.error(error);
      return rejectWithValue(error.message || "Failed to update status");
    }
  }
);

const expensesSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action: PayloadAction<Expense[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Error fetching expenses";
      });

    builder
      .addCase(addExpenseAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addExpenseAsync.fulfilled, (state, action: PayloadAction<Expense>) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(addExpenseAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Error adding expense";
      });

    
    builder
      .addCase(updateExpenseStatusAsync.fulfilled, (state, action: PayloadAction<{ id: string; status: "approved" | "rejected" }>) => {
        const { id, status } = action.payload;
        const index = state.items.findIndex((e) => e.id === id);
        if (index >= 0) state.items[index].status = status;
      })
      .addCase(updateExpenseStatusAsync.rejected, (state, action) => {
        state.error = (action.payload as string) || "Error updating status";
      });
  },
});

export default expensesSlice.reducer;
