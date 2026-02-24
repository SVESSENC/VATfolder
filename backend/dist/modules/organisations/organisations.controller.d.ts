import { OrganisationsService } from './organisations.service';
export declare class OrganisationsController {
    private organisationsService;
    constructor(organisationsService: OrganisationsService);
    getOrganisation(cvr: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        cvr: string;
        primaryAddress: import("@prisma/client/runtime/client").JsonValue | null;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
    } | null>;
}
//# sourceMappingURL=organisations.controller.d.ts.map