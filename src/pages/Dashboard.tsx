import React, { useState, lazy, Suspense } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Add as AddIcon, Close as CloseIcon } from "@mui/icons-material";
import { useAuth } from "../auth/AuthProvider";
import ExpensesList from "../features/expenses/ExpensesList";


// Lazy load ExpenseForm
const ExpenseForm = lazy(() => import("../features/expenses/ExpenseForm"));

const Dashboard: React.FC = () => {
  const { userRole, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
     
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Expense Dashboard
          </Typography>
          <Button color="inherit" onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
       
        {userRole === "employee" && (
          <>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h5" fontWeight="bold">
                My Expenses
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

            <ExpensesList />

       
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
              <DialogTitle
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6" component="div">
                  Add New Expense
                </Typography>
                <IconButton onClick={handleClose}>
                  <CloseIcon />
                </IconButton>
              </DialogTitle>

              <DialogContent dividers>
                <Suspense
                  fallback={
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      height={200}
                    >
                      <CircularProgress />
                    </Box>
                  }
                >
                  <ExpenseForm onSuccess={handleClose} />
                </Suspense>
              </DialogContent>
            </Dialog>
          </>
        )}

        
       
      </Container>
    </>
  );
};

export default Dashboard;
