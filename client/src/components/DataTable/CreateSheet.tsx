import React, { useCallback, useState } from 'react';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface CreateSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (newData: Record<string, any>) => Promise<void>;
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

export const CreateSheet: React.FC<CreateSheetProps> = React.memo(({
    isOpen,
    onClose,
    onAdd,
    columns,
    formatHeader,
    availableColumnTypes,
}) => {
    const [newData, setNewData] = useState<Record<string, any>>({});

    const handleChange = useCallback((column: string, value: any) => {
        setNewData(prev => {
            const columnType = availableColumnTypes[column];
            let formattedValue = value;

            if (columnType?.toLowerCase().includes('date')) {
                if (!value || value === '') {
                    formattedValue = undefined;
                } else {
                    try {
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

        // Format the data before submission
        const formattedData = Object.fromEntries(
            Object.entries(newData).map(([key, value]) => {
                const columnType = availableColumnTypes[key];

                if (columnType?.toLowerCase().includes('date')) {
                    if (!value ||
                        (typeof value === 'object' && Object.keys(value).length === 0)) {
                        return [key, undefined];
                    }

                    try {
                        if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
                            return [key, new Date(value).toISOString()];
                        }
                        return [key, undefined];
                    } catch (e) {
                        return [key, undefined];
                    }
                }

                return [key, value];
            })
        );

        // Remove undefined values and 'id' field if present
        const cleanedData = Object.fromEntries(
            Object.entries(formattedData)
                .filter(([key, value]) => value !== undefined && key !== 'id')
        );

        await onAdd(cleanedData);
        setNewData({}); // Reset form after successful submission
    }, [newData, availableColumnTypes, onAdd]);

    const handleCancel = useCallback(() => {
        setNewData({});
        onClose();
    }, [onClose]);

    const handleSheetClose = useCallback(() => {
        setNewData({});
        onClose();
    }, [onClose]);

    return (
        <Sheet open={isOpen} onOpenChange={handleSheetClose}>
            <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-auto">
                <SheetHeader>
                    <SheetTitle>Add New Record</SheetTitle>
                    <SheetDescription>
                        Fill in the details for the new record. Click add when you're done.
                    </SheetDescription>
                </SheetHeader>
                <div className="py-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {columns.filter(column => column !== 'id').map((column) => {
                            const inputType = getInputTypeForColumn(availableColumnTypes[column] || 'text');

                            return (
                                <div key={column} className="space-y-2">
                                    <label className="text-sm font-medium">
                                        {formatHeader(column)}
                                    </label>
                                    <input
                                        type={inputType}
                                        className="w-full rounded-md border p-2"
                                        value={newData[column] || ''}
                                        onChange={(e) => handleChange(column, e.target.value)}
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
                                Add Record
                            </Button>
                        </SheetFooter>
                    </form>
                </div>
            </SheetContent>
        </Sheet>
    );
});

CreateSheet.displayName = 'CreateSheet';

export default CreateSheet;