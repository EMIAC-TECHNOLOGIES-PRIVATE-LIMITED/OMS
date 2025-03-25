export function ManageRoleAccess() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Manage Role Access</h2>
        <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
          Create New Role
        </button>
      </div>
      <div className="rounded-xl border bg-card">
        <div className="p-6">
          <h3 className="font-semibold">Roles Configuration</h3>
          <p className="text-sm text-muted-foreground">Manage user roles and permissions</p>
        </div>
        <div className="p-6 pt-0">
          <div className="rounded-md border">
            <div className="flex items-center justify-between border-b p-4">
              <div className="font-medium">Administrator</div>
              <div className="flex gap-2">
                <button className="rounded-md bg-secondary px-3 py-1 text-sm">Edit</button>
                <button className="rounded-md bg-destructive/10 px-3 py-1 text-sm text-destructive">Delete</button>
              </div>
            </div>
            <div className="flex items-center justify-between border-b p-4">
              <div className="font-medium">Manager</div>
              <div className="flex gap-2">
                <button className="rounded-md bg-secondary px-3 py-1 text-sm">Edit</button>
                <button className="rounded-md bg-destructive/10 px-3 py-1 text-sm text-destructive">Delete</button>
              </div>
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="font-medium">User</div>
              <div className="flex gap-2">
                <button className="rounded-md bg-secondary px-3 py-1 text-sm">Edit</button>
                <button className="rounded-md bg-destructive/10 px-3 py-1 text-sm text-destructive">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
