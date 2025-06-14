import { useState } from "react";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const categories = ["Office Supplies", "Utilities", "Travel", "Salaries", "Other"];

export default function Expenses() {
  interface Expense {
    id: number;
    amount: number;
    date: string;
    createdAt: string;
    description: string;
    category: string;
  }
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [form, setForm] = useState({ description: "", amount: "", category: categories[0] });


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.amount) return;
    setExpenses([
      ...expenses,
      {
        ...form,
        id: Date.now(),
        amount: parseFloat(form.amount),
        date: new Date().toLocaleDateString(),
        createdAt: new Date().toISOString(),
      },
    ]);
    setForm({ description: "", amount: "", category: categories[0] });
  };

  return (
    <div className="min-h-screen">
      <Header title="Expenses Tracking" subtitle="Track and manage your business expenses" />
      <main className="p-6">
        {/* Add Expense Form */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Add New Expense</h2>
          <div className="flex gap-4 mb-4">
            <Input
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              className="w-1/3"
            />
            <Input
              name="amount"
              type="number"
              placeholder="Amount"
              value={form.amount}
              onChange={handleChange}
              className="w-1/4"
              min="0"
            />
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-1/4 border rounded px-2 py-1"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <Button onClick={handleAddExpense}>Add Expense</Button>
          </div>
        </div>
        {/* Expenses Table */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Expense List</h2>
          <div className="overflow-x-auto">
            <table className="w-full border rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-gray-400">No expenses recorded.</td>
                  </tr>
                ) : (
                  expenses.map((exp, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(exp as {date: string}).date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(exp as {description: string}).description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(exp as {category: string}).category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{(exp as {amount: number}).amount.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}