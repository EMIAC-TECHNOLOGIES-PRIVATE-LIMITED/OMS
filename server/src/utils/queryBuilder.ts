import { FilterConfig } from "@shared/types";
import { PrismaModelInfo } from '../utils/prismaModelInfo';

const modelInfo = new PrismaModelInfo();


export type QueryObject = {
    select?: any;
    where: object;
    orderBy?: object;
};

const getTableAndColumn = (resource: string): { table: string; column: string } => {
    const [table, ...rest] = resource.split('.');
    const column = rest.join('.');
    const tableLower = table.toLowerCase();
    return { table: tableLower, column };
};

const shouldProcessResource = (model: string, resourceTable: string): boolean => {
    // console.log(`[shouldProcessResource] Called with model: "${model}", resourceTable: "${resourceTable}"`);

    const modelLower = model.toLowerCase();
    // console.log(`[shouldProcessResource] Normalized model name: "${modelLower}"`);

    const validTables: { [key: string]: string[] } = {
        client: ['client', 'poc'],
        vendor: ['vendor', 'poc'],
        site: ['site', 'vendor', 'poc'],
        order: ['order', 'client', 'site', 'vendor', 'salesperson'],
    };

    // console.log(`[shouldProcessResource] Valid tables for model "${modelLower}":`, validTables[modelLower] || 'None defined');

    const resourceLower = resourceTable.toLowerCase();
    // console.log(`[shouldProcessResource] Normalized resource table: "${resourceLower}"`);

    const isValid = validTables[modelLower]?.includes(resourceLower) || false;

    if (isValid) {
        // console.log(`[shouldProcessResource] VALID: "${resourceLower}" is a valid table for model "${modelLower}"`);
    } else {
        // console.log(`[shouldProcessResource] INVALID: "${resourceLower}" is NOT a valid table for model "${modelLower}"`);

        if (!validTables[modelLower]) {
            // console.log(`[shouldProcessResource] ERROR: No valid tables defined for model "${modelLower}"`);
        }
    }

    return isValid;
};

const enumFields: { [key: string]: string[] } = {
    site: [
        'siteClassification',
        'priceCategory',
        'linkAttribute',
        'websiteStatus',
        'websiteQuality',
        'pureCategory',
        'websiteType',
        'availability'
    ],
    vendor: ['VendorCategory'],
    client: [],
    order: ['orderStatus', 'vendorInvoiceStatus', 'vendorPaymentStatus', 'clientPaymentStatus'],
};

const isStringType = (value: any): boolean => {
    return typeof value === 'string';
};

const isDateType = (value: any): boolean => {
    if (value instanceof Date) return true;
    if (typeof value === 'string') {
        const date = new Date(value);
        return !isNaN(date.getTime()) &&
            /^\d{4}-\d{2}-\d{2}([T ].*)?$/.test(value);
    }
    return false;
};

const isEnumField = (model: string, field: string): boolean => {
    const modelLower = model.toLowerCase();
    return enumFields[modelLower]?.includes(field) || false;
};

const isTextBasedOperator = (operator: string): boolean => {
    return ['contains', 'startsWith', 'endsWith'].includes(operator);
};

export const primaryQueryBuilder = (model: string, resources: string[]): QueryObject => {
    const modelLower = model.toLowerCase();
    let baseQuery: QueryObject;
    switch (modelLower) {
        case 'client':
        case 'vendor':
            baseQuery = {
                select: {
                    poc: {
                        select: {
                            id: true,
                        }
                    }
                },
                where: {
                  
                },
                orderBy: {},
            };
            break;
        case 'site':
            baseQuery = {
                select: {
                    poc: {
                        select: {
                            id: true,
                        }
                    },
                    vendor: {
                        select: {
                            id: true,
                        }
                    },
                    categories: {
                        select: {
                            id: true,
                            category: true
                        }
                    }
                },
                where: {
                 
                },
                orderBy: {},
            };
            break;
        case 'order':
            baseQuery = {
                select: {
                    client: {
                        select: {
                            id: true,
                        }
                    },
                    site: {
                        select: {
                            vendor: {
                                select: {
                                    id: true,
                                }
                            },
                            categories: {
                                select: {
                                    id: true,
                                    category: true
                                }
                            }
                        }
                    },
                    salesPerson: {
                        select: {
                            id: true,
                        }
                    }
                },
                where: {
       
                },
                orderBy: {},
            };
            break;
        default:
            // console.log(`[primaryQueryBuilder] Unknown model "${model}", defaulting to client structure`);
            baseQuery = {
                select: {},
                where: {
             
                },
                orderBy: {},
            };
    }

    resources.forEach(resource => {
        const { table, column } = getTableAndColumn(resource);
        // console.log(`[primaryQueryBuilder] Processing resource: ${resource}, table: ${table}, column: ${column}`);
        if (!shouldProcessResource(model, table)) {
            
            return;
        }
        if (table === modelLower) {
            baseQuery.select[column] = true;
        } else {
            switch (modelLower) {
                case 'client':
                    if (table === 'poc') {
                        baseQuery.select.poc.select[column] = true;
                    }
                    break;
                case 'vendor':
                    if (table === 'poc') {
                        baseQuery.select.poc.select[column] = true;
                    }
                    break;
                case 'site':
                    if (table === 'vendor') {
                        if (!baseQuery.select.vendor) {
                            baseQuery.select.vendor = { select: {} };
                        }
                        baseQuery.select.vendor.select[column] = true;
                    } else if (table === 'poc') {
                        baseQuery.select.poc.select[column] = true;
                    }
                    break;
                case 'order':
                    if (table === 'client') {
                        if (!baseQuery.select.client) {
                            baseQuery.select.client = { select: {} };
                        }
                        baseQuery.select.client.select[column] = true;
                    } else if (table === 'site') {
                        if (!baseQuery.select.site) {
                            baseQuery.select.site = { select: {} };
                        }
                        baseQuery.select.site.select[column] = true;
                    } else if (table === 'vendor') {
                        if (!baseQuery.select.site) {
                            baseQuery.select.site = { select: {} };
                        }
                        if (!baseQuery.select.site.select.vendor) {
                            baseQuery.select.site.select.vendor = { select: {} };
                        }
                        baseQuery.select.site.select.vendor.select[column] = true;
                    } else if (table === 'salesperson') {
                        // console.log(`[primaryQueryBuilder] Adding salesPerson to select`);
                        baseQuery.select.salesPerson.select[column] = true;
                    }
                    break;
            }
        }
    });

    return baseQuery;
};

function removeNestedField(obj: any, path: string[]): void {
    if (!obj || path.length === 0) return;

    let current = obj;
    for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) {
            return;
        }
        current = current[path[i]];
    }

    const lastKey = path[path.length - 1];
    if (current && current.hasOwnProperty(lastKey)) {
        delete current[lastKey];
    }
}

const excludeColumnsFromSelect = (baseSelect: any, excludeColumns: string[], model: string): any => {
    let newSelect = JSON.parse(JSON.stringify(baseSelect));
    const modelLower = model.toLowerCase();

    excludeColumns.forEach(col => {
        const { table, column } = getTableAndColumn(col);

        if (table === modelLower) {
            if (newSelect.hasOwnProperty(column)) {
                delete newSelect[column];
            }
        } else {
            switch (modelLower) {
                case 'client':
                case 'vendor':
                    if (table === 'poc' && newSelect.poc && newSelect.poc.select) {
                        removeNestedField(newSelect.poc.select, [column]);
                    }
                    break;
                case 'site':
                    if (table === 'vendor' && newSelect.vendor && newSelect.vendor.select) {
                        removeNestedField(newSelect.vendor.select, [column]);
                    } else if (table === 'poc' && newSelect.poc && newSelect.poc.select) {
                        removeNestedField(newSelect.poc.select, [column]);
                    }
                    break;
                case 'order':
                    if (table === 'client' && newSelect.client && newSelect.client.select) {
                        removeNestedField(newSelect.client.select, [column]);
                    } else if (table === 'site' && newSelect.site && newSelect.site.select) {
                        removeNestedField(newSelect.site.select, [column]);
                    } else if (table === 'vendor' && newSelect.site && newSelect.site.select &&
                        newSelect.site.select.vendor && newSelect.site.select.vendor.select) {
                        removeNestedField(newSelect.site.select.vendor.select, [column]);
                    } else if (table === 'salesperson' && newSelect.salesPerson && newSelect.salesPerson.select) {
                        removeNestedField(newSelect.salesPerson.select, [column]);
                    }
                    break;
            }
        }
    });

    return newSelect;
};

const buildWhereCondition = (filter: { column: string; operator: string; value: any }, model: string): any => {
    const { table, column } = getTableAndColumn(filter.column);
    const operator = filter.operator || 'equals';
    const modelLower = model.toLowerCase();

    // Map negation operators to their positive counterparts
    const negationOperatorMap: { [key: string]: string } = {
        notEquals: 'equals',
        notContains: 'contains',
        notStartsWith: 'startsWith',
        notEndsWith: 'endsWith',
        notIn: 'in',
        notGte: 'gte',
        notLte: 'lte',
        notGt: 'gt',
        notLt: 'lt',
        notSome: 'some',
    };

    const isNegation = Object.keys(negationOperatorMap).includes(operator);
    const baseOperator = isNegation ? negationOperatorMap[operator] : operator;

    // Helper to wrap condition in NOT
    const wrapInNot = (condition: any) => isNegation ? { NOT: condition } : condition;

    // Handle 'name' column (case-insensitive for strings)
    if (column === 'name') {
        const condition = (isTextBasedOperator(baseOperator) || (baseOperator === 'equals' && isStringType(filter.value)) && !isDateType(filter.value))
            ? { name: { [baseOperator]: filter.value, mode: 'insensitive' } }
            : { name: { [baseOperator]: filter.value } };

        if (table === modelLower) {
            return wrapInNot({ name: condition.name });
        } else if (modelLower === 'order' && table === 'salesperson') {
            return wrapInNot({ salesPerson: condition });
        } else if (table === 'poc') {
            return wrapInNot({ poc: condition });
        }
    }

    // Handle 'categories' (array fields)
    if (column === 'categories') {
        const idArray = filter.value.map((cat: any) => cat.id);
        const condition = {
            categories: {
                some: {
                    id: {
                        in: idArray,
                    }
                }
            }
        };

        if (table === modelLower) {
            return wrapInNot(condition);
        } else if (modelLower === 'order' && table === 'site') {
            return wrapInNot({ site: condition });
        } else if (modelLower === 'site' && table === 'vendor') {
            return wrapInNot({ vendor: condition });
        }
    }

    // Handle null checks
    if (baseOperator === 'isNull') {
        const condition = { [column]: null };
        if (table === modelLower) {
            return condition;
        } else {
            switch (modelLower) {
                case 'site':
                    return table === 'vendor' ? { vendor: condition } : {};
                case 'order':
                    if (table === 'client') return { client: condition };
                    if (table === 'site') return { site: condition };
                    if (table === 'vendor') return { site: { vendor: condition } };
                    return {};
                default:
                    return {};
            }
        }
    }

    if (baseOperator === 'isNotNull') {
        const condition = { NOT: { [column]: null } };
        if (table === modelLower) {
            return condition;
        } else {
            switch (modelLower) {
                case 'site':
                    return table === 'vendor' ? { vendor: condition } : {};
                case 'order':
                    if (table === 'client') return { client: condition };
                    if (table === 'site') return { site: condition };
                    if (table === 'vendor') return { site: { vendor: condition } };
                    return {};
                default:
                    return {};
            }
        }
    }

    // Handle 'between' (no negation support, as it's range-based)
    if (baseOperator === 'between' && Array.isArray(filter.value)) {
        return {
            [table === modelLower ? column : table]: {
                gte: filter.value[0],
                lte: filter.value[1],
            },
        };
    }

    // Handle 'hasSome'
    if (baseOperator === 'hasSome' && Array.isArray(filter.value)) {
        return wrapInNot({
            [table === modelLower ? column : table]: {
                hasSome: filter.value,
            },
        });
    }

    // Handle 'isEmpty'
    if (baseOperator === 'isEmpty') {
        return {
            [table === modelLower ? column : table]: {
                isEmpty: true,
            },
        };
    }

    // Handle standard operators
    const isEnum = isEnumField(table, column);
    const operatorConfig = (isTextBasedOperator(baseOperator) || (baseOperator === 'equals' && isStringType(filter.value) && !isEnum && !isDateType(filter.value)))
        ? { [baseOperator]: filter.value, mode: 'insensitive' }
        : { [baseOperator]: filter.value };

    if (table === modelLower) {
        return wrapInNot({
            [column]: operatorConfig,
        });
    }

    switch (modelLower) {
        case 'site':
            if (table === 'vendor') {
                return wrapInNot({
                    vendor: {
                        [column]: operatorConfig,
                    },
                });
            }
            break;
        case 'order':
            if (table === 'client') {
                return wrapInNot({
                    client: {
                        [column]: operatorConfig,
                    },
                });
            } else if (table === 'site') {
                return wrapInNot({
                    site: {
                        [column]: operatorConfig,
                    },
                });
            } else if (table === 'vendor') {
                return wrapInNot({
                    site: {
                        vendor: {
                            [column]: operatorConfig,
                        },
                    },
                });
            }
            break;
    }

    return {};
};

// const buildWhereCondition = (filter: { column: string; operator: string; value: any }, model: string): any => {
//     const { table, column } = getTableAndColumn(filter.column);
//     const operator = filter.operator || 'equals';
//     const modelLower = model.toLowerCase();

//     if (column === 'name') {
//         const condition = (isTextBasedOperator(operator) || (operator === 'equals' && isStringType(filter.value)) && !isDateType(filter.value))
//             ? { name: { [operator]: filter.value, mode: 'insensitive' } }
//             : { name: { [operator]: filter.value } };

//         if (table === modelLower) {
//             return { name: condition.name };
//         } else if (modelLower === 'order' && table === 'salesperson') {
//             return { salesPerson: condition };
//         } else if (table === 'poc') {
//             return { poc: condition };
//         }
//     }

//     if (column === 'categories') {
//         const idArray = filter.value.map((cat: any) => cat.id);
//         const condition = {
//             categories: {
//                 some: {
//                     id: {
//                         in: idArray,
//                     }
//                 }
//             }
//         };

//         if (table === modelLower) {
//             return condition;
//         } else if (modelLower === 'order' && table === 'site') {
//             return { site: condition };
//         } else if (modelLower === 'site' && table === 'vendor') {
//             return { vendor: condition };
//         }
//     }

//     if (operator === 'isNull') {
//         const condition = { [column]: null };

//         if (table === modelLower) {
//             return condition;
//         } else {
//             switch (modelLower) {
//                 case 'site':
//                     return table === 'vendor' ? { vendor: condition } : {};
//                 case 'order':
//                     if (table === 'client') return { client: condition };
//                     if (table === 'site') return { site: condition };
//                     if (table === 'vendor') return { site: { vendor: condition } };
//                     return {};
//                 default:
//                     return {};
//             }
//         }
//     }

//     if (operator === 'isNotNull') {
//         const condition = { NOT: { [column]: null } };
//         if (table === modelLower) {
//             return condition;
//         } else {
//             switch (modelLower) {
//                 case 'site':
//                     return table === 'vendor' ? { vendor: condition } : {};
//                 case 'order':
//                     if (table === 'client') return { client: condition };
//                     if (table === 'site') return { site: condition };
//                     if (table === 'vendor') return { site: { vendor: condition } };
//                     return {};
//                 default:
//                     return {};
//             }
//         }
//     }

//     if (operator === 'between' && Array.isArray(filter.value)) {
//         return {
//             [table === modelLower ? column : table]: {
//                 gte: filter.value[0],
//                 lte: filter.value[1],
//             },
//         };
//     }

//     if (operator === 'hasSome' && Array.isArray(filter.value)) {
//         return {
//             [table === modelLower ? column : table]: {
//                 hasSome: filter.value,
//             },
//         };
//     }

//     if (operator === 'isEmpty') {
//         return {
//             [table === modelLower ? column : table]: {
//                 isEmpty: true,
//             },
//         };
//     }

//     const isEnum = isEnumField(table, column);
//     const operatorConfig = (isTextBasedOperator(operator) || (operator === 'equals' && isStringType(filter.value) && !isEnum && !isDateType(filter.value)))
//         ? { [operator]: filter.value, mode: 'insensitive' }
//         : { [operator]: filter.value };

//     if (table === modelLower) {
//         return {
//             [column]: operatorConfig,
//         };
//     }

//     switch (modelLower) {
//         case 'site':
//             if (table === 'vendor') {
//                 return {
//                     vendor: {
//                         [column]: operatorConfig,
//                     },
//                 };
//             }
//             break;
//         case 'order':
//             if (table === 'client') {
//                 return {
//                     client: {
//                         [column]: operatorConfig,
//                     },
//                 };
//             } else if (table === 'site') {
//                 return {
//                     site: {
//                         [column]: operatorConfig,
//                     },
//                 };
//             } else if (table === 'vendor') {
//                 return {
//                     site: {
//                         vendor: {
//                             [column]: operatorConfig,
//                         },
//                     },
//                 };
//             }
//             break;
//     }

//     return {};
// };

type SortDirection = 'asc' | 'desc';
type SortConfig = { [key: string]: SortDirection } | Array<{ [key: string]: SortDirection }>;

const buildOrderByClause = (sort: SortConfig, model: string) => {
    let orderBy: any[] = [];
    const modelLower = model.toLowerCase();

    const sortEntries = Array.isArray(sort)
        ? Object.entries(sort[0] || {})
        : Object.entries(sort || {});

    sortEntries.forEach(([field, direction]) => {
        const { table, column } = getTableAndColumn(field);

        if (column === 'name') {
            if (table === modelLower) {
                orderBy.push({ name: direction });
            } else if (modelLower === 'order' && table === 'salesPerson') {
                orderBy.push({ salesPerson: { name: direction } });
            } else if (table === 'poc') {
                orderBy.push({ poc: { name: direction } });
            }
        } else if (table === modelLower) {
            orderBy.push({ [column]: direction });
        } else {
            switch (modelLower) {
                case 'site':
                    if (table === 'vendor') {
                        orderBy.push({
                            vendor: { [column]: direction }
                        });
                    }
                    break;
                case 'order':
                    if (table === 'client') {
                        orderBy.push({
                            client: { [column]: direction }
                        });
                    } else if (table === 'site') {
                        orderBy.push({
                            site: { [column]: direction }
                        });
                    } else if (table === 'vendor') {
                        orderBy.push({
                            site: {
                                vendor: { [column]: direction }
                            }
                        });
                    }
                    break;
            }
        }
    });

    return orderBy;
};


export const secondaryQueryBuilder = (
    model: string,
    resources: string[],
    filterConfig: FilterConfig,
    forCount: boolean = false,
    globalFilter?: string
) => {
    let query = primaryQueryBuilder(model, resources);

    if (filterConfig.columns && filterConfig.columns.length > 0) {
        query.select = excludeColumnsFromSelect(query.select, filterConfig.columns, model);
    }

    // Initialize where conditions
    let filterConditions: any[] = [];
    let globalFilterClause: any = null;

    // Handle existing filters
    if (filterConfig.filters && filterConfig.filters.length > 0) {
        filterConditions = filterConfig.filters.map(filter => buildWhereCondition(filter, model));
    }

    // Handle global filter
    if (globalFilter && globalFilter.trim() !== '') {
        const columnTypes = modelInfo.getModelColumns(model);
        const globalFilterValue = globalFilter.trim();
        let globalFilterConditions: any[] = [];

        // Process string columns
        const stringColumns = resources.filter(resource => {
            const { table, column } = getTableAndColumn(resource);
            return (
                shouldProcessResource(model, table) &&
                (columnTypes[resource] === 'String' || columnTypes[resource] === 'String?') &&
                !isEnumField(table, column) &&
                !['id', 'categories'].includes(column)
            );
        });

        if (stringColumns.length > 0) {
            const stringConditions = stringColumns.map(column =>
                buildWhereCondition(
                    { column, operator: 'contains', value: globalFilterValue },
                    model
                )
            );
            globalFilterConditions.push(...stringConditions);
        }

        // Process integer columns - only if filter is a valid number
        const numericValue = Number(globalFilterValue);
        if (!isNaN(numericValue)) {
            const intColumns = resources.filter(resource => {
                const { table, column } = getTableAndColumn(resource);

                return (table === 'order') ? (
                    shouldProcessResource(model, table) &&
                    (columnTypes[resource] === 'Int' || columnTypes[resource] === 'Int?' ||
                        columnTypes[resource] === 'Float' || columnTypes[resource] === 'Float?') &&
                    !['categories'].includes(column)
                ) : (
                    shouldProcessResource(model, table) &&
                    (columnTypes[resource] === 'Int' || columnTypes[resource] === 'Int?' ||
                        columnTypes[resource] === 'Float' || columnTypes[resource] === 'Float?') &&
                    !['id', 'categories'].includes(column)
                )
            });

            if (intColumns.length > 0) {
                const numericConditions = intColumns.map(column =>
                    buildWhereCondition(
                        { column, operator: 'equals', value: numericValue },
                        model
                    )
                );
                globalFilterConditions.push(...numericConditions);
            }
        }

        // Only create the OR clause if we have conditions
        if (globalFilterConditions.length > 0) {
            globalFilterClause = { OR: globalFilterConditions };
        }
    }

    // Construct the where clause
    if (filterConditions.length > 0 || globalFilterClause) {
        const conditions: any[] = [];

        // Group filter conditions with the connector from filterConfig
        if (filterConditions.length > 0) {
            const connector = filterConfig.connector || 'AND'; // Default to 'AND' if not specified
            conditions.push({ [connector]: filterConditions });
        }

        // Add global filter clause if it exists
        if (globalFilterClause) {
            conditions.push(globalFilterClause);
        }

        // Combine all conditions with AND
        query.where = conditions.length > 0 ? { AND: conditions } : {};
    }

    if (filterConfig.sort) {
        query.orderBy = buildOrderByClause(filterConfig.sort, model);
    }

    if (forCount) {
        delete query.select;
        delete query.orderBy;
    }

    return query;
};

// export const secondaryQueryBuilder = (
//     model: string,
//     resources: string[],
//     filterConfig: FilterConfig,
//     forCount: boolean = false,
//     globalFilter?: string
// ) => {
//     let query = primaryQueryBuilder(model, resources);

//     if (filterConfig.columns && filterConfig.columns.length > 0) {
//         query.select = excludeColumnsFromSelect(query.select, filterConfig.columns, model);
//     }

//     // Initialize where conditions array
//     let whereConditions: any[] = [];

//     // Handle existing filters
//     if (filterConfig.filters && filterConfig.filters.length > 0) {
//         whereConditions = filterConfig.filters.map(filter => buildWhereCondition(filter, model));
//     }

//     // Handle global filter
//     if (globalFilter && globalFilter.trim() !== '') {
//         const columnTypes = modelInfo.getModelColumns(model);
//         const stringColumns = resources.filter(resource => {
//             const { table, column } = getTableAndColumn(resource);
//             // Check if resource is valid and column is a string type
//             return (
//                 shouldProcessResource(model, table) &&
//                 (columnTypes[resource] === 'String' || columnTypes[resource] === 'String?') &&
//                 !isEnumField(table, column) &&
//                 !['id', 'categories'].includes(column)
//             );
//         });

//         if (stringColumns.length > 0) {
//             const globalFilterConditions = stringColumns.map(column =>
//                 buildWhereCondition(
//                     { column, operator: 'contains', value: globalFilter },
//                     model
//                 )
//             );
//             const globalFilterClause = { OR: globalFilterConditions };
//             whereConditions.push(globalFilterClause);
//         }
//     }

//     // Combine all conditions with AND connector
//     if (whereConditions.length > 0) {
//         query.where = { AND: whereConditions };
//     }

//     if (filterConfig.sort) {
//         query.orderBy = buildOrderByClause(filterConfig.sort, model);
//     }

//     if (forCount) {
//         delete query.select;
//         delete query.orderBy;
//     }

//     return query;
// };