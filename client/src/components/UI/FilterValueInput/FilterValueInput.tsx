// // src/components/UI/FilterValueInput/FilterValueInput.tsx

// import React, { useState } from 'react';
// import { ExtendedFilterCondition, FrontendAvailableColumns } from '../../../types';
// import { useTypeAhead } from '../../../hooks';

// interface FilterValueInputProps {
//   filter: ExtendedFilterCondition;
//   index: number;
//   columnType: string;
//   updateFilter: (
//     index: number,
//     field: keyof ExtendedFilterCondition,
//     value: any
//   ) => void;
//   availableColumns: FrontendAvailableColumns;
// }

// const FilterValueInput: React.FC<FilterValueInputProps> = ({
//   filter,
//   index,
//   columnType,
//   updateFilter,
// }) => {
//   const { suggestions, fetchSuggestions, resetSuggestions } = useTypeAhead();
//   const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(-1);

//   const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
//     if (event.key === 'ArrowDown') {
//       setActiveSuggestionIndex((prevIndex) =>
//         prevIndex < suggestions.length - 1 ? prevIndex + 1 : prevIndex
//       );
//     } else if (event.key === 'ArrowUp') {
//       setActiveSuggestionIndex((prevIndex) =>
//         prevIndex > 0 ? prevIndex - 1 : prevIndex
//       );
//     } else if (event.key === 'Enter') {
//       if (activeSuggestionIndex >= 0) {
//         updateFilter(index, 'value', suggestions[activeSuggestionIndex]);
//         resetSuggestions();
//       }
//     } else if (event.key === 'Escape') {
//       resetSuggestions();
//     }
//   };

//   if (['isNull', 'isNotNull'].includes(filter.operator)) {
//     return null;
//   }

//   const columnTypeLower = columnType.toLowerCase();

//   if (columnTypeLower === 'boolean') {
//     return (
//       <div className="flex items-center space-x-1 mr-2">
//         <input
//           type="checkbox"
//           checked={Boolean(filter.value)}
//           onChange={(e) => updateFilter(index, 'value', e.target.checked)}
//           className="form-checkbox h-4 w-4 text-brand focus:ring-brand-dark"
//         />
//         <span className="text-sm text-neutral-700">True</span>
//       </div>
//     );
//   }

//   return (
//     <div className="relative mr-2 flex-1">
//       <input
//         type={
//           columnTypeLower === 'number'
//             ? 'number'
//             : columnTypeLower === 'date'
//             ? 'date'
//             : 'text'
//         }
//         value={filter.value as string}
//         onChange={(e) => {
//           const newValue =
//             columnTypeLower === 'number'
//               ? e.target.valueAsNumber
//               : e.target.value;

//           updateFilter(index, 'value', newValue);

//           if (columnTypeLower === 'string') {
//             fetchSuggestions(filter.column, newValue as string);
//           }
//         }}
//         onKeyDown={handleKeyDown}
//         onBlur={() => resetSuggestions()}
//         className="border border-brand rounded-md p-1 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-brand-dark"
//         placeholder="Enter value"
//       />
//       {columnTypeLower === 'string' && suggestions.length > 0 && (
//         <ul className="absolute bg-white border border-neutral-200 rounded-md shadow-lg mt-1 z-50 max-h-40 overflow-y-auto w-full">
//           {suggestions.map((suggestion, i) => (
//             <li
//               key={i}
//               className={`p-2 text-sm text-neutral-800 cursor-pointer hover:bg-brand-light ${
//                 i === activeSuggestionIndex ? 'bg-brand-light' : ''
//               }`}
//               onMouseDown={() => {
//                 updateFilter(index, 'value', suggestion);
//                 resetSuggestions();
//               }}
//               onMouseEnter={() => setActiveSuggestionIndex(i)}
//             >
//               {suggestion}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default FilterValueInput;
