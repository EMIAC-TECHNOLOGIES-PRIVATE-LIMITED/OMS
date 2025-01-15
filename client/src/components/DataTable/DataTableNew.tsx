// DataTableNew.tsx

import React, { useState, useMemo } from 'react';
import { Spinner } from '../UI/index';
import { useRecoilValue } from 'recoil';
import { authAtom } from '../../store/atoms/atoms';
import { deleteData, updateData } from '../../utils/apiService/dataAPI';
import { toast } from '../../hooks/use-toast';
import { motion, AnimatePresence } from "framer-motion";

// Shad CN Sheet imports
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

// Shad CN Alert Dialog imports
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Shad CN Table imports
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
    TableCell,
} from "@/components/ui/table";

// BUTTONS
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

import { FilterCondition } from '../../../../shared/src/types';

// Create motion-enhanced versions of Shadcn components
const MotionTableRow = motion(TableRow);
const MotionTableCell = motion(TableCell);
const MotionTableHead = motion(TableHead);

interface SortingConfig {
    [key: string]: 'asc' | 'desc';
}

export interface FilterConfig {
    columns: string[];
    appliedFilters: {
        [key in LogicalOperator]?: Array<{
            [key: string]: FilterCondition;
        }>;
    };
    appliedSorting: SortingConfig[];
}

export enum LogicalOperator {
    AND = 'AND',
    OR = 'OR'
}

interface DataTableNewProps {
    data: Record<string, any>[];
    handleDataChange: (data: Record<string, any>[]) => void;
    handleTotalRecordsChange: () => void;
    availableColumns: string[];
    loading: boolean;
    error: string | null;
    resource: string;
    filteredColumns: Set<string>; // New prop
    sortedColumns: Set<string>;   // New prop
}

const DataTableNew: React.FC<DataTableNewProps> = ({
    data,
    availableColumns,
    loading,
    error,
    resource,
    handleDataChange,
    handleTotalRecordsChange,
    filteredColumns, // Received prop
    sortedColumns,   // Received prop
}) => {
    const [selectedRow, setSelectedRow] = useState<Record<string, any> | null>(null);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const auth = useRecoilValue(authAtom);

    // Animation configuration
    const spring = { type: "spring", damping: 40, stiffness: 200 };

    // Define the background color mapping based on filtered and sorted columns
    const columnBgColors: Record<string, string> = useMemo(() => {
        const colors: Record<string, string> = {};
        availableColumns.forEach(column => {
            if (filteredColumns.has(column)) {
                colors[column] = 'bg-blue-100'; // Blue for filtered columns
            } else if (sortedColumns.has(column)) {
                colors[column] = 'bg-green-100'; // Green for sorted columns
            }
            // If a column is in both, it gets 'bg-blue-100' due to the order
        });
        return colors;
    }, [availableColumns, filteredColumns, sortedColumns]);

    // Rest of the existing logic
    const handleEdit = (rowId: number) => {
        const row = data.find(r => r.id === rowId);
        if (row) {
            setSelectedRow(row);
        }
    };

    const handleSaveEdit = async () => {
        if (!selectedRow) return;
        try {
            await updateData(resource, selectedRow!);
            toast({
                variant: 'default',
                duration: 3500,
                title: 'Success',
                description: 'Data updated successfully',
            });
            const updatedData = data.map((row) =>
                row.id === selectedRow!.id ? selectedRow : row
            );
            handleDataChange(updatedData);
            setSelectedRow(null);
        } catch (error) {
            toast({
                variant: 'destructive',
                duration: 3500,
                title: 'Error',
                description: 'Failed to update data. Please try again or contact the admin.',
            });
        }
    };

    const handleConfirmDelete = async () => {
        try {
            await deleteData(resource, { id: selectedRow!.id });
            handleTotalRecordsChange();
            const updatedData = data.filter((row) => row.id !== selectedRow!.id);
            handleDataChange(updatedData);
            setSelectedRow(null);
            toast({
                variant: 'default',
                duration: 4000,
                title: 'Success',
                description: 'Data deleted successfully',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                duration: 4000,
                title: 'Error',
                description: 'Failed to delete data',
            });
        }
    };

    const displayColumns = useMemo(() => {
        if (!data.length) return [];
        const dataColumns = Object.keys(data[0]);
        return availableColumns.filter((col) => dataColumns.includes(col));
    }, [data, availableColumns]);

    const formatHeader = (header: string) =>
        header.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

    const renderCellContent = (content: any) =>
        typeof content === 'object' && content !== null
            ? JSON.stringify(content)
            : content ?? '--';

    const columnWidths: Record<string, string> = {
        id: '100px',
        name: '200px',
        email: '250px',
    };

    const tableName = resource.charAt(0).toUpperCase() + resource.slice(1);

    return (
        <div className="relative w-full h-full">
            
           

            {/* {loading && <Spinner imagePath="./image.png" />} */}
            {error && <p className="text-red-500 font-medium">{error}</p>}

            {!error && (
                <div className="relative w-full h-full overflow-auto">
                    <Table className="table-fixed border-collapse min-w-full w-full border border-slate-300 rounded-lg">
                        <TableHeader className="bg-neutral-200">
                            <MotionTableRow layout transition={spring}>
                                {displayColumns.map((column) => (
                                    <MotionTableHead
                                        key={column}
                                        layout
                                        transition={spring}
                                        style={{ width: columnWidths[column] || '150px' }}
                                        className={`py-3 px-6 border border-slate-300 text-left text-sm font-bold text-neutral-700 
                                            overflow-hidden text-ellipsis whitespace-nowrap `}
                                    >
                                        {formatHeader(column)}
                                    </MotionTableHead>
                                ))}
                                <MotionTableHead
                                    layout
                                    transition={spring}
                                    style={{ width: '150px' }}
                                    className="py-3 px-6 border border-slate-300 text-left text-sm font-bold text-neutral-700 
                                        overflow-hidden text-ellipsis whitespace-nowrap bg-neutral-200"
                                >
                                    Actions
                                </MotionTableHead>
                            </MotionTableRow>
                        </TableHeader>

                        <AnimatePresence>
                            <TableBody>
                                {data.map((row) => (
                                    <MotionTableRow
                                        key={row.id} // Use unique id instead of rowIndex for better performance
                                        layout
                                        transition={spring}
                                        exit={{ opacity: 0, maxHeight: 0 }}
                                        className="border border-slate-300 transition-colors duration-300 cursor-pointer 
                                            hover:bg-gray-50"
                                        onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}
                                    >
                                        {displayColumns.map((column) => (
                                            <MotionTableCell
                                                key={column}
                                                layout
                                                transition={spring}
                                                style={{ width: columnWidths[column] || '150px' }}
                                                className={`py-3 px-6 border border-slate-300 text-sm text-neutral-800 ${columnBgColors[column] || ''}`}
                                            >
                                                <div className={`${expandedRow === row.id ? "whitespace-normal" : "truncate"} 
                                                    max-w-xs overflow-hidden`}>
                                                    {renderCellContent(row[column])}
                                                </div>
                                            </MotionTableCell>
                                        ))}

                                        <MotionTableCell
                                            layout
                                            transition={spring}
                                            style={{ width: '150px' }}
                                            className="py-3 px-6 border border-slate-300 text-sm text-neutral-800 
                                                flex gap-4 items-start justify-start"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {/* Edit Sheet */}
                                            <Sheet>
                                                <SheetTrigger asChild>
                                                    <Button
                                                        variant="brand"
                                                        size={'sm'}
                                                        className={`btn ${!auth.userInfo.permissions.some(
                                                            (p: any) => p.name === `_update_${resource}`
                                                        ) ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                                        disabled={!auth.userInfo.permissions.some(
                                                            (p: any) => p.name === `_update_${resource}`
                                                        )}
                                                        onClick={() => handleEdit(row.id)} // Updated to use row.id
                                                    >
                                                        <Pencil className="h-5 w-5 mr-1" />
                                                        Edit
                                                    </Button>
                                                </SheetTrigger>
                                                <SheetContent className="h-full overflow-auto">
                                                    <SheetHeader>
                                                        <SheetTitle>{`Edit ${tableName} Data`}</SheetTitle>
                                                        <SheetDescription>
                                                            Update the necessary fields and click save.
                                                        </SheetDescription>
                                                    </SheetHeader>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                                                        {selectedRow &&
                                                            Object.keys(selectedRow).map((key) => (
                                                                <div key={key} className="flex flex-col">
                                                                    <label className="font-medium text-gray-600 mb-1">
                                                                        {formatHeader(key)}
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={selectedRow[key]}
                                                                        disabled={key === 'id'}
                                                                        onChange={(e) =>
                                                                            setSelectedRow({
                                                                                ...selectedRow,
                                                                                [key]: e.target.value,
                                                                            })
                                                                        }
                                                                        className="p-2 border rounded-lg focus:ring focus:ring-blue-200"
                                                                    />
                                                                </div>
                                                            ))}
                                                    </div>
                                                    <SheetFooter>
                                                        <SheetClose asChild>
                                                            <Button
                                                                variant="destructiveOutline"
                                                                onClick={() => setSelectedRow(null)}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </SheetClose>
                                                        <SheetClose asChild>
                                                            <Button variant="brand" onClick={handleSaveEdit}>
                                                                Save changes
                                                            </Button>
                                                        </SheetClose>
                                                    </SheetFooter>
                                                </SheetContent>
                                            </Sheet>

                                            {/* Delete Alert Dialog */}
                                            <AlertDialog>
                                                <AlertDialogTrigger>
                                                    <Button
                                                        variant="destructive"
                                                        size={'sm'}
                                                        className={`btn ${!auth.userInfo.permissions.some(
                                                            (p: any) => p.name === `_delete_${resource}`
                                                        ) ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                                        disabled={!auth.userInfo.permissions.some(
                                                            (p: any) => p.name === `_delete_${resource}`
                                                        )}
                                                        onClick={() => setSelectedRow(row)}
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>
                                                            Are you absolutely sure?
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete and remove the data from our servers.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            className="bg-white border border-brand text-brand font-bold 
                                                                hover:bg-brand-light/20 hover:text-brand-dark 
                                                                dark:border-brand-dark dark:text-brand-dark dark:hover:bg-brand-dark/10 
                                                                rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
                                                            onClick={handleConfirmDelete}
                                                        >
                                                            Confirm
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </MotionTableCell>
                                    </MotionTableRow>
                                ))}
                            </TableBody>
                        </AnimatePresence>
                    </Table>
                </div>
            )}
        </div>
    );
};

export default DataTableNew;
