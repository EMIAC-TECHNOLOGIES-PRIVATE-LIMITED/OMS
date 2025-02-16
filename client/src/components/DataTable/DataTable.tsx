import { AllCommunityModule, ModuleRegistry, themeQuartz, CellKeyDownEvent } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-theme-quartz.css";
import TableSkeleton from "./Skeleton";
import EnumBadge, { getEnumValues, EnumBadgeProps } from "../../utils/EnumUtil/EnumUtil";
import {  deleteData, updateData } from "@/utils/apiService/dataAPI";
import { useToast } from "@/hooks/use-toast";
import { authAtom } from "@/store/atoms/atoms";
import { useRecoilValue } from "recoil";
import NoDataTable from "./NoData";
import {  useMemo, useState } from "react";
import { Fab, Action } from 'react-tiny-fab';
import 'react-tiny-fab/dist/styles.css';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog"
import { FilePlus, Plus } from "lucide-react";
import CreateSheet from "./CreateSheet";




ModuleRegistry.registerModules([AllCommunityModule]);

interface DataGridProps {
  data: Record<string, any>[];
  availableColumnTypes: {
    [key: string]: string;
  };
  loading?: boolean;
  resource: string;
  filteredColumns: string[]
  sortedColumns: string[]
  setProcessing: (value: boolean) => void;
  totalRecords: number | null;
  setTotalRecords: (value: number) => void;
}

const DataGrid: React.FC<DataGridProps> = ({ data, availableColumnTypes, loading, resource, filteredColumns, sortedColumns, setProcessing, totalRecords, setTotalRecords }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRowsForDelete, setSelectedRowsForDelete] = useState<any[]>([]);
  const [gridApi, setGridApi] = useState<any>(null);

  const auth = useRecoilValue(authAtom);
  const { toast } = useToast();

  const [toastVisible, setToastVisible] = useState(false);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);




  const gridTheme = themeQuartz.withParams({
    accentColor: 'green',
    selectedRowBackgroundColor: 'rgba(0, 123 ,60, 0.2)',
    oddRowBackgroundColor: filteredColumns.length === 0 && sortedColumns.length === 0
      ? 'rgba(0, 123 ,60, 0.065)'
      : undefined,
    headerColumnResizeHandleColor: 'rgb(126, 46, 132)',
  });

  const fabStyles = {
    mainButtonStyles: {
      backgroundColor: '#005a2d',
    },
    actionButtonStyles: {
      backgroundColor: '#007b3c',
    },
    position: { bottom: 20, right: 24 }
  };

  const hasCreatePermission = useMemo(() =>
    auth.userInfo.permissions.some((p) => p.name === `_create_${resource}`)
    , [auth.userInfo.permissions, resource]);

  const onCellKeyDown = async (params: CellKeyDownEvent) => {
    const event = params.event as KeyboardEvent;
    if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
      const api = params.api;
      const selectedRows = api.getSelectedRows();

      if (selectedRows && selectedRows.length > 0) {
        const visibleColumns = api.getAllDisplayedColumns();
        const headers = visibleColumns
          .map(col => col.getColDef().headerName || col.getColId())
          .join('\t');

        const rowData = selectedRows.map(row =>
          visibleColumns
            .map(col => row[col.getColId()] ?? '')
            .join('\t')
        ).join('\n');

        navigator.clipboard.writeText(`${headers}\n${rowData}`);
        showCopiedToast(selectedRows.length);
      }
    }

    if (event.key === 'Delete' && auth.userInfo.permissions.some((permission: any) => permission.name === `_delete_${resource}`)) {
      const api = params.api;
      const selectedRows = api.getSelectedRows();

      console.log("[DataTable] : delete button pressed with following row ids : ", selectedRows);

      if (selectedRows && selectedRows.length > 0) {
        setSelectedRowsForDelete(selectedRows);
        setGridApi(api);
        setIsDeleteDialogOpen(true);
      }
    }
  };

  const showCopiedToast = (rows: number) => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000)
    toast({
      variant: 'default',
      title: 'Copied',
      description: `${rows} row(s) copied to clipboard`,
      duration: 1500,
    });
  }



  const generateColumnDefs = (): ColDef[] => {
    const columnDefs: ColDef[] = [];

    Object.keys(data[0]).forEach((key) => {
      const [parentField, childField] = key.split('.');
      if (childField === 'id' || childField === 'siteId' || childField === 'salesPersonId' || childField === 'clientId' || childField === 'pocId' || childField === 'vendorId') {
        return;
      }
      const isEditable = (parentField === resource && childField !== 'id' && auth.userInfo.permissions.some((permission: any) => permission.name === `_update_${resource}`));
      const columnType = availableColumnTypes[key];

      const colDef: ColDef = {
        headerName: parentField === resource
          ? capitalizeFirstLetter(childField)
          : `${capitalizeFirstLetter(parentField)} ${capitalizeFirstLetter(childField)}`,
        field: key,
        valueGetter: (params) => {
          if (params.data[key] === null) {
            return '';
          }

          if (columnType === 'DateTime?' || columnType === 'DateTime') {
            return new Date(params.data[key]).toLocaleDateString();
          }

          return params.data[key];
        },
        tooltipValueGetter: (params) => {
          if (params.value === null || params.value === undefined) {
            return '';
          }

          if (columnType === 'DateTime?' || columnType === 'DateTime') {
            const formattedDate = new Date(params.value).toLocaleDateString();
            const originalValue = params.value;
            return `${formattedDate}\nOriginal: ${originalValue}`;
          }

          return params.value.toString();
        },
        tooltipComponentParams: {
          color: '#333',
          backgroundColor: '#fff',
        },
        cellDataType: (() => {
          if (!columnType) return 'string';

          if (columnType === 'Int?' || columnType === 'Int') {
            return 'number';
          }

          if (columnType === 'Boolean?' || columnType === 'Boolean') {
            return 'boolean';
          }

          if (columnType === 'DateTime?' || columnType === 'DateTime') {
            return 'date';
          }

          return 'string';
        })(),
        ...(isEditable && {
          valueSetter: (params) => {
            const oldValue = params.data[key];
            const newValue = params.newValue;

            if (oldValue === newValue) {
              return false;
            }

            const updatedData = { ...params.data };
            updatedData[key] = newValue;

            const allEditableFieldsData: Record<string, any> = {};
            Object.keys(updatedData).forEach(fieldKey => {
              const [fieldParent] = fieldKey.split('.');
              if (fieldParent === resource) {
                allEditableFieldsData[fieldKey] = updatedData[fieldKey];
              }
            });

            setProcessing(true);
            updateData(resource, allEditableFieldsData)
              .then(response => {
                if (!response.success) {
                  Object.keys(allEditableFieldsData).forEach(fieldKey => {
                    params.data[fieldKey] = oldValue;
                  });
                  params.api.refreshCells({ force: true });
                }
              })
              .catch(error => {
                toast({
                  variant: 'destructive',
                  title: 'Error',
                  description: 'Failed to update data',
                  duration: 5000,
                });
                console.error('Error updating data:', error);
                Object.keys(allEditableFieldsData).forEach(fieldKey => {
                  params.data[fieldKey] = oldValue;
                });
                params.api.refreshCells({ force: true });
              })
              .finally(() => {
                setProcessing(false);
              });

            Object.keys(allEditableFieldsData).forEach(fieldKey => {
              params.data[fieldKey] = updatedData[fieldKey];
            });
            return true;
          }
        }),
        cellEditor: (() => {
          if (!columnType) return 'agTextCellEditor';

          if (columnType === 'Int?' || columnType === 'Int') {
            return 'agNumberCellEditor';
          }

          if (columnType === 'Boolean?' || columnType === 'Boolean') {
            return 'agCheckboxCellEditor';
          }

          if (columnType === 'DateTime?' || columnType === 'DateTime') {
            return "agDateCellEditor";
          }

          const enumMatch = columnType.match(/^Enum\((.+?)\)\??$/);
          if (enumMatch) {
            return 'agSelectCellEditor';
          }

          return 'agTextCellEditor';
        })(),
        cellEditorParams: (() => {
          if (!columnType) return undefined;

          const enumMatch = columnType.match(/^Enum\((.+?)\)\??$/);
          if (enumMatch) {
            const enumName = enumMatch[1];
            const values = getEnumValues(enumName);
            return {
              values: values,
              ...(columnType.endsWith('?') && { values: ['', ...values] })
            };
          }
          return undefined;
        })(),
        flex: 1,
        minWidth: getTextWidth((key), 'bold 12px Arial') + 20,
        initialWidth: getTextWidth((key), 'bold 12px Arial') + 20,
        resizable: true,
        editable: isEditable,
        cellStyle: filteredColumns.includes(key) ? { backgroundColor: '#ddebfc' } : sortedColumns.includes(key) ? { backgroundColor: '#e1fbe9' } : {},
        // Updated cellRenderer logic
        ...(columnType === 'Boolean?' || columnType === 'Boolean'
          ? {
            cellRenderer: 'agCheckboxCellRenderer',
            cellRendererParams: {
              disabled: !isEditable,
            }
          }
          : {
            cellRenderer: (params: any) => {
              if (!columnType) return params.value;

              const enumMatch = columnType.match(/^Enum\((.+?)\)\??$/);
              if (enumMatch) {
                const enumName = enumMatch[1];
                const value = params.data[key];
                
                return <EnumBadge enum={enumName as EnumBadgeProps['enum']} value={value} />;
              }

              return params.value;
            }
          }
        )
      };

      columnDefs.push(colDef);
    });

    return columnDefs;
  };

  const defaultColDef: ColDef = {
    sortable: false,
    resizable: true,
    flex: 1,
  };

  const capitalizeFirstLetter = (string: string): string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const getTextWidth = (text: string, font: string = '14px Arial'): number => {
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Failed to get canvas context');
    }
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width + 20;
  };

  if (loading || !data || totalRecords === null) {
    return (
      <div className="w-screen h-lvh ">
        <TableSkeleton />
      </div>
    )
  }

  if (totalRecords === 0) {
    return (
      <NoDataTable hasFilters />
    )
  }

  return (
    <>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. It will permanently delete {selectedRowsForDelete.length} record(s).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-white border border-brand text-brand font-bold hover:bg-brand-light/20 rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
              onClick={async () => {
                setProcessing(true);

                const idsToDelete = selectedRowsForDelete.map(row => Number(row[`${resource}.id`]));
                const deleteResponse = await deleteData(resource, idsToDelete);

                if (deleteResponse.success) {
                  setToastVisible(true);
                  setTimeout(() => setToastVisible(false), 3500)
                  toast({
                    title: 'Success',
                    description: `${selectedRowsForDelete.length} record(s) deleted successfully`,
                    duration: 3000,
                  });

                  const selectedNodes = gridApi.getSelectedNodes();
                  gridApi.applyTransaction({ remove: selectedNodes.map((node: { data: any }) => node.data) });

                  setTotalRecords(totalRecords - selectedRowsForDelete.length);

                } else {
                  setToastVisible(true);
                  setTimeout(() => setToastVisible(false), 3500)
                  toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to delete record(s)',
                    duration: 3000,
                  });
                }
                setProcessing(false);
                setIsDeleteDialogOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="w-screen h-lvh">
        <AgGridReact
          rowSelection={{
            mode: 'multiRow',
            enableClickSelection: false
          }}
          theme={gridTheme}
          rowData={data}
          columnDefs={generateColumnDefs()}
          defaultColDef={defaultColDef}
          onCellKeyDown={onCellKeyDown}
          enableBrowserTooltips={false}
          tooltipShowDelay={500}
          tooltipHideDelay={1000}
          tooltipInteraction={true}
        />
      </div>

      {hasCreatePermission && !toastVisible && !isCreateSheetOpen && (


        <Fab
          mainButtonStyles={fabStyles.mainButtonStyles}
          style={fabStyles.position}
          icon={<Plus size={24} />}
          event='click'

        >
          <Action
            text="Add Record"
            style={fabStyles.actionButtonStyles}
            onClick={() => setIsCreateSheetOpen(true)}
          >
            <FilePlus size={20} />
          </Action>
        </Fab>
      )}
      <CreateSheet
        resource={resource}
        isOpen={isCreateSheetOpen}
        onClose={() => setIsCreateSheetOpen(false)}
        onSubmit={() => { }}
        availableColumnTypes={availableColumnTypes}
      />
    </>
  );
};

export default DataGrid;


