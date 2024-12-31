// src/components/Dashboard/ManageUsers.tsx

import React, { useEffect, useState } from 'react';
import { getAllUsers } from '../../utils/apiService/adminAPI';
import { useNavigate } from 'react-router-dom';
import AdminDataTable from './AdminDataTable';
import { UserTableRow } from '../../types/adminTable';

interface Column<T> {
  header: string;
  accessor: keyof T;
}

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<UserTableRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        if (response.success) {
          const mappedUsers: UserTableRow[] = response.data.map((user, index) => ({
            srNo: index + 1,
            name: user.name,
            role: user.role.name,
            isActive: user.suspended ? 'No' : 'Yes',
            id: user.id,
          }));
          setUsers(mappedUsers);
        } else {
          setError(response.message || 'Failed to fetch users.');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'An error occurred while fetching users.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const columns: Column<UserTableRow>[] = [
    { header: 'Sr No', accessor: 'srNo' },
    { header: 'Name', accessor: 'name' },
    { header: 'Role', accessor: 'role' },
    { header: 'Is Active', accessor: 'isActive' },
  ];

  const handleRowClick = (row: UserTableRow) => {
    navigate(`/dashboard/manageusers/${row.id}`);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Manage Users</h2>
      <AdminDataTable<UserTableRow>
        columns={columns}
        data={users}
        loading={loading}
        error={error}
        onRowClick={handleRowClick}
      />
    </div>
  );
};

export default ManageUsers;
