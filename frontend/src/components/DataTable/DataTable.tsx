// src/components/DataTable/DataTable.tsx

import React from 'react';
import { FrontendAvailableColumns } from '../../types';
import { Spinner } from '../UI';

interface DataTableProps {
    data: Record<string, any>[];
    availableColumns: FrontendAvailableColumns;
    loading: boolean;
    error: string | null;
    totalRecords: number;
    selectedColumns?: string[];
}

const DataTable: React.FC<DataTableProps> = ({ data, availableColumns, loading, error, totalRecords, selectedColumns }) => {
    const columns = selectedColumns || Object.keys(availableColumns);

    if (loading) {
        return <Spinner imagePath='./image.png' />
    }

    if (error) {
        return <p className="text-red-500 font-medium">{error}</p>;
    }

    return (
        <>
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
                                        {column.replace(/_/g, ' ')} {/* Format header */}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-transparent">
                            {data.map((row, rowIndex) => (
                                <tr key={rowIndex} className="hover:bg-transparent transition-colors duration-300">
                                    {columns.map((column) => (
                                        <td
                                            key={column}
                                            className="py-3 px-6 border-b border-neutral-200 text-sm text-neutral-800 bg-transparent"
                                        >
                                            {row[column] !== undefined && row[column] !== null ? row[column] : '--'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default DataTable;
