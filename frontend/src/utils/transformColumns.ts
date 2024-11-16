import { BackendAvailableColumns, FrontendAvailableColumns, BackendColumnType } from '../types';

export function transformAvailableColumns(
  backendColumns: BackendAvailableColumns
): FrontendAvailableColumns {
  const frontendColumns: FrontendAvailableColumns = {};
  for (const [key, type] of Object.entries(backendColumns)) {
    frontendColumns[key] = {
      label: key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      type: type as BackendColumnType,
    };
  }
  return frontendColumns;
}
