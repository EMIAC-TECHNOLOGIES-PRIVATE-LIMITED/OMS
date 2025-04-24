import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getAllPermissions,
  getUserPermissions,
  manageUserAccess,
  getAllRoles,
  getRolePermissions,
  suspendUser,
  revokeUser,
  updatePassword,
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
import { Loader2, ChevronsUpDown, Check } from 'lucide-react';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Types for the roles returned by getAllRoles()
interface RoleItem {
  id: number;
  name: string;
  _count: {
    users: number;
  };
}

interface TeamMember {
  id: number;
  name: string;
  role: {
    id: number;
    name: string;
  };
}

const EditUser: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { toast } = useToast();

  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [allUsers, setAllUsers] = useState<TeamMember[]>([]);
  const [userDefaultPermissions, setUserDefaultPermissions] = useState<Permission[]>([]);
  const [userDefaultResources, setUserDefaultResources] = useState<Resource[]>([]);
  const [currentUserAccess, setCurrentUserAccess] = useState<number[]>([]);
  
  const [initialUserAccess, setInitialUserAccess] = useState<number[]>([]);
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
  const [userAccessPopoverOpen, setUserAccessPopoverOpen] = useState<boolean>(false);

  // All roles for the dropdown, plus states for storing the user's role
  const [allRoles, setAllRoles] = useState<RoleItem[]>([]);
  const [initialRoleId, setInitialRoleId] = useState<number | null>(null);
  const [currentRoleId, setCurrentRoleId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  // Suspended state + confirmation modals
  const [isSuspended, setIsSuspended] = useState<boolean>(false);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState<boolean>(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState<boolean>(false);
  const [showChangePassword, setShowChangePassword] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

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

        const rolesResponse: GetAllRolesResponse = await getAllRoles();
        if (rolesResponse.success) {
          setAllRoles(rolesResponse.data);
        } else {
          console.error(rolesResponse.message || 'Failed to fetch roles.');
        }

        const permissionsResponse: GetAllPermissionsResponse = await getAllPermissions();
        if (permissionsResponse.success) {
          const permissions = permissionsResponse.data.permissions
            .map((p) => ({ id: p.id, name: p.key }));
          setAllPermissions(permissions);

          console.log('[EditUser] AllpermissionsResponse :  ', permissionsResponse.data);

          const resources = permissionsResponse.data.resources.map((r) => ({
            id: r.id,
            table: r.key.split('.')[0].toLowerCase(),
            column: r.key.split('.')[1],
          }));
          setAllResources(resources);
          setAllUsers(permissionsResponse.data.team);
        } else {
          setError(permissionsResponse.message || 'Failed to fetch permissions.');
          return;
        }

        const userPermissionsResponse: GetUserPermissionsResponse = await getUserPermissions(
          parseInt(userId)
        );

        if (userPermissionsResponse.success) {
          const defaultPermissions = userPermissionsResponse.data.permissions
            .map((p) => ({ id: p.id, name: p.key }));
          setUserDefaultPermissions(defaultPermissions);

          console.log('[EditUser] userPermissionResponse :  ', userPermissionsResponse.data);

          const defaultResources = userPermissionsResponse.data.resources.map((r) => ({
            id: r.id,
            table: r.key.split('.')[0].toLowerCase(),
            column: r.key.split('.')[1],
          }));
          setUserDefaultResources(defaultResources);

          // Set user access data
          setCurrentUserAccess(userPermissionsResponse.data.userAccess);
          setInitialUserAccess(userPermissionsResponse.data.userAccess);

          setInitialOverrides({
            permissionOverride: userPermissionsResponse.data.permissionOverrides,
            resourceOverride: userPermissionsResponse.data.resourceOverrides,
          });
          setCurrentOverrides({
            permissionOverride: userPermissionsResponse.data.permissionOverrides,
            resourceOverride: userPermissionsResponse.data.resourceOverrides,
          });

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
   *  Combine "default" + "override" -> finalPermissions/finalResources for render
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
    const userAccessChanged = JSON.stringify(initialUserAccess) !== JSON.stringify(currentUserAccess);

    setIsModified(overridesChanged || roleChanged || userAccessChanged);
  }, [initialOverrides, currentOverrides, currentRoleId, initialRoleId, initialUserAccess, currentUserAccess]);

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
  const handlePermissionChange = (permissionId: number) => (checked: boolean) => {
    if (isSuspended) return;

    setCurrentOverrides((prev) => {
      const overrideExists = prev.permissionOverride.find(
        (po) => po.permissionId === permissionId
      );
      let updatedPermissionOverrides: PermissionOverride[];
      if (overrideExists) {
        updatedPermissionOverrides = prev.permissionOverride.map((po) =>
          po.permissionId === permissionId ? { ...po, granted: checked } : po
        );
      } else {
        updatedPermissionOverrides = [
          ...prev.permissionOverride,
          { permissionId, granted: checked },
        ];
      }

      if (!checked) {
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

  const handleResourceChange = (resourceId: number) => (checked: boolean) => {
    if (isSuspended) return;

    setCurrentOverrides((prev) => {
      const overrideExists = prev.resourceOverride.find(
        (ro) => ro.resourceId === resourceId
      );
      let updatedResourceOverrides: ResourceOverride[];
      if (overrideExists) {
        updatedResourceOverrides = prev.resourceOverride.map((ro) =>
          ro.resourceId === resourceId ? { ...ro, granted: checked } : ro
        );
      } else {
        updatedResourceOverrides = [
          ...prev.resourceOverride,
          { resourceId, granted: checked },
        ];
      }
      return {
        ...prev,
        resourceOverride: updatedResourceOverrides,
      };
    });
  };

  const handleSelectAllResources = (resources: Array<Resource & { granted: boolean }>) => (
    checked: boolean
  ) => {
    if (isSuspended) return;

    setCurrentOverrides((prev) => {
      let updatedResourceOverrides = [...prev.resourceOverride];
      resources.forEach((resource) => {
        // Skip updating 'id' resources when unchecking all
        if (!checked && resource.column === 'id') {
          return;
        }

        const resourceExists = updatedResourceOverrides.find(
          (ro) => ro.resourceId === resource.id
        );
        if (resourceExists) {
          updatedResourceOverrides = updatedResourceOverrides.map((ro) =>
            ro.resourceId === resource.id ? { ...ro, granted: checked } : ro
          );
        } else {
          updatedResourceOverrides.push({ resourceId: resource.id, granted: checked });
        }
      });
      return {
        ...prev,
        resourceOverride: updatedResourceOverrides,
      };
    });
  };

  /**
   * ------------------------------------------------------------------
   *   User Access Control Handlers
   * ------------------------------------------------------------------
   */
  const handleUserAccessChange = (userId: number) => {
    if (isSuspended) return;

    setCurrentUserAccess((prev) => {
      // If user is already in the access list, remove them
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      }
      // Otherwise add them to the access list
      return [...prev, userId];
    });
  };

  const handleSave = async () => {
    if (!userId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'User ID is missing.',
        duration: 5000,
      });
      return;
    }

    try {
      setSaving(true);

      const response: ManageUserAccessResponse = await manageUserAccess(
        parseInt(userId),
        currentOverrides.permissionOverride,
        currentOverrides.resourceOverride,
        currentUserAccess,
        currentRoleId ? currentRoleId : undefined
      );

      if (response.success) {
        setInitialOverrides({
          permissionOverride: currentOverrides.permissionOverride,
          resourceOverride: currentOverrides.resourceOverride,
        });
        setInitialRoleId(currentRoleId);
        setInitialUserAccess(currentUserAccess);
        setIsModified(false);
        toast({
          title: 'Success',
          description: 'User access updated successfully.',
          duration: 3000,
          className: 'border border-brand',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.message || 'Failed to update user access.',
          duration: 5000,
        });
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'An unexpected error occurred while saving.',
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setCurrentOverrides({
      permissionOverride: [...initialOverrides.permissionOverride],
      resourceOverride: [...initialOverrides.resourceOverride],
    });
    setCurrentRoleId(initialRoleId);
    setCurrentUserAccess([...initialUserAccess]);
    setIsModified(false);
  };

  const handleReset = () => {
    if (isSuspended) return;
    setCurrentOverrides({
      permissionOverride: [],
      resourceOverride: [],
    });
    setCurrentUserAccess([]);
  };

  const handleRoleChange = async (newRoleId: string) => {
    if (!userId) return;

    const roleIdNum = Number(newRoleId);
    try {
      setCurrentOverrides({
        permissionOverride: [],
        resourceOverride: [],
      });

      const rolePermsResponse: GetRolePermissionsResponse = await getRolePermissions(roleIdNum);
      if (rolePermsResponse.success) {
        setUserDefaultPermissions(
          rolePermsResponse.data.permissions
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

      setCurrentRoleId(roleIdNum);
    } catch (error: any) {
      console.error(error.message);
    }
  };

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
        toast({
          title: 'Success',
          description: 'User has been suspended.',
          duration: 3000,
          className: 'border border-brand',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: resp.message || 'Failed to suspend user.',
          duration: 5000,
        });
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Error while suspending user.',
        duration: 5000,
      });
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
        toast({
          title: 'Success',
          description: 'User has been revoked (active).',
          duration: 3000,
          className: 'border border-brand',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: resp.message || 'Failed to revoke user.',
          duration: 5000,
        });
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Error while revoking user.',
        duration: 5000,
      });
    }
  };

  const validatePassword = (): boolean => {
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const handlePasswordChange = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!userId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'User ID is missing.',
        duration: 5000,
      });
      return;
    }

    if (!validatePassword()) {
      return;
    }

    try {
      setSaving(true);
      const response = await updatePassword(parseInt(userId), newPassword);
      
      if (response.success) {
        setShowChangePassword(false);
        setNewPassword('');
        setConfirmPassword('');
        toast({
          title: 'Success',
          description: 'Password updated successfully.',
          duration: 3000,
          className: 'border border-brand',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.message || 'Failed to update password.',
          duration: 5000,
        });
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'An unexpected error occurred while updating password.',
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  // Filter out the current user from the list of all users
  const filteredUsers = allUsers.filter(user => user.id !== parseInt(userId || '0'));
  const selectedUserCount = currentUserAccess.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading user data...</span>
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
    <div className="p-6 space-y-6">
      {/* Confirmation Modal for Suspend */}
      <Dialog open={showSuspendConfirm} onOpenChange={setShowSuspendConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="">Suspend User</DialogTitle>
            <DialogDescription>
              Are you sure you want to suspend this user? They will lose all access.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuspendConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmSuspend}>
              Suspend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal for Revoke */}
      <Dialog open={showRevokeConfirm} onOpenChange={setShowRevokeConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle >Revoke Suspension</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke the suspension? This user will be re-activated.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRevokeConfirm(false)}>
              Cancel
            </Button>
            <Button variant="default" className="bg-green-600" onClick={confirmRevoke}>
              Revoke
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter and confirm the new password for this user. Password must be at least 8 characters long.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="password" className="block mb-2">
                New Password
              </Label>
              <Input
                type="password"
                id="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full"
                placeholder="Enter new password"
                disabled={saving}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="block mb-2">
                Confirm Password
              </Label>
              <Input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full"
                placeholder="Confirm new password"
                disabled={saving}
              />
            </div>
            {passwordError && (
              <Alert variant="destructive">
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowChangePassword(false);
                setNewPassword('');
                setConfirmPassword('');
                setPasswordError(null);
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePasswordChange}
              disabled={saving || !newPassword || !confirmPassword}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Top Section with Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold">{`Edit User Permissions: ${userName}`}</h2>
        <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
          {isSuspended ? (
            <Button variant="default" className="bg-green-600" onClick={handleRevokeClick}>
              Revoke
            </Button>
          ) : (
            <Button variant="destructive" onClick={handleSuspendClick}>
              Suspend
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => setShowChangePassword(true)}
            disabled={saving || isSuspended}
          >
            Change Password
          </Button>

          <Select
            value={currentRoleId?.toString() ?? ''}
            onValueChange={handleRoleChange}
            disabled={isSuspended || saving}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              {allRoles.map((r) => (
                <SelectItem key={r.id} value={r.id.toString()}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* User Access Control Dropdown */}
          {currentRoleId !== 2 && (
            <Popover open={userAccessPopoverOpen} onOpenChange={setUserAccessPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="secondaryFlat"
                  role="combobox"
                  aria-expanded={userAccessPopoverOpen}
                  className="w-[220px] flex h-10  items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300"
                  disabled={isSuspended || saving}
                >
                  Access to {selectedUserCount} users
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[220px] p-0">
                <Command>
                  <CommandList>
                    <CommandGroup>
                      <ScrollArea className="h-64">
                        {filteredUsers.map((user) => (
                          <CommandItem
                            key={user.id}
                            value={user.id.toString()}
                            onSelect={() => {
                              handleUserAccessChange(user.id);
                            }}
                            className="flex items-center space-x-2"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                currentUserAccess.includes(user.id)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <div className="flex items-center justify-between w-full">
                              <span>{user.name}</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {user.role.name}
                              </Badge>
                            </div>
                          </CommandItem>
                        ))}
                      </ScrollArea>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}

          <Button
            onClick={handleSave}
            disabled={!isModified || saving}
            variant={isModified && !saving ? 'brandOutline' : 'outline'}
            className={isModified && !saving ? 'bg-green-100 hover:bg-green-200' : ''}
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

          <Button
            onClick={handleCancel}
            className='bg-red-100 hover:bg-red-200'
            disabled={saving}
            variant="destructiveOutline"
          >
            Cancel
          </Button>

          <Button
            onClick={handleReset}
            disabled={saving || isSuspended}
            variant="outline"
            className="bg-blue-100 hover:bg-blue-200"
          >
            Reset to Default
          </Button>
        </div>
      </div>

      {/* User Access Section */}
      {currentRoleId !== 2 && (
        <Card className="mb-6">
          <CardHeader>
            <h3 className="text-lg font-medium">User Data Access</h3>
            <p className="text-sm text-gray-500">
              Select users whose data this user can access
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {currentUserAccess.length > 0 ? (
                filteredUsers
                  .filter(user => currentUserAccess.includes(user.id))
                  .map(user => (
                    <Badge key={user.id} variant="secondary" className="flex items-center gap-1">
                      {user.name}
                      <button
                        className="ml-1 rounded-full p-1 hover:bg-gray-200"
                        onClick={() => handleUserAccessChange(user.id)}
                        disabled={isSuspended}
                      >
                        <span className="sr-only">Remove</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </Badge>
                  ))
              ) : (
                <p className="text-sm text-gray-500">No user data access granted</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Accordion type="multiple" className="space-y-4">
        {permissionsWithResources.map(({ permission, resources }) => {
          const permissionGranted = permission.granted;
          const selectedCount = resources.filter((r) => r.granted).length;
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
                        checked={permissionGranted}
                        onCheckedChange={handlePermissionChange(permission.id)}
                        disabled={isSuspended}
                        className="h-5 w-5 rounded border-gray-300"
                      />
                      <Label
                        htmlFor={`permission-${permission.id}`}
                        className="font-medium text-gray-700"
                      >
                        {permission.name.charAt(0).toUpperCase() + permission.name.slice(1)}
                      </Label>
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
                          disabled={!permissionGranted || isSuspended}
                          className="h-5 w-5 rounded border-gray-300"
                        />
                        <Label
                          htmlFor={`select-all-${permission.id}`}
                          className={
                            !permissionGranted || isSuspended
                              ? 'text-gray-400'
                              : 'text-gray-700 font-medium'
                          }
                        >
                          Select All
                        </Label>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {resources.map((resource) => {
                        const resourceGranted = resource.granted;
                        return (
                          <div key={resource.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`resource-${resource.id}`}
                              checked={resourceGranted || resource.column === 'id'}
                              onCheckedChange={handleResourceChange(resource.id)}
                              disabled={!permissionGranted || isSuspended || resource.column === 'id'}
                              className="h-5 w-5 rounded border-gray-300"
                            />
                            <Label
                              htmlFor={`resource-${resource.id}`}
                              className={
                                !permissionGranted || isSuspended
                                  ? 'text-gray-400'
                                  : 'text-gray-700'
                              }
                            >
                              {resource.column.charAt(0).toUpperCase() +
                                resource.column.slice(1)}
                            </Label>
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

export default EditUser;