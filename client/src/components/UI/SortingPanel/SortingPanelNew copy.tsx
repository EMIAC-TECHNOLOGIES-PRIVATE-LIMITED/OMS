// import React, { useState, useEffect } from 'react';
// import { FilterConfig } from '../../../../../shared/src/types';
// import {
//   ArrowUpDownIcon,
//   PlusIcon,
//   Check,
//   ChevronsUpDown,
//   TrashIcon
// } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
// } from "@/components/ui/command";
// import { cn } from "@/lib/utils";

// interface SortingPanelNewProps {
//   resource: string;
//   filterConfig: FilterConfig;
//   availableColumnsTypes: { [key: string]: string };
//   onFilterChange: (newFilterConfig: FilterConfig) => void;
// }

// interface SortingEntry {
//   column: string;
//   hasDirection: boolean;
// }

// const formatHeader = (name: string, resource: string): string => {
//   const [parentField, childField] = name.split('.');
//   if (parentField === resource) {
//     return childField.charAt(0).toUpperCase() + childField.slice(1);
//   }
//   return `${parentField.charAt(0).toUpperCase() + parentField.slice(1)} ${childField.charAt(0).toUpperCase() + childField.slice(1)}`;
// };

// // Sub-component: ColumnSelectionPopover
// function ColumnSelectionPopover({
//   index,
//   column,
//   orderedColumns,
//   handleSortingChange,
//   resource,
// }: {
//   index: number;
//   column: string;
//   orderedColumns: { value: string; label: string }[];
//   handleSortingChange: (index: number, field: 'column' | 'direction', value: string) => void;
//   resource: string;
// }) {
//   // Local popover state for column selection
//   const [open, setOpen] = useState(false);

//   return (
//     <Popover open={open} onOpenChange={setOpen}>
//       <PopoverTrigger asChild>
//         <Button
//           variant="secondaryFlat"
//           size="sm"
//           className="w-[200px] justify-between"
//           onClick={() => setOpen(true)}
//           role="combobox"
//         >
//           {column ? formatHeader(column, resource) : "Select Column"}
//           <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent className="w-auto p-4">
//         <Command>
//           <CommandInput placeholder="Search column..." />
//           <CommandList>
//             <CommandEmpty>No column found.</CommandEmpty>
//             <CommandGroup>
//               {orderedColumns.map((col) => (
//                 <CommandItem
//                   key={col.value}
//                   value={col.value}
//                   onSelect={(currentValue) => {
//                     // Update sorting state
//                     handleSortingChange(index, 'column', currentValue);
//                     // Close the popover immediately
//                     setOpen(false);
//                   }}
//                 >
//                   {col.label}
//                   <Check
//                     className={cn(
//                       "ml-auto h-4 w-4",
//                       column === col.value ? "opacity-100" : "opacity-0"
//                     )}
//                   />
//                 </CommandItem>
//               ))}
//             </CommandGroup>
//           </CommandList>
//         </Command>
//       </PopoverContent>
//     </Popover>
//   );
// }

// // Sub-component: DirectionSelectionPopover
// function DirectionSelectionPopover({
//   index,
//   entry,
//   direction,
//   directionOptions,
//   handleSortingChange,
//   disabled,
// }: {
//   index: number;
//   entry: SortingEntry;
//   direction: 'asc' | 'desc';
//   directionOptions: { value: string; label: string }[];
//   handleSortingChange: (index: number, field: 'column' | 'direction', value: string) => void;
//   disabled: boolean;
// }) {
//   const [open, setOpen] = useState(false);

//   return (
//     <Popover open={open} onOpenChange={setOpen}>
//       <PopoverTrigger asChild>
//         <Button
//           variant="secondaryFlat"
//           size="sm"
//           role="combobox"
//           className="w-[100px] justify-between"
//           disabled={disabled}
//           onClick={() => setOpen(true)}
//         >
//           {entry.column && entry.hasDirection
//             ? directionOptions.find(opt => opt.value === direction)?.label
//             : "Select Order"}
//           <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent className="w-[140px] p-0">
//         <Command>
//           <CommandList>
//             <CommandGroup>
//               {directionOptions.map((option) => (
//                 <CommandItem
//                   key={option.value}
//                   value={option.value}
//                   onSelect={(currentValue) => {
//                     handleSortingChange(index, 'direction', currentValue);
//                     // Close popover immediately
//                     setOpen(false);
//                   }}
//                 >
//                   {option.label}
//                   <Check
//                     className={cn(
//                       "ml-auto h-4 w-4",
//                       direction === option.value && entry.hasDirection ? "opacity-100" : "opacity-0"
//                     )}
//                   />
//                 </CommandItem>
//               ))}
//             </CommandGroup>
//           </CommandList>
//         </Command>
//       </PopoverContent>
//     </Popover>
//   );
// }

// const SortingPanelNew: React.FC<SortingPanelNewProps> = ({
//   filterConfig,
//   availableColumnsTypes,
//   onFilterChange,
// }) => {
//   const [isOpen, setIsOpen] = useState<boolean>(false);

//   // Convert the global sort object to a local array representation.
//   const initialLocalSorting = filterConfig.sort
//     ? Object.entries(filterConfig.sort).map(([col, direction]) => ({ [col]: direction as 'asc' | 'desc' }))
//     : [];

//   // Local sorting array: each element is an object like { [columnName]: 'asc'|'desc' }
//   const [localSorting, setLocalSorting] = useState<{ [key: string]: 'asc' | 'desc' }[]>(initialLocalSorting);

//   // Each entry tracks user selection: { column: string, hasDirection: boolean }
//   const [pendingEntries, setPendingEntries] = useState<SortingEntry[]>(
//     initialLocalSorting.length > 0
//       ? initialLocalSorting.map(sort => {
//           const column = Object.keys(sort)[0];
//           return { column, hasDirection: true };
//         })
//       : [{ column: '', hasDirection: false }]
//   );

//   // Re-sync local state when global filterConfig.sort changes
//   useEffect(() => {
//     const validSortingArray = filterConfig.sort
//       ? Object.entries(filterConfig.sort).map(([col, direction]) => ({ [col]: direction as 'asc' | 'desc' }))
//       : [];
//     setLocalSorting(validSortingArray);
//     setPendingEntries(
//       validSortingArray.length > 0
//         ? validSortingArray.map(sort => {
//             const column = Object.keys(sort)[0];
//             return { column, hasDirection: true };
//           })
//         : [{ column: '', hasDirection: false }]
//     );
//   }, [filterConfig.sort]);

//   const handleSortingChange = (index: number, field: 'column' | 'direction', value: string) => {
//     if (field === 'column') {
//       const newPendingEntries = [...pendingEntries];
//       newPendingEntries[index] = { column: value, hasDirection: false };
//       setPendingEntries(newPendingEntries);

//       const newSorting = [...localSorting];
//       newSorting[index] = { [value]: 'asc' };
//       setLocalSorting(newSorting);
//     } else if (field === 'direction') {
//       const newPendingEntries = [...pendingEntries];
//       newPendingEntries[index].hasDirection = true;
//       setPendingEntries(newPendingEntries);

//       const column = pendingEntries[index].column;
//       if (column) {
//         const newSorting = [...localSorting];
//         newSorting[index] = { [column]: value as 'asc' | 'desc' };
//         setLocalSorting(newSorting);

//         // Only update global sort if the current entry is complete
//         if (newPendingEntries[index].hasDirection) {
//           const validSorting = newSorting.filter((sort, i) => {
//             const sortKey = Object.keys(sort)[0];
//             return sortKey !== '' && newPendingEntries[i]?.hasDirection;
//           });
//           // Merge the array into a single object for the new interface.
//           const mergedSorting = validSorting.reduce((acc, curr) => {
//             const key = Object.keys(curr)[0];
//             if (key) {
//               acc[key] = curr[key];
//             }
//             return acc;
//           }, {} as { [key: string]: 'asc' | 'desc' });
//           onFilterChange({
//             ...filterConfig,
//             sort: mergedSorting,
//           });
//         }
//       }
//     }
//   };

//   const addSorting = () => {
//     setPendingEntries([...pendingEntries, { column: '', hasDirection: false }]);
//     setLocalSorting([...localSorting, { '': 'asc' }]);
//   };

//   const removeSorting = (index: number) => {
//     const newPendingEntries = pendingEntries.filter((_, i) => i !== index);
//     const newSorting = localSorting.filter((_, i) => i !== index);

//     setPendingEntries(newPendingEntries.length > 0 ? newPendingEntries : [{ column: '', hasDirection: false }]);
//     setLocalSorting(newSorting);

//     const validSorting = newSorting.filter((_, i) => newPendingEntries[i]?.hasDirection);
//     const mergedSorting = validSorting.reduce((acc, curr) => {
//       const key = Object.keys(curr)[0];
//       if (key) {
//         acc[key] = curr[key];
//       }
//       return acc;
//     }, {} as { [key: string]: 'asc' | 'desc' });
//     onFilterChange({
//       ...filterConfig,
//       sort: mergedSorting,
//     });
//   };

//   const handlePanelClose = () => {
//     const validEntries = pendingEntries.filter(entry => entry.column !== '' && entry.hasDirection);
//     const validSorting = localSorting.filter((_, index) =>
//       pendingEntries[index]?.column !== '' && pendingEntries[index]?.hasDirection
//     );

//     setPendingEntries(validEntries.length > 0 ? validEntries : [{ column: '', hasDirection: false }]);
//     setLocalSorting(validSorting);

//     const mergedSorting = validSorting.reduce((acc, curr) => {
//       const key = Object.keys(curr)[0];
//       if (key) {
//         acc[key] = curr[key];
//       }
//       return acc;
//     }, {} as { [key: string]: 'asc' | 'desc' });
//     onFilterChange({
//       ...filterConfig,
//       sort: mergedSorting,
//     });
//     setIsOpen(false);
//   };

//   const isLastSortComplete = () => {
//     if (pendingEntries.length === 0) return true;
//     const last = pendingEntries[pendingEntries.length - 1];
//     return last.column !== '' && last.hasDirection;
//   };

//   const getDirectionOptions = (column: string) => {
//     const type = availableColumnsTypes[column];
//     if (type === 'String') {
//       return [
//         { value: 'asc', label: 'A-Z' },
//         { value: 'desc', label: 'Z-A' },
//       ];
//     } else if (type === 'Int' || type === 'BigInt' || type === 'DateTime') {
//       return [
//         { value: 'asc', label: '1-9' },
//         { value: 'desc', label: '9-1' },
//       ];
//     } else {
//       return [
//         { value: 'asc', label: 'Ascending' },
//         { value: 'desc', label: 'Descending' },
//       ];
//     }
//   };

//   const orderedColumns = Object.keys(availableColumnsTypes)
//     .filter((col) => filterConfig.columns?.includes(col))
//     .map(col => ({
//       value: col,
//       label: formatHeader(col , resourc)
//     }));

//   return (
//     <div className="relative">
//       <Popover open={isOpen} onOpenChange={(open) => !open && handlePanelClose()}>
//         <PopoverTrigger asChild>
//           <Button
//             variant="secondaryFlat"
//             size="default"
//             className={`
//               flex items-center gap-2
//               transition-colors duration-300 ease-in-out
//               ${filterConfig.sort && Object.keys(filterConfig.sort).length > 0
//                 ? "bg-green-100 hover:bg-green-200 dark:bg-red-900/30 dark:hover:bg-red-900/50"
//                 : ""}
//             `}
//             aria-label={`Toggle sorting panel. ${filterConfig.sort ? Object.keys(filterConfig.sort).length : 0} sorting rules`}
//             onClick={() => setIsOpen(true)}
//           >
//             <ArrowUpDownIcon className="w-4 h-4" />
//             <span className="hidden sm:block">{`Sorting (${filterConfig.sort ? Object.keys(filterConfig.sort).length : 0})`}</span>
//           </Button>
//         </PopoverTrigger>
//         <PopoverContent className="w-80">
//           <div className="space-y-4">
//             <div className="space-y-2">
//               <h4 className="font-bold ">Sort Data</h4>
//             </div>

//             <div className="space-y-2">
//               {pendingEntries.map((entry, index) => {
//                 const sortObj = localSorting[index] || { '': 'asc' };
//                 const column = entry.column;
//                 const direction = column ? sortObj[column] : 'asc';
//                 const directionOptions = getDirectionOptions(column);

//                 return (
//                   <div key={index} className="flex items-center gap-2 w-full max-w-[100%]">
//                     <div className="flex items-center gap-2 flex-nowrap overflow-hidden pr-2">
//                       {/* Column Selection */}
//                       <ColumnSelectionPopover
//                         index={index}
//                         column={column}
//                         orderedColumns={orderedColumns}
//                         handleSortingChange={handleSortingChange}
//                       />

//                       {/* Direction Selection */}
//                       <DirectionSelectionPopover
//                         index={index}
//                         entry={entry}
//                         direction={direction}
//                         directionOptions={directionOptions}
//                         handleSortingChange={handleSortingChange}
//                         disabled={!column}
//                       />

//                       {/* Remove Sorting */}
//                       {column && (
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           onClick={() => removeSorting(index)}
//                         >
//                           <TrashIcon className="w-4 h-4" />
//                         </Button>
//                       )}
//                     </div>
//                   </div>
//                 );
//               })}

//               <Button
//                 onClick={addSorting}
//                 variant="brandOutline"
//                 className="w-full mt-2"
//                 size="sm"
//                 disabled={!isLastSortComplete()}
//               >
//                 <PlusIcon className="w-4 h-4" />
//                 Add Sorting
//               </Button>
//             </div>
//           </div>
//         </PopoverContent>
//       </Popover>
//     </div>
//   );
// };

// export default SortingPanelNew;
