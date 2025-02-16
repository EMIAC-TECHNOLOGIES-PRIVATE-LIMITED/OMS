import React, { useMemo } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-theme-alpine.css";


ModuleRegistry.registerModules([AllCommunityModule]);

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ columns = 15, rows = 22}) => {
  // Include an extra column as in the original skeleton.
  const totalColumns = columns + 1;

  // Create simple column definitions with fixed widths.
  const columnDefs: ColDef[] = useMemo(() => {
    const defs: ColDef[] = [];
    for (let i = 0; i < totalColumns; i++) {
      defs.push({
        field: `col_${i}`,
        width: i === 0 ? 100 : 150,
        
        cellRenderer: () => (
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
        ),
        // Simple header renderer returning a pulse div for the header
        headerComponent: () => (
          <div className="h-6 bg-gray-400 rounded animate-pulse" />
        ),
      });
    }
    return defs;
  }, [totalColumns]);

  // Generate dummy row data.
  const rowData = useMemo(() => {
    return Array.from({ length: rows }, () => {
      const row: Record<string, string> = {};
      for (let i = 0; i < totalColumns; i++) {
        row[`col_${i}`] = ""; // No actual data, just a placeholder.
      }
      return row;
    });
  }, [rows, totalColumns]);

  return (
    <div className="w-full h-full overflow-auto">
      <div className="ag-theme-alpine" style={{ height: "87%", width: "100%" }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          headerHeight={40}
          rowHeight={40}
          defaultColDef={{
            resizable: false,
            sortable: false,
            filter: false,
          }}
          suppressMovableColumns
        />
      </div>
    </div>
  );
};

export default TableSkeleton;
