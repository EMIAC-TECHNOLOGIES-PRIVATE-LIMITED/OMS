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

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

const EditUser: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  /**
   * ---------------
   *   State Setup
   * ---------------
   */
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [userDefaultPermissions, setUserDefaultPermissions] = useState<Permission[]>([]);
  const [userDefaultResources, setUserDefaultResources] = useState<Resource[]>([]);
  const [currentOverrides, setCurrentOverrides] = useState<{
    permissionOverride: PermissionOverride[];
    resourceOverride: ResourceOverride[];
  }>({
    permissionOverride: [],
    resourceOverride: [],
  });
  const [initialOverrides, setInitialOverrides] = useState<{
    permissionOverride: PermissionOverride[];
    resourceOverride: ResourceOverride[];
  }>({
    permissionOverride: [],
    resourceOverride: [],
  });
  const [finalPermissions, setFinalPermissions] = useState<
    Array<Permission & { granted: boolean }>
  >([]);
  const [finalResources, setFinalResources] = useState<
    Array<Resource & { granted: boolean }>
  >([]);
  const [isModified, setIsModified] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // State to handle collapsible sections (expanded/collapsed) by permission ID
  const [expandedPermissions, setExpandedPermissions] = useState<{ [key: number]: boolean }>({});

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

        const permissionsResponse: GetAllPermissionsResponse = await getAllPermissions();
        if (permissionsResponse.success) {
          setAllPermissions(permissionsResponse.data.permissions);
          setAllResources(permissionsResponse.data.resources);
        } else {
          setError(permissionsResponse.message || 'Failed to fetch permissions.');
          return;
        }

        const userPermissionsResponse: GetUserPermissionsResponse = await getUserPermissions(
          parseInt(userId)
        );
        if (userPermissionsResponse.success) {
          setUserDefaultPermissions(userPermissionsResponse.data.permissions);
          setUserDefaultResources(userPermissionsResponse.data.resources);

          setInitialOverrides({
            permissionOverride: userPermissionsResponse.data.permissionOverrides,
            resourceOverride: userPermissionsResponse.data.resourceOverrides,
          });
          setCurrentOverrides({
            permissionOverride: userPermissionsResponse.data.permissionOverrides,
            resourceOverride: userPermissionsResponse.data.resourceOverrides,
          });
        } else {
          setError(userPermissionsResponse.message || 'Failed to fetch user permissions.');
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
    const newFinalPermissions = allPermissions.map((perm) => {
      const userHasDefault = userDefaultPermissions.some(
        (defPerm) => defPerm.id === perm.id
      );
      const override = currentOverrides.permissionOverride.find(
        (o) => o.permissionId === perm.id
      );
      let granted = userHasDefault;
      if (override) {
        granted = override.granted;
      }
      return {
        ...perm,
        granted,
      };
    });

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

  useEffect(() => {
    computeFinalPermissionsAndResources();
  }, [
    allPermissions,
    allResources,
    userDefaultPermissions,
    userDefaultResources,
    currentOverrides,
  ]);

  /**
   * ---------------
   *   isModified
   * ---------------
   */
  useEffect(() => {
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
        updatedPermissionOverrides = prev.permissionOverride.map((po) =>
          po.permissionId === permissionId ? { ...po, granted } : po
        );
      } else {
        updatedPermissionOverrides = [
          ...prev.permissionOverride,
          { permissionId, granted },
        ];
      }

      return {
        ...prev,
        permissionOverride: updatedPermissionOverrides,
      };
    });

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
    navigate('/dashboard/manageusers');
  };

  const handleReset = () => {
    setCurrentOverrides({
      permissionOverride: [],
      resourceOverride: [],
    });
  };

  // Toggle the collapsed/expanded state for a given permission ID
  const togglePermissionSection = (permissionId: number) => {
    setExpandedPermissions((prev) => ({
      ...prev,
      [permissionId]: !prev[permissionId],
    }));
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

  const permissionsWithResources: Array<{
    permission: Permission & { granted: boolean };
    resources: Array<Resource & { granted: boolean }>;
  }> = finalPermissions.map((permission) => ({
    permission,
    resources: finalResources.filter((res) => res.table === permission.name),
  }));

  return (
    <div className="p-6">
      {/* Top Section with Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-semibold mb-4 sm:mb-0">Edit User Permissions</h2>
        <div className="flex space-x-3">
          <button
            onClick={handleSave}
            disabled={!isModified || saving}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${!isModified || saving
                ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>

          <button
            onClick={handleCancel}
            disabled={saving}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${saving
                ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
              }`}
          >
            Cancel
          </button>

          <button
            onClick={handleReset}
            disabled={saving}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${saving
                ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                : 'bg-yellow-600 text-white hover:bg-yellow-700'
              }`}
          >
            Reset to Default
          </button>
        </div>
      </div>

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

      {/* Collapsible Permissions Sections */}
      <div className="space-y-4">
        {permissionsWithResources.map(({ permission, resources }) => {
          const permissionGranted = permission.granted;
          const selectedCount = resources.filter((r) => r.granted).length;
          const totalCount = resources.length;
          const isExpanded = expandedPermissions[permission.id] || false;

          return (
            <div key={permission.id} className="bg-white shadow rounded p-4">
              {/* Permission Header (Collapsible Trigger) */}
              <button
                type="button"
                onClick={() => togglePermissionSection(permission.id)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center">
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
                    {permission.name.charAt(0).toUpperCase() + permission.name.slice(1)}
                  </label>
                  <span className="ml-2 text-sm text-gray-500">
                    ({selectedCount} / {totalCount} selected)
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-600" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-600" />
                )}
              </button>

              {/* Collapsible Body (Resources) */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden mt-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                              {resource.column.charAt(0).toUpperCase() + resource.column.slice(1)}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EditUser;
