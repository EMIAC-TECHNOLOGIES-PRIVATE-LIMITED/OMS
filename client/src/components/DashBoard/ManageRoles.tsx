// src/components/Dashboard/ManageRoles.tsx

import React, { useEffect, useState } from 'react';
import { getAllRoles } from '../../utils/apiService/adminAPI';
import { useNavigate } from 'react-router-dom';
import AdminDataTable from './AdminDataTable';
import { RoleTableRow } from '../../types/adminTable';

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
    navigate(`/dashboard/manageroles/${row.id}`);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Manage Roles</h2>
      <AdminDataTable<RoleTableRow>
        columns={columns}
        data={roles}
        loading={loading}
        error={error}
        onRowClick={handleRowClick}

      />
    </div>
  );
};

export default ManageRoles;
