import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { Plus, Pencil, BarChart, Users, GraduationCap, Star, UserCog } from 'lucide-react';
import { Header } from '@/components/ui/header';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: string;
  rating: number;
}

const StaffManagement: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>([
    { id: '1', name: 'John Doe', role: 'teacher', email: 'john@example.com', phone: '+1 (555) 123-4567', status: 'active', rating: 4 },
    { id: '2', name: 'Jane Smith', role: 'support', email: 'jane@example.com', phone: '+1 (555) 234-5678', status: 'active', rating: 3 },
    { id: '3', name: 'Bob Johnson', role: 'teacher', email: 'bob@example.com', phone: '+1 (555) 345-6789', status: 'active', rating: 5 },
    { id: '4', name: 'Alice Brown', role: 'support', email: 'alice@example.com', phone: '+1 (555) 456-7890', status: 'active', rating: 2 },
    { id: '5', name: 'Charlie Davis', role: 'teacher', email: 'charlie@example.com', phone: '+1 (555) 567-8901', status: 'active', rating: 4 },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [editStaffOpen, setEditStaffOpen] = useState(false);
  const [viewPerformanceOpen, setViewPerformanceOpen] = useState(false);

  const filteredStaff = staff.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateAverageRating = () => {
    const total = staff.reduce((sum, member) => sum + member.rating, 0);
    return total / staff.length;
  };

  return (
    <div className="space-y-10">
      <Header 
        title="Staff Management" 
        subtitle="Manage staff profiles, roles, and performance"
      />

      {/* Quick Stats */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-opacity-90">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{staff.length}</div>
              <p className="text-xs text-gray-500 mt-1">Active staff members</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-opacity-90">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Teachers</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <GraduationCap className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {staff.filter(s => s.role === 'teacher').length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Active teaching staff</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-opacity-90">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Support Staff</CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <UserCog className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {staff.filter(s => s.role === 'support').length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Administrative staff</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-opacity-90">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-4 w-4 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {calculateAverageRating().toFixed(1)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Staff performance rating</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card className="hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-opacity-90">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex flex-col gap-1">
              <CardTitle>Staff Directory</CardTitle>
              <CardDescription>
                Manage staff profiles, roles, and performance metrics
              </CardDescription>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-72">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                </span>
                <input
                  type="text"
                  placeholder="Search staff by name or role..."
                  className="pl-9 pr-2 py-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                onClick={() => setAddStaffOpen(true)}
                className="hover:bg-primary-50 transition-colors h-11 px-6"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Staff
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="py-4 px-6">Staff Member</TableHead>
                <TableHead className="py-4 px-6">Role</TableHead>
                <TableHead className="py-4 px-6">Contact</TableHead>
                <TableHead className="py-4 px-6">Performance</TableHead>
                <TableHead className="py-4 px-6">Status</TableHead>
                <TableHead className="py-4 px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((member) => (
                <TableRow 
                  key={member.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="py-4 px-6 align-top">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-50 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-medium">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-500">ID: {member.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6 align-top">
                    <Badge 
                      variant="outline"
                      className={member.role === 'teacher' ? "bg-green-100 text-green-800 border-green-200" : "bg-purple-100 text-purple-800 border-purple-200"}
                    >
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-6 align-top">
                    <div className="space-y-1">
                      <p className="text-sm">{member.email}</p>
                      <p className="text-sm text-gray-500">{member.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6 align-top">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= member.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">({member.rating})</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6 align-top">
                    <Badge 
                      variant="outline"
                      className={member.status === 'active' ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}
                    >
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-6 align-top">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedStaff(member);
                          setEditStaffOpen(true);
                        }}
                        className="hover:bg-primary-50 transition-colors h-9"
                      >
                        <Pencil className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedStaff(member);
                          setViewPerformanceOpen(true);
                        }}
                        className="hover:bg-primary-50 transition-colors h-9"
                      >
                        <BarChart className="mr-1 h-3 w-3" />
                        Performance
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffManagement; 