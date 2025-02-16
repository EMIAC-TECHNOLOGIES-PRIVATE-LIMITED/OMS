import { FilterConfig } from "@shared/types";

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
    const modelLower = model.toLowerCase();
    const validTables: { [key: string]: string[] } = {
        client: ['client'],
        vendor: ['vendor'],
        site: ['site', 'vendor'],
        order: ['order', 'client', 'site', 'vendor'],
    };
    const resourceLower = resourceTable.toLowerCase();
    return validTables[modelLower]?.includes(resourceLower) || false;
};

export const primaryQueryBuilder = (model: string, resources: string[]): QueryObject => {
    const modelLower = model.toLowerCase();
    let baseQuery: QueryObject;
    switch (modelLower) {
        case 'client':
        case 'vendor':
            baseQuery = {
                select: {},
                where: {},
                orderBy: {},
               
            };
            break;
        case 'site':
            baseQuery = {
                select: {
                    vendor: { select: {} }
                },
                where: {},
                orderBy: {},
              
            };
            break;
        case 'order':
            baseQuery = {
                select: {
                    client: { select: {} },
                    site: {
                        select: {
                            vendor: { select: {} }
                        }
                    }
                },
                where: {},
                orderBy: {},
               
            };
            break;
        default:
            console.log(`[primaryQueryBuilder] Unknown model "${model}", defaulting to client structure`);
            baseQuery = {
                select: {},
                where: {},
                orderBy: {},
             
            };
    }

    resources.forEach(resource => {
        const { table, column } = getTableAndColumn(resource);
        if (!shouldProcessResource(model, table)) {
            return;
        }
        if (table === modelLower) {
            baseQuery.select[column] = true;
        } else {
            switch (modelLower) {
                case 'site':
                    if (table === 'vendor') {
                        if (!baseQuery.select.vendor) {
                            baseQuery.select.vendor = { select: {} };
                        }
                        baseQuery.select.vendor.select[column] = true;
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
                    }
                    break;
            }
        }
    });

    return baseQuery;
};

function removeNestedField(obj: any, path: string[]): void {
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
                case 'site':
                    if (table === 'vendor' && newSelect.vendor && newSelect.vendor.select) {
                        removeNestedField(newSelect.vendor.select, [column]);
                    }
                    break;
                case 'order':
                    if (table === 'client' && newSelect.client && newSelect.client.select) {
                        removeNestedField(newSelect.client.select, [column]);
                    } else if (table === 'site' && newSelect.site && newSelect.site.select) {
                        removeNestedField(newSelect.site.select, [column]);
                    } else if (table === 'vendor' && newSelect.site && newSelect.site.select && newSelect.site.select.vendor && newSelect.site.select.vendor.select) {
                        removeNestedField(newSelect.site.select.vendor.select, [column]);
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

    if (operator === 'between' && Array.isArray(filter.value)) {
        return {
            [table === modelLower ? column : table]: {
                gte: filter.value[0],
                lte: filter.value[1],
            },
        };
    }

    if (table === modelLower) {
        return {
            [column]: {
                [operator]: filter.value,
            },
        };
    }

    switch (modelLower) {
        case 'site':
            if (table === 'vendor') {
                return {
                    vendor: {
                        [column]: {
                            [operator]: filter.value,
                        },
                    },
                };
            }
            break;
        case 'order':
            if (table === 'client') {
                return {
                    client: {
                        [column]: {
                            [operator]: filter.value,
                        },
                    },
                };
            } else if (table === 'site') {
                return {
                    site: {
                        [column]: {
                            [operator]: filter.value,
                        },
                    },
                };
            } else if (table === 'vendor') {
                return {
                    site: {
                        vendor: {
                            [column]: {
                                [operator]: filter.value,
                            },
                        },
                    },
                };
            }
            break;
    }

    return {};
};

type SortDirection = 'asc' | 'desc';
type SortConfig = { [key: string]: SortDirection } | Array<{ [key: string]: SortDirection }>;

const buildOrderByClause = (sort: SortConfig, model: string) => {
    let orderBy: any[] = []; // Change to array
    const modelLower = model.toLowerCase();

    // Handle both array and object input formats
    const sortEntries = Array.isArray(sort)
        ? Object.entries(sort[0] || {})
        : Object.entries(sort || {});

    sortEntries.forEach(([field, direction]) => {
        const { table, column } = getTableAndColumn(field);

        if (table === modelLower) {
            // Push as individual order condition
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
    forCount: boolean = false
) => {
    let query = primaryQueryBuilder(model, resources);

    if (filterConfig.columns && filterConfig.columns.length > 0) {
        query.select = excludeColumnsFromSelect(query.select, filterConfig.columns, model);
    }

    if (filterConfig.filters && filterConfig.filters.length > 0) {
        const whereConditions = filterConfig.filters.map(filter => buildWhereCondition(filter, model));
        query.where = { [filterConfig.connector || 'AND']: whereConditions };
    }

    if (filterConfig.sort) {
        // console.log('[secondary query buiilder] : inside the if block for sorting')
        query.orderBy = buildOrderByClause(filterConfig.sort, model);
    }

    if (forCount) {
        delete query.select;
        delete query.orderBy;
    }

    return query;
};
