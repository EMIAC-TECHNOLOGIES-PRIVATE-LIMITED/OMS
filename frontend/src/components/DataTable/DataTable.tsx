// src/components/DataTableRecoil/DataTableRecoil.tsx

import React from 'react';
import { useRecoilValue } from 'recoil';
import {
  dataState,
  availableColumnsState,
  loadingState,
  errorState,
  currentFilterConfigState,
} from '../../store/atoms/atoms'; 
import { FrontendAvailableColumns, FilterConfig } from '../../types';
import { Spinner } from '../UI';

interface DataTableProps {
  resource: string; 
}

const DataTable: React.FC<DataTableProps> = ({ resource }) => {
  // Recoil State Access
  const data = useRecoilValue<Record<string, any>[]>(dataState(resource));
  const availableColumns = useRecoilValue<FrontendAvailableColumns>(
    availableColumnsState(resource)
  );
  const loading = useRecoilValue<boolean>(loadingState(resource));
  const error = useRecoilValue<string | null>(errorState(resource));
  const currentFilterConfig = useRecoilValue<FilterConfig | null>(
    currentFilterConfigState(resource)
  );

  // Determine columns to display
  const columns: string[] = React.useMemo(() => {
    if (
      currentFilterConfig &&
      currentFilterConfig.columns &&
      currentFilterConfig.columns.length > 0
    ) {
      return currentFilterConfig.columns;
    }
    return Object.keys(availableColumns);
  }, [currentFilterConfig, availableColumns]);

  // Render Loading Spinner
  if (loading) {
    return <Spinner imagePath="./image.png" />;
  }

  // Render Error Message
  if (error) {
    return <p className="text-red-500 font-medium">{error}</p>;
  }

  return (
    <div className="relative w-full h-full">
      {/* Table Container with Full Size and Scrollbars */}
      <div className="w-full h-full overflow-auto">
        <table className="min-w-full w-full h-full border border-neutral-200 rounded-lg relative z-10">
          <thead className="bg-neutral-200 sticky top-0">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="py-3 px-6 border-b border-neutral-200 text-left text-sm font-semibold text-neutral-700 bg-neutral-200"
                >
                  {availableColumns[column]?.label || column.replace(/_/g, ' ')} {/* Format header */}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-transparent">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-transparent transition-colors duration-300"
              >
                {columns.map((column) => (
                  <td
                    key={column}
                    className="py-3 px-6 border-b border-neutral-200 text-sm text-neutral-800 bg-transparent"
                  >
                    {row[column] !== undefined && row[column] !== null
                      ? row[column]
                      : '--'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
