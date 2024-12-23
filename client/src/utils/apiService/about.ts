/**
 * 
 * authAPI.ts

signIn(email: string, password: string) - Signs in a user and returns a token.
signOut() - Logs out the current user.
signUp(name: string, email: string, password: string, roleId: number) - Registers a new user with the specified role.
userAPI.ts
4. getUserInfo() - Fetches information about the currently logged-in user.

adminAPI.ts
5. getAllRoles() - Retrieves a list of all roles.
6. getAllUsers() - Retrieves a list of all users.
7. getAllPermissions() - Retrieves a list of all permissions.
8. getRolePermissions(roleId: number) - Fetches permissions associated with a specific role.
9. getUserPermissions(userId: number) - Fetches permissions associated with a specific user.
10. suspendUser(userId: number) - Suspends a user by their ID.
11. revokeUser(userId: number) - Revokes a user's suspension.
12. manageUserAccess(userId: number, permissionOverride: any[]) - Updates permissions for a specific user.

dataAPI.ts
13. getViewData() - Fetches data from the default view.
14. getFilteredData(columns: string[], filters: any, sorting: any) - Fetches filtered data based on specified columns, filters, and sorting.
15. createView(viewName: string, columns: string[], filters: any, sorting: any) - Creates a new view with the specified parameters.
16. updateView(viewId: number, viewName: string, columns: string[], filters: any, sorting: any) - Updates an existing view by its ID.
17. deleteView(viewId: number) - Deletes a view by its ID.

Utility Functions (APIService.ts)
18. apiRequest<T>(endpoint: string, method: Method, params?: Record<string, any>, data?: any) - Generic function to make API requests using Axios.

Utility Functions (axiosInstance.ts)
19. Axios instance (axiosInstance) with pre-configured base URL, headers, and interceptors.


 * 
 */