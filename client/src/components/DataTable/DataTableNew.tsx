// import React, { useState, useEffect, useRef } from 'react';
// import { Spinner } from '../UI/index';
// import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useRecoilValue } from 'recoil';
// import { authAtom } from '../../store/atoms/atoms';
// import { deleteData, updateData } from '../../utils/apiService/dataAPI';
// import { toast } from '../../hooks/use-toast';


// interface DataTableNewProps {
//   data: Record<string, any>[];
//   handleDataChange: (data: Record<string, any>[]) => void;
//   handleTotalRecordsChange: () => void;
//   availableColumns: string[];
//   loading: boolean;
//   error: string | null;
//   resource: string;
// }

// const DataTableNew: React.FC<DataTableNewProps> = ({
//   data,
//   availableColumns,
//   loading,
//   error,
//   resource,
//   handleDataChange,
//   handleTotalRecordsChange
// }) => {
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [selectedRow, setSelectedRow] = useState<Record<string, any> | null>(null);
//   const editModalRef = useRef<HTMLDivElement>(null);
//   const deleteModalRef = useRef<HTMLDivElement>(null);
//   const auth = useRecoilValue(authAtom);

//   // console.log(auth);

//   const handleEdit = (rowIndex: number) => {
//     setIsEditModalOpen(true);
//     // console.log(" The cliked row data is : ", data[rowIndex]);
//     setSelectedRow(data[rowIndex]);
//   };

//   const handleDelete = (rowIndex: number) => {
//     setIsDeleteModalOpen(true);
//     setSelectedRow(data[rowIndex]);
//   };

//   const handleSaveEdit = async () => {
//     if (!selectedRow) return;
//     try {
//       const success = await updateData(resource, selectedRow!);

//       toast({
//         variant: 'default',
//         duration: 5000,
//         title: 'Success',
//         description: 'Data updated successfully'
        
//       });

//       const updatedData = data.map((row) =>
//         row.id === selectedRow!.id ? selectedRow : row
//       );

//       handleDataChange(updatedData);
//       setIsEditModalOpen(false);
//       setSelectedRow(null);
//     } catch (error) {

//     }


//   };

//   const handleConfirmDelete = async () => {
//     try {
//       const success = await deleteData(resource, { id: selectedRow!.id });

//       handleTotalRecordsChange();
//       const updatedData = data.filter((row) => row.id !== selectedRow!.id);
//       handleDataChange(updatedData);
//       setIsDeleteModalOpen(false);
//       setSelectedRow(null);

//     } catch (error) {

//     }
//   };

//   const handleClickOutside = (event: MouseEvent) => {
//     if (
//       isEditModalOpen &&
//       editModalRef.current &&
//       !editModalRef.current.contains(event.target as Node)
//     ) {
//       setIsEditModalOpen(false);
//     }
//     if (
//       isDeleteModalOpen &&
//       deleteModalRef.current &&
//       !deleteModalRef.current.contains(event.target as Node)
//     ) {
//       setIsDeleteModalOpen(false);
//     }
//   };

//   useEffect(() => {
//     if (isEditModalOpen || isDeleteModalOpen) {
//       document.addEventListener('mousedown', handleClickOutside);
//     }
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [isEditModalOpen, isDeleteModalOpen]);

//   const displayColumns = React.useMemo(() => {
//     if (!data.length) return [];
//     const dataColumns = Object.keys(data[0]);
//     return availableColumns.filter((col) => dataColumns.includes(col));
//   }, [data, availableColumns]);

//   const formatHeader = (header: string) =>
//     header.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

//   const renderCellContent = (content: any) =>
//     typeof content === 'object' && content !== null
//       ? JSON.stringify(content)
//       : content ?? '--';

//   return (
//     <div className="relative w-full h-full">
//       {loading && <Spinner imagePath="./image.png" />}
//       {error && <p className="text-red-500 font-medium">{error}</p>}

//       {!loading && !error && (
//         <div className="w-full h-full overflow-auto">
//           <table className="min-w-full w-full border border-neutral-200 rounded-lg">
//             <thead className="bg-neutral-200 sticky top-0">
//               <tr>
//                 {displayColumns.map((column) => (
//                   <th
//                     key={column}
//                     className="py-3 px-6 border-b border-neutral-200 text-left text-sm font-semibold text-neutral-700"
//                   >
//                     {formatHeader(column)}
//                   </th>
//                 ))}
//                 <th className="py-3 px-6 border-b border-neutral-200 text-left text-sm font-semibold text-neutral-700">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {data.map((row, rowIndex) => (
//                 <tr
//                   key={rowIndex}
//                   className="hover:bg-gray-50 transition-colors duration-300"
//                 >
//                   {displayColumns.map((column) => (
//                     <td
//                       key={column}
//                       className="py-3 px-6 border-b border-neutral-200 text-sm text-neutral-800"
//                     >
//                       {renderCellContent(row[column])}
//                     </td>
//                   ))}
//                   <td className="py-3 px-6 border-b border-neutral-200 text-sm text-neutral-800 flex gap-4">
//                     <button
//                       className={`btn ${!auth.userInfo.permissions.some((p: any) => p.name === `_update_${resource}`)
//                         ? 'cursor-not-allowed'
//                         : 'cursor-pointer'
//                         }`}
//                       disabled={!auth.userInfo.permissions.some((p: any) => p.name === `_update_${resource}`)}
//                       onClick={() => handleEdit(rowIndex)}
//                     >
//                       <PencilIcon className="h-5 w-5" />
//                     </button>


//                     <button
//                       className={`btn ${!auth.userInfo.permissions.some((p: any) => p.name === `_delete_${resource}`)
//                         ? 'cursor-not-allowed'
//                         : 'cursor-pointer'
//                         }`}
//                       disabled={!auth.userInfo.permissions.some((p: any) => p.name === `_delete_${resource}`)}
//                       onClick={() => handleDelete(rowIndex)}>
//                       <TrashIcon className="h-5 w-5 text-red-500" />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Edit Modal */}
//       <AnimatePresence>
//         {isEditModalOpen && selectedRow && (
//           <motion.div
//             className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//           >
//             <motion.div
//               className="bg-white p-6 rounded-lg shadow-xl max-w-full w-[90%] h-[90%] overflow-auto"
//               initial={{ scale: 0.8 }}
//               animate={{ scale: 1 }}
//               exit={{ scale: 0.8 }}
//               ref={editModalRef}
//             >
//               <h3 className="text-xl font-semibold mb-4 text-gray-700">{`Edit ${resource} Data`}</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-auto">
//                 {Object.keys(selectedRow).map((key) => (
//                   <div key={key} className="flex flex-col">
//                     <label className="font-medium text-gray-600 mb-1">
//                       {formatHeader(key)}
//                     </label>
//                     <input
//                       type="text"
//                       value={selectedRow[key]}
//                       disabled={key === 'id'}
//                       onChange={(e) =>
//                         setSelectedRow({ ...selectedRow, [key]: e.target.value })
//                       }
//                       className="p-2 border rounded-lg focus:ring focus:ring-blue-200"
//                     />
//                   </div>
//                 ))}
//               </div>
//               <div className="flex justify-end space-x-4 mt-6">
//                 <button
//                   className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
//                   onClick={() => {
//                     setIsEditModalOpen(false)
//                     setSelectedRow(null)
//                   }
//                   }

//                 >
//                   Cancel
//                 </button>
//                 <button
//                   className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white"
//                   onClick={handleSaveEdit}
//                 >
//                   Save
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}


//       </AnimatePresence>
//       {/* Delete Modal */}
//       <AnimatePresence>
//         {isDeleteModalOpen && selectedRow && (
//           <motion.div
//             className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//           >
//             <motion.div
//               className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full"
//               initial={{ scale: 0.8 }}
//               animate={{ scale: 1 }}
//               exit={{ scale: 0.8 }}
//               ref={deleteModalRef}
//             >
//               <h3 className="text-xl font-semibold mb-4 text-red-700">{`Delete ${resource}`}</h3>
//               <p className="mb-4 text-gray-600">
//                 Are you sure you want to delete this entry? This action cannot be undone.
//               </p>
//               <div className="flex justify-end space-x-4">
//                 <button
//                   className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
//                   onClick={() => setIsDeleteModalOpen(false)}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white"
//                   onClick={handleConfirmDelete}
//                 >
//                   Delete
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div >
//   );
// };

// export default DataTableNew;
