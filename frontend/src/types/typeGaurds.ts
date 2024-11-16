// src/utils/typeGuards.ts

import { AvailableColumns, BackendColumnType } from './index';

/**
 * Type guard to validate if an object conforms to the AvailableColumns interface.
 * It trims each type string to remove trailing and leading whitespace and control characters.
 * @param obj - The object to validate.
 * @returns - Boolean indicating whether the object is of type AvailableColumns.
 */
export const isAvailableColumns = (obj: any): obj is AvailableColumns => {
  const validTypes: BackendColumnType[] = ['Int', 'String', 'BigInt', 'DateTime', 'Boolean'];

  if (typeof obj !== 'object' || obj === null) {
    console.error('availableColumns is not an object or is null.');
    return false;
  }

  let allValid = true;

  Object.entries(obj).forEach(([key, type]) => {
    if (typeof type !== 'string') {
      console.error(`Type for column "${key}" is not a string. Received: ${typeof type}`);
      allValid = false;
      return;
    }
    const trimmedType = type.trim() as BackendColumnType;
    if (!validTypes.includes(trimmedType)) {
      console.error(`Invalid type "${trimmedType}" for column "${key}". Expected types: ${validTypes.join(', ')}`);
      allValid = false;
    }
  });

  return allValid;
};

