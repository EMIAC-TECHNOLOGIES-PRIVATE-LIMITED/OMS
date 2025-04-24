import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; // Add useLocation
import {
  getAllPermissions,
  getRolePermissions,
  manageRoleAccess,
} from '../../utils/apiService/adminAPI';
import { Permission, Resource } from '../../types/adminTable';
import {
  GetAllPermissionsResponse,
  GetRolePermissionsResponse,
  ManageRoleAccessResponse,
} from '../../../../shared/src/types';
import {
  Card,
  CardHeader,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const EditRole: React.FC = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const { state } = useLocation(); // Access navigation state
  const roleName = (state as { roleName?: string } | undefined)?.roleName || 'Unknown Role'; // Default if not provided
  const { toast } = useToast();

  // State: list of all permissions & resources
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [allResources, setAllResources] = useState<Resource[]>([]);

  // State: initial vs current overrides for this role
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

  // Fetch global permissions/resources and role-specific data
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

        const permsResponse: GetAllPermissionsResponse = await getAllPermissions();
        if (permsResponse.success) {
          const permissions = permsResponse.data.permissions.map((p) => ({
            id: p.id,
            name: p.key,
          }));
          setAllPermissions(permissions);

          const resources = permsResponse.data.resources.map((r) => ({
            id: r.id,
            table: r.key.split('.')[0].toLowerCase(),
            column: r.key.split('.')[1],
          }));
          setAllResources(resources);
        } else {
          setError(permsResponse.message || 'Failed to fetch global permissions/resources.');
          setLoading(false);
          return;
        }

        const rolePermsResponse: GetRolePermissionsResponse = await getRolePermissions(
          parseInt(roleId, 10)
        );
        if (rolePermsResponse.success) {
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

  // Detect if the form has been modified
  useEffect(() => {
    const modified = JSON.stringify(initialOverrides) !== JSON.stringify(currentOverrides);
    setIsModified(modified);
  }, [initialOverrides, currentOverrides]);

  // Check if a permission is granted
  const isPermissionGranted = (permId: number): boolean => {
    const override = currentOverrides.permissions.find((p) => p.id === permId);
    return override?.granted ?? false;
  };

  // Check if a resource is granted
  const isResourceGranted = (resId: number): boolean => {
    const override = currentOverrides.resources.find((r) => r.id === resId);
    return override?.granted ?? false;
  };

  // Toggle a permission’s granted status and update related resources
  const handlePermissionChange = (permissionId: number) => (checked: boolean) => {
    setCurrentOverrides((prev) => {
      let updatedPermissions = toggleItem(prev.permissions, permissionId, checked);

      if (!checked) {
        const permObj = allPermissions.find((p) => p.id === permissionId);
        if (permObj) {
          const relatedResources = allResources.filter(
            (res) => res.table === permObj.name.toLowerCase()
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

  // Toggle a resource’s granted status
  const handleResourceChange = (resourceId: number) => (checked: boolean) => {
    setCurrentOverrides((prev) => {
      const updatedResources = toggleItem(prev.resources, resourceId, checked);
      return {
        ...prev,
        resources: updatedResources,
      };
    });
  };

  // Select/Deselect all resources for a permission
  const handleSelectAllResources = (resources: Resource[]) => (checked: boolean) => {
    setCurrentOverrides((prev) => {
      let updatedResources = [...prev.resources];
      resources.forEach((resource) => {
        // Only toggle if it's not an 'id' column or if we're selecting (not deselecting)
        if (resource.column !== 'id' || checked) {
          updatedResources = toggleItem(updatedResources, resource.id, checked);
        }
      });
      return {
        ...prev,
        resources: updatedResources,
      };
    });
  };

  // Toggle logic for updating array of { id, granted }
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

  // Save changes to the server
  const handleSave = async () => {
    if (!roleId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Role ID is missing.',
        duration: 5000
      });
      return;
    }

    setSaving(true);

    try {
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
        setInitialOverrides(currentOverrides);
        setIsModified(false);
        toast({
          title: 'Success',
          description: 'Role access updated successfully.',
          duration: 3000,
          className: 'border border-brand ',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.message || 'Failed to update role access.',
          duration: 5000
        });
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'An unexpected error occurred while saving.',
        duration: 5000
      });
    } finally {
      setSaving(false);
    }
  };

  // Cancel and navigate back
  const handleCancel = () => {
    navigate('/dashboard/manageroles');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading role data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Group resources by their permission prefix
  const permissionsWithResources: Array<{
    permission: Permission;
    resources: Resource[];
  }> = allPermissions.map((permission) => ({
    permission,
    resources: allResources.filter(
      (resource) => resource.table === permission.name.toLowerCase()
    ),
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold">
          Edit Role Permissions : {roleName}
        </h2>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Button
            onClick={handleSave}
            disabled={!isModified || saving}
            variant={isModified && !saving ? 'brandOutline' : 'outline'}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
          <Button onClick={handleCancel} disabled={saving} variant="destructiveOutline">
            Cancel
          </Button>
        </div>
      </div>

      <Accordion type="multiple" className="space-y-4">
        {permissionsWithResources.map(({ permission, resources }) => {
          const permGranted = isPermissionGranted(permission.id);
          const selectedCount = resources.filter((r) => isResourceGranted(r.id)).length;
          const totalCount = resources.length;
          const allResourcesSelected = selectedCount === totalCount && totalCount > 0;

          return (
            <AccordionItem value={`permission-${permission.id}`} key={permission.id}>
              <Card>
                <CardHeader>
                  <AccordionTrigger className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`permission-${permission.id}`}
                        checked={permGranted}
                        onCheckedChange={handlePermissionChange(permission.id)}
                        className="h-5 w-5 rounded border-gray-300"
                      />
                      <label
                        htmlFor={`permission-${permission.id}`}
                        className="font-medium text-gray-700"
                      >
                        {permission.name.charAt(0).toUpperCase() + permission.name.slice(1)}
                      </label>
                      <span className="text-sm text-gray-500">
                        {totalCount > 0 && `${selectedCount}/${totalCount} selected`}
                      </span>
                    </div>
                  </AccordionTrigger>
                </CardHeader>
                <AccordionContent>
                  <CardContent>
                    {resources.length > 0 && (
                      <div className="mb-4 flex items-center space-x-2">
                        <Checkbox
                          id={`select-all-${permission.id}`}
                          checked={allResourcesSelected}
                          onCheckedChange={handleSelectAllResources(resources)}
                          disabled={!permGranted}
                          className="h-5 w-5 rounded border-gray-300"
                        />
                        <label
                          htmlFor={`select-all-${permission.id}`}
                          className={
                            !permGranted ? 'text-gray-400' : 'text-gray-700 font-medium'
                          }
                        >
                          Select All
                        </label>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {resources.map((resource) => {
                        const resourceGranted = isResourceGranted(resource.id);
                        return (
                          <div key={resource.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`resource-${resource.id}`}
                              checked={resourceGranted || resource.column === 'id'}
                              onCheckedChange={handleResourceChange(resource.id)}
                              disabled={!permGranted || resource.column === 'id'}
                              className="h-5 w-5 rounded border-gray-300"
                            />
                            <label
                              htmlFor={`resource-${resource.id}`}
                              className={
                                !permGranted ? 'text-gray-400' : 'text-gray-700'
                              }
                            >
                              {resource.column.charAt(0).toUpperCase() +
                                resource.column.slice(1)}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default EditRole;