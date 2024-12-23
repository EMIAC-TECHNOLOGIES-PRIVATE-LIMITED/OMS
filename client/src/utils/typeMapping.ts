import { BackendColumnType, FrontendColumnType } from '../types';

// Utility function to map backend types to frontend types
export const mapBackendToFrontendType = (
  backendType: BackendColumnType
): FrontendColumnType => {
  switch (backendType) {
    case 'Int':
    case 'BigInt':
      return 'number';
    case 'String':
      return 'string';
    case 'Boolean':
      return 'boolean';
    case 'DateTime':
      return 'date';
    default:
      console.warn(`Unknown backend type "${backendType}". Defaulting to "string".`);
      return 'string';
  }
};
