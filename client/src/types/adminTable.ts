
export interface RoleTableRow {
  srNo: number;
  name: string;
  userCount: number;
  id: number;
}

export interface UserTableRow {
  srNo: number;
  name: string;
  role: string;
  isActive: string;
  id: number;
}



export interface Permission {
  id: number;
  name: string;
}

export interface Resource {
  id: number;
  table: string;
  column: string;
}


export interface PermissionOverride {
  permissionId: number;
  granted: boolean;
}

export interface ResourceOverride {
  resourceId: number;
  granted: boolean;
}