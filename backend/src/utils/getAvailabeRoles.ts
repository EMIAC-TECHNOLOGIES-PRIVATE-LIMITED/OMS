
import prismaClient from "./prismaClient";

export const getAvailableRoles = async () => {
    const roles = await prismaClient.role.findMany();
    return roles.map(role => ({ id: role.id, type: role.name }));
};
