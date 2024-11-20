import React from 'react';
import { FrontendAvailableColumns } from '../../types';

interface DataTableProps {
    data: Record<string, any>[];
    availableColumns: FrontendAvailableColumns
    loading: boolean;
    error: string | null;
    totalRecords: number
    selectedColumns?: string[];
}

const DataTable: React.FC<DataTableProps> = ({ data, availableColumns, loading, error, totalRecords, selectedColumns }) => {
    const columns = selectedColumns || Object.keys(availableColumns);

    if (loading) {
        return <p className='text-green-400'>Loading data...</p>;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    return (<>
        <div className='text-right italic'>
            Fetched {totalRecords} records.
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column}
                                className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700"
                            >
                                {column.replace(/_/g, ' ')} {/* Format header */}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-gray-50">
                            {columns.map((column) => (
                                <td
                                    key={column}
                                    className="py-2 px-4 border-b border-gray-200 text-sm text-gray-800"
                                >
                                    {row[column] || '--'}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </>

    );
};

export default DataTable;
