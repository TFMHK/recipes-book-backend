import { Permission } from "@prisma/client";

export class PermissionDto{
    constructor(public username: string, public permission:Permission){}
}