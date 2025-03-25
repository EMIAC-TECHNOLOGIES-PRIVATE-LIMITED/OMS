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
import { Loader2, ChevronDown, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Command, CommandList, CommandItem, CommandEmpty } from '@/components/ui/command';
import { getSuggestions } from '@/utils/apiService/typeAheadAPI';
import EnumBadge, { EnumBadgeProps, getEnumValues } from '@/utils/EnumUtil/EnumUtil';
import debounce from 'lodash.debounce';
import { createData } from '@/utils/apiService/dataAPI';
import {
  ICellRendererParams,
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

// Updated AutoCompleteEditor with fixed positioning
const AutoCompleteEditor = (props: any) => {
  const [value, setValue] = useState(props.value || '');
  const [suggestions, setSuggestions] = useState<AutoCompleteData[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = useCallback(
    debounce(async (input: string) => {
      if (input.length < 2) {
        setSuggestions([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await getSuggestions(
          props.route,
          props.searchColumn,
          input,
          { timeout: 5000 }
        );
        setSuggestions(data);
        setOpen(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    return () => {
      fetchSuggestions.cancel();
    };
  }, [fetchSuggestions]);

  const handleSelect = (selected: AutoCompleteData) => {
    props.onDataSelected(selected, props.node);
    const fullKey = `${props.route}.${props.searchColumn}`;
    setValue(selected[fullKey]);
    setOpen(false);
    props.stopEditing();
    // Force update after editing
    props.node.setDataValue(fullKey, selected[fullKey]);
    console.log('Forced setDataValue:', selected[fullKey]);
  };

  return (
    <div style={{
      position: 'absolute',
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
    }}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="w-full h-full flex items-center bg-white">
            <input
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                fetchSuggestions(e.target.value);
              }}
              className="w-full h-full border-none outline-none px-2 text-sm"
              autoFocus
            />
            {loading && (
              <Loader2 className="absolute right-2 h-4 w-4 animate-spin text-gray-400" />
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-[300px] p-0 border border-gray-200 shadow-lg"
          align="start"
          sideOffset={5}
          style={{ zIndex: 9999 }}
        >
          <Command>
            <CommandList>
              {suggestions.length === 0 && !loading && (
                <CommandEmpty>No results found.</CommandEmpty>
              )}
              {suggestions.map((suggestion) => {
                const fullKey = `${props.route}.${props.searchColumn}`;
                return (
                  <CommandItem
                    key={suggestion[`${props.route}.id`]}
                    onSelect={() => handleSelect(suggestion)}
                    className="cursor-pointer hover:bg-blue-50 text-sm py-2"
                  >
                    {suggestion[fullKey]}
                  </CommandItem>
                );
              })}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

// Updated EnumEditor with fixed positioning
const EnumEditor = (props: any) => {
  const [value, setValue] = useState(props.value || '');
  const [open, setOpen] = useState(false);
  const enumValues = props.enumValues || [];

  const handleSelect = (selected: string) => {
    setValue(selected);
    setOpen(false);
    props.stopEditing();
    // Update the cell value
    props.node.setDataValue(props.column.getColId(), selected);
  };

  return (
    <div style={{
      position: 'absolute',
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
    }}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative w-full h-full flex items-center">
            <input
              value={value}
              readOnly
              className="w-full h-full border-none outline-none px-2 py-1 text-sm cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                setOpen(true);
              }}
              autoFocus
            />
            <ChevronDown className="absolute right-2 h-4 w-4 text-gray-500" />
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-[200px] p-0 border border-gray-200 shadow-lg"
          align="start"
          sideOffset={5}
          style={{ zIndex: 9999 }}
        >
          <Command>
            <CommandList>
              {enumValues.length === 0 && (
                <CommandEmpty>No options available.</CommandEmpty>
              )}
              {enumValues.map((enumValue: string) => (
                <CommandItem
                  key={enumValue}
                  onSelect={() => handleSelect(enumValue)}
                  className="cursor-pointer hover:bg-blue-50 text-sm py-2"
                >
                  <EnumBadge
                    enum={props.enumName}
                    value={enumValue}
                  />
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
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
  const [rowData, setRowData] = useState<Record<string, any>[]>([{}]);
  const [invalidCells, setInvalidCells] = useState<Set<string>>(new Set());
  const setShowFab = useSetRecoilState(showFabAtom);

  const filteredColumns = useMemo(() => {
    return Object.entries(availableColumnTypes).reduce<Record<string, string>>(
      (acc, [key, value]) => {
        const [table, childField] = key.split('.');
        console.log('Table:', table, 'ChildField:', childField);
        if ((
          ![
            'id',
            'siteId',
            'salesPersonId',
            'clientId',
            'pocId',
            'vendorId',
            'createdAt',
            'updatedAt',
          ].includes(childField)) || (table === 'Poc')
        ) {
          acc[key] = value;
        }
        return acc;
      },
      {}
    );
  }, [availableColumnTypes]);

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
      const isRequired = !type.endsWith('?') || isLookupField;

      const colDef: any = {
        field: key,
        headerName: `${formatHeader(key, resource)}${isRequired ? ' *' : ''}`,
        editable: !isRelatedTable || isLookupField,
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
        // Replace the existing enum editor with our custom EnumEditor
        colDef.cellEditor = EnumEditor;
        colDef.cellEditorParams = {
          enumValues: type.endsWith('?') ? [null, ...getEnumValues(enumName)] : getEnumValues(enumName),
          enumName: enumName
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
            console.log('Selected data from API:', data);
            const updatedData = { ...node.data };
            updatedData[`${table}.id`] = data[`${table}.id`];
            const lookupField = `${table}.${key.split('.')[1]}`;
            console.log('lookupField:', lookupField);
            console.log('data[lookupField]:', data[lookupField]);
            updatedData[lookupField] = data[lookupField];
            Object.entries(data).forEach(([field, val]) => {
              if (field !== `${table}.id` && field !== lookupField && availableColumnTypes[field]) {
                updatedData[field] = val;
              }
            });
            console.log('Updated row data:', updatedData);
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
        const isRequired = !type.endsWith('?');
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
        setShowFab(true)
      }, 3500)
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
    setRowData(prev => [...prev, {}]);
  }, []);

  const sanitizeEmptyRows = useCallback(() => {
    setRowData(prev => prev.filter((row) =>
      Object.values(row).some(val => val !== undefined && val !== null && val !== '')
    ));
  }, []);

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
        toast({
          title: 'Success',
          description: 'Records created successfully',
          duration: 3000,
        });
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
              console.log('Column:', params.column.getId(), 'Params.data:', params.data);
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
              console.log('New rowData:', newData);
              setRowData(newData);
            }}
            popupParent={document.body}
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