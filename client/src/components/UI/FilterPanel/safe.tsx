// import React, { useState, useMemo, useCallback, useEffect } from 'react';
// import { FilterConfig } from '../../../../../shared/src/types';
// import { availableColumnsTypes } from '../../../types';
// import { ListFilter, PlusIcon, TrashIcon, ChevronsUpDown, Check, Calendar } from 'lucide-react';
// import { getEnumValues } from "../../../utils/EnumUtil/EnumUtil";
// import {
//     Popover,
//     PopoverContent,
//     PopoverTrigger,
// } from "@/components/ui/popover";
// import {
//     Command,
//     CommandEmpty,
//     CommandGroup,
//     CommandInput,
//     CommandItem,
//     CommandList,
// } from "@/components/ui/command";
// import { Calendar as CalendarComponent } from "@/components/ui/calendar";
// import {
//     Popover as DatePopover,
//     PopoverContent as DatePopoverContent,
//     PopoverTrigger as DatePopoverTrigger,
// } from "@/components/ui/popover";
// import { format } from "date-fns";
// import { cn } from "@/lib/utils";
// import { Button } from '@/components/ui/button';
// import { Input } from "@/components/ui/input";
// import { Label } from '@/components/ui/label';
// import { Switch } from "@/components/ui/switch";
// import debounce from 'lodash.debounce';
// import { useRecoilState } from 'recoil';
// import { filterPanelLocalFiltersAtom, filterPanelOpenStateAtom } from '@/store/atoms/atoms';

// interface FilterPanelProps {
//     filterConfig: FilterConfig;
//     availableColumnTypes: availableColumnsTypes;
//     onFilterChange: (newFilterConfig: FilterConfig) => void;
//     resource: string;
// }

// interface LocalFilter {
//     column?: string;
//     operator?: string;
//     value?: string | number | boolean | Date | null;
//     isComplete: boolean;
// }

// const formatDateForPrisma = (date: Date): string => {
//     return date.toISOString();
// };

// const formatHeader = (name: string, resource: string): string => {
//     const [parentField, childField] = name.split('.');
//     if (parentField === resource) {
//         return childField.charAt(0).toUpperCase() + childField.slice(1);
//     }
//     return `${parentField.charAt(0).toUpperCase() + parentField.slice(1)} ${childField.charAt(0).toUpperCase() + childField.slice(1)}`;
// };

// const DatePickerWithPresets: React.FC<{
//     value?: Date;
//     onChange: (date: Date | undefined) => void;
//     disabled?: boolean;
// }> = ({ value, onChange, disabled }) => {
//     const [date, setDate] = useState<Date | undefined>(value);

//     return (
//         <DatePopover>
//             <DatePopoverTrigger asChild>
//                 <Button
//                     variant="secondaryFlat"
//                     className={cn(
//                         "w-[200px] justify-start text-left font-normal",
//                         !date && "text-muted-foreground"
//                     )}
//                     disabled={disabled}
//                 >
//                     <Calendar className="mr-2 h-4 w-4" />
//                     {date ? format(date, "PPP") : "Pick a date"}
//                 </Button>
//             </DatePopoverTrigger>
//             <DatePopoverContent className="flex w-auto flex-col space-y-2 p-2">
//                 <CalendarComponent
//                     mode="single"
//                     selected={date}
//                     onSelect={(newDate) => {
//                         setDate(newDate);
//                         if (newDate) {
//                             const dateWithTime = new Date(newDate);
//                             dateWithTime.setHours(0, 0, 0, 0);
//                             onChange(dateWithTime);
//                         } else {
//                             onChange(undefined);
//                         }
//                     }}
//                     initialFocus
//                 />
//             </DatePopoverContent>
//         </DatePopover>
//     );
// };

// const ColumnSelectionPopover: React.FC<{
//     filter: LocalFilter;
//     index: number;
//     availableColumnTypes: availableColumnsTypes;
//     handleFilterChange: (index: number, field: keyof LocalFilter, value: any) => void;
//     resource: string;
//     filterConfig: FilterConfig;
// }> = ({ filter, index, availableColumnTypes, handleFilterChange, resource, filterConfig }) => {
//     const [open, setOpen] = useState(false);
//     const filteredColumns = useMemo(() => {
//         return Object.entries(availableColumnTypes).reduce((acc, [key, value]) => {
//             const [, childField] = key.split('.');
//             if (
//                 childField !== 'id' &&
//                 childField !== 'siteId' &&
//                 childField !== 'salesPersonId' &&
//                 childField !== 'clientId' &&
//                 childField !== 'pocId' &&
//                 childField !== 'vendorId' &&
//                 !(filterConfig.columns?.includes(key) ?? false)
//             ) {
//                 acc[key] = value;
//             }
//             return acc;
//         }, {} as availableColumnsTypes);
//     }, [availableColumnTypes, filterConfig.columns]);

//     return (
//         <Popover open={open} onOpenChange={setOpen}>
//             <PopoverTrigger asChild>
//                 <Button
//                     variant="secondaryFlat"
//                     role="combobox"
//                     className="w-[200px] justify-between"
//                 >
//                     {filter.column ? formatHeader(filter.column, resource) : 'Select column'}
//                     <ChevronsUpDown className="opacity-50" />
//                 </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-64 p-0">
//                 <Command>
//                     <CommandInput placeholder="Search columns..." />
//                     <CommandList>
//                         <CommandEmpty>No columns found</CommandEmpty>
//                         <CommandGroup>
//                             {Object.keys(filteredColumns).map((column) => (
//                                 <CommandItem
//                                     key={column}
//                                     value={column}
//                                     onSelect={(currentValue) => {
//                                         handleFilterChange(index, 'column', currentValue);
//                                         setOpen(false);
//                                     }}
//                                 >
//                                     {formatHeader(column, resource)}
//                                     <Check className={cn(
//                                         "ml-auto",
//                                         filter.column === column ? "opacity-100" : "opacity-0"
//                                     )} />
//                                 </CommandItem>
//                             ))}
//                         </CommandGroup>
//                     </CommandList>
//                 </Command>
//             </PopoverContent>
//         </Popover>
//     );
// };

// const OperatorSelectionPopover: React.FC<{
//     filter: LocalFilter;
//     index: number;
//     operators: { value: string; label: string }[];
//     handleFilterChange: (index: number, field: keyof LocalFilter, value: any) => void;
//     disabled: boolean;
// }> = ({ filter, index, operators, handleFilterChange, disabled }) => {
//     const [open, setOpen] = useState(false);

//     return (
//         <Popover open={open} onOpenChange={setOpen}>
//             <PopoverTrigger asChild>
//                 <Button
//                     variant="secondaryFlat"
//                     role="combobox"
//                     className="w-[200px] justify-between"
//                     disabled={disabled}
//                 >
//                     {operators.find(op => op.value === filter.operator)?.label || 'Select operator'}
//                     <ChevronsUpDown className="opacity-50" />
//                 </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-64 p-0">
//                 <Command>
//                     <CommandList>
//                         <CommandGroup>
//                             {operators.map((op) => (
//                                 <CommandItem
//                                     key={op.value}
//                                     value={op.value}
//                                     onSelect={(currentValue) => {
//                                         handleFilterChange(index, 'operator', currentValue);
//                                         setOpen(false);
//                                     }}
//                                 >
//                                     {op.label}
//                                     <Check className={cn(
//                                         "ml-auto",
//                                         filter.operator === op.value ? "opacity-100" : "opacity-0"
//                                     )} />
//                                 </CommandItem>
//                             ))}
//                         </CommandGroup>
//                     </CommandList>
//                 </Command>
//             </PopoverContent>
//         </Popover>
//     );
// };

// const ValueSelectionPopover: React.FC<{
//     columnType: string;
//     value: any;
//     onChange: (value: any) => void;
//     disabled: boolean;
// }> = ({ columnType, value, onChange, disabled }) => {
//     const [open, setOpen] = useState(false);

//     const getOptions = useCallback(() => {
//         if (columnType === 'Boolean' || columnType === 'Boolean?') {
//             return [
//                 { value: true, label: 'True' },
//                 { value: false, label: 'False' }
//             ];
//         }

//         const enumMatch = columnType.match(/^Enum\((.+?)\)\??$/);
//         if (enumMatch) {
//             const enumName = enumMatch[1];
//             const values = getEnumValues(enumName);
//             return values.map(v => ({ value: v, label: v }));
//         }

//         return [];
//     }, [columnType]);

//     const options = getOptions();

//     const getDisplayValue = useCallback(() => {
//         if (value === undefined || value === null) return 'Select value';

//         if (columnType === 'Boolean' || columnType === 'Boolean?') {
//             return value === true ? 'True' : 'False';
//         }
//         return value.toString();
//     }, [value, columnType]);

//     if (!options.length) return null;

//     return (
//         <Popover open={open} onOpenChange={setOpen}>
//             <PopoverTrigger asChild>
//                 <Button
//                     variant="secondaryFlat"
//                     role="combobox"
//                     className="w-[200px] justify-between"
//                     disabled={disabled}
//                 >
//                     {getDisplayValue()}
//                     <ChevronsUpDown className="opacity-50" />
//                 </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-64 p-0">
//                 <Command>
//                     <CommandList>
//                         <CommandGroup>
//                             {options.map((option) => (
//                                 <CommandItem
//                                     key={String(option.value)}
//                                     value={String(option.value)}
//                                     onSelect={() => {
//                                         const processedValue = columnType === 'Boolean' || columnType === 'Boolean?'
//                                             ? option.value === true
//                                             : option.value;
//                                         onChange(processedValue);
//                                         setOpen(false);
//                                     }}
//                                 >
//                                     {option.label}
//                                     <Check className={cn(
//                                         "ml-auto",
//                                         value === option.value ? "opacity-100" : "opacity-0"
//                                     )} />
//                                 </CommandItem>
//                             ))}
//                         </CommandGroup>
//                     </CommandList>
//                 </Command>
//             </PopoverContent>
//         </Popover>
//     );
// };

// export const FilterPanel: React.FC<FilterPanelProps> = ({
//     filterConfig,
//     availableColumnTypes,
//     onFilterChange,
//     resource
// }) => {
//     const [localFilters, setLocalFilters] = useRecoilState(filterPanelLocalFiltersAtom);
//     const [isInitialMount, setIsInitialMount] = useState(true);

//     // Initial sync of filterConfig.filters into localFilters
//     useEffect(() => {
//         if (isInitialMount) {

//             const initialFilters = filterConfig.filters?.length ?? 0 > 0
//                 ? filterConfig.filters!.map(filter => ({
//                     ...filter,
//                     isComplete: true
//                 }))
//                 : [{ isComplete: false }];
//             setLocalFilters(initialFilters);
//             setIsInitialMount(false);
//         }
//     }, [filterConfig, isInitialMount, setLocalFilters]);

//     // Sync filterConfig changes without overwriting incomplete filters
//     useEffect(() => {
//         if (!isInitialMount) {

//             setLocalFilters(prev => {
//                 const configFilters = filterConfig.filters?.map(f => ({ ...f, isComplete: true })) ?? [];
//                 const incompleteFilters = prev.filter(f => !f.isComplete);
//                 // Merge complete filters from filterConfig with existing incomplete filters
//                 const mergedFilters = [
//                     ...configFilters,
//                     ...incompleteFilters.filter(f => !configFilters.some(cf => cf.column === f.column))
//                 ];
//                 return mergedFilters.length > 0 ? mergedFilters : [{ isComplete: false }];
//             });
//         }
//     }, [filterConfig, isInitialMount, setLocalFilters]);

//     const [localConnector, setLocalConnector] = useState<'AND' | 'OR'>(
//         filterConfig.connector || 'AND'
//     );
//     const [filterPanelOpenState, setFilterPanelOpenState] = useRecoilState(filterPanelOpenStateAtom);
//     const [numberOfCompleteFilters, setNumberOfCompleteFilters] = useState(
//         filterConfig.filters?.length ?? 0
//     );

//     useEffect(() => {

//         setNumberOfCompleteFilters(filterConfig.filters?.length ?? 0);
//     }, [filterConfig, filterPanelOpenState]);

//     const getInputTypeForColumn = useCallback((columnType: string): React.HTMLInputTypeAttribute => {
//         switch (columnType) {
//             case 'Int':
//             case 'Int?':
//                 return 'number';
//             case 'DateTime':
//             case 'DateTime?':
//                 return 'datetime-local';
//             case 'Boolean':
//             case 'Boolean?':
//                 return 'select';
//             default:
//                 const enumMatch = columnType.match(/^Enum\((.+?)\)\??$/);
//                 if (enumMatch) return 'select';
//                 return 'text';
//         }
//     }, []);

//     const getOperatorsByType = useCallback((type: string): { value: string; label: string }[] => {
//         const baseOperators = (() => {
//             switch (type) {
//                 case 'String':
//                 case 'String?':
//                     return [
//                         { value: 'contains', label: 'Contains' },
//                         { value: 'startsWith', label: 'Starts With' },
//                         { value: 'endsWith', label: 'Ends With' },
//                         { value: 'equals', label: 'Equals' },
//                     ];
//                 case 'Int':
//                 case 'Int?':
//                     return [
//                         { value: 'gte', label: 'Greater Than or Equal To' },
//                         { value: 'lte', label: 'Less Than or Equal To' },
//                         { value: 'gt', label: 'Greater Than' },
//                         { value: 'lt', label: 'Less Than' },
//                         { value: 'equals', label: 'Equals' },
//                     ];
//                 case 'Boolean':
//                 case 'Boolean?':
//                     return [{ value: 'equals', label: 'Equals' }];
//                 case 'DateTime':
//                 case 'DateTime?':
//                     return [
//                         { value: 'equals', label: 'Equals' },
//                         { value: 'gt', label: 'After' },
//                         { value: 'lt', label: 'Before' },
//                         { value: 'lte', label: 'On or Before' },
//                         { value: 'gte', label: 'On or After' }
//                     ];
//                 default:
//                     const enumMatch = type.match(/^Enum\((.+?)\)\??$/);
//                     if (enumMatch) {
//                         return [{ value: 'equals', label: 'Is' }];
//                     }
//                     return [{ value: 'equals', label: 'Equals' }];
//             }
//         })();

//         if (type.endsWith('?')) {
//             return [
//                 ...baseOperators,
//                 { value: 'isNull', label: 'Is Null' },
//                 { value: 'isNotNull', label: 'Is Not Null' }
//             ];
//         }

//         return baseOperators;
//     }, []);

//     const updateGlobalFilterState = useCallback((filters: LocalFilter[], connector?: 'AND' | 'OR') => {
//         const completeFilters = filters.filter(f => f.isComplete);
//         const newFilterConfig: FilterConfig = {
//             ...filterConfig,
//             filters: completeFilters.map(filter => ({
//                 column: filter.column as string,
//                 operator: filter.operator as string,
//                 value: filter.value !== undefined ? filter.value : null
//             })),
//             connector: completeFilters.length > 1 ? (connector || localConnector) : 'AND'
//         };

//         onFilterChange(newFilterConfig);
//     }, [filterConfig, localConnector, onFilterChange]);

//     const debouncedUpdateGlobalState = useMemo(
//         () => debounce(updateGlobalFilterState, 500),
//         [updateGlobalFilterState]
//     );

//     useEffect(() => {
//         return () => {
//             debouncedUpdateGlobalState.cancel();
//         };
//     }, [debouncedUpdateGlobalState]);

//     const handleFilterChange = useCallback((
//         index: number,
//         field: keyof LocalFilter,
//         value: any
//     ) => {
//         setLocalFilters(prev => {
//             const newFilters = [...prev];
//             let processedValue = value;



//             if (field === 'column' && newFilters[index].isComplete) {
//                 const previousColumnType = newFilters[index].column
//                     ? availableColumnTypes[newFilters[index].column]
//                     : null;

//                 const newColumnType = value ? availableColumnTypes[value] : null;

//                 if (previousColumnType !== newColumnType) {
//                     newFilters[index] = {
//                         ...newFilters[index],
//                         column: value,
//                         operator: undefined,
//                         value: undefined,
//                         isComplete: false
//                     };

//                     const completeFilters = newFilters.filter(f => f.isComplete);
//                     debouncedUpdateGlobalState(completeFilters);
//                     return newFilters;
//                 }
//             }

//             if (field === 'value' && value === '') {
//                 newFilters[index] = {
//                     ...newFilters[index],
//                     value: undefined,
//                     isComplete: false
//                 };
//                 return newFilters;
//             }

//             if (field === 'operator' && (value === 'isNull' || value === 'isNotNull')) {
//                 newFilters[index] = {
//                     ...newFilters[index],
//                     operator: value,
//                     value: null,
//                     isComplete: true
//                 };
//                 debouncedUpdateGlobalState(newFilters);
//                 return newFilters;
//             }

//             if (field === 'value' && newFilters[index].column) {
//                 const columnType = availableColumnTypes[newFilters[index].column];
//                 if (columnType === 'DateTime' || columnType === 'DateTime?') {
//                     if (value instanceof Date) {
//                         processedValue = formatDateForPrisma(value);
//                     } else if (value === '') {
//                         processedValue = undefined;
//                     }
//                 } else if (columnType === 'Boolean' || columnType === 'Boolean?') {
//                     processedValue = value === true;
//                 } else {
//                     const enumMatch = columnType?.match(/^Enum\((.+?)\)\??$/);
//                     if (enumMatch) {
//                         processedValue = value;
//                     }
//                 }
//             }

//             newFilters[index] = {
//                 ...newFilters[index],
//                 [field]: processedValue,
//                 isComplete: field === 'value'
//                     ? !!(newFilters[index].column && newFilters[index].operator && processedValue !== undefined)
//                     : !!(newFilters[index].column && newFilters[index].operator && newFilters[index].value !== undefined)
//             };

//             if (newFilters[index].isComplete) {
//                 debouncedUpdateGlobalState(newFilters);
//             }


//             return newFilters;
//         });
//     }, [availableColumnTypes, debouncedUpdateGlobalState]);

//     const handleConnectorChange = useCallback((checked: boolean) => {
//         const newConnector = checked ? 'OR' : 'AND';
//         setLocalConnector(newConnector);
//         const completeFilters = localFilters.filter(f => f.isComplete);
//         if (completeFilters.length > 1) {
//             updateGlobalFilterState(completeFilters, newConnector);
//         }
//     }, [localFilters, updateGlobalFilterState]);

//     const handleRemoveFilter = useCallback((index: number) => {
//         setLocalFilters(prev => {
//             const newFilters = prev.filter((_, i) => i !== index);
//             if (newFilters.length === 0) {
//                 newFilters.push({ isComplete: false });
//             }
//             updateGlobalFilterState(newFilters);
//             return newFilters;
//         });
//     }, [updateGlobalFilterState]);

//     const addNewFilter = useCallback(() => {
//         setLocalFilters(prev => [
//             ...prev,
//             { isComplete: false }
//         ]);
//     }, []);

//     const handlePanelOpenChange = useCallback((open: boolean) => {

//         setFilterPanelOpenState(open);
//         if (!open) {
//             setLocalFilters(prev => {
//                 const completeFilters = prev.filter(f => f.isComplete);
//                 return completeFilters.length > 0 ? completeFilters : [{ isComplete: false }];
//             });
//         }
//     }, [setFilterPanelOpenState]);

//     const renderFilterItem = useCallback((filter: LocalFilter, index: number) => {
//         const columnType = filter.column ? availableColumnTypes[filter.column] : undefined;
//         const operators = columnType ? getOperatorsByType(columnType) : [];
//         const inputType = columnType ? getInputTypeForColumn(columnType) : 'text';
//         const isNullOperator = filter.operator === 'isNull' || filter.operator === 'isNotNull';

//         return (
//             <div key={index} className="flex items-center gap-2 mb-2">
//                 <div className="flex-1 flex items-center gap-2">
//                     <ColumnSelectionPopover
//                         filter={filter}
//                         index={index}
//                         availableColumnTypes={availableColumnTypes}
//                         handleFilterChange={handleFilterChange}
//                         resource={resource}
//                         filterConfig={filterConfig}
//                     />

//                     <OperatorSelectionPopover
//                         filter={filter}
//                         index={index}
//                         operators={operators}
//                         handleFilterChange={handleFilterChange}
//                         disabled={!filter.column}
//                     />

//                     {!isNullOperator && (columnType === 'DateTime' || columnType === 'DateTime?') ? (
//                         <DatePickerWithPresets
//                             value={filter.value ? new Date(filter.value as string) : undefined}
//                             onChange={(date) => handleFilterChange(index, 'value', date)}
//                             disabled={!filter.column || !filter.operator}
//                         />
//                     ) : !isNullOperator && (inputType === 'select' || (columnType && columnType.match(/^Enum\((.+?)\)\??$/))) ? (
//                         <ValueSelectionPopover
//                             columnType={columnType as string}
//                             value={filter.value}
//                             onChange={(value) => handleFilterChange(index, 'value', value)}
//                             disabled={!filter.column || !filter.operator}
//                         />
//                     ) : !isNullOperator ? (
//                         <Input
//                             type={inputType}
//                             placeholder="Enter value"
//                             className="w-[200px]"
//                             value={filter.value?.toString() ?? ''}
//                             onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
//                                 const value = inputType === 'number'
//                                     ? (e.target.value === '' ? '' : Number(e.target.value))
//                                     : e.target.value;
//                                 handleFilterChange(index, 'value', value);
//                             }}
//                             disabled={!filter.column || !filter.operator}
//                         />
//                     ) : null}

//                     <Button
//                         variant="ghost"
//                         size="icon"
//                         onClick={() => handleRemoveFilter(index)}
//                         className="h-8 w-8"
//                     >
//                         <TrashIcon className="h-4 w-4" />
//                     </Button>
//                 </div>
//             </div>
//         );
//     }, [availableColumnTypes, getOperatorsByType, getInputTypeForColumn, handleFilterChange, handleRemoveFilter, resource, filterConfig]);

//     return (
//         <div className="relative">
//             <Popover onOpenChange={handlePanelOpenChange} open={filterPanelOpenState}>
//                 <PopoverTrigger asChild>
//                     <Button
//                         variant="secondaryFlat"
//                         className={cn(
//                             "flex items-center gap-2",
//                             "transition-colors duration-300 ease-in-out",
//                             numberOfCompleteFilters > 0
//                                 ? "bg-blue-100 hover:bg-blue-200 dark:bg-red-900/30 dark:hover:bg-red-900/50"
//                                 : "bg-slate-100 hover:bg-slate-200"
//                         )}
//                     >
//                         <ListFilter className="w-5 h-5 mr-1" />
//                         Filters ({numberOfCompleteFilters})
//                     </Button>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-auto p-4">
//                     <div className="space-y-4">
//                         <div className="flex justify-between items-center">
//                             <h3 className="text-lg font-semibold">Filters</h3>
//                             <div className="flex items-center space-x-2">
//                                 <Label htmlFor="connector-switch" className="text-sm">AND</Label>
//                                 <Switch
//                                     id="connector-switch"
//                                     disabled={numberOfCompleteFilters <= 1}
//                                     checked={localConnector === 'OR'}
//                                     onCheckedChange={handleConnectorChange}
//                                 />
//                                 <Label htmlFor="connector-switch" className="text-sm">OR</Label>
//                             </div>
//                         </div>

//                         <div className="space-y-4">
//                             <div className="space-y-2">
//                                 {localFilters.map((filter, index) => renderFilterItem(filter, index))}
//                             </div>

//                             <Button
//                                 onClick={addNewFilter}
//                                 className="w-full"
//                                 variant="brandOutline"
//                                 disabled={localFilters.length > 0 && !localFilters[localFilters.length - 1].isComplete}
//                             >
//                                 <PlusIcon className="w-4 h-4 mr-1" />
//                                 Add Filter
//                             </Button>
//                         </div>
//                     </div>
//                 </PopoverContent>
//             </Popover>
//         </div>
//     );
// };

// export default FilterPanel;