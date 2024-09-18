"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FilePenIcon, PlusIcon, TrashIcon } from "lucide-react";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type Expense = {
  id: number;
  name: string;
  amount: number | null;
  date: Date;
};

const initialExpenses: Expense[] = [
  {
    id: 1,
    name: "Groceries",
    amount: 250,
    date: new Date("2024-05-15"),
  },
  {
    id: 2,
    name: "Rent",
    amount: 250,
    date: new Date("2024-06-01"),
  },
  {
    id: 3,
    name: "Utilities",
    amount: 250,
    date: new Date("2024-06-05"),
  },
  {
    id: 4,
    name: "Dining Out",
    amount: 250,
    date: new Date("2024-06-10"),
  },
];

export default function ExpenseTrackerComponent() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentExpenseId, setCurrentExpenseId] = useState<number | null>(null);
  const [newExpense, setNewExpense] = useState<{
    name: string;
    amount: string;
    date: Date;
  }>({
    name: "",
    amount: "",
    date: new Date(),
  });

  useEffect(() => {
    const storedExpenses = localStorage.getItem("expenses");
    if (storedExpenses) {
      setExpenses(
        JSON.parse(storedExpenses).map((expense: Expense) => ({
          ...expense,
          date: new Date(expense.date),
        }))
      );
    } else {
      setExpenses(initialExpenses);
    }
  }, []);

  useEffect(() => {
    if (expenses.length > 0) {
      localStorage.setItem("expenses", JSON.stringify(expenses));
    }
  }, [expenses]);

  const handleAddExpense = (): void => {
    setExpenses([
      ...expenses,
      {
        id: expenses.length + 1,
        name: newExpense.name,
        amount: parseFloat(newExpense.amount) || 0,
        date: new Date(newExpense.date),
      },
    ]);
    resetForm();
    setShowModal(false);
  };

  const handleEditExpense = (id: number): void => {
    const expenseToEdit = expenses.find((expense) => expense.id === id);
    if (expenseToEdit) {
      setNewExpense({
        name: expenseToEdit.name,
        amount: expenseToEdit.amount?.toString() || '',
        date: expenseToEdit.date,
      });
      setCurrentExpenseId(id);
      setIsEditing(true);
      setShowModal(true);
    }
  };

  const handleSaveEditExpense = (): void => {
    setExpenses(
      expenses.map((expense) =>
        expense.id === currentExpenseId
          ? { ...expense, ...newExpense, amount: parseFloat(newExpense.amount) || 0 }
          : expense
      )
    );
    resetForm();
    setShowModal(false);
  };

  const resetForm = (): void => {
    setNewExpense({
      name: "",
      amount: "",
      date: new Date(),
    });
    setIsEditing(false);
    setCurrentExpenseId(null);
  };

  const handleDeleteExpense = (id: number): void => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
  };

  const totalExpenses = expenses.reduce(
    (total, expense) => total + (expense.amount || 0),
    0
  );

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { id, value } = e.target;
    setNewExpense((prevExpense) => ({
      ...prevExpense,
      [id]: id === "amount" ? value : value,
    }));
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setNewExpense((prevExpense) => ({
        ...prevExpense,
        date,
      }));
    }
  };

  const chartData = {
    labels: expenses.map((expense) => format(expense.date, 'MMM dd')),
    datasets: [
      {
        label: 'Expenses',
        data: expenses.map((expense) => expense.amount || 0),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };
  
  const chartOptions = {
    scales: {
      x: {
        ticks: {
          color: 'black', // Dark color for month labels
          font: {
            size: 14, // You can adjust the size as needed
          },
        },
      },
      y: {
        ticks: {
          color: 'black', // Dark color for number labels
          font: {
            size: 14, // You can adjust the size as needed
          },
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: 'black', // Dark color for legend text
        },
      },
    },
  };
  

  return (
    <div className="bg-slate-700">
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Expense Tracker</h1>
          <div className="text-2xl font-bold">
            Total: ${totalExpenses.toFixed(2)}
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-6 bg-slate-400">
        {expenses.length === 0 ? (
          <p className="text-center mt-4">No expenses yet. Add your first expense!</p>
        ) : (
          <ul className="space-y-4">
            {expenses.map((expense) => (
              <motion.li
                key={expense.id}
                className="bg-card p-4 rounded-lg shadow flex justify-between items-center hover:shadow-lg transition-shadow duration-300 bg-slate-300"
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div>
                  <h2 className="text-lg font-semibold bg-slate-200">{expense.name}</h2>
                  <p>{format(expense.date, "dd MMM yyyy")}</p>
                </div>
                <div>
                  <span className="text-xl font-semibold bg-slate-400">${(expense.amount || 0).toFixed(2)}</span>
                  <Button
                    className="ml-2"
                    onClick={() => handleEditExpense(expense.id)}
                  >
                    <FilePenIcon className="w-5 h-5" />
                  </Button>
                  <Button
                    className="ml-2"
                    variant="destructive"
                    onClick={() => handleDeleteExpense(expense.id)}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </Button>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
        <div className="mt-6 bg-slate-700">
          <Line data={chartData} />
        </div>
      </main>
      <div className="fixed bottom-4 right-4 bg-slate-400">
        <Button
          className="bg-primary text-primary-foreground "
          onClick={() => setShowModal(true)}
        >
          <PlusIcon className="w-6 h-6" />
        </Button>
      </div>
      <Dialog open={showModal} onOpenChange={(open) => !open && resetForm()} >
        <DialogContent className="bg-slate-400">
          <DialogHeader className="bg text-cyan-50">
            <DialogTitle>{isEditing ? "Edit Expense" : "Add Expense"}</DialogTitle>
            <Button
              className="absolute right-2 top-2"
              onClick={() => setShowModal(false)}
            >
              ✕
            </Button>
          </DialogHeader>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              isEditing ? handleSaveEditExpense() : handleAddExpense();
            }}
          >
            <div className="space-y-4 bg-slate-400">
              <div>
                <Label htmlFor="name"><b>Expense Name</b></Label>
                <Input
                  id="name"
                  value={newExpense.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="amount"><b>Amount</b></Label>
                <Input
                  id="amount"
                  type="number"
                  value={newExpense.amount}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="date"><b>Date</b></Label>
                <DatePicker
                  selected={newExpense.date}
                  onChange={handleDateChange}
                  dateFormat="dd MMM yyyy"
                  className="p-2 w-full rounded-md border bg-slate-500"
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit">
                {isEditing ? "Save Changes" : "Add Expense"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="ml-2" 
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

