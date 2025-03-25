// src/components/Dashboard/ManageRoles.tsx

import React, { useEffect, useState } from 'react';
import { getAllRoles } from '../../utils/apiService/adminAPI';
import { useNavigate } from 'react-router-dom';
import { RoleTableRow } from '../../types/adminTable';
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
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";


interface Column<T> {
  header: string;
  accessor: keyof T;
}

const ManageRoles: React.FC = () => {
  const [roles, setRoles] = useState<RoleTableRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await getAllRoles();
        if (response.success) {
          const mappedRoles: RoleTableRow[] = response.data.map((role, index) => ({
            srNo: index + 1,
            name: role.name,
            userCount: role._count.users,
            id: role.id,
          }));
          setRoles(mappedRoles);
        } else {
          setError(response.message || 'Failed to fetch roles.');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'An error occurred while fetching roles.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const columns: Column<RoleTableRow>[] = [
    { header: 'Sr No', accessor: 'srNo' },
    { header: 'Role Name', accessor: 'name' },
    { header: 'No of Users', accessor: 'userCount' },
  ];

  const handleRowClick = (row: RoleTableRow) => {
    navigate(`/dashboard/manageroles/${row.id}`, {
      state: { roleName: row.name },
    });
  };

  // Function to assign premium solid background colors with white text
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
        return 'bg-gray-600 text-white border-gray-600'; // Fallback
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="shadow-lg border-none">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Manage Roles
          </CardTitle>
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
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  {columns.map((column) => (
                    <TableHead 
                      key={column.accessor as string}
                      className="font-semibold text-muted-foreground px-6 py-4 text-left"
                    >
                      {column.header}
                    </TableHead>
                  ))}
                  <TableHead className="w-[100px] px-6 py-4"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((row) => (
                  <TableRow 
                    key={row.id}
                    className="cursor-pointer border-b last:border-b-0"
                    onClick={() => handleRowClick(row)}
                  >
                    <TableCell className="px-6 py-4">{row.srNo}</TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge 
                        className={cn(
                          'font-medium px-3 py-1 text-sm rounded-full shadow-sm',
                          getBadgeStyles(row.name)
                        )}
                      >
                        {row.name}
                      </Badge>
                    </TableCell>
                    <TableCell className=" py-4">{row.userCount}</TableCell>
                    <TableCell className=" py-4">
                      <Button
                        variant="ghost"
                        className='hover:bg-gray-100'
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageRoles;