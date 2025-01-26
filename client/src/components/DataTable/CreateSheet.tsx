import React, { useCallback, useState, useEffect } from "react";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Autocomplete } from "@/components/UI/TypeAhead/TypeAhead";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

// Enum Definitions 
const EnumDefinitions = {
    StatusLogin: ["ACTIVE", "INACTIVE"],
    OrderPaymentStatus: ["RECEIVED", "PARTIALLY_RECEIVED", "PENDING", "NOT_RECEIVED"],
    VendorPaymentStatus: ["HOLD", "UNPAID", "PAID", "PARTIALLY_PAID", "CANCEL"],
    OrderStatus: ["PENDING", "GIVEN", "PUBLISH", "NOT_PUBLISH", "CANCELT", "REPLACEMENT", "NEED_UPDATE"],
    VendorInvoiceStatus: ["PENDING", "ASK", "RECEIVED", "GIVEN", "PAID"],
    SiteType: ["NORMAL", "CASINO", "ADULT", "CBD"],
    Follow: ["Do_follow", "No_follow", "Sponsored"],
    PriceType: ["Paid", "Free", "Exchange"],
    Posting: ["Yes", "No"],
    WebsiteType: ["Default", "PR", "Language"],
    WebsiteStatus: ["Normal", "Blacklist", "Disqualified"],
    WebsiteQuality: ["Pure", "Almost_Pure", "Multi"],
};

// Define a more robust interface for relationship column info
interface RelationshipColumnInfo {
    route: string;
    displayColumn?: string;
}

interface CreateSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (newData: Record<string, any>[]) => Promise<{success : boolean}>; // Updated to accept an array
    columns: string[];
    formatHeader: (header: string) => string;
    availableColumnTypes: {
        [key: string]: string;
    };
    // Optional mapping for relationship columns
    relationshipColumns?: {
        [key: string]: RelationshipColumnInfo;
    };
}

const getInputTypeForColumn = (
    columnType: string
): React.HTMLInputTypeAttribute => {
    if (columnType.startsWith("Enum(")) return "select";

    switch (columnType) {
        case "Int":
        case "BigInt":
        case "Number":
        case "number":
        case "Int?":
        case "BigInt?":
        case "Number?":
        case "number?":
            return "number";
        case "DateTime":
        case "date":
        case "DateTime?":
        case "date?":
            return "datetime-local";
        case "Boolean":
        case "boolean":
        case "Boolean?":
        case "boolean?":
            return "select";
        default:
            return "text";
    }
};

const formatValue = (value: any, columnType: string) => {
    if (!value && value !== 0) return undefined;

    if (columnType?.includes("Int") || columnType?.includes("BigInt")) {
        return parseInt(value, 10) || undefined;
    }

    if (columnType?.toLowerCase().includes("date")) {
        try {
            return value;
        } catch (e) {
            return undefined;
        }
    }

    return value;
};

const CreateSheet: React.FC<CreateSheetProps> = React.memo(
    ({
        isOpen,
        onClose,
        onAdd,
        columns,
        formatHeader,
        availableColumnTypes,
       
    }) => {
        const [newData, setNewData] = useState<Record<string, any>>({});

        useEffect(() => {
            if (isOpen) {
                // Optionally set default values or initialize specific fields
                const initialData: Record<string, any> = {};
                columns.forEach(column => {
                    const columnType = availableColumnTypes[column];

                    // Set default values for specific types
                    if (columnType === "boolean" || columnType === "Boolean") {
                        initialData[column] = false;
                    } else if (columnType?.includes("Int") || columnType?.includes("Number")) {
                        initialData[column] = 0;
                    }
                });
                setNewData(initialData);
            }
        }, [isOpen, columns, availableColumnTypes]);

        const handleChange = useCallback(
            (column: string, value: any) => {
                setNewData((prev) => ({
                    ...prev,
                    [column]: formatValue(value, availableColumnTypes[column]),
                }));
            },
            [availableColumnTypes]
        );

        const handleSubmit = useCallback(
            async (e: React.FormEvent) => {
                e.preventDefault();

                try {
                    const cleanedData = Object.fromEntries(
                        Object.entries(newData)
                            .filter(([key, value]) => value !== undefined && key !== "id")
                            .map(([key, value]) => {
                                const columnType = availableColumnTypes[key] || "text";

                                if (columnType.toLowerCase().includes("date")) {
                                    if (typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}/)) {
                                        try {
                                            return [key, new Date(value).toISOString()];
                                        } catch (e) {
                                            return [key, undefined];
                                        }
                                    }
                                    return [key, undefined];
                                }

                                return [key, formatValue(value, columnType)];
                            })
                    );

                    console.log("Adding new data", cleanedData);
                 await onAdd([cleanedData]); // Wrapped in an array
                } catch (error) {
                    console.error("Error adding new data", error);
                }
            },
            [newData, availableColumnTypes, onAdd]
        );

        const handleCancel = useCallback(() => {
            setNewData({});
            onClose();
        }, [onClose]);

        const handleSheetClose = useCallback(() => {
            setNewData({});
            onClose();
        }, [onClose]);

        // Helper function to extract enum name from column type
        const extractEnumName = (columnType: string): string | null => {
            const match = columnType.match(/^Enum\((\w+)\)$/);
            return match ? match[1] : null;
        };

        return (
            <Sheet open={isOpen} onOpenChange={handleSheetClose}>
                <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-auto">
                    <SheetHeader>
                        <SheetTitle>Add New Record</SheetTitle>
                        <SheetDescription>
                            Fill in the details for the new record. Click "Add" when you're done.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="py-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {columns
                                .filter((column) => column !== "id")
                                .map((column) => {
                                    const columnType = availableColumnTypes[column] || "text";
                                    const inputType = getInputTypeForColumn(columnType);

                                    // Hardcoded handling for 'vendor' and 'client' columns
                                    if (column === "vendor" || column === "client") {
                                        const relatedIdKey = `${column}_id`;
                                        const currentId = newData[relatedIdKey] || null;
                                        const currentName = "";

                                        return (
                                            <div key={column} className="space-y-2">
                                                <label className="text-sm font-medium">
                                                    {formatHeader(column)}
                                                </label>
                                                <Autocomplete
                                                    route={column} // Route is the same as the column name
                                                    column="name" // Assuming 'name' is the display column
                                                    initialValue={{ id: currentId, name: currentName }}
                                                    placeholder={`Search for ${column}`}
                                                    onSelect={(selectedId) => {
                                                        setNewData((prev) => ({
                                                            ...prev,
                                                            [`${column}_id`]: selectedId,
                                                        }));
                                                    }}
                                                    
                                                />
                                            </div>
                                        );
                                    }

                                   

                                    // Handle Enum types
                                    const enumName = extractEnumName(columnType);
                                    if (enumName && inputType === "select") {
                                        const enumValues = EnumDefinitions[enumName as keyof typeof EnumDefinitions] || [];

                                        return (
                                            <div key={column} className="space-y-2">
                                                <label className="text-sm font-medium">
                                                    {formatHeader(column)}
                                                </label>
                                                <Select
                                                    value={newData[column] ?? ""}
                                                    onValueChange={(value) => handleChange(column, value)}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder={`Select ${formatHeader(column)}`} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {enumValues.map((value) => (
                                                            <SelectItem key={value} value={value}>
                                                                {value}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        );
                                    }

                                    // Default input handling
                                    return (
                                        <div key={column} className="space-y-2">
                                            <label className="text-sm font-medium">
                                                {formatHeader(column)}
                                            </label>
                                            <input
                                                type={inputType}
                                                className="w-full rounded-md border p-2"
                                                value={newData[column] ?? ""}
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
    }
);

CreateSheet.displayName = "CreateSheet";
export default CreateSheet;
