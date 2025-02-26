import React, { useEffect, useState, ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import {
  getAllPermissions,
  getUserPermissions,
  manageUserAccess,
  getAllRoles,
  getRolePermissions,
  suspendUser,
  revokeUser,
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
  GetAllRolesResponse,
  GetRolePermissionsResponse,
  SuspendUserResponse,
  RevokeUserResponse,
} from '../../../../shared/src/types';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

// Types for the roles returned by getAllRoles()
interface RoleItem {
  id: number;
  name: string;
  _count: {
    users: number;
  };
}

const EditUser: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();

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

  // Collapsible sections
  const [expandedPermissions, setExpandedPermissions] = useState<{ [key: number]: boolean }>({});

  // All roles for the dropdown, plus states for storing the user’s role
  const [allRoles, setAllRoles] = useState<RoleItem[]>([]);
  const [initialRoleId, setInitialRoleId] = useState<number | null>(null);
  const [currentRoleId, setCurrentRoleId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  // Suspended state + confirmation modals
  const [isSuspended, setIsSuspended] = useState<boolean>(false);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState<boolean>(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState<boolean>(false);

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

        // Fetch all roles for dropdown
        const rolesResponse: GetAllRolesResponse = await getAllRoles();
        if (rolesResponse.success) {
          setAllRoles(rolesResponse.data);
        } else {
          console.error(rolesResponse.message || 'Failed to fetch roles.');
        }

        // Fetch all (global) permissions and resources
        const permissionsResponse: GetAllPermissionsResponse = await getAllPermissions();
        if (permissionsResponse.success) {
          // Filter out permissions starting with underscore
          const permissions = permissionsResponse.data.permissions
           
            .map((p) => ({ id: p.id, name: p.key }));
          setAllPermissions(permissions);

          // Parse resources in Permission.Resource format
          const resources = permissionsResponse.data.resources.map((r) => ({
            id: r.id,
            table: r.key.split('.')[0].toLowerCase(), // e.g., "site" from "Site.id"
            column: r.key.split('.')[1], // e.g., "id" from "Site.id"
          }));
          setAllResources(resources);
        } else {
          setError(permissionsResponse.message || 'Failed to fetch permissions.');
          return;
        }

        // Fetch user-specific defaults & overrides
        const userPermissionsResponse: GetUserPermissionsResponse = await getUserPermissions(
          parseInt(userId)
        );
        if (userPermissionsResponse.success) {
          // User’s default perms/resources
          const defaultPermissions = userPermissionsResponse.data.permissions
            .filter((p) => !p.key.startsWith('_'))
            .map((p) => ({ id: p.id, name: p.key }));
          setUserDefaultPermissions(defaultPermissions);

          const defaultResources = userPermissionsResponse.data.resources.map((r) => ({
            id: r.id,
            table: r.key.split('.')[0].toLowerCase(),
            column: r.key.split('.')[1],
          }));
          setUserDefaultResources(defaultResources);

          // The override arrays
          setInitialOverrides({
            permissionOverride: userPermissionsResponse.data.permissionOverrides,
            resourceOverride: userPermissionsResponse.data.resourceOverrides,
          });
          setCurrentOverrides({
            permissionOverride: userPermissionsResponse.data.permissionOverrides,
            resourceOverride: userPermissionsResponse.data.resourceOverrides,
          });

          // Store user’s role, name, and suspended status
          setInitialRoleId(userPermissionsResponse.data.roleId);
          setCurrentRoleId(userPermissionsResponse.data.roleId);
          setUserName(userPermissionsResponse.data.name);
          setIsSuspended(userPermissionsResponse.data.isSuspended);
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
      const userHasDefault = userDefaultPermissions.some((defPerm) => defPerm.id === perm.id);
      const override = currentOverrides.permissionOverride.find((o) => o.permissionId === perm.id);
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
      const userHasDefault = userDefaultResources.some((defRes) => defRes.id === res.id);
      const override = currentOverrides.resourceOverride.find((o) => o.resourceId === res.id);
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
    const overridesChanged =
      JSON.stringify(initialOverrides.permissionOverride) !==
        JSON.stringify(currentOverrides.permissionOverride) ||
      JSON.stringify(initialOverrides.resourceOverride) !==
        JSON.stringify(currentOverrides.resourceOverride);
    const roleChanged = currentRoleId !== initialRoleId;
    setIsModified(overridesChanged || roleChanged);
  }, [initialOverrides, currentOverrides, currentRoleId, initialRoleId]);

  /**
   * ----------------------------------------------------------
   *   Check helpers using finalPermissions/finalResources
   * ----------------------------------------------------------
   */
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
    if (isSuspended) return;

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

      // If permission is unchecked, uncheck related resources
      if (!granted) {
        const relatedResources = allResources.filter(
          (resource) => resource.table === getPermissionNameById(permissionId).toLowerCase()
        );
        let updatedResourceOverrides = [...prev.resourceOverride];
        relatedResources.forEach((resource) => {
          const resourceExists = updatedResourceOverrides.find(
            (ro) => ro.resourceId === resource.id
          );
          if (resourceExists) {
            updatedResourceOverrides = updatedResourceOverrides.map((ro) =>
              ro.resourceId === resource.id ? { ...ro, granted: false } : ro
            );
          } else {
            updatedResourceOverrides.push({ resourceId: resource.id, granted: false });
          }
        });
        return {
          permissionOverride: updatedPermissionOverrides,
          resourceOverride: updatedResourceOverrides,
        };
      }

      return {
        ...prev,
        permissionOverride: updatedPermissionOverrides,
      };
    });
  };

  const handleResourceChange = (resourceId: number) => (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    if (isSuspended) return;

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
  // A) SAVE
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
        currentOverrides.resourceOverride,
        currentRoleId ? currentRoleId : undefined
      );

      if (response.success) {
        setInitialOverrides({
          permissionOverride: currentOverrides.permissionOverride,
          resourceOverride: currentOverrides.resourceOverride,
        });
        setInitialRoleId(currentRoleId);
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

  // B) CANCEL
  const handleCancel = () => {
    setCurrentOverrides({
      permissionOverride: [...initialOverrides.permissionOverride],
      resourceOverride: [...initialOverrides.resourceOverride],
    });
    setCurrentRoleId(initialRoleId);
    setSaveError(null);
    setSaveSuccess(null);
    setIsModified(false);
  };

  // C) RESET
  const handleReset = () => {
    if (isSuspended) return;
    setCurrentOverrides({
      permissionOverride: [],
      resourceOverride: [],
    });
  };

  // D) Role change
  const handleRoleChange = async (newRoleId: number) => {
    if (!userId) return;

    try {
      setCurrentOverrides({
        permissionOverride: [],
        resourceOverride: [],
      });

      const rolePermsResponse: GetRolePermissionsResponse = await getRolePermissions(newRoleId);
      if (rolePermsResponse.success) {
        setUserDefaultPermissions(
          rolePermsResponse.data.permissions
            .filter((p) => !p.key.startsWith('_'))
            .map((p) => ({ id: p.id, name: p.key }))
        );
        setUserDefaultResources(
          rolePermsResponse.data.resources.map((r) => ({
            id: r.id,
            table: r.key.split('.')[0].toLowerCase(),
            column: r.key.split('.')[1],
          }))
        );
      } else {
        console.error(rolePermsResponse.message || 'Failed to fetch role-based perms/resources');
      }

      setCurrentRoleId(newRoleId);
    } catch (error: any) {
      console.error(error.message);
    }
  };

  /**
   * Suspend / Revoke handlers
   */
  const handleSuspendClick = () => {
    setShowSuspendConfirm(true);
  };
  const confirmSuspend = async () => {
    if (!userId) return;
    setShowSuspendConfirm(false);
    try {
      const resp: SuspendUserResponse = await suspendUser(parseInt(userId));
      if (resp.success) {
        setIsSuspended(true);
        setSaveSuccess('User has been suspended.');
      } else {
        setSaveError(resp.message || 'Failed to suspend user.');
      }
    } catch (err: any) {
      setSaveError(err.message || 'Error while suspending user.');
    }
  };

  const handleRevokeClick = () => {
    setShowRevokeConfirm(true);
  };
  const confirmRevoke = async () => {
    if (!userId) return;
    setShowRevokeConfirm(false);
    try {
      const resp: RevokeUserResponse = await revokeUser(parseInt(userId));
      if (resp.success) {
        setIsSuspended(false);
        setSaveSuccess('User has been revoked (active).');
      } else {
        setSaveError(resp.message || 'Failed to revoke user.');
      }
    } catch (err: any) {
      setSaveError(err.message || 'Error while revoking user.');
    }
  };

  const closeSuspendModal = () => setShowSuspendConfirm(false);
  const closeRevokeModal = () => setShowRevokeConfirm(false);

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
    resources: finalResources.filter(
      (res) => res.table === permission.name.toLowerCase()
    ),
  }));

  return (
    <div className="p-6">
      {/* Confirmation Modal for Suspend */}
      <AnimatePresence>
        {showSuspendConfirm && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded shadow-lg max-w-md w-full"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <h3 className="text-xl font-semibold mb-4 text-red-700">Suspend User</h3>
              <p className="mb-4 text-gray-600">
                Are you sure you want to suspend this user? They will lose all access.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={closeSuspendModal}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSuspend}
                  className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
                >
                  Suspend
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal for Revoke */}
      <AnimatePresence>
        {showRevokeConfirm && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded shadow-lg max-w-md w-full"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <h3 className="text-xl font-semibold mb-4 text-green-700">Revoke Suspension</h3>
              <p className="mb-4 text-gray-600">
                Are you sure you want to revoke the suspension? This user will be re-activated.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={closeRevokeModal}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRevoke}
                  className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white"
                >
                  Revoke
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Section with Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-semibold mb-4 sm:mb-0">{`Edit User Permissions : ${userName}`}</h2>

        <div className="flex flex-wrap gap-3 items-center justify-end">
          {isSuspended ? (
            <button
              onClick={handleRevokeClick}
              className="px-4 py-2 rounded-md font-medium transition-colors bg-green-600 text-white hover:bg-green-700"
            >
              Revoke
            </button>
          ) : (
            <button
              onClick={handleSuspendClick}
              className="px-4 py-2 rounded-md font-medium transition-colors bg-red-600 text-white hover:bg-red-700"
            >
              Suspend
            </button>
          )}

          <select
            className="px-3 py-2 rounded-md border border-gray-300 text-gray-700"
            value={currentRoleId ?? ''}
            onChange={(e) => handleRoleChange(Number(e.target.value))}
            disabled={isSuspended || saving}
          >
            <option value="" disabled>
              Select Role
            </option>
            {allRoles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleSave}
            disabled={!isModified || saving}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
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
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              saving
                ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                : 'bg-gray-500 text-white hover:bg-gray-600'
            }`}
          >
            Cancel
          </button>

          <button
            onClick={handleReset}
            disabled={saving || isSuspended}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              saving || isSuspended
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
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">{saveSuccess}</div>
      )}
      {saveError && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{saveError}</div>
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
              <button
                type="button"
                onClick={() =>
                  setExpandedPermissions((prev) => ({
                    ...prev,
                    [permission.id]: !prev[permission.id],
                  }))
                }
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`permission-${permission.id}`}
                    checked={permissionGranted}
                    onChange={handlePermissionChange(permission.id)}
                    disabled={isSuspended}
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
                              disabled={!permissionGranted || isSuspended}
                              className={`mr-2 h-4 w-4 ${
                                !permissionGranted || isSuspended
                                  ? 'text-gray-300 border-gray-300 cursor-not-allowed'
                                  : 'text-blue-600 border-gray-300 rounded'
                              }`}
                            />
                            <label
                              htmlFor={`resource-${resource.id}`}
                              className={`${!permissionGranted || isSuspended ? 'text-gray-400' : 'text-gray-700'}`}
                            >
                              {resource.column.charAt(0).toUpperCase() +
                                resource.column.slice(1)}
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