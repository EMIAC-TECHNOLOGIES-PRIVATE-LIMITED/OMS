import React, { useState, useMemo, useCallback, memo } from 'react';
import { useRecoilValue } from 'recoil';
import { authAtom } from '../../store/atoms/atoms';
import { deleteData, updateData } from '../../utils/apiService/dataAPI';
import { toast } from '../../hooks/use-toast';
import { Copy, CopyCheck, Pencil, Trash2 } from 'lucide-react';
import { Sheet, SheetClose, SheetContent,  SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Button } from "@/components/ui/button";
import TableSkeleton from './DataTableSkeleton';

// Type definitions
interface Permission {
    name: string;
    [key: string]: any;
}

interface AuthInfo {
    userInfo: {
        permissions: Permission[];
    };
}

interface DataTableNewProps {
    data: Record<string, any>[];
    availableColumns: string[];
    loading: boolean;
    error: string | null;
    resource: string;
    handleDataChange: (data: Record<string, any>[]) => void;
    handleTotalRecordsChange: () => void;
    filteredColumns: Set<string>;
    sortedColumns: Set<string>;
}

interface EditFormProps {
    editData: Record<string, any>;
    setEditData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    formatHeader: (header: string) => string;
}

interface TableCellProps {
    content: any;
    onCopy: (content: string, e: React.MouseEvent) => Promise<void>;
    isExpanded: boolean;
}

interface EditSheetProps {
    row: Record<string, any>;
    onEdit: (row: Record<string, any>) => Promise<void>;
    resource: string;
    auth: AuthInfo;
    formatHeader: (header: string) => string;
}

interface DeleteDialogProps {
    row: Record<string, any>;
    onDelete: (row: Record<string, any>) => Promise<void>;
    resource: string;
    auth: AuthInfo;
}

interface TableRowProps {
    row: Record<string, any>;
    displayColumns: string[];
    columnWidths: Record<string, string>;
    columnBgColors: Record<string, string>;
    expandedRow: number | null;
    setExpandedRow: (id: number | null) => void;
    onEdit: (row: Record<string, any>) => Promise<void>;
    onDelete: (row: Record<string, any>) => Promise<void>;
    resource: string;
    auth: AuthInfo;
    formatHeader: (header: string) => string;
}

// Optimized EditForm component
const EditForm: React.FC<EditFormProps> = memo(({ editData, setEditData, formatHeader }) => {
    const handleChange = useCallback((key: string, value: string) => {
        setEditData(prev => ({
            ...prev,
            [key]: value
        }));
    }, [setEditData]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {Object.entries(editData).map(([key, value]) => (
                <div key={key} className="flex flex-col">
                    <label className="font-medium text-gray-600 mb-1">
                        {formatHeader(key)}
                    </label>
                    <input
                        type="text"
                        value={String(value)}
                        disabled={key === 'id'}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="p-2 border rounded-lg focus:ring focus:ring-blue-200"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            ))}
        </div>
    );
});

EditForm.displayName = 'EditForm';

// Optimized TableCell component
const CustomTableCell: React.FC<TableCellProps> = memo(({ content,  isExpanded }) => {
    const renderedContent = typeof content === 'object' && content !== null
        ? JSON.stringify(content)
        : content?.toString() ?? '--';

    return (
        <div
            className={`${isExpanded ? 'whitespace-normal' : 'truncate'} max-w-xs overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
        >
            {renderedContent}
        </div>
    );
});

CustomTableCell.displayName = 'CustomTableCell';

// Optimized EditSheet component
const EditSheet: React.FC<EditSheetProps> = memo(({ row, onEdit, resource, auth, formatHeader }) => {
    const [editData, setEditData] = useState<Record<string, any>>(row);
    const canEdit = useMemo(() =>
        auth.userInfo.permissions.some((p) => p.name === `_update_${resource}`),
        [auth.userInfo.permissions, resource]
    );

    const handleSave = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit(editData);
    }, [editData, onEdit]);

    return (
        <Sheet>
            <SheetTrigger asChild>
                <ContextMenuItem
                    disabled={!canEdit}
                    onSelect={(e) => e.preventDefault()}
                >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                </ContextMenuItem>
            </SheetTrigger>
            <SheetContent className='overflow-auto'>
                <SheetHeader>
                    <SheetTitle>Edit {resource.charAt(0).toUpperCase() + resource.slice(1)} Data</SheetTitle>
                </SheetHeader>
                <EditForm
                    editData={editData}
                    setEditData={setEditData}
                    formatHeader={formatHeader}
                />
                <SheetFooter>
                    <SheetClose asChild>
                        <Button
                            variant="destructive"
                            onClick={(e) => e.stopPropagation()}
                        >
                            Cancel
                        </Button>
                    </SheetClose>
                    <SheetClose asChild>
                        <Button
                            onClick={handleSave}
                        >
                            Save changes
                        </Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
});

EditSheet.displayName = 'EditSheet';

// DeleteDialog component
const DeleteDialog: React.FC<DeleteDialogProps> = memo(({ row, onDelete, resource, auth }) => {
    const canDelete = useMemo(() =>
        auth.userInfo.permissions.some((p) => p.name === `_delete_${resource}`),
        [auth.userInfo.permissions, resource]
    );

    const handleDelete = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(row);
    }, [onDelete, row]);

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <ContextMenuItem
                    disabled={!canDelete}
                    onSelect={(e) => e.preventDefault()}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </ContextMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete and remove the data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-white border border-brand text-brand font-bold hover:bg-brand-light/20 hover:text-brand-dark"
                        onClick={handleDelete}
                    >
                        Confirm
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
});

DeleteDialog.displayName = 'DeleteDialog';

// Optimized TableRow component
const MemoizedTableRow: React.FC<TableRowProps> = memo(({
    row,
    displayColumns,
    columnWidths,
    columnBgColors,
    expandedRow,
    setExpandedRow,
    onEdit,
    onDelete,
    resource,
    auth,
    formatHeader
}) => {
    const handleCopyToClipboard = useCallback(async (content: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(content);
            toast({
                title: "Copied to clipboard",
                description: "Content has been copied to your clipboard.",
                duration: 2000,
            });
        } catch (err) {
            toast({
                title: "Failed to copy",
                description: "Please try again.",
                variant: "destructive",
                duration: 2000,
            });
        }
    }, []);

    const handleRowClick = useCallback(() => {
        setExpandedRow(expandedRow === row.id ? null : row.id);
    }, [expandedRow, row.id, setExpandedRow]);

    return (
        <TableRow
            className="border border-slate-300 transition-colors duration-300 cursor-pointer hover:bg-gray-50"
            onClick={handleRowClick}
        >
            {displayColumns.map((column) => (
                <TableCell
                    key={`${row.id}-${column}`}
                    style={{ width: columnWidths[column] || '150px' }}
                    className={`py-3 px-6 border border-slate-300 text-sm text-neutral-800 ${columnBgColors[column] || ''}`}
                >
                    <ContextMenu>
                        <ContextMenuTrigger>
                            <CustomTableCell
                                content={row[column]}
                                onCopy={handleCopyToClipboard}
                                isExpanded={expandedRow === row.id}
                            />
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                            <ContextMenuItem onClick={(e) => handleCopyToClipboard(String(row[column]), e)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy cell content
                            </ContextMenuItem>
                            <ContextMenuItem onClick={(e) => handleCopyToClipboard(JSON.stringify(row, null, 2), e)}>
                                <CopyCheck className="mr-2 h-4 w-4" />
                                Copy entire row
                            </ContextMenuItem>
                            <ContextMenuSeparator />
                            <EditSheet
                                row={row}
                                onEdit={onEdit}
                                resource={resource}
                                auth={auth}
                                formatHeader={formatHeader}
                            />
                            <DeleteDialog
                                row={row}
                                onDelete={onDelete}
                                resource={resource}
                                auth={auth}
                            />
                        </ContextMenuContent>
                    </ContextMenu>
                </TableCell>
            ))}
        </TableRow>
    );
}, (prevProps, nextProps) => {
    return prevProps.row.id === nextProps.row.id &&
        prevProps.expandedRow === nextProps.expandedRow &&
        prevProps.columnBgColors === nextProps.columnBgColors;
});

MemoizedTableRow.displayName = 'MemoizedTableRow';

// Main DataTableNew component
const DataTableNew: React.FC<DataTableNewProps> = memo(({
    data,
    availableColumns,
    loading,
    error,
    resource,
    handleDataChange,
    handleTotalRecordsChange,
    filteredColumns,
    sortedColumns,
}) => {
    const auth = useRecoilValue(authAtom);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

    const columnBgColors = useMemo(() => {
        const colors: Record<string, string> = {};
        availableColumns.forEach(column => {
            if (filteredColumns.has(column)) colors[column] = 'bg-blue-100';
            else if (sortedColumns.has(column)) colors[column] = 'bg-green-100';
        });
        return colors;
    }, [availableColumns, filteredColumns, sortedColumns]);

    const displayColumns = useMemo(() => {
        if (!data.length) return [];
        const dataColumns = Object.keys(data[0]);
        return availableColumns.filter((col) => dataColumns.includes(col));
    }, [data, availableColumns]);

    const handleEdit = useCallback(async (editedRow: Record<string, any>) => {
        try {
            await updateData(resource, editedRow);
            const updatedData = data.map((row) =>
                row.id === editedRow.id ? editedRow : row
            );
            handleDataChange(updatedData);
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

    const formatHeader = useCallback((header: string): string =>
        header.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
        , []);

    const columnWidths: Record<string, string> = useMemo(() => ({
        id: '100px',
        name: '200px',
        email: '250px',
    }), []);

    if (loading) return <TableSkeleton />;
    if (error) return <p className="text-red-500 font-medium">{error}</p>;

    return (
        <div className="relative w-full h-full overflow-auto">
            <Table className="table-fixed border-collapse min-w-full w-full border border-slate-300 rounded-lg">
                <TableHeader className="bg-neutral-200">
                    <TableRow>
                        {displayColumns.map((column) => (
                            <TableHead
                                key={column}
                                style={{ width: columnWidths[column] || '150px' }}
                                className="py-3 px-6 border border-slate-300 text-left text-sm font-bold text-neutral-700 overflow-hidden text-ellipsis whitespace-nowrap"
                            >
                                {formatHeader(column)}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((row) => (
                        <MemoizedTableRow
                            key={row.id}
                            row={row}
                            displayColumns={displayColumns}
                            columnWidths={columnWidths}
                            columnBgColors={columnBgColors}
                            expandedRow={expandedRow}
                            setExpandedRow={setExpandedRow}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            resource={resource}
                            auth={auth}
                            formatHeader={formatHeader}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
});

DataTableNew.displayName = 'DataTableNew';

export default memo(DataTableNew);