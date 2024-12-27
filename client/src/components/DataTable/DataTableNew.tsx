import React from 'react';
import { Spinner } from '../UI/index'; 

interface DataTableNewProps {
  data: Record<string, any>[];
  loading: boolean;
  error: string | null;
}

const DataTableNew: React.FC<DataTableNewProps> = ({ data, loading, error }) => {
  if (loading) return <Spinner imagePath="./image.png" />;
  if (error) return <p className="text-red-500 font-medium">{error}</p>;

  const displayColumns: string[] = React.useMemo(() => {
    return data.length > 0 ? Object.keys(data[0]) : [];
  }, [data]);

  const formatHeader = (header: string) =>
    header.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());

  // Helper function to render cell content
  const renderCellContent = (content: any) => {
    if (typeof content === 'object' && content !== null) {
      return JSON.stringify(content);
      // Alternatively, extract a specific property:
      // return content.name || 'N/A';
    }
    return content ?? '--';
  };

  return (
    <div className="relative w-full h-full">
      <div className="w-full h-full overflow-auto">
        <table className="min-w-full w-full h-full border border-neutral-200 rounded-lg relative z-10">
          <thead className="bg-neutral-200 sticky top-0">
            <tr>
              {displayColumns.map(column => (
                <th
                  key={column}
                  className="py-3 px-6 border-b border-neutral-200 text-left text-sm font-semibold text-neutral-700 bg-neutral-200"
                >
                  {formatHeader(column)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-transparent">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 transition-colors duration-300">
                {displayColumns.map(column => (
                  <td
                    key={column}
                    className="py-3 px-6 border-b border-neutral-200 text-sm text-neutral-800 bg-transparent"
                  >
                    {renderCellContent(row[column])}
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

export default DataTableNew;
