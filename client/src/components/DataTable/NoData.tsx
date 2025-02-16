import React from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-theme-alpine.css";

import { Search, Filter } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Register the required modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface NoDataTableProps {
  hasFilters?: boolean;
}

// This is the custom overlay that ag‑grid will render when there are no rows.
interface NoRowsOverlayParams {
  hasFilters: boolean;
}
const NoRowsOverlay: React.FC<NoRowsOverlayParams> = ({ hasFilters }) => {
  return (
    <div
      className="flex flex-col items-center justify-center space-y-6"
      style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      {hasFilters ? (
        <>
          <div className="relative">
            <Filter className="w-16 h-16 text-slate-300" strokeWidth={1.5} />
            <Search
              className="w-8 h-8 text-slate-400 absolute -bottom-2 -right-2"
              strokeWidth={1.5}
            />
          </div>
          <div className="max-w-md text-center space-y-2">
            <h3 className="text-lg font-medium text-slate-700">
              No Matching Results
            </h3>
            <p className="text-sm text-slate-500">
              Try adjusting your search or filter criteria to find what you're looking for.
            </p>
          </div>
        </>
      ) : (
        <>
          <Search className="w-16 h-16 text-slate-300" strokeWidth={1.5} />
          <div className="max-w-md text-center space-y-2">
            <h3 className="text-lg font-medium text-slate-700">
              No Data Available
            </h3>
            <p className="text-sm text-slate-500">
              There are currently no records in the system. New records will appear here once they are added.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

const NoDataTable: React.FC<NoDataTableProps> = ({ hasFilters = false }) => {
  // Even though we have no data, ag-grid expects column definitions.
  // We supply an empty column definitions array. The grid will show the overlay.
  const columnDefs: ColDef[] = [];



  return (
    <Card className="w-screen border-slate-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-slate-800">
          No Records Found
        </CardTitle>
        <CardDescription className="text-slate-500">
          {hasFilters
            ? "No data matches your current filter criteria."
            : "No records are currently available in the system."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Wrap the grid in a div with the ag-theme class and a fixed height */}
        <div className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
          <AgGridReact
            rowData={[]} // No data provided
            columnDefs={columnDefs}
            // Use our custom overlay component.
            noRowsOverlayComponent={NoRowsOverlay}
            noRowsOverlayComponentParams={{ hasFilters }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default NoDataTable;
