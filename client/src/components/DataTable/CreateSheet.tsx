import React, { useCallback, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { AgGridReact } from 'ag-grid-react';
import {
  ColDef,
  GridApi,
  CellValueChangedEvent,
  GridOptions
} from 'ag-grid-community';
import EnumBadge, { EnumBadgeProps, getEnumValues } from '@/utils/EnumUtil/EnumUtil';
import { createData } from '@/utils/apiService/dataAPI';
import { useToast } from '@/hooks/use-toast';
import AutoCompleteEditor from './AutoCompleteEditor';

// Specific CSS for create dialog grid only
const createDialogGridStyles = `
.create-dialog-grid.ag-theme-quartz {
  --ag-odd-row-background-color: rgba(0, 123, 60, 0.09);
  --ag-selected-row-background-color: rgba(0, 123, 60, 0.2);
  --ag-accent-color: green;
  --ag-header-column-resize-handle-color: rgb(126, 46, 132);
}
`;

interface CreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  availableColumnTypes: Record<string, string>;
  resource: string;
}

const CreateDialog: React.FC<CreateDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  availableColumnTypes,
  resource
}) => {
  const [rowData, setRowData] = useState<Record<string, any>[]>([{}]);
  const [, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setGridApi] = useState<GridApi | null>(null);
  const { toast } = useToast();

  // Transform data before sending to server
  const transformDataForSubmission = (data: Record<string, any>[]): Record<string, any>[] => {
    return data.map(row => {
      const transformedRow: Record<string, any> = {};
      
      Object.entries(row).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          const [table, columnName] = key.split('.');
          
          // Only include fields from the main resource table
          // and reference IDs from related tables
          if (table === resource) {
            transformedRow[columnName] = value;
          } else if (columnName === 'id') {
            // Add the foreign key reference (e.g., vendorId for vendor table)
            transformedRow[`${table}Id`] = value;
          }
        }
      });
      
      return transformedRow;
    });
  };

  // Filter out system columns
  const filteredColumns = useMemo(() => {
    return Object.entries(availableColumnTypes).reduce((acc, [key, value]) => {
      const [, childField] = key.split('.');
      if (!['id', 'siteId', 'salesPersonId', 'clientId', 'pocId', 'vendorId', 'createdAt', 'updatedAt'].includes(childField)) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>);
  }, [availableColumnTypes]);

  // Get lookup fields for related tables
  const lookupFields: Record<'vendor' | 'client' | 'site', string> = useMemo(() => ({
    vendor: 'vendor.name',
    client: 'client.name',
    site: 'site.website'
  }), []);

  // Format column header
  const formatHeader = useCallback((name: string): string => {
    const [parentField, childField] = name.split('.');
    const formattedChild = childField.charAt(0).toUpperCase() + childField.slice(1);
    return parentField === resource
      ? formattedChild
      : `${parentField.charAt(0).toUpperCase() + parentField.slice(1)} ${formattedChild}`;
  }, [resource]);

  // Remove row action column definition
  const removeRowColDef: ColDef = useMemo(() => ({
    headerName: '',
    field: 'remove',
    width: 50,
    maxWidth: 50,
    resizable: false,
    sortable: false,
    cellRenderer: (params: any) => {
      if (rowData.length === 1) return null;
      return (
        <div className="flex items-center justify-center h-full">
          <button
            onClick={() => removeRow(params.node.rowIndex)}
            className="text-slate-900 hover:text-red-500 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      );
    }
  }), [rowData.length]);

  // Handle cell value changes
  const onCellValueChanged = useCallback((params: CellValueChangedEvent) => {
    const { data, node } = params;
    if (node && node.rowIndex !== null) {
      setRowData(prev => {
        const newData = [...prev];
        newData[node.rowIndex as number] = { ...data };
        return newData;
      });
    }
  }, []);

  // Generate column definitions
  const columnDefs = useMemo(() => {
    const defs: ColDef[] = [removeRowColDef];

    Object.entries(filteredColumns).forEach(([key, type]) => {
      const [table] = key.split('.');
      const isRelatedTable = table !== resource;
      const isLookupField = isRelatedTable && key === lookupFields[table as keyof typeof lookupFields];
      const isRequired = !type.endsWith('?');

      const colDef: ColDef = {
        field: key,
        headerName: `${formatHeader(key)}${isRequired ? ' *' : ''}`,
        editable: !isRelatedTable || isLookupField,
        minWidth: 150,
        flex: 1,
        suppressMovable: true,
        valueGetter: (params) => {
          if (params.data[key] === null) return '';
          if (type.startsWith('DateTime')) {
            return params.data[key]
              ? new Date(params.data[key]).toLocaleDateString()
              : '';
          }
          return params.data[key];
        },
        valueSetter: (params) => {
          const newValue = params.newValue;
          params.data[key] = newValue;
          return true;
        }
      };

      // Handle different types of fields
      const enumMatch = type.match(/^Enum\((.+?)\)\??$/);
      if (enumMatch) {
        const enumName = enumMatch[1];
        colDef.cellEditor = 'agSelectCellEditor';
        colDef.cellEditorParams = { 
          values: getEnumValues(enumName)
        };
        colDef.cellRenderer = (params: any) => {
          //@ts-ingore
          return params.value ? <EnumBadge enum={enumName as EnumBadgeProps['enum']} value={params.value} /> : '';
        };
      } else if (type.startsWith('Boolean')) {
        colDef.cellEditor = 'agCheckboxCellEditor';
        colDef.cellRenderer = (params: any) => {
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

      if (isRelatedTable && isLookupField) {
        colDef.cellEditor = AutoCompleteEditor;
        colDef.cellEditorParams = {
          route: table,
          searchColumn: key.split('.')[1],
          onDataSelected: (data: Record<string, any>, node: any) => {
            // Store only necessary data from the related table
            const updatedData = { ...node.data };
            // Store the ID for the foreign key reference
            updatedData[`${table}.id`] = data.id;
            // Store display fields for user reference
            Object.entries(data).forEach(([field, val]) => {
              if (field !== 'id') {
                const fullKey = `${table}.${field}`;
                // Only store if the column exists in availableColumnTypes
                if (availableColumnTypes[fullKey]) {
                  updatedData[fullKey] = val;
                }
              }
            });
            node.setData(updatedData);
          },
        };
      }

      defs.push(colDef);
    });

    return defs;
  }, [filteredColumns, resource, lookupFields, formatHeader, removeRowColDef, availableColumnTypes]);

  // Grid options with specific class name
  const gridOptions: GridOptions = useMemo(() => ({
    suppressMovableColumns: true,
    defaultColDef: {
      sortable: false,
      resizable: true,
      flex: 1,
    }
  }), []);

  // Validate data before submission
  const validateData = useCallback((): boolean => {
    const newErrors: Record<string, string[]> = {};
    let isValid = true;
    const missingFields: string[] = [];

    rowData.forEach((row, index) => {
      Object.entries(filteredColumns).forEach(([key, type]) => {
        const [table] = key.split('.');
        if (table === resource && !type.endsWith('?') && !row[key]) {
          if (!newErrors[key]) newErrors[key] = [];
          newErrors[key][index] = 'Required';
          isValid = false;
          const formattedFieldName = formatHeader(key);
          if (!missingFields.includes(formattedFieldName)) {
            missingFields.push(formattedFieldName);
          }
        }
      });
    });

    if (!isValid) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: `Please fill in all required fields: ${missingFields.join(', ')}`,
        duration: 5000,
      });
    }

    setErrors(newErrors);
    return isValid;
  }, [filteredColumns, resource, rowData, toast, formatHeader]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateData()) return;

    setIsSubmitting(true);
    try {
      // Transform the data before sending
      const formattedData = transformDataForSubmission(rowData);

      const result = await createData(resource, formattedData);

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Records created successfully',
          duration: 3000,
        });
        setRowData([{}]);
        onClose();
        if (onSubmit) onSubmit();
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
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add new row
  const addRow = useCallback(() => {
    setRowData(prev => [...prev, {}]);
  }, []);

  // Remove row
  const removeRow = useCallback((index: number) => {
    setRowData(prev => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <>
      <style>{createDialogGridStyles}</style>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Create New {resource.charAt(0).toUpperCase() + resource.slice(1)}(s)</DialogTitle>
            <DialogDescription>
              Add one or more entries. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex-grow h-[60vh] create-dialog-grid ag-theme-quartz">
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              onGridReady={params => setGridApi(params.api)}
              onCellValueChanged={onCellValueChanged}
              gridOptions={gridOptions}
              className="create-dialog-grid"
            />
          </div>
          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              onClick={addRow}
              className="border border-brand text-brand font-bold hover:bg-brand-light/20"
            >
              Add Row
            </Button>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="border border-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-brand text-white font-bold hover:bg-brand-dark"
              >
                {isSubmitting ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateDialog;