// import { AllCommunityModule, ModuleRegistry, themeQuartz, CellKeyDownEvent, IRowNode, RowSelectedEvent, Column } from "ag-grid-community";
// import { AgGridReact } from "ag-grid-react";
// import { ColDef, ICellRendererParams, ICellEditorParams } from "ag-grid-community";
// import "ag-grid-community/styles/ag-theme-quartz.css";
// import TableSkeleton from "./Skeleton";
// import EnumBadge, { getEnumValues, EnumBadgeProps } from "../../utils/EnumUtil/EnumUtil";
// import { deleteData, updateData } from "@/utils/apiService/dataAPI";
// import { useToast } from "@/hooks/use-toast";
// import { authAtom, showFabAtom } from "@/store/atoms/atoms";
// import { useRecoilState, useRecoilValue } from "recoil";
// import NoDataTable from "./NoData";
// import { useEffect, useMemo, useState, useRef, forwardRef, useImperativeHandle } from "react";
// import { Fab, Action } from 'react-tiny-fab';
// import 'react-tiny-fab/dist/styles.css';

// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "../../components/ui/alert-dialog"
// import { FilePlus, Plus } from "lucide-react";
// import CreateSheet from "./CreateSheet2";

// ModuleRegistry.registerModules([AllCommunityModule]);

// // Define columns that should use the large text editor
// const LARGE_TEXT_COLUMNS = ['niche', 'notes', 'comments', 'details'];

// // Define columns that may contain hyperlinks
// const LINK_COLUMNS = ['website', 'url', 'link'];

// // Define columns that should use Indian number formatting
// const INDIAN_NUMBER_COLUMNS = ['ahrefTraffic', 'price', 'total', 'balance'];

// // Function to check if a string is a valid URL
// const isValidUrl = (str: string): boolean => {
//   try {
//     new URL(str);
//     return true;
//   } catch {
//     return false;
//   }
// };

// // Function to format number in Indian system
// const formatIndianNumber = (num: number): string => {
//   const numStr = num.toString();
//   if (numStr.length <= 3) return numStr;
  
//   let lastThree = numStr.substring(numStr.length - 3);
//   const remaining = numStr.substring(0, numStr.length - 3);
//   if (remaining) {
//     lastThree = ',' + lastThree;
//   }
//   return remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
// };

// // Custom tooltip component for hyperlinks
// const HyperlinkTooltip = (props: any) => {
//   if (isValidUrl(props.value)) {
//     return (
//       <div style={{ backgroundColor: '#fff', padding: '5px', borderRadius: '3px' }}>
//         <a 
//           href={props.value} 
//           target="_blank" 
//           rel="noopener noreferrer"
//           style={{ color: '#007b3c', textDecoration: 'underline' }}
//         >
//           {props.value}
//         </a>
//       </div>
//     );
//   }
//   return props.value?.toString() || '';
// };

// // Updated Large text editor component
// interface LargeTextEditorProps extends ICellEditorParams {
//   value: string;
// }

// const LargeTextEditor = forwardRef((props: LargeTextEditorProps, ref) => {
//   const textAreaRef = useRef<HTMLTextAreaElement>(null);
//   const initialValue = props.value;

//   useEffect(() => {
//     // Focus the textarea when the editor is mounted
//     textAreaRef.current?.focus();
//   }, []);

//   useImperativeHandle(ref, () => ({
//     getValue() {
//       return textAreaRef.current?.value ?? initialValue;
//     },
    
//     isCancelBeforeStart() {
//       return false;
//     },
    
//     isCancelAfterEnd() {
//       const currentValue = textAreaRef.current?.value;
//       return currentValue === initialValue;
//     }
//   }));

//   return (
//     <textarea
//       ref={textAreaRef}
//       defaultValue={initialValue}
//       className="w-full h-24 p-2 resize-both"
//       style={{
//         border: '1px solid #ccc',
//         borderRadius: '4px',
//         minHeight: '100px',
//         backgroundColor: '#fff'
//       }}
//     />
//   );
// });

// LargeTextEditor.displayName = 'LargeTextEditor';

// interface DataGridProps {
//   data: Record<string, any>[];
//   availableColumnTypes: {
//     [key: string]: string;
//   };
//   loading?: boolean;
//   resource: string;
//   filteredColumns: string[];
//   sortedColumns: string[];
//   setProcessing: (value: boolean) => void;
//   totalCount: number | null;
//   setTotalCount: (value: number) => void;
//   filteredCount: number | null;
//   refreshRecords: (addedRecords: number) => void;
// }

// interface RowNumberCellRendererParams extends ICellRendererParams {
//   node: IRowNode;
//   api: any;
//   isHeader: boolean;
// }

// const RowNumberCellRenderer: React.FC<RowNumberCellRendererParams> = (params) => {
//   const [isHovered, setIsHovered] = useState<boolean>(false);
//   const isHeader = params.isHeader;

//   if (isHeader) {
//     const handleHeaderCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//       const checked = event.target.checked;
//       params.api.forEachNode((node: any) => node.setSelected(checked));
//       params.api.refreshCells({ force: true });
//     };

//     return (
//       <div
//         className="h-4 w-4 cursor-pointer absolute transition-all duration-100 ease-in-out rounded-md 
//         accent-brand focus:ring-brand-light focus:ring-2 pl-1"
//         onMouseEnter={() => setIsHovered(true)}
//         onMouseLeave={() => setIsHovered(false)}
//       >
//         <input
//           type="checkbox"
//           onChange={handleHeaderCheckboxChange}
//           checked={params.api.getSelectedRows().length === params.api.getDisplayedRowCount()}
//           className="h-4 w-4 cursor-pointer"
//         />
//       </div>
//     );
//   }

//   const rowNumber = (params.node?.rowIndex ?? 0) + 1;
//   const isSelected = params.node?.isSelected() ?? false;

//   useEffect(() => {
//     return () => setIsHovered(false);
//   }, [rowNumber, isSelected]);

//   const showCheckbox = isHovered || isSelected;

//   return (
//     <div
//       className="h-full w-full flex items-center justify-center cursor-pointer relative -m-2 p-2"
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//       onClick={() => {
//         if (params.node) {
//           params.node.setSelected(!isSelected);
//         }
//       }}
//     >
//       <div className="relative w-3 h-3 flex items-center justify-center">
//         <input
//           type="checkbox"
//           checked={isSelected}
//           onChange={() => {
//             if (params.node) {
//               params.node.setSelected(!isSelected);
//             }
//           }}
//           className={`h-4 w-4 cursor-pointer absolute transition-all duration-100 ease-in-out rounded-md 
//         accent-brand focus:ring-brand-light focus:ring-2 ${showCheckbox ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
//         />
//         <span className={`text-gray-600 select-none absolute transition-all duration-100 ease-in-out ${showCheckbox ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
//           {rowNumber}
//         </span>
//       </div>
//     </div>
//   );
// };

// const DataGrid: React.FC<DataGridProps> = ({
//   data,
//   availableColumnTypes,
//   loading,
//   resource,
//   filteredColumns,
//   sortedColumns,
//   setProcessing,
//   totalCount,
//   setTotalCount,
//   filteredCount,
//   refreshRecords
// }) => {
//   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
//   const [selectedRowsForDelete, setSelectedRowsForDelete] = useState<any[]>([]);
//   const [gridApi, setGridApi] = useState<any>(null);
//   const [showFab, setShowFab] = useRecoilState(showFabAtom);
//   const [isCreateSheetOpen, setIsCreateSheetOpen] = useState<boolean>(false);
//   const gridRef = useRef<any>(null);
//   const auth = useRecoilValue(authAtom);
//   const { toast } = useToast();

//   useEffect(() => {
//     setShowFab(!isDeleteDialogOpen)
//   }, [isDeleteDialogOpen]);

//   const gridTheme = themeQuartz.withParams({
//     accentColor: 'green',
//     selectedRowBackgroundColor: 'rgba(0, 123 ,60, 0.2)',
//     oddRowBackgroundColor: filteredColumns.length === 0 && sortedColumns.length === 0
//       ? 'rgba(0, 123 ,60, 0.065)'
//       : undefined,
//     headerColumnResizeHandleColor: 'rgb(126, 46, 132)',
//   });

//   const fabStyles = {
//     mainButtonStyles: {
//       backgroundColor: '#005a2d',
//     },
//     actionButtonStyles: {
//       backgroundColor: '#007b3c',
//     },
//     position: { bottom: 20, right: 24 } as const
//   };

//   const hasCreatePermission = useMemo(() =>
//     auth.userInfo.permissions.some((p) => p.name === `_create_${resource}`)
//     , [auth.userInfo.permissions, resource]);

//   const onCellKeyDown = async (params: CellKeyDownEvent) => {
//     const event = params.event as KeyboardEvent;
//     if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
//       const api = params.api;
//       const selectedRows = api.getSelectedRows();

//       if (selectedRows && selectedRows.length > 0) {
//         const visibleColumns = api.getAllDisplayedColumns();
//         const headers = visibleColumns
//           .map((col: Column) => col.getColDef().headerName || col.getColId())
//           .join('\t');

//         const rowData = selectedRows.map((row: Record<string, any>) =>
//           visibleColumns
//             .map((col: Column) => row[col.getColId()] ?? '')
//             .join('\t')
//         ).join('\n');

//         navigator.clipboard.writeText(`${headers}\n${rowData}`);
//         showCopiedToast(selectedRows.length);
//       }
//     }

//     if (event.key === 'Delete' && auth.userInfo.permissions.some((permission: any) => permission.name === `_delete_${resource}`)) {
//       const api = params.api;
//       const selectedRows = api.getSelectedRows();

//       if (selectedRows && selectedRows.length > 0) {
//         setSelectedRowsForDelete(selectedRows);
//         setGridApi(api);
//         setIsDeleteDialogOpen(true);
//       }
//     }
//   };

//   useEffect(() => {
//     const handleKeyDown = (event: KeyboardEvent) => {
//       if (gridApi) {
//         if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
//           const selectedRows = gridApi.getSelectedRows();
//           if (selectedRows && selectedRows.length > 0) {
//             const visibleColumns = gridApi.getAllDisplayedColumns();
//             const headers = visibleColumns
//               .map((col: Column) => col.getColDef().headerName || col.getColId())
//               .join('\t');

//             const rowData = selectedRows.map((row: Record<string, any>) =>
//               visibleColumns
//                 .map((col: Column) => row[col.getColId()] ?? '')
//                 .join('\t')
//             ).join('\n');

//             navigator.clipboard.writeText(`${headers}\n${rowData}`);
//             showCopiedToast(selectedRows.length);
//           }
//         }

//         if (event.key === 'Delete' && auth.userInfo.permissions.some((permission: any) => permission.name === `_delete_${resource}`)) {
//           const selectedRows = gridApi.getSelectedRows();
//           if (selectedRows && selectedRows.length > 0) {
//             setSelectedRowsForDelete(selectedRows);
//             setGridApi(gridApi);
//             setIsDeleteDialogOpen(true);
//           }
//         }
//       }
//     };

//     document.addEventListener('keydown', handleKeyDown);
//     return () => document.removeEventListener('keydown', handleKeyDown);
//   }, [gridApi, auth.userInfo.permissions, resource]);

//   const onRowSelected = (event: RowSelectedEvent) => {
//     if (event.api) {
//       event.api.refreshCells({
//         force: true,
//         columns: ['rowNumberSelect']
//       });
//     }
//   };

//   const onGridReady = (params: any) => {
//     setGridApi(params.api);
//     gridRef.current = params;
//   };

//   const showCopiedToast = (rows: number) => {
//     setShowFab(false);
//     setTimeout(() => setShowFab(true), 2000);
//     toast({
//       variant: 'default',
//       title: 'Copied',
//       description: `${rows} row(s) copied to clipboard`,
//       duration: 1500,
//     });
//   };

//   const generateColumnDefs = (): ColDef[] => {
//     const columnDefs: ColDef[] = [
//       {
//         headerName: '',
//         field: 'rowNumberSelect',
//         width: 60,
//         minWidth: 60,
//         maxWidth: 60,
//         pinned: 'left',
//         lockPosition: true,
//         suppressMovable: true,
//         sortable: false,
//         headerComponent: RowNumberCellRenderer,
//         headerComponentParams: { isHeader: true },
//         suppressSizeToFit: true,
//         checkboxSelection: false,
//         headerCheckboxSelection: false,
//         cellRenderer: RowNumberCellRenderer,
//         cellStyle: {
//           padding: '0',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center'
//         }
//       }
//     ];

//     const firstRow = data && data.length > 0 ? data[0] : {};
//     Object.keys(firstRow).forEach((key) => {
//       const [parentField, childField] = key.split('.');
//       if (childField === 'id' || childField === 'siteId' || childField === 'salesPersonId' || childField === 'clientId' || childField === 'pocId' || childField === 'vendorId') {
//         return;
//       }
//       const isEditable = (parentField === resource && childField !== 'id' && auth.userInfo.permissions.some((permission: any) => permission.name === `_update_${resource}`));
//       const columnType = availableColumnTypes[key];

//       const valueSetter = (params: any) => {
//         const oldValue = params.data[key];
//         let newValue = params.newValue;

//         // Handle Indian Number columns
//         if (INDIAN_NUMBER_COLUMNS.includes(childField) && typeof newValue === 'string') {
//           // Convert string number with commas to actual number
//           newValue = Number(newValue.replace(/,/g, ''));
//           if (isNaN(newValue)) {
//             return false;
//           }
//         }

//         // Handle DateTime fields
//         if (columnType === 'DateTime?' || columnType === 'DateTime') {
//           if (!newValue && columnType === 'DateTime?') {
//             newValue = null;
//           } else {
//             const dateValue = new Date(newValue);
//             if (isNaN(dateValue.getTime())) {
//               return false;
//             }
//             newValue = dateValue.toISOString();
//           }
//         }

//         // If value hasn't changed, don't trigger update
//         if (oldValue === newValue) {
//           return false;
//         }

//         const updatedData = { ...params.data };
//         updatedData[key] = newValue;

//         const allEditableFieldsData: Record<string, any> = {};
//         Object.keys(updatedData).forEach(fieldKey => {
//           const [fieldParent] = fieldKey.split('.');
//           if (fieldParent === resource) {
//             allEditableFieldsData[fieldKey] = updatedData[fieldKey];
//           }
//         });

//         setProcessing(true);
//         updateData(resource, allEditableFieldsData)
//           .then(response => {
//             if (!response.success) {
//               Object.keys(allEditableFieldsData).forEach(fieldKey => {
//                 params.data[fieldKey] = oldValue;
//               });
//               params.api.refreshCells({ force: true });
//             }
//           })
//           .catch(error => {
//             toast({
//               variant: 'destructive',
//               title: 'Error',
//               description: 'Failed to update data',
//               duration: 5000,
//             });
//             console.error('Error updating data:', error);
//             Object.keys(allEditableFieldsData).forEach(fieldKey => {
//               params.data[fieldKey] = oldValue;
//             });
//             params.api.refreshCells({ force: true });
//           })
//           .finally(() => {
//             setProcessing(false);
//           });

//         Object.keys(allEditableFieldsData).forEach(fieldKey => {
//           params.data[fieldKey] = updatedData[fieldKey];
//         });
//         return true;
//       };

//       const colDef: ColDef = {
//         headerName: parentField === resource
//           ? capitalizeFirstLetter(childField)
//           : `${capitalizeFirstLetter(parentField)} ${capitalizeFirstLetter(childField)}`,
//         field: key,
//         valueGetter: (params) => {
//           if (params.data[key] === null) {
//             return '';
//           }

//           if (columnType === 'DateTime?' || columnType === 'DateTime') {
//             return new Date(params.data[key]).toLocaleDateString();
//           }

//           if (INDIAN_NUMBER_COLUMNS.includes(childField) && typeof params.data[key] === 'number') {
//             return formatIndianNumber(params.data[key]);
//           }

//           return params.data[key];
//         },
//         tooltipValueGetter: (params) => {
//           if (params.value === null || params.value === undefined) {
//             return '';
//           }

//           if (columnType === 'DateTime?' || columnType === 'DateTime') {
//             const formattedDate = new Date(params.value).toLocaleDateString();
//             const originalValue = params.value;
//             return `${formattedDate}\nOriginal: ${originalValue}`;
//           }

//           return params.value.toString();
//         },
//         tooltipComponent: LINK_COLUMNS.includes(childField) ? HyperlinkTooltip : undefined,
//         tooltipComponentParams: {
//           color: '#333',
//           backgroundColor: '#fff',
//         },
//         cellDataType: (() => {
//           if (!columnType) return 'string';

//           if (columnType === 'Int?' || columnType === 'Int') {
//             return 'number';
//           }

//           if (columnType === 'Boolean?' || columnType === 'Boolean') {
//             return 'boolean';
//           }

//           if (columnType === 'DateTime?' || columnType === 'DateTime') {
//             return 'date';
//           }

//           return 'string';
//         })(),
//         editable: isEditable,
//         valueSetter: isEditable ? valueSetter : undefined,
//         cellEditor: (() => {
//           if (!columnType) return 'agTextCellEditor';

//           if (LARGE_TEXT_COLUMNS.includes(childField)) {
//             return LargeTextEditor;
//           }

//           if (columnType === 'Int?' || columnType === 'Int') {
//             return 'agNumberCellEditor';
//           }

//           if (columnType === 'Boolean?' || columnType === 'Boolean') {
//             return 'agCheckboxCellEditor';
//           }

//           if (columnType === 'DateTime?' || columnType === 'DateTime') {
//             return 'agDateCellEditor';
//           }

//           const enumMatch = columnType.match(/^Enum\((.+?)\)\??$/);
//           if (enumMatch) {
//             return 'agSelectCellEditor';
//           }

//           return 'agTextCellEditor';
//         })(),
//         cellEditorParams: (() => {
//           if (!columnType) return undefined;

//           const enumMatch = columnType.match(/^Enum\((.+?)\)\??$/);
//           if (enumMatch) {
//             const enumName = enumMatch[1];
//             const values = getEnumValues(enumName);
//             return {
//               values: values,
//               ...(columnType.endsWith('?') && { values: [null, ...values] })
//             };
//           }
//           return undefined;
//         })(),
//         flex: 1,
//         minWidth: getTextWidth((key), 'bold 12px Arial') + 20,
//         initialWidth: getTextWidth((key), 'bold 12px Arial') + 20,
//         resizable: true,
//         cellStyle: filteredColumns.includes(key) ? { backgroundColor: '#ddebfc' } : sortedColumns.includes(key) ? { backgroundColor: '#e1fbe9' } : {},
//         ...(columnType === 'Boolean?' || columnType === 'Boolean'
//           ? {
//             cellRenderer: 'agCheckboxCellRenderer',
//             cellRendererParams: {
//               disabled: !isEditable,
//             }
//           }
//           : {
//             cellRenderer: (params: any) => {
//               if (!columnType) return params.value;

//               const enumMatch = columnType.match(/^Enum\((.+?)\)\??$/);
//               if (enumMatch) {
//                 const enumName = enumMatch[1];
//                 const value = params.data[key];

//                 return <EnumBadge enum={enumName as EnumBadgeProps['enum']} value={value} />;
//               }

//               return params.value;
//             }
//           }
//         )
//       };

//       columnDefs.push(colDef);
//     });

//     return columnDefs;
//   };

//   const defaultColDef: ColDef = {
//     sortable: false,
//     resizable: true,
//     flex: 1,
//   };

//   const capitalizeFirstLetter = (string: string): string => {
//     return string.charAt(0).toUpperCase() + string.slice(1);
//   };

//   const getTextWidth = (text: string, font: string = '14px Arial'): number => {
//     const canvas: HTMLCanvasElement = document.createElement('canvas');
//     const context = canvas.getContext('2d');

//     if (!context) {
//       throw new Error('Failed to get canvas context');
//     }
//     context.font = font;
//     const metrics = context.measureText(text);
//     return metrics.width + 20;
//   };

//   if (loading || !data || totalCount === null) {
//     return (
//       <div className="w-screen h-lvh">
//         <TableSkeleton />
//       </div>
//     );
//   }

//   if (filteredCount === 0) {
//     return <NoDataTable hasFilters />;
//   }

//   return (
//     <>
//       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This action cannot be undone. It will permanently delete {selectedRowsForDelete.length} record(s).
//             </AlertDialogDescription>
//           </AlertDialogHeader>

//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               className="bg-white border border-brand text-brand font-bold hover:bg-brand-light/20 rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
//               onClick={async () => {
//                 setProcessing(true);

//                 const idsToDelete = selectedRowsForDelete.map(row => Number(row[`${resource}.id`]));
//                 const deleteResponse = await deleteData(resource, idsToDelete);

//                 if (deleteResponse.success) {
//                   setShowFab(false);
//                   setTimeout(() => setShowFab(true), 3500);
//                   toast({
//                     title: 'Success',
//                     description: `${selectedRowsForDelete.length} record(s) deleted successfully`,
//                     duration: 3000,
//                   });

//                   const selectedNodes = gridApi.getSelectedNodes();
//                   gridApi.applyTransaction({ remove: selectedNodes.map((node: { data: any }) => node.data) });

//                   setTotalCount(totalCount - selectedRowsForDelete.length);

//                 } else {
//                   setShowFab(false);
//                   setTimeout(() => setShowFab(true), 3500);
//                   toast({
//                     variant: 'destructive',
//                     title: 'Error',
//                     description: 'Failed to delete record(s)',
//                     duration: 3000,
//                   });
//                 }
//                 setProcessing(false);
//                 setIsDeleteDialogOpen(false);
//               }}
//             >
//               Delete
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>

//       <div className="w-screen h-lvh">
//         <AgGridReact
//           rowSelection={{
//             mode: 'multiRow',
//             enableClickSelection: false,
//             checkboxes: false,
//             headerCheckbox: false,
//           }}
//           theme={gridTheme}
//           rowData={data}
//           columnDefs={generateColumnDefs()}
//           defaultColDef={defaultColDef}
//           onCellKeyDown={onCellKeyDown}
//           onRowSelected={onRowSelected}
//           onGridReady={onGridReady}
//           enableBrowserTooltips={false}
//           tooltipShowDelay={500}
//           tooltipHideDelay={1000}
//           tooltipInteraction={true}
//           ref={gridRef}
//         />
//       </div>

//       {hasCreatePermission && showFab && !isCreateSheetOpen && (
//         <Fab
//           mainButtonStyles={fabStyles.mainButtonStyles}
//           style={fabStyles.position}
//           icon={<Plus size={24} />}
//           event='click'
//         >
//           <Action
//             text="Add Record"
//             style={fabStyles.actionButtonStyles}
//             onClick={() => setIsCreateSheetOpen(true)}
//           >
//             <FilePlus size={20} />
//           </Action>
//         </Fab>
//       )}

//       <CreateSheet
//         resource={resource}
//         isOpen={isCreateSheetOpen}
//         onClose={() => setIsCreateSheetOpen(false)}
//         onSubmit={refreshRecords}
//         availableColumnTypes={availableColumnTypes}
//       />
//     </>
//   );
// };

// export default DataGrid;