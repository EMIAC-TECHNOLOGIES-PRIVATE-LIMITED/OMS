export function ManageUserAccess() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Manage User Access</h2>
        <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
          Add New User
        </button>
      </div>
      <div className="rounded-xl border bg-card">
        <div className="p-6">
          <h3 className="font-semibold">Users</h3>
          <p className="text-sm text-muted-foreground">Manage user accounts and permissions</p>
          <div className="mt-4 relative">
            <input
              type="text"
              placeholder="Search users..."
              className="w-full rounded-md border px-4 py-2"
            />
          </div>
        </div>
        <div className="p-6 pt-0">
          <div className="rounded-md border">
            <div className="grid grid-cols-4 border-b p-4 font-medium text-sm">
              <div>Name</div>
              <div>Email</div>
              <div>Role</div>
              <div>Actions</div>
            </div>
            <div className="grid grid-cols-4 border-b p-4">
              <div>John Doe</div>
              <div>john@example.com</div>
              <div>Administrator</div>
              <div className="flex gap-2">
                <button className="rounded-md bg-secondary px-3 py-1 text-sm">Edit</button>
                <button className="rounded-md bg-destructive/10 px-3 py-1 text-sm text-destructive">Deactivate</button>
              </div>
            </div>
            <div className="grid grid-cols-4 border-b p-4">
              <div>Jane Smith</div>
              <div>jane@example.com</div>
              <div>Manager</div>
              <div className="flex gap-2">
                <button className="rounded-md bg-secondary px-3 py-1 text-sm">Edit</button>
                <button className="rounded-md bg-destructive/10 px-3 py-1 text-sm text-destructive">Deactivate</button>
              </div>
            </div>
            <div className="grid grid-cols-4 p-4">
              <div>Mark Johnson</div>
              <div>mark@example.com</div>
              <div>User</div>
              <div className="flex gap-2">
                <button className="rounded-md bg-secondary px-3 py-1 text-sm">Edit</button>
                <button className="rounded-md bg-destructive/10 px-3 py-1 text-sm text-destructive">Deactivate</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}