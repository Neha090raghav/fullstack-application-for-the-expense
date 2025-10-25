
import React, { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { fetchExpenses } from "./expensesSlice";
import ExpensesTable, { Expense } from "../../pages/ExpensesTable";
import ExpensesChart from "../../pages/ExpensesChart"; 

const ExpensesList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.expenses);

  useEffect(() => {
    dispatch(fetchExpenses(false)); 
  }, [dispatch]);

  if (loading)
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: 50 }}>
        Loading...
      </div>
    );

  return (
    <>
     
      <ExpensesChart expenses={items as Expense[]} />

     
      <ExpensesTable expenses={items as Expense[]} showUserEmail={false} />
    </>
  );
};

export default ExpensesList;
