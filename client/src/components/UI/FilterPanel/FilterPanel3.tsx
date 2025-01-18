import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { FilterCondition, FilterConfig, LogicalOperator } from '../../../../../shared/src/types';
import { availableColumnsTypes } from '../../../types';
import { ListFilter, PlusIcon, TrashIcon, ChevronsUpDown, Check } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import debounce from 'lodash.debounce';

interface FilterPanelProps {
    filterConfig: FilterConfig;
    availableColumnTypes: availableColumnsTypes;
    onFilterChange: (newFilterConfig: FilterConfig) => void;
}

interface Operator {
    value: keyof FilterCondition;
    label: string;
}

interface LocalFilter {
    column?: string;
    operator?: keyof FilterCondition;
    value?: string | number | boolean | Date;
    isComplete: boolean;
}

// Sub-components for the selection popovers
const ColumnSelectionPopover = ({
    filter,
    index,
    availableColumnTypes,
    handleFilterChange
}: {
    filter: LocalFilter;
    index: number;
    availableColumnTypes: availableColumnsTypes;
    handleFilterChange: (index: number, field: keyof LocalFilter, value: any) => void;
}) => {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="secondaryFlat"
                    role="combobox"
                    className="w-[200px] justify-between"
                >
                    {filter.column || 'Select column'}
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0">
                <Command>
                    <CommandInput placeholder="Search columns..." />
                    <CommandList>
                        <CommandEmpty>No columns found</CommandEmpty>
                        <CommandGroup>
                            {Object.keys(availableColumnTypes).map((column) => (
                                <CommandItem
                                    key={column}
                                    value={column}
                                    onSelect={(currentValue) => {
                                        handleFilterChange(index, 'column', currentValue);
                                        setOpen(false);
                                    }}
                                >
                                    {column.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
                                    <Check className={cn(
                                        "ml-auto",
                                        filter.column === column ? "opacity-100" : "opacity-0"
                                    )} />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

const OperatorSelectionPopover = ({
    filter,
    index,
    operators,
    handleFilterChange,
    disabled
}: {
    filter: LocalFilter;
    index: number;
    operators: Operator[];
    handleFilterChange: (index: number, field: keyof LocalFilter, value: any) => void;
    disabled: boolean;
}) => {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="secondaryFlat"
                    role="combobox"
                    className="w-[200px] justify-between"
                    disabled={disabled}
                >
                    {operators.find(op => op.value === filter.operator)?.label || 'Select operator'}
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0">
                <Command>
                    <CommandList>
                        <CommandGroup>
                            {operators.map((op) => (
                                <CommandItem
                                    key={op.value}
                                    value={op.value}
                                    onSelect={(currentValue) => {
                                        handleFilterChange(index, 'operator', currentValue);
                                        setOpen(false);
                                    }}
                                >
                                    {op.label}
                                    <Check className={cn(
                                        "ml-auto",
                                        filter.operator === op.value ? "opacity-100" : "opacity-0"
                                    )} />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export const FilterPanel: React.FC<FilterPanelProps> = ({
    filterConfig,
    availableColumnTypes,
    onFilterChange,
}) => {
    const [localFilters, setLocalFilters] = useState<LocalFilter[]>([{ isComplete: false }]);
    const [localConnector, setLocalConnector] = useState<LogicalOperator>(LogicalOperator.AND);
    const [isOpen, setIsOpen] = useState(false);
    const [numberOfCompleteFilters, setNumberOfCompleteFilters] = useState(0);

    console.log("current filter config", filterConfig);

    useEffect(() => {
        const activeConnector = Object.entries(filterConfig.appliedFilters)
            .find(([_, filters]) => filters && filters.length > 0);

        if (activeConnector) {
            setNumberOfCompleteFilters(activeConnector[1].length);
        } else {
            setNumberOfCompleteFilters(0);
        }
    }, [filterConfig]);

    useEffect(() => {
        if (isOpen) {
            const filters: LocalFilter[] = [];
            const activeConnector = Object.entries(filterConfig.appliedFilters)
                .find(([_, filters]) => filters && filters.length > 0);

            if (activeConnector) {
                if (activeConnector[1].length > 1) {
                    setLocalConnector(activeConnector[0] as LogicalOperator);
                } else {
                    setLocalConnector(LogicalOperator.AND);
                }
                activeConnector[1].forEach((filter) => {
                    const [column, condition] = Object.entries(filter)[0];
                    const [operator, value] = Object.entries(condition)[0];

                    filters.push({
                        column,
                        operator: operator as keyof FilterCondition,
                        value,
                        isComplete: true,
                    });
                });
            }

            setLocalFilters(filters.length > 0 ? filters : [{ isComplete: false }]);
        }
    }, [isOpen, filterConfig]);

    const getInputTypeForColumn = useMemo(() => (columnType: string): React.HTMLInputTypeAttribute => {
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
    }, []);

    const getOperatorsByType = useMemo(() => (type: string): Operator[] => {
        switch (type) {
            case 'String':
            case 'String?':
            case 'string':
            case 'string?':
                return [
                    { value: 'contains', label: 'Contains' },
                    { value: 'startsWith', label: 'Starts With' },
                    { value: 'endsWith', label: 'Ends With' },
                    { value: 'equals', label: 'Equals' },
                    { value: 'in', label: 'In (comma-separated)' },
                ];
            case 'Int':
            case 'BigInt':
            case 'Number':
            case 'number':
            case 'Int?':
            case 'BigInt?':
            case 'Number?':
            case 'number?':
                return [
                    { value: 'gte', label: 'Greater Than or Equal To' },
                    { value: 'lte', label: 'Less Than or Equal To' },
                    { value: 'gt', label: 'Greater Than' },
                    { value: 'lt', label: 'Less Than' },
                    { value: 'equals', label: 'Equals' },
                    { value: 'in', label: 'In (comma-separated)' },
                ];
            case 'Boolean':
            case 'boolean':
            case 'Boolean?':
            case 'boolean?':
                return [{ value: 'equals', label: 'Equals' }];
            case 'DateTime':
            case 'date':
            case 'DateTime?':
            case 'date?':
                return [
                    { value: 'equals', label: 'Equals' },
                    { value: 'gt', label: 'After' },
                    { value: 'lt', label: 'Before' },
                ];
            default:
                return [{ value: 'equals', label: 'Equals' }];
        }
    }, []);

    const processFilterValue = useCallback((value: string | number | boolean | Date, operator: keyof FilterCondition, type: string) => {
        if (operator === 'in') {
            if (typeof value === 'string') {
                const values = value.split(',').map(v => v.trim());
                if (type.startsWith('Int') || type.startsWith('Number')) {
                    return values.map(Number);
                }
                return values;
            }
            return [value];
        }
        return value;
    }, []);

    const updateGlobalFilterState = useCallback((filters: LocalFilter[]) => {
        const completeFilters = filters.filter(f => f.isComplete);
        const newAppliedFilters: FilterConfig['appliedFilters'] = {};

        if (completeFilters.length > 0) {
            const connector = completeFilters.length === 1 ? LogicalOperator.AND : localConnector;
            const newFilters = completeFilters.map(filter => ({
                [filter.column as string]: {
                    [filter.operator as keyof FilterCondition]: processFilterValue(
                        filter.value as any,
                        filter.operator as keyof FilterCondition,
                        availableColumnTypes[filter.column as string]
                    )
                }
            }));
            newAppliedFilters[connector] = newFilters;
        }

        onFilterChange({
            ...filterConfig,
            appliedFilters: { ...newAppliedFilters },
        });
    }, [filterConfig, localConnector, onFilterChange, processFilterValue, availableColumnTypes]);

    const debouncedUpdateGlobalState = useMemo(
        () => debounce(updateGlobalFilterState, 500),
        [updateGlobalFilterState]
    );

    useEffect(() => {
        return () => {
            debouncedUpdateGlobalState.cancel();
        };
    }, [debouncedUpdateGlobalState]);

    const handleFilterChange = useCallback((
        index: number,
        field: keyof LocalFilter,
        value: any
    ) => {
        setLocalFilters(prev => {
            const newFilters = [...prev];
            newFilters[index] = {
                ...newFilters[index],
                [field]: value,
                isComplete: field === 'value'
                    ? !!(newFilters[index].column && newFilters[index].operator && value)
                    : !!(newFilters[index].column && newFilters[index].operator && newFilters[index].value)
            };

            if (newFilters[index].isComplete) {
                debouncedUpdateGlobalState(newFilters);
            }
            return newFilters;
        });
    }, [debouncedUpdateGlobalState]);

    const handleConnectorChange = useCallback((checked: boolean) => {
        const newConnector = checked ? LogicalOperator.OR : LogicalOperator.AND;
        setLocalConnector(newConnector);
        const completeFilters = localFilters.filter(f => f.isComplete);
        if (completeFilters.length > 1) {
            const newConfig = { ...filterConfig };
            Object.keys(newConfig.appliedFilters).forEach(key => {
                delete newConfig.appliedFilters[key as LogicalOperator];
            });

            newConfig.appliedFilters[newConnector] = completeFilters.map(filter => ({
                [filter.column as string]: {
                    [filter.operator as keyof FilterCondition]: processFilterValue(
                        filter.value as any,
                        filter.operator as keyof FilterCondition,
                        availableColumnTypes[filter.column as string]
                    )
                }
            }));

            onFilterChange(newConfig);
        }
    }, [filterConfig, localFilters, processFilterValue, availableColumnTypes, onFilterChange]);

    const handleRemoveFilter = useCallback((index: number) => {
        setLocalFilters(prev => {
            const newFilters = prev.filter((_, i) => i !== index);
            if (newFilters.length === 0) {
                newFilters.push({ isComplete: false });
            }
            updateGlobalFilterState(newFilters);
            return newFilters;
        });
    }, [updateGlobalFilterState]);

    const addNewFilter = useCallback(() => {
        setLocalFilters(prev => [
            ...prev,
            { isComplete: false }
        ]);
    }, []);

    const handlePanelOpenChange = useCallback((open: boolean) => {
        setIsOpen(open);
        if (!open) {
            setLocalFilters(prev => {
                const completeFilters = prev.filter(f => f.isComplete);
                return completeFilters.length > 0 ? completeFilters : [{ isComplete: false }];
            });
        }
    }, []);

    const renderFilterItem = useCallback((filter: LocalFilter, index: number) => {
        const columnType = filter.column ? availableColumnTypes[filter.column] : undefined;
        const operators = columnType ? getOperatorsByType(columnType) : [];
        const inputType = columnType ? getInputTypeForColumn(columnType) : 'text';

        return (
            <div key={index} className="flex items-center gap-2 mb-2">
                <div className="flex-1 flex items-center gap-2">
                    <ColumnSelectionPopover
                        filter={filter}
                        index={index}
                        availableColumnTypes={availableColumnTypes}
                        handleFilterChange={handleFilterChange}
                    />

                    <OperatorSelectionPopover
                        filter={filter}
                        index={index}
                        operators={operators}
                        handleFilterChange={handleFilterChange}
                        disabled={!filter.column} // Disabled until column is selected
                    />

                    {/* Value Input */}
                    <Input
                        type={inputType}
                        placeholder="Enter value"
                        className="w-[200px]"
                        value={filter.value?.toString() || ''}
                        onChange={(e) => {
                            const value = inputType === 'number'
                                ? (e.target.value === '' ? '' : Number(e.target.value))
                                : e.target.value;
                            handleFilterChange(index, 'value', value);
                        }}
                        disabled={!filter.column || !filter.operator}
                    />

                    {/* Remove Filter Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFilter(index)}
                        className="h-8 w-8"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    }, [availableColumnTypes, getOperatorsByType, getInputTypeForColumn, handleFilterChange, handleRemoveFilter]);

    return (
        <div className="relative">
            <Popover onOpenChange={handlePanelOpenChange}>
                <PopoverTrigger asChild>
                    <Button
                        variant="secondaryFlat"
                        className={cn(
                            "flex items-center gap-2",
                            "transition-colors duration-300 ease-in-out",
                            numberOfCompleteFilters > 0
                                ? "bg-blue-100 hover:bg-blue-200 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                                : ""
                        )}
                    >
                        <ListFilter className="w-5 h-5 mr-1" />
                        Filters ({numberOfCompleteFilters})
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Filters</h3>
                            <div className="flex items-center space-x-2">
                                <Label htmlFor="connector-switch" className="text-sm">AND</Label>
                                <Switch
                                    id="connector-switch"
                                    disabled={numberOfCompleteFilters <= 1}
                                    checked={localConnector === LogicalOperator.OR}
                                    onCheckedChange={handleConnectorChange}
                                />
                                <Label htmlFor="connector-switch" className="text-sm">OR</Label>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                {localFilters.map((filter, index) => renderFilterItem(filter, index))}
                            </div>

                            <Button
                                onClick={addNewFilter}
                                className="w-full"
                                variant="brandOutline"
                                disabled={localFilters.length > 0 && !localFilters[localFilters.length - 1].isComplete}
                            >
                                <PlusIcon className="w-4 h-4 mr-1" />
                                Add Filter
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default FilterPanel;