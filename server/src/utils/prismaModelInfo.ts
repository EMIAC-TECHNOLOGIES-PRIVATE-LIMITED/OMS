import NodeCache from 'node-cache';
import { prismaClient, Prisma, PrismaClient } from "../utils/prismaClient";

// Create a cache instance with a TTL of 86400 seconds (1 day)
const modelInfoCache = new NodeCache({ stdTTL: 86400 });

export class PrismaModelInfo {
    private prisma: PrismaClient;
    private dmmf: any;

    constructor() {
        this.prisma = prismaClient;
        // Access the Data Model Meta Format (DMMF)
        this.dmmf = (Prisma as any).dmmf;

    }

    // Helper: retrieve a model definition from the DMMF by name (case-insensitive)
    private getModelDefinition(modelName: string): any {
        const lowerName = modelName.toLowerCase();
        const modelDef = this.dmmf.datamodel.models.find(
            (m: any) => m.name.toLowerCase() === lowerName
        );
        return modelDef;
    }

    // Helper: extract scalar (or enum) fields from a model.
    // Returns an object mapping "Model.Field" to a string description of the type.
    private getScalarFields(model: any): { [column: string]: string } {
        const fields: { [column: string]: string } = {};
        for (const field of model.fields) {
            if (field.kind === 'scalar' || field.kind === 'enum') {
                let fieldType = field.kind === 'enum' ? `Enum(${field.type})` : field.type;
                if (!field.isRequired) {
                    fieldType += '?';
                }
                if (field.isList) {
                    fieldType += '[]';
                }
                fields[`${model.name}.${field.name}`] = fieldType;
            }
        }

        return fields;
    }

    /**
     * Returns an object mapping fully qualified column names to their data type strings,
     * for the given model. The mapping is built according to these rules:
     *
     * - For "Client" and "Vendor": only the model’s own scalar (and enum) fields.
     * - For "Site": include Site’s own scalar fields plus the fields from its forward relation "Vendor".
     * - For "Order": include Order’s own fields, plus the fields from forward relations "Client" and "Site";
     *            and for Site, include its forward relation "Vendor".
     * - For any other model: only its own scalar fields.
     */
    getModelColumns(modelName: string): { [column: string]: string } {
        const modelLower = modelName.toLowerCase();
        const cacheKey = `modelColumns:${modelLower}`;
        const cachedResult = modelInfoCache.get<{ [column: string]: string }>(cacheKey);
        if (cachedResult) {
            return cachedResult;
        }

        let columns: { [column: string]: string } = {};

        switch (modelLower) {
            case 'client': {
                const modelDef = this.getModelDefinition('Client');
                if (!modelDef) throw new Error(`Model Client not found in schema`);
                columns = this.getScalarFields(modelDef);

                // Add poc.name field
                columns['Poc.name'] = 'String';

                break;
            }
            case 'vendor': {
                const modelDef = this.getModelDefinition('Vendor');
                if (!modelDef) throw new Error(`Model Vendor not found in schema`);
                columns = this.getScalarFields(modelDef);

                // Add poc.name field
                columns['Poc.name'] = 'String';
                break;
            }
            case 'site': {
                const siteDef = this.getModelDefinition('Site');
                if (!siteDef) throw new Error(`Model Site not found in schema`);
                columns = this.getScalarFields(siteDef);
                const vendorDef = this.getModelDefinition('Vendor');
                if (vendorDef) {
                    const vendorColumns = this.getScalarFields(vendorDef);
                    columns = { ...columns, ...vendorColumns };
                }

                // Add poc.name field
                columns['Poc.name'] = 'String';
                columns['Site.categories'] = 'JSON[]';
                break;
            }
            case 'order': {
                const orderDef = this.getModelDefinition('Order');
                if (!orderDef) throw new Error(`Model Order not found in schema`);
                columns = this.getScalarFields(orderDef);
                const clientDef = this.getModelDefinition('Client');
                if (clientDef) {
                    const clientColumns = this.getScalarFields(clientDef);
                    columns = { ...columns, ...clientColumns };
                }
                const siteDef = this.getModelDefinition('Site');
                if (siteDef) {
                    const siteColumns = this.getScalarFields(siteDef);
                    columns = { ...columns, ...siteColumns };
                    const vendorDef = this.getModelDefinition('Vendor');
                    if (vendorDef) {
                        const vendorColumns = this.getScalarFields(vendorDef);
                        columns = { ...columns, ...vendorColumns };
                    }
                }

                // Add salesPerson.name field
                columns['SalesPerson.name'] = 'String';
                columns['Site.categories'] = 'JSON[]';
                break;
            }
            default: {
                const modelDef = this.getModelDefinition(modelName);
                if (!modelDef) throw new Error(`Model ${modelName} not found in schema`);
                columns = this.getScalarFields(modelDef);
                break;
            }
        }
        modelInfoCache.set(cacheKey, columns);
        return columns;
    }

    // Returns all available model names from the Prisma schema.
    getModelNames(): string[] {
        return this.dmmf.datamodel.models.map((m: any) => m.name);
    }
}
