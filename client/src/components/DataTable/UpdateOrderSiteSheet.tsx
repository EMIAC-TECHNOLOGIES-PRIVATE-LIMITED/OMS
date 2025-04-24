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
import { Loader2 } from 'lucide-react';
import { Command, CommandList, CommandItem, CommandEmpty } from '@/components/ui/command';
import { getSitesWithVendor } from '@/utils/apiService/typeAheadAPI';
import EnumBadge, { EnumBadgeProps, getEnumValues } from '@/utils/EnumUtil/EnumUtil';
import debounce from 'lodash.debounce';
import {
    ICellRendererParams,
    ICellEditorParams,
} from 'ag-grid-community';
import { useSetRecoilState } from 'recoil';
import { showFabAtom } from '@/store/atoms/atoms';
import { updateOrder } from '@/utils/apiService/dataAPI';

// Styles (same as CreateSheet with minor tweaks)
const updateDialogGridStyles = `
  .update-dialog-grid.ag-theme-quartz {
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
interface UpdateOrderSiteSheetProps {
    isOpen: boolean;
    onClose: () => void;
    rowData: Record<string, any>;
    availableColumnTypes: Record<string, string>;
}

interface AutoCompleteData {
    id: number;
    [key: string]: any;
}

// Utility function (same as CreateSheet)
const formatHeader = (name: string, resource: string): string => {
    const [parentField, childField] = name.split('.');
    if (parentField === resource) {
        return childField.charAt(0).toUpperCase() + childField.slice(1);
    }
    return `${parentField.charAt(0).toUpperCase() + parentField.slice(1)} ${childField.charAt(0).toUpperCase() + childField.slice(1)}`;
};

// AutoCompleteEditor with enhanced dropdown
interface AutoCompleteEditorParams extends ICellEditorParams {
    route: string;
    searchColumn: string;
    onDataSelected: (data: any, node: any) => void;
}

const AutoCompleteEditor: React.FC<AutoCompleteEditorParams> = (props) => {
    const [value, setValue] = useState(props.value || '');
    const [suggestions, setSuggestions] = useState<AutoCompleteData[]>([]);
    const [loading, setLoading] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(true);

    const inputRef = React.useRef<HTMLInputElement>(null);

    const fetchSuggestions = useCallback(
        debounce(async (input: string) => {
            if (input.length < 2) {
                setSuggestions([]);
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const data = await getSitesWithVendor(input, { timeout: 5000 });
                setSuggestions(data);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            } finally {
                setLoading(false);
            }
        }, 300),
        [props.route, props.searchColumn]
    );

    useEffect(() => {
        return () => {
            fetchSuggestions.cancel();
        };
    }, [fetchSuggestions]);

    useEffect(() => {
        inputRef.current?.focus();
        fetchSuggestions(value);
    }, []);

    const handleSelect = (selected: AutoCompleteData) => {
        const fullKey = `${props.route}.${props.searchColumn}`;
        props.onDataSelected(selected, props.node);
        props.stopEditing();
        props.node.setDataValue(fullKey, selected[fullKey]);
        setValue(selected[fullKey]);
        setIsPopupOpen(false);
    };

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <input
                ref={inputRef}
                value={value}
                onChange={(e) => {
                    setValue(e.target.value);
                    fetchSuggestions(e.target.value);
                    setIsPopupOpen(true);
                }}
                className="w-full h-full border-none outline-none px-2 text-sm"
                style={{ boxSizing: 'border-box' }}
            />
            {loading && (
                <Loader2 className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
            )}
            {isPopupOpen && suggestions.length > 0 && (
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
                            {suggestions.length === 0 && !loading && (
                                <CommandEmpty>No results found.</CommandEmpty>
                            )}
                            {suggestions.map((suggestion) => {
                                const fullKey = `${props.route}.${props.searchColumn}`;
                                const displayText = `${suggestion[fullKey]} (${suggestion['vendor.name']})`;
                                return (
                                    <CommandItem
                                        key={suggestion[`${props.route}.id`]}
                                        onSelect={() => handleSelect(suggestion)}
                                        className="cursor-pointer hover:bg-blue-50 text-sm py-2 px-2"
                                    >
                                        {displayText}
                                    </CommandItem>
                                );
                            })}
                        </CommandList>
                    </Command>
                </div>
            )}
        </div>
    );
};

(AutoCompleteEditor as any).getValue = function () {
    return this.getValue();
};
(AutoCompleteEditor as any).isPopup = function () {
    return true;
};

// Main Component
const UpdateOrderSiteSheet: React.FC<UpdateOrderSiteSheetProps> = ({
    isOpen,
    onClose,
    rowData: initialRowData,
    availableColumnTypes,
}) => {
    const { toast } = useToast();
    const gridRef = useRef<AgGridReact>(null);
    const [rowData, setRowData] = useState<Record<string, any>[]>([initialRowData]);
    const [invalidCells, setInvalidCells] = useState<Set<string>>(new Set());
    const setShowFab = useSetRecoilState(showFabAtom);
    const resource = 'order';

    const filteredColumns = useMemo(() => {
        return Object.entries(availableColumnTypes).reduce<Record<string, string>>(
            (acc, [key, value]) => {
                const [, childField] = key.split('.');
                if (
                    key !== 'poc.name' &&
                    key !== 'order.orderNumber' &&
                    ![
                        'id',
                        'siteId',
                        'salesPersonId',
                        'clientId',
                        'pocId',
                        'vendorId',
                        'createdAt',
                        'updatedAt',
                    ].includes(childField)
                ) {
                    acc[key] = value;
                }
                return acc;
            },
            {}
        );
    }, [availableColumnTypes]);

    const columnDefs = useMemo(() => {
        const defs: any[] = [];

        Object.entries(filteredColumns).forEach(([key, type]) => {

            const isSiteWebsite = key === 'site.website';
            const isRequired = isSiteWebsite; // Only site.website is required

            const colDef: any = {
                field: key,
                headerName: `${formatHeader(key, resource)}${isRequired ? ' *' : ''}`,
                editable: isSiteWebsite,
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
                    return <input type="checkbox" checked={params.value} className="cursor-pointer" disabled />;
                };
            } else if (type.startsWith('DateTime')) {
                colDef.cellEditor = 'agDateCellEditor';
            } else if (type.startsWith('Int')) {
                colDef.cellEditor = 'agNumberCellEditor';
            }

            if (isSiteWebsite) {
                colDef.cellEditor = AutoCompleteEditor;
                colDef.cellEditorParams = {
                    route: 'site',
                    searchColumn: 'website',
                    onDataSelected: (data: AutoCompleteData, node: any) => {
                        const updatedData = { ...node.data };
                        updatedData['site.id'] = data['site.id'];
                        updatedData['site.website'] = data['site.website'];
                        Object.entries(data).forEach(([field, val]) => {
                            if (field.startsWith('site.') && availableColumnTypes[field]) {
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
    }, [filteredColumns, resource, availableColumnTypes, invalidCells]);

    const validateData = useCallback(() => {
        const newInvalidCells = new Set<string>();
        let isValid = true;

        if (!rowData[0]['site.website']) {
            newInvalidCells.add(`0-site.website`);
            isValid = false;
        }

        setInvalidCells(newInvalidCells);
        if (!isValid) {
            setShowFab(false);
            setTimeout(() => setShowFab(true), 3500);
            toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: 'Please select a website',
                duration: 3000,
            });
        }
        return isValid;
    }, [rowData, toast, setShowFab]);

    const handleSubmit = useCallback(async () => {
        if (!validateData()) return;

        const payload: Record<string, any> = {};
        Object.entries(rowData[0]).forEach(([key, value]) => {
            const [table,] = key.split('.');
            if (table === 'order') {
                payload[key] = value;
            } else if (key === 'site.id') {
                payload['siteId'] = value;
            }
        });

        try {
            console.log('Mock API Payload:', payload);
            const response = await updateOrder(payload);
            if (response.success) {
                setShowFab(false);
                setTimeout(() => setShowFab(true), 3500);
                toast({
                    title: 'Success',
                    description: 'Site updated successfully (mocked)',
                    duration: 3000,
                });
                onClose();
            }
        } catch (error) {
            console.error('Mock API Error:', error);
            setShowFab(false);
            setTimeout(() => setShowFab(true), 3500);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to update site (mocked)',
                duration: 3000,
            });
        }
    }, [rowData, validateData, onClose, toast, setShowFab]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="min-w-[80vw] h-[80vh] flex flex-col p-0 bg-white rounded-lg shadow-xl">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-2xl font-semibold text-gray-800">
                        Update Order Site
                    </DialogTitle>
                </DialogHeader>
                <style>{updateDialogGridStyles}</style>
                <div className="flex-1 px-6 py-4 overflow-auto">
                    <AgGridReact
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        className="update-dialog-grid ag-theme-quartz rounded-md border border-gray-200"
                        defaultColDef={{
                            editable: false,
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
                            setRowData(newData);
                        }}
                    />
                </div>
                <div className="p-6 flex justify-end items-center bg-gray-50 border-t border-gray-200">
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 border-gray-300 hover:bg-gray-100"
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} variant="brand">
                            Update
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default UpdateOrderSiteSheet;