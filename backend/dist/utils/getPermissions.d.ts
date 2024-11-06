export declare function getPermissions(userId: number): Promise<{
    permissions: {
        key: string;
        description: string;
    }[];
    resources: {
        key: string;
        columns: string[];
    }[];
}>;
