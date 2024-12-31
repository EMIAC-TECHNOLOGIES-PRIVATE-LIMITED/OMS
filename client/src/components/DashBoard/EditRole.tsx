// src/components/Dashboard/EditRole.tsx

import React, { useEffect, useState, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getAllPermissions,
  getRolePermissions,
  manageRoleAccess,
} from '../../utils/apiService/adminAPI';
import {
  Permission,
  Resource,
} from '../../types/adminTable';
import {
  GetAllPermissionsResponse,
  GetRolePermissionsResponse,
  ManageRoleAccessResponse,
} from '../../../../shared/src/types';

const EditRole: React.FC = () => {
  const { roleId } = useParams<{ roleId: string }>(); // e.g., /dashboard/manageroles/:roleId
  const navigate = useNavigate();

  // State: list of all permissions & resources
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [allResources, setAllResources] = useState<Resource[]>([]);

  // State: initial vs current overrides for this role
  // We store them as arrays of objects { id: number; granted: boolean }
  // for both permissions and resources
  const [initialOverrides, setInitialOverrides] = useState<{
    permissions: Array<{ id: number; granted: boolean }>;
    resources: Array<{ id: number; granted: boolean }>;
  }>({
    permissions: [],
    resources: [],
  });

  const [currentOverrides, setCurrentOverrides] = useState<{
    permissions: Array<{ id: number; granted: boolean }>;
    resources: Array<{ id: number; granted: boolean }>;
  }>({
    permissions: [],
    resources: [],
  });

  // UI states
  const [isModified, setIsModified] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  /**
   * 1. Fetch global (all) permissions/resources
   * 2. Fetch role-specific permissions/resources
   */
  useEffect(() => {
    const fetchRoleData = async () => {
      if (!roleId) {
        setError('Role ID is missing.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 1. Fetch all permissions and resources
        const permsResponse: GetAllPermissionsResponse = await getAllPermissions();
        if (permsResponse.success) {
          setAllPermissions(permsResponse.data.permissions);
          setAllResources(permsResponse.data.resources);
        } else {
          setError(permsResponse.message || 'Failed to fetch global permissions/resources.');
          setLoading(false);
          return;
        }

        // 2. Fetch role's current permissions and resources
        const rolePermsResponse: GetRolePermissionsResponse = await getRolePermissions(
          parseInt(roleId, 10)
        );
        if (rolePermsResponse.success) {
          // rolePermsResponse.data.permissions & rolePermsResponse.data.resources
          // are arrays of { id, name, ... } => we assume "granted: true" for each
          const { permissions, resources } = rolePermsResponse.data;

          const mappedPermissions = permissions.map((p) => ({
            id: p.id,
            granted: true,
          }));
          const mappedResources = resources.map((r) => ({
            id: r.id,
            granted: true,
          }));

          setInitialOverrides({
            permissions: mappedPermissions,
            resources: mappedResources,
          });
          setCurrentOverrides({
            permissions: mappedPermissions,
            resources: mappedResources,
          });
        } else {
          setError(rolePermsResponse.message || 'Failed to fetch role permissions.');
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoleData();
  }, [roleId]);

  /**
   * Determine if the form has been modified
   */
  useEffect(() => {
    const modified =
      JSON.stringify(initialOverrides) !== JSON.stringify(currentOverrides);
    setIsModified(modified);
  }, [initialOverrides, currentOverrides]);

  /**
   * Check if a permission is currently granted
   */
  const isPermissionGranted = (permId: number) => {
    const override = currentOverrides.permissions.find((p) => p.id === permId);
    return override?.granted ?? false;
  };

  /**
   * Check if a resource is currently granted
   */
  const isResourceGranted = (resId: number) => {
    const override = currentOverrides.resources.find((r) => r.id === resId);
    return override?.granted ?? false;
  };

  /**
   * Toggle a permission’s granted status
   * If unchecking a permission => uncheck all resources associated with it
   */
  const handlePermissionChange = (permissionId: number) => (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const granted = e.target.checked;

    setCurrentOverrides((prev) => {
      // 1. Toggle permission
      let updatedPermissions = toggleItem(
        prev.permissions,
        permissionId,
        granted
      );

      // 2. If unchecking => uncheck all resources that belong to that permission (table)
      if (!granted) {
        // figure out permission name from allPermissions
        const permObj = allPermissions.find((p) => p.id === permissionId);
        if (permObj) {
          const relatedResources = allResources.filter(
            (res) => res.table === permObj.name
          );
          let updatedResources = [...prev.resources];
          relatedResources.forEach((res) => {
            updatedResources = toggleItem(updatedResources, res.id, false);
          });

          return {
            ...prev,
            permissions: updatedPermissions,
            resources: updatedResources,
          };
        }
      }

      return {
        ...prev,
        permissions: updatedPermissions,
      };
    });
  };

  /**
   * Toggle a resource’s granted status
   * Disabled if parent permission is not granted
   */
  const handleResourceChange = (resourceId: number) => (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const granted = e.target.checked;
    setCurrentOverrides((prev) => {
      const updatedResources = toggleItem(prev.resources, resourceId, granted);
      return {
        ...prev,
        resources: updatedResources,
      };
    });
  };

  /**
   * Toggle logic for updating array of { id, granted }
   */
  const toggleItem = (
    arr: Array<{ id: number; granted: boolean }>,
    id: number,
    granted: boolean
  ) => {
    const existing = arr.findIndex((o) => o.id === id);
    if (existing >= 0) {
      const updated = [...arr];
      updated[existing] = { ...updated[existing], granted };
      return updated;
    }
    return [...arr, { id, granted }];
  };

  /**
   * Save changes => manageRoleAccess
   * Filter out only those permissions/resources with granted = true
   */
  const handleSave = async () => {
    if (!roleId) {
      setSaveError('Role ID is missing.');
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      // Only send the ones that are granted
      const finalPermissions = currentOverrides.permissions
        .filter((p) => p.granted)
        .map((p) => ({ id: p.id }));
      const finalResources = currentOverrides.resources
        .filter((r) => r.granted)
        .map((r) => ({ id: r.id }));

      const response: ManageRoleAccessResponse = await manageRoleAccess(
        parseInt(roleId, 10),
        finalPermissions,
        finalResources
      );

      if (response.success) {
        // reset the initial overrides
        setInitialOverrides(currentOverrides);
        setIsModified(false);
        setSaveSuccess('Role access updated successfully.');
      } else {
        setSaveError(response.message || 'Failed to update role access.');
      }
    } catch (err: any) {
      setSaveError(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Cancel => navigate back to role list
   */
  const handleCancel = () => {
    navigate('/dashboard/manageroles');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-gray-500">Loading role data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">{error}</div>
    );
  }

  /**
   * Group the resources by each permission => similar to "sections"
   * but we rely on resource.table === permission.name
   */
  const permissionsWithResources: Array<{
    permission: Permission;
    resources: Resource[];
  }> = allPermissions.map((permission) => ({
    permission,
    resources: allResources.filter(
      (resource) => resource.table === permission.name
    ),
  }));

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Edit Role Permissions</h2>

      {saveSuccess && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          {saveSuccess}
        </div>
      )}
      {saveError && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {saveError}
        </div>
      )}

      <div className="space-y-6">
        {permissionsWithResources.map(({ permission, resources }) => {
          // check if the permission is granted
          const permGranted = isPermissionGranted(permission.id);

          return (
            <div key={permission.id} className="border p-4 rounded shadow-sm relative">
              {/* Permission Checkbox */}
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id={`permission-${permission.id}`}
                  checked={permGranted}
                  onChange={handlePermissionChange(permission.id)}
                  className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label
                  htmlFor={`permission-${permission.id}`}
                  className="font-medium text-gray-700"
                >
                  {permission.name.charAt(0).toUpperCase() + permission.name.slice(1)}
                </label>
              </div>

              {/* Resources for this permission => disabled if permission is not granted */}
              <div className="space-y-2 pl-6">
                {resources.map((resource) => {
                  const resourceGranted = isResourceGranted(resource.id);
                  return (
                    <div key={resource.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`resource-${resource.id}`}
                        checked={resourceGranted}
                        onChange={handleResourceChange(resource.id)}
                        disabled={!permGranted}
                        className={`mr-2 h-4 w-4 ${
                          !permGranted
                            ? 'text-gray-300 border-gray-300 cursor-not-allowed'
                            : 'text-blue-600 border-gray-300 rounded'
                        }`}
                      />
                      <label
                        htmlFor={`resource-${resource.id}`}
                        className={`${
                          !permGranted ? 'text-gray-400' : 'text-gray-700'
                        }`}
                      >
                        {resource.column.charAt(0).toUpperCase() + resource.column.slice(1)}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex space-x-4">
        <button
          onClick={handleSave}
          disabled={!isModified || saving}
          className={`px-4 py-2 rounded-md font-medium ${
            !isModified || saving
              ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={handleCancel}
          disabled={saving}
          className={`px-4 py-2 rounded-md font-medium ${
            saving
              ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditRole;
