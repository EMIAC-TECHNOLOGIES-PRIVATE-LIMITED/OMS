import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, X } from 'lucide-react';
import { Command, CommandList, CommandItem, CommandEmpty } from '@/components/ui/command';
import { getSuggestions } from '@/utils/apiService/typeAheadAPI';
import EnumBadge, { EnumBadgeProps, getEnumValues } from '@/utils/EnumUtil/EnumUtil';
import debounce from 'lodash.debounce';
import { createData } from '@/utils/apiService/dataAPI';
import {
  ICellRendererParams,
  ICellEditorParams,
} from 'ag-grid-community';
import { useSetRecoilState } from 'recoil';
import { showFabAtom } from '@/store/atoms/atoms';

// Updated styles to fix cell editing alignment
const createDialogGridStyles = `
  .create-dialog-grid.ag-theme-quartz {
    --ag-odd-row-background-color: #f8fafc;
    --ag-selected-row-background-color: #e6f2ff;
    --ag-accent-color: #3b82f6;
    --ag-header-column-resize-handle-color: #9ca3af;
    --ag-header-background-color: #f1f5f9;
    --ag-font-size: 14px;
    --ag-grid-size: 6px;
    --ag-cell-horizontal-padding: 8px;
  }
  .cell-error {
    background-color: rgba(254, 226, 226, 0.6) !important;
    border: 2px solid #ff5757 !important;
    border-radius: 6px !important;
    box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.2) !important;
    transition: all 0.2s ease;
  }
  .cell-error.ag-cell-focus {
    background-color: rgba(254, 202, 202, 0.8) !important;
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.3) !important;
  }
  .ag-cell {
    padding: var(--ag-cell-horizontal-padding) !important;
    line-height: 28px !important;
  }
  .ag-header-cell {
    padding: 8px 12px !important;
  }
  .ag-cell-inline-editing {
    padding: 0 !important;
    height: 100% !important;
  }
  .ag-popup-editor {
    padding: 0 !important;
    height: 100% !important;
  }
  .ag-input-field-input {
    height: 100% !important;
    padding: var(--ag-cell-horizontal-padding) !important;
  }
`;

// Interfaces
interface CreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (addedRecords: number) => void;
  availableColumnTypes: Record<string, string>;
  resource: string;
}

interface AutoCompleteData {
  id: number;
  [key: string]: any;
}

const DEFAULT_VALUES: Record<string, any> = {
  'order.orderStatus': 'Pending'
};



// Utility functions
const formatHeader = (name: string, resource: string): string => {
  const [parentField, childField] = name.split('.');
  if (parentField === resource) {
    return childField.charAt(0).toUpperCase() + childField.slice(1);
  }
  return `${parentField.charAt(0).toUpperCase() + parentField.slice(1)} ${childField.charAt(0).toUpperCase() + childField.slice(1)}`;
};

const lookupFields = {
  order: ['client.name', 'site.website'],
  site: ['vendor.name']
};

// Updated AutoCompleteEditor integrated with AG Grid
interface AutoCompleteEditorParams extends ICellEditorParams {
  route: string;
  searchColumn: string;
  onDataSelected: (data: any, node: any) => void;
}

const AutoCompleteEditor: React.FC<AutoCompleteEditorParams> = (props) => {
  const [value, setValue] = useState(props.value || '');
  const [suggestions, setSuggestions] = useState<AutoCompleteData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(true); // Control popup visibility

  const inputRef = React.useRef<HTMLInputElement>(null);

  // Debounced fetch for suggestions
  const fetchSuggestions = useCallback(
    debounce(async (input: string) => {
      if (input.length < 2) {
        setSuggestions([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await getSuggestions(props.route, props.searchColumn, input, { timeout: 5000 });
        setSuggestions(data);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoading(false);
      }
    }, 300),
    [props.route, props.searchColumn]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      fetchSuggestions.cancel();
    };
  }, [fetchSuggestions]);

  // Focus the input when the editor is attached
  useEffect(() => {
    inputRef.current?.focus();
    fetchSuggestions(value); // Fetch initial suggestions if value exists
  }, []);

  // Handle selection of an option
  const handleSelect = (selected: AutoCompleteData) => {
    const fullKey = `${props.route}.${props.searchColumn}`;

    // First, update the related fields via onDataSelected
    props.onDataSelected(selected, props.node);

    // Then, finish the editing بند
    props.stopEditing();

    // Finally, explicitly set the value in the lookup field
    props.node.setDataValue(fullKey, selected[fullKey]);

    // Update local state (though this may not be necessary after stopEditing)
    setValue(selected[fullKey]);
    setIsPopupOpen(false);
  };

  // Show popup when user is typing and input length >= 2 characters
  const shouldShowPopup = isPopupOpen && value.length >= 2;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          fetchSuggestions(e.target.value);
          setIsPopupOpen(true); // Reopen popup on input change
        }}
        className="w-full h-full border-none outline-none px-2 text-sm"
        style={{ boxSizing: 'border-box' }}
      />
      {loading && (
        <Loader2 className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
      )}
      {shouldShowPopup && (
        <div
          className="ag-custom-component-popup"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '300px',
            maxHeight: '200px',
            overflowY: 'auto',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 9999,
          }}
        >
          <Command>
            <CommandList>
              {suggestions.length === 0 && !loading ? (
                <CommandEmpty>No results found.</CommandEmpty>
              ) : (
                suggestions.map((suggestion) => {
                  const fullKey = `${props.route}.${props.searchColumn}`;
               
                  return (
                    <CommandItem
                      key={suggestion[`${props.route}.id`]}
                      onSelect={() => handleSelect(suggestion)}
                      className="cursor-pointer hover:bg-blue-50 text-sm py-2 px-2"
                    >
                      {fullKey === 'vendor.name' ? `${suggestion[fullKey]} (${suggestion['vendor.email']})` : suggestion[fullKey]}
                    </CommandItem>
                  );
                })
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
};

// Attach AG Grid required methods
(AutoCompleteEditor as any).getValue = function () {
  return this.getValue();
};
(AutoCompleteEditor as any).isPopup = function () {
  return true;
};

// Main Component
const CreateSheet: React.FC<CreateDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  availableColumnTypes,
  resource,
}) => {
  const { toast } = useToast();
  const gridRef = useRef<AgGridReact>(null);

  const createNewRowWithDefaults = useCallback(() => {
    const newRow: Record<string, any> = {};
    
    // Apply default values for the current resource type
    if (resource) {
      Object.entries(DEFAULT_VALUES).forEach(([key, value]) => {
        // Only apply default if the column exists in availableColumnTypes
        if (availableColumnTypes[key]) {
          newRow[key] = value;
        }
      });
    }
    
    return newRow;
  }, [resource, availableColumnTypes]);

  const [rowData, setRowData] = useState<Record<string, any>[]>([{}]);
  const [invalidCells, setInvalidCells] = useState<Set<string>>(new Set());
  const setShowFab = useSetRecoilState(showFabAtom);

  const filteredColumns = useMemo(() => {
    // Step 1: Create the initial filtered columns object
    let columns = Object.entries(availableColumnTypes).reduce<Record<string, string>>(
      (acc, [key, value]) => {
        const [, childField] = key.split('.');

        if ((
          key !== 'poc.name' && key !== 'order.orderNumber' &&
          ![
            'id',
            'siteId',
            'salesPersonId',
            'clientId',
            'pocId',
            'vendorId',
            'createdAt',
            'updatedAt',
          ].includes(childField))
        ) {
          acc[key] = value;
        }
        return acc;
      },
      {}
    );

    // Step 2: Reorder columns if resource is 'order'
    if (resource === 'order') {
      const priorityColumns = [
        'order.orderDate',
        'client.name',
        'client.email',
        'client.contactedFrom',
        'order.invoiceNumber',
        'order.orderRemark',
        'order.mainRemark',
        'site.website',
        'order.clientProposedAmount',
      ];

      // Get all keys from filtered columns
      const allKeys = Object.keys(columns);

      // Filter priority columns that exist in filteredColumns
      const validPriorityColumns = priorityColumns.filter((col) => allKeys.includes(col));

      // Get remaining columns in their original order
      const remainingColumns = allKeys.filter((col) => !validPriorityColumns.includes(col));

      // Combine priority columns and remaining columns
      const orderedKeys = [...validPriorityColumns, ...remainingColumns];

      // Create a new object with keys in the desired order
      const orderedColumns: Record<string, string> = {};
      orderedKeys.forEach((key) => {
        orderedColumns[key] = columns[key];
      });

      return orderedColumns;
    }

    // Return original filtered columns for other resources
    return columns;
  }, [availableColumnTypes, resource]);

  const removeRowColDef = useMemo(() => ({
    headerName: '',
    field: 'remove',
    width: 60,
    editable: false,
    cellRenderer: (params: any) => {
      const hasData = Object.values(params.data).some(
        (val) => val !== undefined && val !== null && val !== ''
      );
      return (
        <Button
          variant="ghost"
          size="sm"
          disabled={!hasData}
          className="text-gray-500 hover:text-red-600"
          onClick={() => {
            const newData = [...rowData];
            newData[params.node.rowIndex] = {};
            setRowData(newData);
          }}
        >
          <X size={18} />
        </Button>
      );
    },
  }), [rowData]);

  const columnDefs = useMemo(() => {
    const defs: any[] = [removeRowColDef];

    Object.entries(filteredColumns).forEach(([key, type]) => {
      const [table] = key.split('.');
      const isRelatedTable = table !== resource;
      const isLookupField = lookupFields[resource as keyof typeof lookupFields]?.includes(key) ?? false;
      const isRequired = key !== 'site.categories' && (!type.endsWith('?') || isLookupField);

      const colDef: any = {
        field: key,
        headerName: `${formatHeader(key, resource)}${isRequired ? ' *' : ''}`,
        editable: (!isRelatedTable || isLookupField) && key !== 'site.categories',
        minWidth: 180,
        flex: 1,
        suppressMovable: true,
        cellClass: (params: any) => {
          const cellId = `${params.node?.rowIndex ?? 0}-${params.column.getId()}`;
          return invalidCells.has(cellId) ? 'cell-error' : '';
        },
        valueGetter: (params: any) => {
          if (params.data[key] === null || params.data[key] === undefined) return '';
          if (type.startsWith('DateTime')) {
            return params.data[key]
              ? new Date(params.data[key]).toLocaleDateString()
              : '';
          }
          return params.data[key];
        },
        valueSetter: (params: any) => {
          const newValue = params.newValue;
          params.data[key] = newValue;

          if (newValue && isRequired) {
            const cellId = `${params.node?.rowIndex ?? 0}-${params.column.getId()}`;
            setInvalidCells((prev) => {
              const next = new Set(prev);
              next.delete(cellId);
              return next;
            });
          }
          return true;
        },
      };

      const enumMatch = type.match(/^Enum\((.+?)\)\??$/);
      if (enumMatch) {
        const enumName = enumMatch[1];
        colDef.cellEditor = 'agSelectCellEditor';
        colDef.cellEditorParams = {
          values: type.endsWith('?') ? [null, ...getEnumValues(enumName)] : getEnumValues(enumName),
        };
        colDef.cellRenderer = (params: ICellRendererParams) => {
          return params.value ? <EnumBadge enum={enumName as EnumBadgeProps['enum']} value={params.value} /> : '';
        };
      } else if (type.startsWith('Boolean')) {
        colDef.cellEditor = 'agCheckboxCellEditor';
        colDef.cellRenderer = (params: ICellRendererParams) => {
          return <input
            type="checkbox"
            checked={params.value}
            className="cursor-pointer"
            onChange={() => { }}
          />;
        };
      } else if (type.startsWith('DateTime')) {
        colDef.cellEditor = 'agDateCellEditor';
      } else if (type.startsWith('Int')) {
        colDef.cellEditor = 'agNumberCellEditor';
      }

      if (isLookupField) {
        colDef.cellEditor = AutoCompleteEditor;
        colDef.cellEditorParams = {
          route: table,
          searchColumn: key.split('.')[1],
          onDataSelected: (data: AutoCompleteData, node: any) => {
            const updatedData = { ...node.data };
            updatedData[`${table}.id`] = data[`${table}.id`];
            const lookupField = `${table}.${key.split('.')[1]}`;
            updatedData[lookupField] = data[lookupField];
            Object.entries(data).forEach(([field, val]) => {
              if (field !== `${table}.id` && field !== lookupField && availableColumnTypes[field]) {
                updatedData[field] = val;
              }
            });
            node.setData(updatedData);
          },
        };
      }

      defs.push(colDef);
    });

    return defs;
  }, [
    filteredColumns,
    resource,
    removeRowColDef,
    availableColumnTypes,
    invalidCells,
  ]);

  const validateData = useCallback(() => {
    const newInvalidCells = new Set<string>();
    let isValid = true;

    rowData.forEach((row, rowIndex) => {
      const hasData = Object.values(row).some(
        (val) => val !== undefined && val !== null && val !== ''
      );
      if (!hasData) return;

      Object.entries(filteredColumns).forEach(([key, type]) => {
        const [table] = key.split('.');
        const isRequired = key !== 'site.categories' && !type.endsWith('?');
        const isLookupField = lookupFields[table as keyof typeof lookupFields]?.includes(key) ?? false;

        if (
          (isRequired || isLookupField) &&
          (row[key] === undefined || row[key] === null || row[key] === '')
        ) {
          newInvalidCells.add(`${rowIndex}-${key}`);
          isValid = false;
        }
      });
    });

    setInvalidCells(newInvalidCells);

    if (!isValid) {
      setShowFab(false);
setTimeout(() => {
  setShowFab(true);
}, 3500);
toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill all required fields marked with *',
        duration: 3000,
      });
    }

    return isValid;
  }, [rowData, filteredColumns, resource, toast]);

    const handleAddRow = useCallback(() => {
    setRowData(prev => [...prev, createNewRowWithDefaults()]);
  }, [createNewRowWithDefaults]);

  const sanitizeEmptyRows = useCallback(() => {
    setRowData(prev => {
      const filteredRows = prev.filter((row) =>
        Object.values(row).some(val => val !== undefined && val !== null && val !== '')
      );
      
      // If all rows were empty, add one default row
      if (filteredRows.length === 0) {
        return [createNewRowWithDefaults()];
      }
      
      return filteredRows;
    });
  }, [createNewRowWithDefaults]);

  const handleSubmit = useCallback(async () => {
    if (!validateData()) return;

    // Filter out completely empty rows
    const nonEmptyRows = rowData.filter((row) =>
      Object.values(row).some(
        (val) => val !== undefined && val !== null && val !== ''
      )
    );

    if (nonEmptyRows.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill at least one row to create records',
        duration: 3000,
      });
      return;
    }

    const formattedData = nonEmptyRows.map((row) => {
      const payload: Record<string, any> = {};
      Object.entries(row).forEach(([key, value]) => {
        const [table, field] = key.split('.');
        if (table === resource) {
          payload[field] = value;
        } else if (field === 'id' && !(resource === 'order' && table === 'vendor')) {
          payload[`${table}Id`] = value;
        }
      });
      return payload;
    });

    try {
      const result = await createData(resource, formattedData);
      if (result.success) {
        setShowFab(false);
        setTimeout(() => {
          setShowFab(true)
        }, 3500)
        if (resource === 'order') {
          toast({
            title: 'Success',
            //@ts-ignore
            description: `Order added successfully with Order Number: ${result.data.orderNumber}`,
            duration: 3000,
          });
        }
        else {
          toast({
            title: 'Success',
            description: 'Records created successfully',
            duration: 3000,
          });
        }
        setRowData([{}]);
        onClose();
        onSubmit(formattedData.length);
      } else {
        throw new Error('Failed to create records');
      }
    } catch (error) {
      console.error('Error creating records:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create records',
        duration: 3000,
      });
    }
  }, [rowData, resource, validateData, onClose, onSubmit, toast]);

  useEffect(() => {
    setRowData([createNewRowWithDefaults()]);
  }, [resource, createNewRowWithDefaults]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[80vw] h-[80vh] flex flex-col p-0 bg-white rounded-lg shadow-xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-semibold text-gray-800">
            Add New {resource.charAt(0).toUpperCase() + resource.slice(1)} Records
          </DialogTitle>
        </DialogHeader>
        <style>{createDialogGridStyles}</style>
        <div className="flex-1 px-6 py-4 overflow-auto">
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            className="create-dialog-grid ag-theme-quartz rounded-md border border-gray-200"
            defaultColDef={{
              editable: true,
              resizable: true,
              suppressMovable: true,
            }}
            enableCellTextSelection={true}
            rowHeight={48}
            headerHeight={56}
            domLayout="normal"
            singleClickEdit={true}
            onGridReady={(params) => {
              params.api.sizeColumnsToFit();
            }}
            onCellValueChanged={(params) => {
              const newData = [...rowData];
              newData[params.node.rowIndex!] = { ...params.data };
              if (
                newData.every((row) =>
                  Object.values(row).every(
                    (val) => val === undefined || val === null || val === ''
                  )
                )
              ) {
                newData.push({});
              }
              setRowData(newData);
            }}
          />
        </div>
        <div className="p-6 flex justify-between items-center bg-gray-50 border-t border-gray-200">
          <Button
            onClick={handleAddRow}
            variant="outline"
            className="px-4 py-2 text-gray-700 border-gray-300 hover:bg-gray-100"
          >
            Add Row
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setRowData([{}]);
                onClose();
              }}
              className="px-4 py-2 text-gray-700 border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                sanitizeEmptyRows();
                handleSubmit();
              }}
              variant="brand"
            >
              Add Records
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSheet;