import React, { useState, useMemo } from 'react';
import { Spinner } from '../UI/index';
import { useRecoilValue } from 'recoil';
import { authAtom } from '../../store/atoms/atoms';
import { deleteData, updateData } from '../../utils/apiService/dataAPI';
import { toast } from '../../hooks/use-toast';

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
  TableHead as ShadTableHead,
  TableHeader,
  TableRow,
  TableCell,
  // If you need TableCaption or TableFooter, import them as well
} from "@/components/ui/table";

// BUTTONS
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface DataTableNewProps {
  data: Record<string, any>[];
  handleDataChange: (data: Record<string, any>[]) => void;
  handleTotalRecordsChange: () => void;
  availableColumns: string[];
  loading: boolean;
  error: string | null;
  resource: string;
}

const DataTable: React.FC<DataTableNewProps> = ({
  data,
  availableColumns,
  loading,
  error,
  resource,
  handleDataChange,
  handleTotalRecordsChange
}) => {
  const [selectedRow, setSelectedRow] = useState<Record<string, any> | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const auth = useRecoilValue(authAtom);

  // Handle edit logic
  const handleEdit = (rowIndex: number) => {
    setSelectedRow(data[rowIndex]);
  };

  const handleSaveEdit = async () => {
    if (!selectedRow) return;
    try {
      await updateData(resource, selectedRow!);

      toast({
        variant: 'default',
        duration: 5000,
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
        duration: 4000,
        title: 'Error',
        description: 'Failed to update data',
      });
    }
  };

  // Handle delete logic
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

  // Filter columns to display
  const displayColumns = useMemo(() => {
    if (!data.length) return [];
    const dataColumns = Object.keys(data[0]);
    return availableColumns.filter((col) => dataColumns.includes(col));
  }, [data, availableColumns]);

  // Utility functions
  const formatHeader = (header: string) =>
    header.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

  const renderCellContent = (content: any) =>
    typeof content === 'object' && content !== null
      ? JSON.stringify(content)
      : content ?? '--';

  // Example column width mapping
  const columnWidths: Record<string, string> = {
    id: '100px',
    name: '200px',
    email: '250px',
    // default fallback: '150px'
  };

  const tableName = resource.charAt(0).toUpperCase() + resource.slice(1);

  return (
    <div className="relative w-full h-full">
      {loading && <Spinner imagePath="./image.png" />}
      {error && <p className="text-red-500 font-medium">{error}</p>}

      {!loading && !error && (
        <>
          {/*
            SINGLE container for the whole table.
            The header is set to "sticky top-0", so it stays in place when scrolling down.
            The horizontal scrollbar is always at the bottom of this container.
          */}
          <div className="relative w-full h-full overflow-auto">
            <Table className="table-fixed border-collapse min-w-full w-full border border-slate-300 rounded-lg">
              {/* TABLE HEADER */}
              <TableHeader className="bg-neutral-200 sticky top-0 z-10">
                <TableRow className="border border-slate-300">
                  {displayColumns.map((column) => (
                    <ShadTableHead
                      key={column}
                      style={{ width: columnWidths[column] || '150px' }}
                      className="py-3 px-6 border border-slate-300 text-left text-sm font-bold text-neutral-700 
                                 overflow-hidden text-ellipsis whitespace-nowrap"
                    >
                      {formatHeader(column)}
                    </ShadTableHead>
                  ))}
                  <ShadTableHead
                    style={{ width: '150px' }}
                    className="py-3 px-6 border border-slate-300 text-left text-sm font-bold text-neutral-700 
                               overflow-hidden text-ellipsis whitespace-nowrap"
                  >
                    Actions
                  </ShadTableHead>
                </TableRow>
              </TableHeader>

              {/* TABLE BODY */}
              <TableBody>
                {data.map((row, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    className="border border-slate-300 transition-colors duration-300 cursor-pointer 
                               hover:bg-gray-50"
                    onClick={() =>
                      setExpandedRow(expandedRow === rowIndex ? null : rowIndex)
                    }
                  >
                    {displayColumns.map((column, colIndex) => (
                      <TableCell
                        key={column}
                        style={{ width: columnWidths[column] || '150px' }}
                        className="relative py-3 px-6 border border-slate-300 text-sm text-neutral-800 
                                   overflow-hidden text-ellipsis whitespace-nowrap align-top"
                      >
                        {/* Always visible cell content */}
                        <div>{renderCellContent(row[column])}</div>

                        {/*
                          Expanded content (vertically) only in the first cell (colIndex===0),
                          so the row height grows without adding a new row.
                          Overflow text now stacks vertically.
                        */}
                        {colIndex === 0 && expandedRow === rowIndex && (
                          <div
                            className={`
                              transition-all duration-300 ease-in-out overflow-hidden 
                              pt-2 
                            `}
                          >
                            {/*
                              Render the entire row's data in a vertical stack,
                              one key-value pair below another.
                            */}
                            <div className="space-y-2 bg-white p-3 mt-2 border rounded shadow-sm">
                              {Object.entries(row).map(([key, value]) => (
                                <div key={key}>
                                  <span className="text-xs font-semibold text-gray-600">
                                    {formatHeader(key)}:
                                  </span>{' '}
                                  <span className="text-sm text-gray-800 break-words">
                                    {renderCellContent(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </TableCell>
                    ))}

                    {/* ACTIONS CELL */}
                    <TableCell
                      style={{ width: '150px' }}
                      className="py-3 px-6 border border-slate-300 text-sm text-neutral-800 
                                 flex gap-4 items-start justify-start align-top"
                      onClick={(e) => e.stopPropagation()} // So we don't toggle expansion
                    >
                      {/* EDIT SHEET */}
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button
                            variant="brand"
                            className={`btn ${!auth.userInfo.permissions.some(
                              (p: any) => p.name === `_update_${resource}`
                            )
                                ? 'cursor-not-allowed'
                                : 'cursor-pointer'
                              }`}
                            disabled={
                              !auth.userInfo.permissions.some(
                                (p: any) => p.name === `_update_${resource}`
                              )
                            }
                            onClick={() => handleEdit(rowIndex)}
                          >
                            <Pencil className="h-5 w-5" />
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

                      {/* DELETE ALERT */}
                      <AlertDialog>
                        <AlertDialogTrigger>
                          <Button
                            variant="destructive"
                            className={`btn ${!auth.userInfo.permissions.some(
                              (p: any) => p.name === `_delete_${resource}`
                            )
                                ? 'cursor-not-allowed'
                                : 'cursor-pointer'
                              }`}
                            disabled={
                              !auth.userInfo.permissions.some(
                                (p: any) => p.name === `_delete_${resource}`
                              )
                            }
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
                              This action cannot be undone. This will
                              permanently delete and remove the data from our
                              servers.
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {/* Optional: Add <TableFooter> if needed */}
            </Table>
          </div>
        </>
      )}
    </div>
  );
};

export default DataTable;
