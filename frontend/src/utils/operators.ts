import { FrontendColumnType } from '../types';

// Function to get operators based on column type
export const getOperators = (
  type: FrontendColumnType
): { value: string; label: string }[] => {
  const baseOperators = (() => {
    switch (type) {
      case 'number':
        return [
          { value: 'lt', label: 'Less Than' },
          { value: 'lte', label: 'Less Than or Equal' },
          { value: 'gt', label: 'Greater Than' },
          { value: 'gte', label: 'Greater Than or Equal' },
          { value: 'equals', label: 'Equals' },
        ];
      case 'string':
        return [
          { value: 'contains', label: 'Contains' },
          { value: 'startsWith', label: 'Starts With' },
          { value: 'endsWith', label: 'Ends With' },
          { value: 'equals', label: 'Equals' },
        ];
      case 'boolean':
        return [{ value: 'equals', label: 'Equals' }];
      case 'date':
        return [
          { value: 'lt', label: 'Before' },
          { value: 'gt', label: 'After' },
          { value: 'gte', label: 'On' },
        ];
      default:
        return [];
    }
  })();

  // Add empty/not empty operators for all types
  return [
    ...baseOperators,
    { value: 'isNull', label: 'Is Empty' },
    { value: 'isNotNull', label: 'Is Not Empty' },
  ];
};
