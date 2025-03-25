// src/components/Dashboard/ManageUsers.tsx

import React, { useEffect, useState } from 'react';
import { getAllUsers, createUser, getAllRoles } from '../../utils/apiService/adminAPI';
import { useNavigate } from 'react-router-dom';
import { UserTableRow } from '../../types/adminTable';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';

interface Column<T> {
  header: string;
  accessor: keyof T;
}

interface Role {
  id: number;
  name: string;
}

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<UserTableRow[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roleId: '',
    password: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        if (response.success) {
          const mappedUsers: UserTableRow[] = response.data.users.map((user, index) => ({
            srNo: index + 1,
            name: user.name,
            email: user.email,
            role: user.role.name,
            isActive: user.suspended ? (
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-500 font-medium">Suspended</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-green-500 font-medium">Active</span>
              </div>
            ),
            id: user.id,
          }));
          setUsers(mappedUsers);
          setTotalUsers(response.data.totalUsers);
        } else {
          setError(response.message || 'Failed to fetch users.');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'An error occurred while fetching users.');
      } finally {
        setLoading(false);
      }
    };

    const fetchRoles = async () => {
      try {
        const response = await getAllRoles();
        if (response.success) {
          setRoles(response.data.map(role => ({ id: role.id, name: role.name })));
        }
      } catch (err) {
        console.error('Failed to fetch roles:', err);
      }
    };

    fetchUsers();
    fetchRoles();
  }, []);

  const columns: Column<UserTableRow>[] = [
    { header: 'Sr No', accessor: 'srNo' },
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Role', accessor: 'role' },
    { header: 'Status', accessor: 'isActive' },
  ];

  const handleRowClick = (row: UserTableRow) => {
    navigate(`/dashboard/manageusers/${row.id}`);
  };

  const getBadgeStyles = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'sales':
        return 'bg-blue-600 text-white border-blue-600';
      case 'admin':
        return 'bg-red-600 text-white border-red-600';
      case 'manager':
        return 'bg-green-600 text-white border-green-600';
      case 'operator':
        return 'bg-purple-600 text-white border-purple-600';
      default:
        return 'bg-gray-600 text-white border-gray-600';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, roleId: value }));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    try {
      const response = await createUser(
        formData.name,
        formData.email,
        formData.password,
        Number(formData.roleId)
      );

      if (response.success) {
        toast({
          title: 'Success',
          description: 'User created successfully!',
          variant: 'default',
          duration: 3000,
        });
        setIsModalOpen(false);
        setFormData({ name: '', email: '', roleId: '', password: '', confirmPassword: '' });
        // Refresh user list
        const usersResponse = await getAllUsers();
        if (usersResponse.success) {
          const mappedUsers: UserTableRow[] = usersResponse.data.users.map((user, index) => ({
            srNo: index + 1,
            name: user.name,
            email: user.email,
            role: user.role.name,
            isActive: user.suspended ? (
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-500 font-medium">Suspended</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-green-500 font-medium">Active</span>
              </div>
            ),
            id: user.id,
          }));
          setUsers(mappedUsers);
          setTotalUsers(usersResponse.data.totalUsers);
        }
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to create user.',
          variant: 'destructive',
          duration: 5000,
        });
      }
    } catch (err: any) {
      if (err.status === 409) {
        toast({
          title: 'Error',
          description: 'User with the provided email already exists.',
          variant: 'destructive',
          duration: 5000,
        });
        return;
      }
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'An error occurred while creating the user.',
        variant: 'destructive',
        duration: 5000,
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="shadow-lg border-none">
        <CardHeader className="border-b flex flex-row justify-between items-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
           {` Manage Users  (Total : ${totalUsers})`}
          </CardTitle>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button variant="brand">
                <UserPlus className="h-6 w-6 ml-2" /> Create User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Fill in the details below to create a new user.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roleId">Role</Label>
                  <Select onValueChange={handleRoleChange} value={formData.roleId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role.id} value={String(role.id)}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                {formError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}
                <DialogFooter>
                  <Button type="submit" variant={'brand'} className="w-full">
                    Create User
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="max-h-[1000px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow className="border-b ">
                    {columns.map((column) => (
                      <TableHead
                        key={column.accessor as string}
                        className="font-bold px-6 py-4 text-left text-lg"
                      >
                        {column.header}
                      </TableHead>
                    ))}
                    <TableHead className="w-[100px] px-6 py-4"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((row) => (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer border-b last:border-b-0"
                      onClick={() => handleRowClick(row)}
                    >
                      {columns.map((column) => (
                        <TableCell key={column.accessor as string} className="px-6 py-4">
                          {column.accessor === 'role' ? (
                            <Badge
                              className={cn(
                                'font-medium px-3 py-1 text-md rounded-full shadow-sm',
                                getBadgeStyles(row[column.accessor] as string)
                              )}
                            >
                              {row[column.accessor]}
                            </Badge>
                          ) : (
                            row[column.accessor]
                          )}
                        </TableCell>
                      ))}
                      <TableCell className=" py-4">
                        <Button
                          variant="ghost"
                          className="hover:bg-gray-100"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(row);
                          }}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageUsers;