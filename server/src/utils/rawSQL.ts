// import { QueryObject } from "./queryBuilder";

// export const convertToSQL = (
//   model: string,
//   queryObject: QueryObject,
//   options: { limit?: number; offset?: number } = {}
// ): string => {
//   const tableName = `"${model}"`; // Use exact model name (e.g., "Site"), no pluralization
  
//   let sql = 'SELECT ';
  
//   if (!queryObject.select || Object.keys(queryObject.select).length === 0) {
//     sql += '*';
//   } else {
//     const selectFields: string[] = [];
//     const joinClauses: string[] = [];
    
//     processSelectObject(model, tableName, queryObject.select, selectFields, joinClauses);
    
//     sql += selectFields.join(', ') || '*';
//     sql += ` FROM ${tableName}`;
    
//     if (joinClauses.length > 0) {
//       sql += ' ' + joinClauses.join(' ');
//     }
//   }
  
//   if (queryObject.where && Object.keys(queryObject.where).length > 0) {
//     sql += ' WHERE ' + buildWhereClause(model, tableName, queryObject.where);
//   }
  
//   if (queryObject.orderBy && (Array.isArray(queryObject.orderBy) ? queryObject.orderBy.length > 0 : Object.keys(queryObject.orderBy).length > 0)) {
//     sql += ' ORDER BY ' + buildOrderByClause(model, tableName, queryObject.orderBy);
//   }
  
//   if (options.limit !== undefined) {
//     sql += ` LIMIT ${options.limit}`;
//   }
  
//   if (options.offset !== undefined) {
//     sql += ` OFFSET ${options.offset}`;
//   }
  
//   return sql;
// };


// export const convertToCountSQL = (
//   model: string,
//   queryObject: QueryObject,
//   options: { limit?: number; offset?: number } = {}
// ): string => {
//   const tableName = `"${model}"`; // Use exact model name (e.g., "Site")
  
//   let sql = 'SELECT COUNT(*) AS "count"';
  
//   // We still need JOINs if the WHERE clause references related tables
//   const joinClauses: string[] = [];
  
//   // If there's a select object, process it only to determine necessary JOINs (not for fields)
//   if (queryObject.select && Object.keys(queryObject.select).length > 0) {
//     const dummyFields: string[] = []; // Not used, but required by processSelectObject
//     processSelectObject(model, tableName, queryObject.select, dummyFields, joinClauses);
//   }
  
//   sql += ` FROM ${tableName}`;
  
//   if (joinClauses.length > 0) {
//     sql += ' ' + joinClauses.join(' ');
//   }
  
//   if (queryObject.where && Object.keys(queryObject.where).length > 0) {
//     sql += ' WHERE ' + buildWhereClause(model, tableName, queryObject.where);
//   }
  
//   // No ORDER BY, LIMIT, or OFFSET needed for a count query
//   return sql;
// };

// const processSelectObject = (
//   model: string,
//   baseTableAlias: string, 
//   selectObj: any, 
//   selectFields: string[], 
//   joinClauses: string[],
//   path: string = '',
//   joinedTables: Set<string> = new Set()
// ): void => {
//   for (const [key, value] of Object.entries(selectObj)) {
//     if (value === true) {
//       selectFields.push(`${baseTableAlias}."${key}"`);
//     } else if (typeof value === 'object' && value !== null && 'select' in value) {
//       let relationTableName = key === 'poc' ? '"User"' : `"${key.charAt(0).toUpperCase() + key.slice(1)}"`; // e.g., "Vendor"
//       const relationTableAlias = key;
      
//       const joinKey = `${baseTableAlias}_${relationTableAlias}`;
//       if (!joinedTables.has(joinKey)) {
//         joinedTables.add(joinKey);
        
//         let joinCondition = '';
//         if (model === 'Order' && key === 'salesPerson') {
//           joinCondition = `${baseTableAlias}."salesPersonId" = ${relationTableAlias}."id"`;
//         } else {
//           joinCondition = `${baseTableAlias}."${key}Id" = ${relationTableAlias}."id"`;
//         }
        
//         joinClauses.push(`LEFT JOIN ${relationTableName} AS ${relationTableAlias} ON ${joinCondition}`);
//       }
      
//       if (typeof value.select === 'object' && value.select !== null) {
//         for (const [nestedKey, nestedValue] of Object.entries(value.select)) {
//           if (nestedValue === true) {
//             selectFields.push(`${relationTableAlias}."${nestedKey}" AS "${relationTableAlias}_${nestedKey}"`);
//           }
//         }
//       }
//     }
//   }
// };


// const buildWhereClause = (model: string, baseTableAlias: string, whereObj: any, path: string = ''): string => {
//   if (!whereObj || Object.keys(whereObj).length === 0) {
//     return '1=1';
//   }
  
//   if ('AND' in whereObj) {
//     return `(${whereObj.AND.map((condition: any) => buildWhereClause(model, baseTableAlias, condition, path)).join(' AND ')})`;
//   } else if ('OR' in whereObj) {
//     return `(${whereObj.OR.map((condition: any) => buildWhereClause(model, baseTableAlias, condition, path)).join(' OR ')})`;
//   } else if ('NOT' in whereObj) {
//     return `NOT (${buildWhereClause(model, baseTableAlias, whereObj.NOT, path)})`;
//   }
  
//   const conditions: string[] = [];
  
//   for (const [key, value] of Object.entries(whereObj)) {
//     if (typeof value === 'object' && value !== null) {
//       if (isRelationObject(value)) {
//         const relationTableAlias = key;
//         conditions.push(buildWhereClause(key, relationTableAlias, value, key));
//       } else {
//         conditions.push(buildFieldCondition(baseTableAlias, key, value));
//       }
//     } else {
//       conditions.push(`${baseTableAlias}."${key}" = ${formatValue(value)}`);
//     }
//   }
  
//   return conditions.join(' AND ');
// };

// const isRelationObject = (obj: any): boolean => {
//   return Object.keys(obj).some(key => 
//     typeof obj[key] === 'object' && obj[key] !== null && 
//     !['contains', 'equals', 'not', 'in', 'notIn', 'lt', 'lte', 'gt', 'gte', 
//       'startsWith', 'endsWith', 'isNull', 'isNotNull', 'mode'].includes(key)
//   );
// };

// const buildFieldCondition = (tableAlias: string, field: string, condition: any): string => {
//   const conditions: string[] = [];
  
//   const isCaseInsensitive = condition.mode === 'insensitive';
  
//   for (const [operator, value] of Object.entries(condition)) {
//     if (operator === 'mode') continue;
    
//     switch (operator) {
//       case 'equals':
//         conditions.push(`${tableAlias}."${field}" = ${formatValue(value)}`);
//         break;
//       case 'not':
//         conditions.push(`${tableAlias}."${field}" <> ${formatValue(value)}`);
//         break;
//       case 'in':
//         conditions.push(`${tableAlias}."${field}" IN (${(value as any[]).map(formatValue).join(', ')})`);
//         break;
//       case 'notIn':
//         conditions.push(`${tableAlias}."${field}" NOT IN (${(value as any[]).map(formatValue).join(', ')})`);
//         break;
//       case 'lt':
//         conditions.push(`${tableAlias}."${field}" < ${formatValue(value)}`);
//         break;
//       case 'lte':
//         conditions.push(`${tableAlias}."${field}" <= ${formatValue(value)}`);
//         break;
//       case 'gt':
//         conditions.push(`${tableAlias}."${field}" > ${formatValue(value)}`);
//         break;
//       case 'gte':
//         conditions.push(`${tableAlias}."${field}" >= ${formatValue(value)}`);
//         break;
//       case 'contains':
//         if (isCaseInsensitive) {
//           conditions.push(`${tableAlias}."${field}" ILIKE ${formatValue(`%${value}%`)}`);
//         } else {
//           conditions.push(`${tableAlias}."${field}" LIKE ${formatValue(`%${value}%`)}`);
//         }
//         break;
//       case 'startsWith':
//         if (isCaseInsensitive) {
//           conditions.push(`${tableAlias}."${field}" ILIKE ${formatValue(`${value}%`)}`);
//         } else {
//           conditions.push(`${tableAlias}."${field}" LIKE ${formatValue(`${value}%`)}`);
//         }
//         break;
//       case 'endsWith':
//         if (isCaseInsensitive) {
//           conditions.push(`${tableAlias}."${field}" ILIKE ${formatValue(`%${value}`)}`);
//         } else {
//           conditions.push(`${tableAlias}."${field}" LIKE ${formatValue(`%${value}`)}`);
//         }
//         break;
//       case 'isNull':
//         conditions.push(`${tableAlias}."${field}" IS NULL`);
//         break;
//       case 'isNotNull':
//         conditions.push(`${tableAlias}."${field}" IS NOT NULL`);
//         break;
//       default:
//         conditions.push(`${tableAlias}."${field}" ${operator} ${formatValue(value)}`);
//     }
//   }
  
//   return conditions.join(' AND ');
// };

// const buildOrderByClause = (model: string, baseTableAlias: string, orderByObj: any): string => {
//   const orders: string[] = [];
  
//   if (Array.isArray(orderByObj)) {
//     for (const orderItem of orderByObj) {
//       for (const [field, direction] of Object.entries(orderItem)) {
//         if (typeof direction === 'object' && direction !== null) {
//           for (const [nestedField, nestedDirection] of Object.entries(direction)) {
//             orders.push(`${field}."${nestedField}" ${nestedDirection}`);
//           }
//         } else {
//           orders.push(`${baseTableAlias}."${field}" ${direction}`);
//         }
//       }
//     }
//   } else {
//     for (const [field, direction] of Object.entries(orderByObj)) {
//       if (typeof direction === 'object' && direction !== null) {
//         for (const [nestedField, nestedDirection] of Object.entries(direction)) {
//           orders.push(`${field}."${nestedField}" ${nestedDirection}`);
//         }
//       } else {
//         orders.push(`${baseTableAlias}."${field}" ${direction}`);
//       }
//     }
//   }
  
//   return orders.join(', ') || '1';
// };

// const formatValue = (value: any): string => {
//   if (value === null) return 'NULL';
//   if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
//   if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
//   if (value instanceof Date) return `'${value.toISOString()}'`;
//   return String(value);
// };