import React, { useEffect, useState, lazy, Suspense } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../auth/AuthProvider';
import ExpensesTable from './ExpensesTable';
import ExpensesChart from './ExpensesChart';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchExpenses, updateExpenseStatusAsync } from '../features/expenses/expensesSlice';


const ExpenseForm = lazy(() => import('../features/expenses/ExpenseForm'));

interface Expense {
  id: string;
  userEmail: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const dispatch = useAppDispatch();
  
   const { items, loading } = useAppSelector((state) => state.expenses);

 
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  useEffect(() => {
      dispatch(fetchExpenses(true)); 
    }, [dispatch]);

  
  

  const handleStatusChange = (id: string, newStatus: 'approved' | 'rejected') => {
  dispatch(updateExpenseStatusAsync({ id, status: newStatus }));
};

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" gutterBottom>
            All Submitted Expenses
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpen}
          >
            Add Expense
          </Button>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" mt={5}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <ExpensesChart expenses={items as Expense[]} />
            <ExpensesTable
              expenses={items as Expense[]}
              showUserEmail={true}
              onStatusChange={handleStatusChange}
            />
          </>
        )}

       
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
          <DialogTitle
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Typography variant="h6">Add New Expense</Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            <Suspense
              fallback={
                <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                  <CircularProgress />
                </Box>
              }
            >
              <ExpenseForm onSuccess={handleClose} />
            </Suspense>
          </DialogContent>
        </Dialog>
      </Container>
    </>
  );
};

export default AdminDashboard;
