import { useState } from "react";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Trash2, AlertCircle, Settings2 } from "lucide-react";

const categories = ["Office Supplies", "Utilities", "Travel", "Salaries", "Other"];

interface CategoryBudget {
  category: string;
  amount: number;
}

interface Expense {
  id: number;
  amount: number;
  date: string;
  createdAt: string;
  description: string;
  category: string;
}

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [form, setForm] = useState({ description: "", amount: "", category: categories[0] });
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    const saved = localStorage.getItem("monthlyBudget");
    return saved ? parseInt(saved) : 100000;
  });
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>(() => {
    const saved = localStorage.getItem("categoryBudgets");
    return saved ? JSON.parse(saved) : categories.map(cat => ({ category: cat, amount: 0 }));
  });
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [newBudget, setNewBudget] = useState(monthlyBudget.toString());
  const [activeTab, setActiveTab] = useState("overall");
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [showCategoryUtilization, setShowCategoryUtilization] = useState(false);

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const budgetUtilization = (totalExpenses / monthlyBudget) * 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddExpense = () => {
    if (!form.description || !form.amount) return;

    const newExpense: Expense = {
      id: Date.now(),
      amount: parseFloat(form.amount),
      date: new Date().toLocaleDateString(),
      createdAt: new Date().toISOString(),
      description: form.description,
      category: form.category,
    };

    if (editingExpense) {
      setExpenses(expenses.map(exp => exp.id === editingExpense.id ? newExpense : exp));
      setEditingExpense(null);
    } else {
      setExpenses([...expenses, newExpense]);
    }

    setForm({ description: "", amount: "", category: categories[0] });
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setForm({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
    });
  };

  const handleDelete = (id: number) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  const handleBudgetUpdate = () => {
    const budget = parseInt(newBudget);
    if (isNaN(budget) || budget < 0) return;

    setMonthlyBudget(budget);
    localStorage.setItem("monthlyBudget", budget.toString());
    setIsBudgetDialogOpen(false);
  };

  const handleCategoryBudgetUpdate = (category: string, amount: string) => {
    const newAmount = parseInt(amount);
    if (isNaN(newAmount) || newAmount < 0) return;

    const updatedBudgets = categoryBudgets.map(cb =>
      cb.category === category ? { ...cb, amount: newAmount } : cb
    );

    setCategoryBudgets(updatedBudgets);
    localStorage.setItem("categoryBudgets", JSON.stringify(updatedBudgets));
  };

  return (
    <div className="min-h-screen bg-black">
      <Header className="py-4" />

      <main className="p-6 space-y-8">
        {/* Budget Utilization Card */}
        <Card className="bg-black text-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-4 bg-black text-white">
            <CardTitle className="text-xl text-white">Budget Utilization</CardTitle>
            <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 h-9">
                  <Settings2 className="h-4 w-4 mr-2" />
                  Set Budget
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-xl">Budget Settings</DialogTitle>
                </DialogHeader>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="overall">Overall Budget</TabsTrigger>
                    <TabsTrigger value="categories">Category Budgets</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overall" className="space-y-6 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="budget" className="text-sm font-medium">Monthly Budget Amount (₹)</Label>
                      <Input
                        id="budget"
                        type="number"
                        value={newBudget}
                        onChange={(e) => setNewBudget(e.target.value)}
                        min="0"
                        step="1000"
                        className="h-10"
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setIsBudgetDialogOpen(false)} className="h-10">
                        Cancel
                      </Button>
                      <Button onClick={handleBudgetUpdate} className="h-10">
                        Save Budget
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="categories" className="space-y-6 pt-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Category</Label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 h-10 text-sm"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    {/* Show budget and utilization for selected category */}
                    {(() => {
                      const catBudget = categoryBudgets.find(cb => cb.category === selectedCategory)?.amount || 0;
                      const catExpense = expenses.filter(exp => exp.category === selectedCategory).reduce((sum, exp) => sum + exp.amount, 0);
                      const catUtilization = catBudget > 0 ? (catExpense / catBudget) * 100 : 0;
                      return (
                        <div className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">{selectedCategory} Budget (₹)</Label>
                            <Input
                              type="number"
                              value={catBudget}
                              min="0"
                              step="100"
                              onChange={e => handleCategoryBudgetUpdate(selectedCategory, e.target.value)}
                              className="h-10"
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">Utilization</span>
                              <span className="text-sm font-medium">{catUtilization.toFixed(1)}%</span>
                            </div>
                            <Progress value={catUtilization} className="h-2" />
                            <div className="text-xs text-gray-500">Spent: ₹{catExpense.toLocaleString()} / ₹{catBudget.toLocaleString()}</div>
                          </div>
                        </div>
                      );
                    })()}
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="bg-black text-white">
            <div className="space-y-8">
              {/* Overall Budget */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Overall Budget</span>
                  <span className="text-sm font-medium text-gray-700">{budgetUtilization.toFixed(1)}%</span>
                </div>
                <Progress value={budgetUtilization} className="h-2" />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>₹{totalExpenses.toLocaleString()} spent</span>
                  <span>₹{monthlyBudget.toLocaleString()} budget</span>
                </div>
              </div>

              {/* Category-wise Utilization Toggle Button and Section */}
              <div>
                {!showCategoryUtilization ? (
                  <Button variant="outline" onClick={() => setShowCategoryUtilization(true)} className="h-10">
                    View Category Utilization
                  </Button>
                ) : (
                  <Card className="bg-black text-white shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 bg-black text-white">
                      <CardTitle className="text-xl text-white">Category-wise Utilization</CardTitle>
                      <Button variant="destructive" size="sm" onClick={() => setShowCategoryUtilization(false)} className="h-9">
                        Hide
                      </Button>
                    </CardHeader>
                    <CardContent className="bg-black text-white">
                      <div className="max-w-xs mb-6">
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full border rounded-md px-3 py-2 h-10 text-sm"
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      {/* Show utilization for selected category only */}
                      {(() => {
                        const catBudget = categoryBudgets.find(cb => cb.category === selectedCategory)?.amount || 0;
                        const catExpense = expenses.filter(exp => exp.category === selectedCategory).reduce((sum, exp) => sum + exp.amount, 0);
                        const catUtilization = catBudget > 0 ? (catExpense / catBudget) * 100 : 0;
                        return (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-900">{selectedCategory}</span>
                              <span className="text-sm font-medium text-gray-700">{catUtilization.toFixed(1)}%</span>
                            </div>
                            <Progress value={catUtilization} className="h-2" />
                            <div className="flex justify-between text-sm text-gray-500">
                              <span>₹{catExpense.toLocaleString()} spent</span>
                              <span>₹{catBudget.toLocaleString()} budget</span>
                            </div>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Expense Form */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">
            {editingExpense ? "Edit Expense" : "Add New Expense"}
          </h2>
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
            <Button onClick={handleAddExpense}>
              {editingExpense ? "Update Expense" : "Add Expense"}
            </Button>
            {editingExpense && (
              <Button variant="outline" onClick={() => {
                setEditingExpense(null);
                setForm({ description: "", amount: "", category: categories[0] });
              }}>
                Cancel
              </Button>
            )}
          </div>
        </div>

        {/* Expenses Table */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Expense List</h2>
          <div className="overflow-x-auto">
            <table className="w-full border rounded-lg bg-black text-white">
              <thead className="bg-black text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-black text-white">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-400">No expenses recorded.</td>
                  </tr>
                ) : (
                  expenses.map((exp) => (
                    <tr key={exp.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {exp.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {exp.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {exp.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{exp.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(exp)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(exp.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
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