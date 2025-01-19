import React, { useCallback, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Copy, CopyCheck, Pencil, Trash2 } from 'lucide-react';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from '../../hooks/use-toast';
import { authAtom } from '../../store/atoms/atoms';
import { deleteData, updateData } from '../../utils/apiService/dataAPI';
import TableSkeleton from './DataTableSkeleton';

interface DataTableNewProps {
    data: Record<string, any>[];
    availableColumnTypes: {
        [key: string]: string;
    };
    handleDataChange: (data: Record<string, any>[]) => void;
    handleTotalRecordsChange: () => void;
    loading: boolean;
    error: string | null;
    resource: string;
    filteredColumns: Set<string>;
    sortedColumns: Set<string>;
}

export const DataTableNew: React.FC<DataTableNewProps> = ({
    data,
    availableColumnTypes,
    handleDataChange,
    handleTotalRecordsChange,
    loading,
    error,
    resource,
    filteredColumns,
    sortedColumns
}) => {
    const auth = useRecoilValue(authAtom);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const [selectedRow, setSelectedRow] = useState<Record<string, any> | null>(null);
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [copiedCell, setCopiedCell] = useState<string | null>(null);

    const formatHeader = useCallback((header: string): string =>
        header.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
        , []);

    const columns = useMemo(() => {
        if (data.length === 0) return [];
        return Object.keys(data[0]);
    }, [data]);

    const getColumnColor = useCallback((column: string): string => {
        if (filteredColumns.has(column)) return 'bg-blue-100';
        if (sortedColumns.has(column)) return 'bg-green-100';
        return '';
    }, [filteredColumns, sortedColumns]);

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

    const handleEdit = useCallback(async (editedRow: Record<string, any>) => {
        try {
            await updateData(resource, editedRow);
            const updatedData = data.map((row) =>
                row.id === editedRow.id ? editedRow : row
            );
            handleDataChange(updatedData);
            setIsEditSheetOpen(false);
            toast({
                variant: 'default',
                duration: 3500,
                title: 'Success',
                description: 'Data updated successfully',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                duration: 3500,
                title: 'Error',
                description: 'Failed to update data',
            });
        }
    }, [data, resource, handleDataChange]);

    const handleDelete = useCallback(async (rowToDelete: Record<string, any>) => {
        try {
            await deleteData(resource, { id: rowToDelete.id });
            handleTotalRecordsChange();
            const updatedData = data.filter((row) => row.id !== rowToDelete.id);
            handleDataChange(updatedData);
            setIsDeleteDialogOpen(false);
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
    }, [resource, handleTotalRecordsChange, handleDataChange, data]);

    const handleCopyCell = (value: string) => {
        navigator.clipboard.writeText(value);
        setCopiedCell(value);
        setTimeout(() => setCopiedCell(null), 2000);
        toast({
            variant: 'default',
            duration: 1000,
            title: 'Copied',
            description: 'Cell content copied to clipboard',
        });
    };

    const handleCopyRow = (row: Record<string, any>) => {
        const rowString = Object.entries(row)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
        navigator.clipboard.writeText(rowString);
        toast({
            variant: 'default',
            duration: 1000,
            title: 'Copied',
            description: 'Row content copied to clipboard',
        });
    };

    const toggleRowExpansion = (id: number) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    if (loading) return <TableSkeleton />;
    if (error) return <div className="text-red-500">{error}</div>;
    if (!data.length) return <div className="text-gray-500">No data available</div>;

    return (
        <div className="w-full overflow-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map((column) => (
                            <TableHead
                                key={column}
                                className="w-40 min-w-40 max-w-40 px-4 py-2 font-semibold"
                            >
                                {formatHeader(column)}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((row) => (
                        <ContextMenu key={row.id}>
                            <ContextMenuTrigger>
                                <TableRow
                                    onClick={() => toggleRowExpansion(row.id)}
                                    className={`cursor-pointer transition-all duration-200 ${expandedRows.has(row.id) ? 'bg-slate-50' : ''
                                        }`}
                                >
                                    {columns.map((column) => (
                                        <TableCell
                                            key={`${row.id}-${column}`}
                                            className={`w-40 min-w-40 max-w-40 px-4 py-2 ${expandedRows.has(row.id) ? 'whitespace-normal' : 'truncate'
                                                } ${getColumnColor(column)}`}
                                        >
                                            {String(row[column])}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </ContextMenuTrigger>
                            <ContextMenuContent>
                                <ContextMenuItem onClick={() => handleCopyCell(String(row[columns[0]]))}>
                                    {copiedCell === String(row[columns[0]]) ? <CopyCheck className="mr-2" /> : <Copy className="mr-2" />}
                                    Copy Cell
                                </ContextMenuItem>
                                <ContextMenuItem onClick={() => handleCopyRow(row)}>
                                    <Copy className="mr-2" />
                                    Copy Row
                                </ContextMenuItem>
                                <ContextMenuSeparator />
                                <ContextMenuItem
                                    onClick={() => {
                                        setSelectedRow(row);
                                        setIsEditSheetOpen(true);
                                    }}
                                    disabled={!auth.userInfo.permissions.some((p) => p.name === `_update_${resource}`)}
                                >
                                    <Pencil className="mr-2" />
                                    Edit Row
                                </ContextMenuItem>
                                <ContextMenuItem
                                    onClick={() => {
                                        setSelectedRow(row);
                                        setIsDeleteDialogOpen(true);
                                    }}
                                    disabled={!auth.userInfo.permissions.some((p) => p.name === `_delete_${resource}`)}
                                    className="text-red-600"
                                >
                                    <Trash2 className="mr-2" />
                                    Delete Row
                                </ContextMenuItem>
                            </ContextMenuContent>
                        </ContextMenu>
                    ))}
                </TableBody>
            </Table>

            {/* Edit Sheet */}
            <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
                <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-auto">
                    <SheetHeader>
                        <SheetTitle>Edit Row</SheetTitle>
                        <SheetDescription>
                            Make changes to the selected row. Click save when you're done.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="py-6">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (selectedRow) {
                                    handleEdit(selectedRow);
                                }
                            }}
                            className="space-y-4"
                        >
                            {columns.map((column) => {
                                const inputType = getInputTypeForColumn(availableColumnTypes[column] || 'text');
                                return (
                                    <div key={column} className="space-y-2">
                                        <label className="text-sm font-medium">{formatHeader(column)}</label>
                                        {inputType === 'select' ? (
                                            <select
                                                className="w-full rounded-md border p-2"
                                                value={selectedRow?.[column] || ''}
                                                onChange={(e) => setSelectedRow(prev => ({
                                                    ...prev!,
                                                    [column]: e.target.value === 'true'
                                                }))}
                                                disabled={column === 'id'}
                                            >
                                                <option value="true">True</option>
                                                <option value="false">False</option>
                                            </select>
                                        ) : (
                                            <input
                                                type={inputType}
                                                className="w-full rounded-md border p-2"
                                                value={selectedRow?.[column] || ''}
                                                onChange={(e) => setSelectedRow(prev => ({
                                                    ...prev!,
                                                    [column]: e.target.value
                                                }))}
                                                disabled={column === 'id'}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                            <SheetFooter>
                                <SheetClose asChild>
                                    <Button type="button" variant="outline">Cancel</Button>
                                </SheetClose>
                                <Button type="submit" variant="brandOutline">Save changes</Button>
                            </SheetFooter>
                        </form>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Delete Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the selected row.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            className="bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800/80 rounded-full px-6 py-2 font-bold shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
                        >Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => selectedRow && handleDelete(selectedRow)}
                            className="bg-red-700 text-white  font-bold hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
                        >

                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default DataTableNew;