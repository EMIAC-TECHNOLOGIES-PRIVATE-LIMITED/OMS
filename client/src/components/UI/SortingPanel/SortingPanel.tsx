// import React, { useState, useRef, useEffect } from 'react';
// import { FilterConfig } from '../../../../../shared/src/types';

// import Panel from '../Panel/Panel';
// import { ArrowsUpDownIcon, ChevronDownIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
// import IconButton from '../IconButton/IconButton';
// import { Button } from '@/components/ui/button';

// interface SortingPanelNewProps {
//   resource: string;
//   filterConfig: FilterConfig;
//   availableColumnsTypes: { [key: string]: string };
//   onFilterChange: (newFilterConfig: FilterConfig) => void;
// }

// // Utility function to format column headers
// const formatHeader = (header: string) =>
//   header.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

// const SortingPanelNew: React.FC<SortingPanelNewProps> = ({
//   filterConfig,
//   availableColumnsTypes,
//   onFilterChange,
// }) => {
//   const [isSortingPanelOpen, setIsSortingPanelOpen] = useState<boolean>(false);
//   const [localSorting, setLocalSorting] = useState<{ [key: string]: 'asc' | 'desc' }[]>(
//     filterConfig.appliedSorting
//   );

//   useEffect(() => {
//     setLocalSorting(filterConfig.appliedSorting);
//   }, [filterConfig.appliedSorting]);

//   console.log(`The received value for filterConfig.appliedSorting is `, filterConfig.appliedSorting);

//   const panelRef = useRef<HTMLDivElement>(null);

//   const toggleSortingPanel = () => {
//     setIsSortingPanelOpen((prev) => !prev);
//   };

//   const handleSortingChange = (index: number, field: 'column' | 'direction', value: string) => {
//     const updatedSorting = [...localSorting];
//     const currentEntry = updatedSorting[index] || {};

//     if (field === 'column') {
//       updatedSorting[index] = { [value]: 'asc' as 'asc' | 'desc' };
//       setLocalSorting(updatedSorting);
//     } else if (field === 'direction') {
//       const column = Object.keys(currentEntry)[0] || '';
//       if (column) {
//         updatedSorting[index] = { [column]: value as 'asc' | 'desc' };
//         setLocalSorting(updatedSorting);

//         // Apply the sorting immediately
//         const validSorting = updatedSorting.filter((entry) => {
//           const col = Object.keys(entry)[0];
//           const dir = entry[col];
//           return col && dir;
//         });

//         onFilterChange({
//           ...filterConfig,
//           appliedSorting: validSorting,
//         });
//       }
//     }
//   };

//   const addSorting = () => {
//     setLocalSorting([...localSorting, { '': 'asc' }]);
//   };

//   const removeSorting = (index: number) => {
//     const updatedSorting = localSorting.filter((_, i) => i !== index);
//     setLocalSorting(updatedSorting);

//     // Apply the updated sorting immediately
//     const validSorting = updatedSorting.filter((entry) => {
//       const col = Object.keys(entry)[0];
//       const dir = entry[col];
//       return col && dir;
//     });

//     onFilterChange({
//       ...filterConfig,
//       appliedSorting: validSorting,
//     });
//   };

//   // Determine if the last sorting entry is complete
//   const isLastSortComplete = () => {
//     if (localSorting.length === 0) return true;
//     const lastSort = localSorting[localSorting.length - 1];
//     const column = Object.keys(lastSort)[0];
//     const direction = lastSort[column];
//     return column !== '' && (direction === 'asc' || direction === 'desc');
//   };

//   // Function to get direction options based on column type
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
//       // Default to asc/desc if type is Boolean or unsupported
//       return [
//         { value: 'asc', label: 'Ascending' },
//         { value: 'desc', label: 'Descending' },
//       ];
//     }
//   };

//   // Get ordered columns based on availableColumnsTypes
//   const orderedColumns = Object.keys(availableColumnsTypes).filter((col) =>
//     filterConfig.columns.includes(col)
//   );

//   return (
//     <div className="relative">
//       <Button
//         onClick={toggleSortingPanel}
//       >
//         {`Sort(${filterConfig.appliedSorting.length})`}
//         <ArrowsUpDownIcon className="w-5 h-5 mr-1" />

//       </Button>

//       <Panel
//         isOpen={isSortingPanelOpen}
//         onClose={() => setIsSortingPanelOpen(false)}
//         title="Sorting Options"
//         panelRef={panelRef}
//       >
//         <div>
//           {localSorting.map((sort, index) => {
//             const column = Object.keys(sort)[0] || '';
//             const direction = sort[column] || 'asc';
            

//             const directionOptions = getDirectionOptions(column);

//             return (
//               <div key={index} className="flex items-center mb-1">
//                 {/* Column Selection */}
//                 <div className="relative mr-2">
//                   <select
//                     value={column}
//                     onChange={(e) => handleSortingChange(index, 'column', e.target.value)}
//                     className="appearance-none w-32 border border-brand rounded-md p-1 text-xs focus:outline-none focus:ring-2 focus:ring-brand"
//                   >
//                     <option value="">Select Column</option>
//                     {orderedColumns.map((col) => (
//                       <option key={col} value={col}>
//                         {formatHeader(col)}
//                       </option>
//                     ))}
//                   </select>
//                   <ChevronDownIcon className="absolute right-1 top-1.5 h-4 w-4 text-gray-500 pointer-events-none" />
//                 </div>

//                 {/* Direction Selection */}
//                 <div
//                   className={`relative mr - 2 ${column === '' ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
//                     }`}
//                 >
//                   <select
//                     value={column === '' ? '' : direction}
//                     onChange={(e) => handleSortingChange(index, 'direction', e.target.value)}
//                     className="appearance-none w-24 border border-brand rounded-md p-1 text-xs focus:outline-none focus:ring-2 focus:ring-brand"
//                     disabled={!column}
//                   >
//                     {column === '' ? (
//                       <option value="" disabled>
//                         Select
//                       </option>
//                     ) : (
//                       directionOptions.map((option) => (
//                         <option key={option.value} value={option.value}>
//                           {option.label}
//                         </option>
//                       ))
//                     )}
//                   </select>
//                   <ChevronDownIcon className="absolute right-1 top-1.5 h-4 w-4 text-gray-500 pointer-events-none" />
//                 </div>

//                 {/* Remove Sorting Button */}
//                 <IconButton
//                   icon={<TrashIcon className="w-4 h-4 text-red-500" />}
//                   ariaLabel="Remove Sorting"
//                   onClick={() => removeSorting(index)}
//                 />
//               </div>
//             );
//           })}

//           <Button
//             onClick={addSorting}
//             className="mt-2 text-xs"
//             disabled={!isLastSortComplete()}
//           >
//             <PlusIcon className="w-4 h-4 mr-1" />
//             Add Sorting

//           </Button>
//         </div>

//         {/* Removed Apply and Cancel buttons */}
//       </Panel>
//     </div>
//   );
// };

// export default SortingPanelNew;
