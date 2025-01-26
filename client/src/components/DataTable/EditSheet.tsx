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
  follow: ["Do_follow", "No_follow", "Sponsored"],
  PriceType: ["Paid", "Free", "Exchange"],
  Posting: ["Yes", "No"],
  WebsiteType: ["Default", "PR", "Language"],
  WebsiteStatus: ["Normal", "Blacklist", "Disqualified"],
  WebsiteQuality: ["Pure", "Almost_Pure", "Multi"],
};

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

const getInputTypeForColumn = (
  columnType: string
): React.HTMLInputTypeAttribute => {
  // Check for Enum type first
  if (columnType.startsWith("Enum(")) {
    return "select";
  }

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

const formatValue = (value: any, columnType: string): any => {
  if (value === "" || value === null || value === undefined) {
    return columnType.includes("?")
      ? null
      : columnType.includes("Int") || columnType.includes("Number")
        ? 0
        : "";
  }

  if (columnType.includes("Int") || columnType.includes("Number")) {
    return parseInt(value, 10) || 0;
  }

  return value;
};

export const EditSheet: React.FC<EditSheetProps> = React.memo(
  ({
    isOpen,
    onClose,
    onSave,
    initialData,
    columns,
    formatHeader,
    availableColumnTypes,
  }) => {
    const [editedData, setEditedData] = useState<Record<string, any> | null>(
      null
    );

    useEffect(() => {
      if (isOpen && initialData) {
        const formattedInitialData = Object.fromEntries(
          Object.entries(initialData).map(([key, value]) => {
            const columnType = availableColumnTypes[key] || "text";

            if (
              value &&
              typeof value === "object" &&
              !Array.isArray(value) &&
              "id" in value
            ) {
              return [`${key}_id`, (value as { id: number }).id];
            }

            return [key, formatValue(value, columnType)];
          })
        );

        setEditedData(formattedInitialData);
      }
    }, [isOpen, initialData, availableColumnTypes]);

    const formatDateForInput = useCallback((value: any): string => {
      if (!value || (typeof value === "object" && Object.keys(value).length === 0)) {
        return "";
      }
      if (typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}/)) {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            return value.includes("T") ? value.slice(0, 16) : `${value}T00:00`;
          }
        } catch (e) {
          return "";
        }
      }
      return "";
    }, []);

    const handleChange = useCallback(
      (column: string, value: any) => {
        setEditedData((prev) => {
          if (!prev) return prev;

          const columnType = availableColumnTypes[column] || "text";
          let formattedValue = value;

          if (columnType.toLowerCase().includes("date")) {
            formattedValue = value || undefined;
          } else {
            formattedValue = formatValue(value, columnType);
          }

          return {
            ...prev,
            [column]: formattedValue,
          };
        });
      },
      [availableColumnTypes]
    );

    const handleSubmit = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editedData) return;

        // Final pass: handle date fields, remove undefined, etc.
        const formattedData = Object.fromEntries(
          Object.entries(editedData).map(([key, value]) => {
            const columnType = availableColumnTypes[key] || "text";

            // date fields
            if (columnType.toLowerCase().includes("date")) {
              if (
                !value ||
                (typeof value === "object" && Object.keys(value).length === 0)
              ) {
                return [key, undefined];
              }
              try {
                if (
                  typeof value === "string" &&
                  value.match(/^\d{4}-\d{2}-\d{2}/)
                ) {
                  return [key, new Date(value).toISOString()];
                }
                return [key, undefined];
              } catch (e) {
                return [key, undefined];
              }
            }
            return [key, formatValue(value, columnType)];
          })
        );

        // Remove undefined
        const cleanedData = Object.fromEntries(
          Object.entries(formattedData).filter(([_, val]) => val !== undefined)
        );

     
        columns.forEach((col) => {
          const val = initialData?.[col];
          if (val && typeof val === "object" && !Array.isArray(val)) {
            delete cleanedData[col]; // remove the original nested field
          }
        });

        await onSave(cleanedData);
      },
      [editedData, availableColumnTypes, onSave, columns, initialData]
    );

    const handleCancel = useCallback(() => {
      setEditedData(initialData ? { ...initialData } : null);
      onClose();
    }, [initialData, onClose]);

    const handleSheetClose = useCallback(() => {
      setEditedData(null);
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
            <SheetTitle>Edit Row</SheetTitle>
            <SheetDescription>
              Make changes to the selected row. Click save when you're done.
            </SheetDescription>
          </SheetHeader>
          <div className="py-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {columns.map((column) => {
                // Check if initialData[column] is a nested object -> then use our Autocomplete
                const originalValue = initialData?.[column];
                const columnType = availableColumnTypes[column] || "text";
                const isObjectField =
                  originalValue &&
                  typeof originalValue === "object" &&
                  !Array.isArray(originalValue);

                if (isObjectField) {
                  // We stored the foreign key in editedData as <column>_id
                  const columnFkKey = `${column}_id`;
                  // This is the numeric ID we are editing
                  const currentId = editedData?.[columnFkKey] ?? null;
                  // If we want to pass an "initialValue" containing both id + name, we can do this:
                  // (Below assumes `name` property is always there in originalValue)
                  const currentName =
                    typeof originalValue?.name === "string"
                      ? originalValue.name
                      : "";

                  return (
                    <div key={column} className="space-y-2">
                      <label className="text-sm font-medium">
                        {formatHeader(column)}
                      </label>
                      <Autocomplete
                        route={column.toLowerCase()}    // or a custom route if you know it, e.g. "vendor"
                        column="name"                   // the column on which we do type-ahead
                        emptyMessage={`No ${column} found`}
                        initialValue={{ id: currentId, name: currentName }}
                        onSelect={(selectedId) => {
                          setEditedData((prev) => ({
                            ...prev,
                            [columnFkKey]: selectedId,
                          }));
                        }}
                        placeholder={`Search for ${column}`}
                        disabled={column === "id"}
                      />
                    </div>
                  );
                } else {
                  // Handle Enum types with a dropdown
                  const inputType = getInputTypeForColumn(columnType);
                  const currentValue = editedData?.[column] ?? "";
                  const enumName = extractEnumName(columnType);

                  // Special handling for Enum types
                  if (enumName && inputType === "select") {
                    const enumValues = EnumDefinitions[enumName as keyof typeof EnumDefinitions] || [];

                    return (
                      <div key={column} className="space-y-2">
                        <label className="text-sm font-medium">
                          {formatHeader(column)}
                        </label>
                        <Select
                          value={currentValue}
                          onValueChange={(value) => handleChange(column, value)}
                          disabled={column === "id"}
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

                  // Default input handling for other types (datetime, number, text)
                  if (inputType === "datetime-local") {
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
                          disabled={column === "id"}
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
                        value={currentValue}
                        onChange={(e) => handleChange(column, e.target.value)}
                        disabled={column === "id"}
                      />
                    </div>
                  );
                }
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
  }
);

EditSheet.displayName = "EditSheet";