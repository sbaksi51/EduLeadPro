import { useState } from "react";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Import Input component
import { Users } from "lucide-react";

export default function Payroll() {
  // Sample staff data with initial salary and a place for working days
  const [staffData, setStaffData] = useState([
    { id: 1, name: "John Doe", role: "Teacher", baseSalary: 2500, workingDays: 0, calculatedSalary: 0, status: "Active" },
    { id: 2, name: "Jane Smith", role: "Administrator", baseSalary: 3000, workingDays: 0, calculatedSalary: 0, status: "Active" },
    // Add more staff as needed
  ]);

  const dailyRate = 100; // Example daily rate. Adjust as per your business logic.

  // Function to handle changes in working days input
  const handleWorkingDaysChange = (id: number, days: number) => {
    setStaffData(prevData =>
      prevData.map(staff => {
        if (staff.id === id) {
          const newWorkingDays = Math.max(0, days); // Ensure days are not negative
          const newCalculatedSalary = newWorkingDays * dailyRate; // Simple calculation
          return { ...staff, workingDays: newWorkingDays, calculatedSalary: newCalculatedSalary };
        }
        return staff;
      })
    );
  };

  return (
    <div className="min-h-screen">
      <Header 
        title="Payroll Management" 
        subtitle="Manage staff, salaries, and payroll activities"
      />
      <main className="p-6">
        {/* Payroll Features */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Staff Payroll</h2>
          <div className="overflow-x-auto">
            <table className="w-full border rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Salary</th> {/* Changed to Base Salary */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Working Days</th> {/* New column */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calculated Salary</th> {/* New column */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {staffData.map(staff => (
                  <tr key={staff.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{staff.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{staff.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap">₹{staff.baseSalary.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Input
                        type="number"
                        value={staff.workingDays}
                        onChange={(e) => handleWorkingDaysChange(staff.id, parseInt(e.target.value) || 0)}
                        className="w-24"
                        min="0"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">₹{staff.calculatedSalary.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 rounded-full text-xs ₹{staff.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{staff.status}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap"><Button size="sm" variant="outline">View</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}