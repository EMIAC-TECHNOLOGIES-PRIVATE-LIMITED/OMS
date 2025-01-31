//second verion with broken copy cell logic 

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import {  CopyCheck, Pencil, Trash2 } from 'lucide-react';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from '../../hooks/use-toast';
import { authAtom } from '../../store/atoms/atoms';
import { deleteData, updateData } from '../../utils/apiService/dataAPI';
import TableSkeleton from './DataTableSkeleton';
import { EditSheet } from './EditSheet';
import { createData } from '../../utils/apiService/dataAPI';
import CreateSheet from './CreateSheet';
import { Fab, Action } from 'react-tiny-fab';
import 'react-tiny-fab/dist/styles.css';
import { Plus, FilePlus, FileInput } from 'lucide-react';
import BulkEditDialog from './BulkAdd';
import NoDataTable from './NoDataTable';

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
    fetchFilteredData: () => void;
}

const TableCheckbox = React.memo(({
    checked,
    onCheckedChange
}: {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}) => (
    <Checkbox
        checked={checked}
        onCheckedChange={(checked) => onCheckedChange(checked as boolean)}
        className=" rounded-s rounded-e rounded-t rounded-b border border-gray-500 "
    />
));

const MemoizedTableCell = React.memo(({
    value,
    className,
    columnType,
    isExpanded
}: {
    value: any;
    className: string;
    columnType: string;
    isExpanded: boolean;
}) => {
    const formattedValue = useMemo(() => {
        if (!value) {
            return '-';
        }

        if (typeof value === 'object' && !Array.isArray(value)) {
            if ('name' in value) {
                return (value as { name: string }).name;
            }
            return '-';
        }

        if (columnType?.toLowerCase().includes('date')) {
            try {
                if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
                    return new Date(value).toLocaleDateString();
                }
                return '-';
            } catch (e) {
                return '-';
            }
        }
        return String(value);
    }, [value, columnType]);

    return (
        <TableCell
            className={`
                w-40 min-w-40 max-w-40 px-4 py-2
                ${className}
            `}
            style={{
                wordBreak: 'break-all',
                overflowWrap: 'break-word',
                whiteSpace: isExpanded ? 'pre-wrap' : 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            }}
        >
            <div className="max-w-full">
                {formattedValue}
            </div>
        </TableCell>
    );
});



const RowContextMenu = React.memo(({
    row,
    onCopyRow,
    onEdit,
    onDelete,

    hasUpdatePermission,
    hasDeletePermission,
}: {
    row: Record<string, any>;
    copiedCell: string | null;
    onCopyCell: (value: string) => void;
    onCopyRow: (row: Record<string, any>) => void;
    onEdit: (row: Record<string, any>) => void;
    onDelete: (row: Record<string, any>) => void;
    resource: string;
    hasUpdatePermission: boolean;
    hasDeletePermission: boolean;
}) => (
    <ContextMenuContent>
        {/* <ContextMenuItem onClick={() => onCopyCell(String(row.id))}>
            <Copy className="mr-2" />
            Copy Cell
        </ContextMenuItem> */}
        <ContextMenuItem onClick={() => onCopyRow(row)}>
            <CopyCheck className="mr-2" />
            Copy Row
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
            onClick={() => onEdit(row)}
            disabled={!hasUpdatePermission}
        >
            <Pencil className="mr-2" />
            Edit Row
        </ContextMenuItem>
        <ContextMenuItem
            onClick={() => onDelete(row)}
            disabled={!hasDeletePermission}
            className="text-red-600"
        >
            <Trash2 className="mr-2" />
            Delete Row
        </ContextMenuItem>
    </ContextMenuContent>
));

const MemoizedTableRow = React.memo(({
    row,
    columns,
    expandedRows,
    selectedRows,
    onSelectRow,
    onToggleExpansion,
    getColumnColor,
    copiedCell,
    onCopyCell,
    onCopyRow,
    onEdit,
    onDelete,
    resource,
    hasUpdatePermission,
    hasDeletePermission,
    availableColumnTypes
}: {
    row: Record<string, any>;
    columns: string[];
    expandedRows: Set<number>;
    selectedRows: Set<number>;
    onSelectRow: (id: number, checked: boolean) => void;
    onToggleExpansion: (id: number) => void;
    getColumnColor: (column: string) => string;
    copiedCell: string | null;
    onCopyCell: (value: string) => void;
    onCopyRow: (row: Record<string, any>) => void;
    onEdit: (row: Record<string, any>) => void;
    onDelete: (row: Record<string, any>) => void;
    resource: string;
    hasUpdatePermission: boolean;
    hasDeletePermission: boolean;
    availableColumnTypes: {
        [key: string]: string;
    };
}) => (
    <ContextMenu>
        <ContextMenuTrigger>
            <TableRow
                onClick={() => onToggleExpansion(row.id)}
                className={`cursor-pointer transition-all duration-200 ${expandedRows.has(row.id) ? 'bg-slate-50' : ''}`}
            >
                <TableCell className="w-12 text-center pt-3 pl-4 pr-0" onClick={(e) => e.stopPropagation()}>
                    <TableCheckbox
                        checked={selectedRows.has(row.id)}
                        onCheckedChange={(checked) => onSelectRow(row.id, checked)}
                    />
                </TableCell>
                {columns.map((column) => (
                    column === 'id' ? null : (
                        <MemoizedTableCell
                            key={`${row.id}-${column}`}
                            value={row[column]}
                            columnType={availableColumnTypes[column]}
                            isExpanded={expandedRows.has(row.id)}
                            className={getColumnColor(column)}
                        />
                    )))}
            </TableRow>
        </ContextMenuTrigger>
        <RowContextMenu
            row={row}
            copiedCell={copiedCell}
            onCopyCell={onCopyCell}
            onCopyRow={onCopyRow}
            onEdit={onEdit}
            onDelete={onDelete}
            resource={resource}
            hasUpdatePermission={hasUpdatePermission}
            hasDeletePermission={hasDeletePermission}
        />
    </ContextMenu>
));

export const DataTableNew: React.FC<DataTableNewProps> = ({
    data,
    availableColumnTypes,
    handleDataChange,
    handleTotalRecordsChange,
    loading,
    error,
    resource,
    filteredColumns,
    sortedColumns,
    fetchFilteredData
}) => {
    const auth = useRecoilValue(authAtom);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const [selectedRowForDelete, setSelectedRowForDelete] = useState<Record<string, any> | null>(null);
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [copiedCell, setCopiedCell] = useState<string | null>(null);
    const [selectedRow, setSelectedRow] = useState<Record<string, any> | null>(null);
    const [toastVisible, setToastVisible] = useState(false);
    const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);

    const fabStyles = {
        mainButtonStyles: {
            backgroundColor: '#005a2d',
        },
        actionButtonStyles: {
            backgroundColor: '#007b3c',
        },
        position: { bottom: 20, right: 24 }
    };

    const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);

    const hasCreatePermission = useMemo(() =>
        auth.userInfo.permissions.some((p) => p.name === `_create_${resource}`)
        , [auth.userInfo.permissions, resource]);

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



    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.ctrlKey && event.key === 'c' && selectedRows.size > 0) {
            const selectedData = data
                .filter(row => selectedRows.has(row.id))
                .map(row => Object.entries(row)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join('\n'))
                .join('\n\n');
            setToastVisible(true);
            setTimeout(() => setToastVisible(false), 1500)
            navigator.clipboard.writeText(selectedData);
            toast({
                variant: 'default',
                duration: 1000,
                title: 'Copied',
                description: `${selectedRows.size} row${selectedRows.size > 1 ? 's' : ''} copied to clipboard`,

            });
        }
    }, [data, selectedRows]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const handleSelectAll = useCallback((checked: boolean) => {
        setSelectedRows(new Set(checked ? data.map(row => row.id) : []));
    }, [data]);

    const handleSelectRow = useCallback((id: number, checked: boolean) => {
        setSelectedRows(prev => {
            const newSet = new Set(prev);
            if (checked) {
                newSet.add(id);
            } else {
                newSet.delete(id);
            }
            return newSet;
        });
    }, []);

    const handleCreate = useCallback(async (newData: Record<string, any>[]) => { // Changed to accept an array
        try {
            const createdData = await createData(resource, newData); // Pass the array to createData

            handleDataChange([...data, ...createdData]); // Spread the createdData array into the existing data
            setIsCreateSheetOpen(false);
            setToastVisible(true);
            setTimeout(() => setToastVisible(false), 3500)
            toast({
                variant: 'default',
                duration: 3000,
                title: 'Success',
                description: 'Record added successfully',
            });
            return Promise.resolve({ success: true });
        } catch (error) {
            setToastVisible(true);
            setTimeout(() => setToastVisible(false), 3500)
            toast({
                variant: 'destructive',
                duration: 3000,
                title: 'Error',
                description: 'Failed to add record',
            });
            return Promise.resolve({ success: false })
        }
    }, []);


    const handleCopyCell = useCallback((value: string) => {
        navigator.clipboard.writeText(value);
        setCopiedCell(value);
        setTimeout(() => setCopiedCell(null), 2000);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 1500)
        toast({
            variant: 'default',
            duration: 1000,
            title: 'Copied',
            description: 'Cell content copied to clipboard',
        });
    }, []);

    const handleCopyRow = useCallback((row: Record<string, any>) => {
        const rowString = Object.entries(row)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
        navigator.clipboard.writeText(rowString);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 1500)
        toast({
            variant: 'default',
            duration: 1000,
            title: 'Copied',
            description: 'Row content copied to clipboard',
        });
    }, []);

    const toggleRowExpansion = useCallback((id: number) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    const handleEdit = useCallback(async (editedData: Record<string, any>) => {
        try {
            await updateData(resource, editedData);
            fetchFilteredData();
            setIsEditSheetOpen(false);
            setSelectedRow(null);
            setToastVisible(true);
            setTimeout(() => setToastVisible(false), 3500)
            toast({
                variant: 'default',
                duration: 3000,
                title: 'Success',
                description: 'Data updated successfully',
            });
        } catch (error) {
            setToastVisible(true);
            setTimeout(() => setToastVisible(false), 3500)
            toast({
                variant: 'destructive',
                duration: 3000,
                title: 'Error',
                description: 'Failed to update data',
            });
        }
    }, [resource, data, handleDataChange]);

    const handleDelete = useCallback(async () => {
        if (!selectedRowForDelete) return;

        try {
            await deleteData(resource, { id: selectedRowForDelete.id });
            handleTotalRecordsChange();
            const updatedData = data.filter((row) => row.id !== selectedRowForDelete.id);
            handleDataChange(updatedData);
            setIsDeleteDialogOpen(false);
            setSelectedRowForDelete(null);
            setToastVisible(true);
            setTimeout(() => setToastVisible(false), 3500)
            toast({
                variant: 'default',
                duration: 3000,
                title: 'Success',
                description: 'Data deleted successfully',
            });
        } catch (error) {
            setToastVisible(true);
            setTimeout(() => setToastVisible(false), 3500)
            toast({
                variant: 'destructive',
                duration: 3000,
                title: 'Error',
                description: 'Failed to delete data',
            });
        }
    }, [selectedRowForDelete, resource, handleTotalRecordsChange, handleDataChange, data]);

    const handleEditStart = useCallback((row: Record<string, any>) => {
        setSelectedRow({ ...row });
        setIsEditSheetOpen(true);
    }, []);


    const hasUpdatePermission = useMemo(() =>
        auth.userInfo.permissions.some((p) => p.name === `_update_${resource}`)
        , [auth.userInfo.permissions, resource]);

    const hasDeletePermission = useMemo(() =>
        auth.userInfo.permissions.some((p) => p.name === `_delete_${resource}`)
        , [auth.userInfo.permissions, resource]);

    console.log(availableColumnTypes);

    if (loading) return <TableSkeleton />;
    if (error) return <div className="text-red-500">{error}</div>;


    return (
        <div className="">
            {data.length === 0 && (<NoDataTable hasFilters/>)}
            {data.length > 0 && (  <Table>
                <TableHeader >
                    <TableRow>
                        <TableHead className="w-12 text-center pl-4 pt-4 bg-slate-200">
                            <TableCheckbox
                                checked={selectedRows.size === data.length}
                                onCheckedChange={handleSelectAll}
                            />
                        </TableHead>
                        {columns.map((column) => (
                            column === 'id' ? null : (
                                <TableHead
                                    key={column}
                                    className="w-40 min-w-40 max-w-40 px-0 py-2 font-semibold bg-slate-200 break-words whitespace-pre-wrap"
                                    style={{
                                        wordWrap: 'break-word',
                                        overflowWrap: 'break-word',
                                        hyphens: 'auto'
                                    }}
                                >
                                    {formatHeader(column)}
                                </TableHead>
                            )
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((row) => (
                        <MemoizedTableRow
                            key={row.id}
                            row={row}
                            columns={columns}
                            expandedRows={expandedRows}
                            selectedRows={selectedRows}
                            onSelectRow={handleSelectRow}
                            onToggleExpansion={toggleRowExpansion}
                            getColumnColor={getColumnColor}
                            copiedCell={copiedCell}
                            onCopyCell={handleCopyCell}
                            onCopyRow={handleCopyRow}
                            onEdit={handleEditStart}
                            onDelete={(row) => {
                                setSelectedRowForDelete(row);
                                setIsDeleteDialogOpen(true);
                            }}
                            resource={resource}
                            hasUpdatePermission={hasUpdatePermission}
                            hasDeletePermission={hasDeletePermission}
                            availableColumnTypes={availableColumnTypes}
                        />
                    ))}
                </TableBody>
            </Table>)  }
           

            <EditSheet
                isOpen={isEditSheetOpen}
                onClose={() => {
                    setIsEditSheetOpen(false);
                    setSelectedRow(null);
                }}
                onSave={handleEdit}
                initialData={selectedRow}
                columns={columns}
                formatHeader={formatHeader}
                availableColumnTypes={availableColumnTypes}
            />

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
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-700 text-white font-bold hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {hasCreatePermission && !isBulkEditOpen && !toastVisible && !isCreateSheetOpen && !isEditSheetOpen && (
                <Fab
                    mainButtonStyles={fabStyles.mainButtonStyles}
                    style={fabStyles.position}
                    icon={<Plus size={24} />}
                    event='click'

                >
                    <Action
                        text="Add Record"
                        style={fabStyles.actionButtonStyles}
                        onClick={() => setIsCreateSheetOpen(true)}
                    >
                        <FilePlus size={20} />
                    </Action>
                    <Action
                        text="Bulk Edit"
                        style={fabStyles.actionButtonStyles}
                        onClick={() => setIsBulkEditOpen(true)}
                    >
                        <FileInput size={20} />
                    </Action>
                </Fab>
            )}
            <CreateSheet
                isOpen={isCreateSheetOpen}
                onClose={() => setIsCreateSheetOpen(false)}
                onAdd={handleCreate}
                columns={columns}
                formatHeader={formatHeader}
                availableColumnTypes={availableColumnTypes}
            />
            <BulkEditDialog
                isOpen={isBulkEditOpen}
                onClose={() => setIsBulkEditOpen(false)}
                onAdd={handleCreate}
                columns={columns}
                availableColumnTypes={availableColumnTypes}
            />
        </div>

    );
};

export default DataTableNew;