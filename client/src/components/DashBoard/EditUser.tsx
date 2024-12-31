import React, { useEffect, useState, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getAllPermissions,
  getUserPermissions,
  manageUserAccess,
} from '../../utils/apiService/adminAPI';
import {
  Permission,
  Resource,
  PermissionOverride,
  ResourceOverride,
} from '../../types/adminTable';
import {
  GetAllPermissionsResponse,
  GetUserPermissionsResponse,
  ManageUserAccessResponse,
} from '../../../../shared/src/types';

const EditUser: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  /**
   * ---------------
   *   State Setup
   * ---------------
   */

  // 1) All (global) permissions/resources from getAllPermissions()
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [allResources, setAllResources] = useState<Resource[]>([]);

  // 2) The “default” user-specific permissions/resources from getUserPermissions() response
  //    i.e., the base set of permissions/resources that user already has (before overrides).
  //    If userPermissionsResponse.data.permissions is the default set, we store it separately.
  const [userDefaultPermissions, setUserDefaultPermissions] = useState<Permission[]>([]);
  const [userDefaultResources, setUserDefaultResources] = useState<Resource[]>([]);

  // 3) The user’s override arrays from getUserPermissions() response
  //    (what the admin can manipulate).
  const [currentOverrides, setCurrentOverrides] = useState<{
    permissionOverride: PermissionOverride[];
    resourceOverride: ResourceOverride[];
  }>({
    permissionOverride: [],
    resourceOverride: [],
  });

  // We still track the initial overrides so we can handle “isModified” logic
  const [initialOverrides, setInitialOverrides] = useState<{
    permissionOverride: PermissionOverride[];
    resourceOverride: ResourceOverride[];
  }>({
    permissionOverride: [],
    resourceOverride: [],
  });

  // 4) The final combined set for rendering on the UI.
  //    This merges default user permissions/resources with the current override list.
  const [finalPermissions, setFinalPermissions] = useState<
    Array<Permission & { granted: boolean }>
  >([]);
  const [finalResources, setFinalResources] = useState<
    Array<Resource & { granted: boolean }>
  >([]);

  // Misc. states
  const [isModified, setIsModified] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  /**
   * ---------------
   *   Data Fetch
   * ---------------
   */
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setError('User ID is missing.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 1) Fetch all (global) permissions and resources
        const permissionsResponse: GetAllPermissionsResponse = await getAllPermissions();
        if (permissionsResponse.success) {
          setAllPermissions(permissionsResponse.data.permissions);
          setAllResources(permissionsResponse.data.resources);
        } else {
          setError(permissionsResponse.message || 'Failed to fetch permissions.');
          return;
        }

        // 2) Fetch user-specific defaults & overrides
        const userPermissionsResponse: GetUserPermissionsResponse = await getUserPermissions(
          parseInt(userId)
        );
        if (userPermissionsResponse.success) {
          // The “default” user-permissions/resources
          setUserDefaultPermissions(userPermissionsResponse.data.permissions);
          setUserDefaultResources(userPermissionsResponse.data.resources);

          // Override arrays
          setInitialOverrides({
            permissionOverride: userPermissionsResponse.data.permissionOverrides,
            resourceOverride: userPermissionsResponse.data.resourceOverrides,
          });
          setCurrentOverrides({
            permissionOverride: userPermissionsResponse.data.permissionOverrides,
            resourceOverride: userPermissionsResponse.data.resourceOverrides,
          });
        } else {
          setError(
            userPermissionsResponse.message || 'Failed to fetch user permissions.'
          );
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  /**
   * ----------------------------------------------------------------------------
   *  Combine “default” + “override” -> finalPermissions/finalResources for render
   * ----------------------------------------------------------------------------
   */
  const computeFinalPermissionsAndResources = () => {
    // Combine allPermissions with userDefaultPermissions, but actually we’ll treat
    // “userDefaultPermissions” as the user’s baseline for whether they have that permission by default.
    // Then apply overrides from currentOverrides.

    // Permissions
    const newFinalPermissions = allPermissions.map((perm) => {
      // Does user have it by default?
      const userHasDefault = userDefaultPermissions.some(
        (defPerm) => defPerm.id === perm.id
      );

      // Check if there’s an override for this permission
      const override = currentOverrides.permissionOverride.find(
        (o) => o.permissionId === perm.id
      );

      // If user has it by default, default to granted = true
      // Then override if we have an entry in the override array
      let granted = userHasDefault;
      if (override) {
        granted = override.granted;
      }

      // Return merged object for final usage in the UI
      return {
        ...perm,
        granted,
      };
    });

    // Resources
    const newFinalResources = allResources.map((res) => {
      const userHasDefault = userDefaultResources.some(
        (defRes) => defRes.id === res.id
      );
      const override = currentOverrides.resourceOverride.find(
        (o) => o.resourceId === res.id
      );

      let granted = userHasDefault;
      if (override) {
        granted = override.granted;
      }

      return {
        ...res,
        granted,
      };
    });

    setFinalPermissions(newFinalPermissions);
    setFinalResources(newFinalResources);
  };

  // Recompute final whenever global or default or currentOverrides changes.
  useEffect(() => {
    computeFinalPermissionsAndResources();
  }, [allPermissions, allResources, userDefaultPermissions, userDefaultResources, currentOverrides]);

  /**
   * ---------------
   *   isModified
   * ---------------
   */
  useEffect(() => {
    // Compare currentOverrides with initialOverrides
    const modified =
      JSON.stringify(initialOverrides.permissionOverride) !==
      JSON.stringify(currentOverrides.permissionOverride) ||
      JSON.stringify(initialOverrides.resourceOverride) !==
      JSON.stringify(currentOverrides.resourceOverride);

    setIsModified(modified);
  }, [initialOverrides, currentOverrides]);

  /**
   * ----------------------------------------------------------
   *   Check helpers using finalPermissions/finalResources
   * ----------------------------------------------------------
   */
  const isPermissionGranted = (permissionId: number): boolean => {
    const found = finalPermissions.find((fp) => fp.id === permissionId);
    return found ? found.granted : false;
  };

  const isResourceGranted = (resourceId: number): boolean => {
    const found = finalResources.find((fr) => fr.id === resourceId);
    return found ? found.granted : false;
  };

  const getPermissionNameById = (permissionId: number): string => {
    const permission = allPermissions.find((perm) => perm.id === permissionId);
    return permission ? permission.name : '';
  };

  /**
   * ------------------------------------------------------------------
   *   Event Handlers: toggle permission/resources -> update overrides
   * ------------------------------------------------------------------
   */

  // Toggle a permission => update currentOverrides.permissionOverride
  const handlePermissionChange = (permissionId: number) => (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const granted = e.target.checked;

    setCurrentOverrides((prev) => {
      const overrideExists = prev.permissionOverride.find(
        (po) => po.permissionId === permissionId
      );

      let updatedPermissionOverrides: PermissionOverride[];
      if (overrideExists) {
        // Update the existing override
        updatedPermissionOverrides = prev.permissionOverride.map((po) =>
          po.permissionId === permissionId ? { ...po, granted } : po
        );
      } else {
        // Add new override
        updatedPermissionOverrides = [
          ...prev.permissionOverride,
          { permissionId, granted },
        ];
      }

      // If the user’s default for that permission is the same as “granted,” and the admin
      // is effectively toggling it back to default, we could remove it from override.
      // But that’s optional. If you want your override array to only store changes
      // from the default, you might do something more advanced. For now, keep it simple
      // as asked in the instructions.

      return {
        ...prev,
        permissionOverride: updatedPermissionOverrides,
      };
    });

    // If permission is unchecked => disable all related resources by default
    if (!granted) {
      const relatedResources = allResources.filter(
        (resource) => resource.table === getPermissionNameById(permissionId)
      );
      relatedResources.forEach((resource) => {
        setCurrentOverrides((prev) => {
          const resourceExists = prev.resourceOverride.find(
            (ro) => ro.resourceId === resource.id
          );
          let updatedResourceOverrides: ResourceOverride[];

          if (resourceExists) {
            updatedResourceOverrides = prev.resourceOverride.map((ro) =>
              ro.resourceId === resource.id ? { ...ro, granted: false } : ro
            );
          } else {
            updatedResourceOverrides = [
              ...prev.resourceOverride,
              { resourceId: resource.id, granted: false },
            ];
          }

          return {
            ...prev,
            resourceOverride: updatedResourceOverrides,
          };
        });
      });
    }
  };

  // Toggle a resource => update currentOverrides.resourceOverride
  const handleResourceChange = (resourceId: number) => (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const granted = e.target.checked;

    setCurrentOverrides((prev) => {
      const overrideExists = prev.resourceOverride.find(
        (ro) => ro.resourceId === resourceId
      );
      let updatedResourceOverrides: ResourceOverride[];

      if (overrideExists) {
        updatedResourceOverrides = prev.resourceOverride.map((ro) =>
          ro.resourceId === resourceId ? { ...ro, granted } : ro
        );
      } else {
        updatedResourceOverrides = [
          ...prev.resourceOverride,
          { resourceId, granted },
        ];
      }

      return {
        ...prev,
        resourceOverride: updatedResourceOverrides,
      };
    });
  };

  /**
   * -------------
   *   Actions
   * -------------
   */
  const handleSave = async () => {
    if (!userId) {
      setSaveError('User ID is missing.');
      return;
    }

    try {
      setSaving(true);
      setSaveError(null);
      setSaveSuccess(null);

      const response: ManageUserAccessResponse = await manageUserAccess(
        parseInt(userId),
        currentOverrides.permissionOverride,
        currentOverrides.resourceOverride
      );

      if (response.success) {
        // Sync up initialOverrides = currentOverrides
        setInitialOverrides({
          permissionOverride: currentOverrides.permissionOverride,
          resourceOverride: currentOverrides.resourceOverride,
        });
        setIsModified(false);
        setSaveSuccess('User access updated successfully.');
      } else {
        setSaveError(response.message || 'Failed to update user access.');
      }
    } catch (err: any) {
      setSaveError(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/manageusers'); // same UI logic as earlier
  };

  // New “Reset to Default” -> clears current overrides, so final permission becomes the default set
  const handleReset = () => {
    setCurrentOverrides({
      permissionOverride: [],
      resourceOverride: [],
    });
  };

  /**
   * ---------------
   *   UI Render
   * ---------------
   */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-gray-500">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // Group finalPermissions by permission + relevant resources
  // (still keep the same structure to not break UI)
  const permissionsWithResources: Array<{
    permission: Permission & { granted: boolean };
    resources: Array<Resource & { granted: boolean }>;
  }> = finalPermissions.map((permission) => ({
    permission,
    resources: finalResources.filter((res) => res.table === permission.name),
  }));

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Edit User Permissions</h2>

      {/* Feedback Messages */}
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

      {/* Permissions Sections */}
      <div className="space-y-6">
        {permissionsWithResources.map(({ permission, resources }) => {
          const permissionGranted = permission.granted;

          return (
            <div
              key={permission.id}
              className="border p-4 rounded shadow-sm relative"
            >
              {/* Permission Checkbox */}
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id={`permission-${permission.id}`}
                  checked={permissionGranted}
                  onChange={handlePermissionChange(permission.id)}
                  className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label
                  htmlFor={`permission-${permission.id}`}
                  className="font-medium text-gray-700"
                >
                  {permission.name.charAt(0).toUpperCase() +
                    permission.name.slice(1)}
                </label>
              </div>

              {/* Resources Checkboxes */}
              <div className="space-y-2 pl-6">
                {resources.map((resource) => {
                  const resourceGranted = resource.granted;
                  return (
                    <div key={resource.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`resource-${resource.id}`}
                        checked={resourceGranted}
                        onChange={handleResourceChange(resource.id)}
                        disabled={!permissionGranted}
                        className={`mr-2 h-4 w-4 ${!permissionGranted
                            ? 'text-gray-300 border-gray-300 cursor-not-allowed'
                            : 'text-blue-600 border-gray-300 rounded'
                          }`}
                      />
                      <label
                        htmlFor={`resource-${resource.id}`}
                        className={`${!permissionGranted ? 'text-gray-400' : 'text-gray-700'
                          }`}
                      >
                        {resource.column.charAt(0).toUpperCase() +
                          resource.column.slice(1)}
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
        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!isModified || saving}
          className={`px-4 py-2 rounded-md font-medium ${!isModified || saving
              ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>

        {/* Cancel */}
        <button
          onClick={handleCancel}
          disabled={saving}
          className={`px-4 py-2 rounded-md font-medium ${saving
              ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-red-700'
            }`}
        >
          Cancel
        </button>

        {/* Reset to Default */}
        <button
          onClick={handleReset}
          disabled={saving}
          className={`px-4 py-2 rounded-md font-medium ${saving
              ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
              : 'bg-yellow-600 text-white hover:bg-yellow-700'
            }`}
        >
          Reset to Default
        </button>
      </div>
    </div>
  );
};

export default EditUser;
