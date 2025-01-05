
import { Spinner } from '../UI'; 

interface Column<T> {
  header: string;
  accessor: keyof T;
}

interface AdminDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading: boolean;
  error: string | null;
  onRowClick: (row: T) => void;

}

const AdminDataTable = <T extends Record<string, any>>({
  columns,
  data,
  loading,
  error,
  onRowClick,
}: AdminDataTableProps<T>) => {
  const formatHeader = (header: string) =>
    header.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

  const renderCellContent = (content: any) => {
    if (typeof content === 'boolean') {
      return content ? 'Yes' : 'No';
    }
    return content ?? '--';
  };

  return (
    
    <div className="relative w-full h-full">
      {/* Loader */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <Spinner imagePath="/image.png" />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute top-4 left-4 bg-red-100 text-red-700 px-4 py-2 rounded-md shadow-lg z-20">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="w-full h-full overflow-auto">
        <table className="min-w-full w-full h-full border border-neutral-200 rounded-lg relative z-10">
          <thead className="bg-neutral-200 sticky top-0">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.accessor)}
                  className="py-3 px-6 border-b border-neutral-200 text-left text-sm font-semibold text-neutral-700 bg-neutral-200"
                >
                  {formatHeader(column.header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-transparent">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-gray-50 transition-colors duration-300 cursor-pointer"
                onClick={() => onRowClick(row)}
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onRowClick(row);
                  }
                }}
                aria-label={`Edit row ${rowIndex + 1}`}
              >
                {columns.map((column) => (
                  <td
                    key={String(column.accessor)}
                    className="py-3 px-6 border-b border-neutral-200 text-sm text-neutral-800 bg-transparent"
                  >
                    {renderCellContent(row[column.accessor])}
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

export default AdminDataTable;
