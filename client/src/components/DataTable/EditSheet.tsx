import React, { useCallback, useState, useEffect } from 'react';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface EditSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (editedData: Record<string, any>) => Promise<void>;
    initialData: Record<string, any> | null;
    columns: string[];
    formatHeader: (header: string) => string;
    availableColumnTypes: {
        [key: string]: string;
    };
}

const getInputTypeForColumn = (columnType: string): React.HTMLInputTypeAttribute => {
    switch (columnType) {
        case 'Int':
        case 'BigInt':
        case 'Number':
        case 'number':
        case 'Int?':
        case 'BigInt?':
        case 'Number?':
        case 'number?':
            return 'number';
        case 'DateTime':
        case 'date':
        case 'DateTime?':
        case 'date?':
            return 'datetime-local';
        case 'Boolean':
        case 'boolean':
        case 'Boolean?':
        case 'boolean?':
            return 'select';
        default:
            return 'text';
    }
};

export const EditSheet: React.FC<EditSheetProps> = React.memo(({
    isOpen,
    onClose,
    onSave,
    initialData,
    columns,
    formatHeader,
    availableColumnTypes,
}) => {
    const [editedData, setEditedData] = useState<Record<string, any> | null>(null);

    // Update editedData when initialData changes or sheet opens
    useEffect(() => {
        if (isOpen && initialData) {
            setEditedData({ ...initialData });
        }
    }, [isOpen, initialData]);

    const formatDateForInput = useCallback((value: any): string => {
        // Handle empty objects or null/undefined
        if (!value || typeof value === 'object' && Object.keys(value).length === 0) {
            return '';
        }

        // If it's already a valid date string in the correct format
        if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
            try {
                // Only process if it's a valid date
                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                    // Format as YYYY-MM-DDThh:mm
                    return value.includes('T') ? value.slice(0, 16) : `${value}T00:00`;
                }
            } catch (e) {
                return '';
            }
        }

        return '';
    }, []);

    const handleChange = useCallback((column: string, value: any) => {
        setEditedData(prev => {
            if (!prev) return prev;

            const columnType = availableColumnTypes[column];
            let formattedValue = value;

            if (columnType?.toLowerCase().includes('date')) {
                // If empty value, store as undefined (will be excluded from update)
                if (!value || value === '') {
                    formattedValue = undefined;
                } else {
                    try {
                        // Store the date string as is from the input
                        formattedValue = value;
                    } catch (e) {
                        formattedValue = undefined;
                    }
                }
            }

            return {
                ...prev,
                [column]: formattedValue,
            };
        });
    }, [availableColumnTypes]);


    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (editedData) {
            // Convert all datetime fields to proper format before saving
            const formattedData = Object.fromEntries(
                Object.entries(editedData).map(([key, value]) => {
                    const columnType = availableColumnTypes[key];

                    // Handle datetime fields
                    if (columnType?.toLowerCase().includes('date')) {
                        // If value is empty, undefined, or an empty object, 
                        // exclude it from the update payload
                        if (!value ||
                            (typeof value === 'object' && Object.keys(value).length === 0)) {
                            return [key, undefined]; // Prisma will ignore undefined values
                        }

                        try {
                            // For valid date strings from input
                            if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
                                return [key, new Date(value).toISOString()];
                            }
                            // If we can't process it, exclude it from update
                            return [key, undefined];
                        } catch (e) {
                            return [key, undefined];
                        }
                    }

                    // For non-datetime fields, return as is
                    return [key, value];
                })
            );

            // Remove any fields with undefined values
            const cleanedData = Object.fromEntries(
                Object.entries(formattedData)
                    .filter(([_, value]) => value !== undefined)
            );

            await onSave(cleanedData);
        }
    }, [editedData, availableColumnTypes, onSave]);


    const handleCancel = useCallback(() => {
        setEditedData(initialData ? { ...initialData } : null);
        onClose();
    }, [initialData, onClose]);

    const handleSheetClose = useCallback(() => {
        setEditedData(null);
        onClose();
    }, [onClose]);

    return (
        <Sheet open={isOpen} onOpenChange={handleSheetClose}>
            <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-auto">
                <SheetHeader>
                    <SheetTitle>Edit Row</SheetTitle>
                    <SheetDescription>
                        Make changes to the selected row. Click save when you're done.
                    </SheetDescription>
                </SheetHeader>
                <div className="py-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {columns.map((column) => {
                            const inputType = getInputTypeForColumn(availableColumnTypes[column] || 'text');
                            const currentValue = editedData?.[column];

                            if (inputType === 'datetime-local') {
                                return (
                                    <div key={column} className="space-y-2">
                                        <label className="text-sm font-medium">
                                            {formatHeader(column)}
                                        </label>
                                        <input
                                            type={inputType}
                                            className="w-full rounded-md border p-2"
                                            value={formatDateForInput(currentValue)}
                                            onChange={(e) => handleChange(column, e.target.value)}
                                            disabled={column === 'id'}
                                        />
                                    </div>
                                );
                            }

                            return (
                                <div key={column} className="space-y-2">
                                    <label className="text-sm font-medium">
                                        {formatHeader(column)}
                                    </label>
                                    <input
                                        type={inputType}
                                        className="w-full rounded-md border p-2"
                                        value={currentValue || ''}
                                        onChange={(e) => handleChange(column, e.target.value)}
                                        disabled={column === 'id'}
                                    />
                                </div>
                            );
                        })}
                        <SheetFooter>
                            <SheetClose asChild>
                                <Button type="button" variant="outline" onClick={handleCancel}>
                                    Cancel
                                </Button>
                            </SheetClose>
                            <Button type="submit" variant="brandOutline">
                                Save changes
                            </Button>
                        </SheetFooter>
                    </form>
                </div>
            </SheetContent>
        </Sheet>
    );
});

EditSheet.displayName = 'EditSheet';