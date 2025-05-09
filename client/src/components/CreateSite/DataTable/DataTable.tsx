import * as React from "react";
import { clsx } from "clsx";
import type { Table as TanStackTableType, RowData } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";

// Extend the ColumnMeta type to include 'editable' property
declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    editable?: boolean;
  }
}
import { Table } from "../Table";
import type { CellCoordinates } from "./useCellSelection";
import { useCellSelection } from "./useCellSelection";
import { useCopyToClipboard } from "./useCopyToClipboard";
import { parseCopyData } from "./parseCopyData";
import "./styles.css";

export interface DataTableProps<TData> {
  table: TanStackTableType<TData>;
  allowCellSelection?: boolean;
  allowRangeSelection?: boolean;
  allowHistory?: boolean;
  allowPaste?: boolean;
  paste?: (selectedCell: CellCoordinates, clipboardData?: string) => void;
  undo?: () => void;
  redo?: () => void;
}

export function DataTable<TData>({
  table,
  allowCellSelection = false,
  allowRangeSelection = false,
  allowHistory = false,
  allowPaste = false,
  paste,
  undo,
  redo,
}: DataTableProps<TData>) {
  const {
    selectedCell,
    selection: selectedRange,
    getCellRef,
    isCellSelected,
    isCellInRange,
    handleClick,
    handleKeyDown,
    handleMouseDown,
    handleMouseEnter,
  } = useCellSelection(table.getRowModel().rows, table.getVisibleFlatColumns());

  const [, copy] = useCopyToClipboard();

  React.useEffect(() => {
    const handleCopy = async (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "c" &&
        selectedRange
      ) {
        event.preventDefault();

        const clipboardData = parseCopyData(
          selectedRange,
          table.getRowModel().rows,
          table.getAllColumns()
        );

        // TODO: it would be great to display a toast with success or error onCopy.
        // The copy function returns a success or error boolean.
        await copy(clipboardData);
      }
    };

    document.addEventListener("keydown", handleCopy);
    return () => document.removeEventListener("keydown", handleCopy);
  }, [selectedRange, copy]);

  React.useEffect(() => {
    if (allowPaste && paste && selectedCell) {
      const pasteHandler = (event: ClipboardEvent) => {
        const clipboardData = event.clipboardData?.getData("Text");
        paste(selectedCell, clipboardData);
      };

      document.addEventListener("paste", pasteHandler);
      return () => document.removeEventListener("paste", pasteHandler);
    }
  }, [allowPaste, selectedCell, paste]);

  React.useEffect(() => {
    if (allowHistory && undo && redo) {
      const handleTableKeyDown = (event: KeyboardEvent) => {
        if ((event.ctrlKey || event.metaKey) && event.key === "z") {
          event.preventDefault();
          if (event.shiftKey) {
            redo();
          } else {
            undo();
          }
        }
      };

      document.addEventListener("keydown", handleTableKeyDown);
      return () => document.removeEventListener("keydown", handleTableKeyDown);
    }
  }, [allowHistory, undo, redo]);

  return (
    <div
      className={clsx("qz__data-table", {
        "qz__data-table--no-select": allowRangeSelection,
      })}
    >
      <Table>
        <Table.Header>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <Table.Head key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </Table.Head>
                );
              })}
            </Table.Row>
          ))}
        </Table.Header>
        <Table.Body>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <Table.Row
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => {
                  const cellRef = getCellRef(cell.row.id, cell.column.id);
                  const isSelected = isCellSelected(
                    cell.row.id,
                    cell.column.id
                  );
                  const isInRange = isCellInRange(cell.row.id, cell.column.id);
                  const isEditable = cell.column.columnDef.meta?.editable;

                  return (
                    <Table.Data
                      key={cell.id}
                      ref={cellRef}
                      tabIndex={0}
                      onClick={() =>
                        allowCellSelection &&
                        handleClick(cell.row.id, cell.column.id)
                      }
                      onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                        allowCellSelection &&
                          handleKeyDown(e, cell.row.id, cell.column.id);
                        if (e.key === "Enter") {
                          // Tricky way to allow triggering of edit mode on Enter press
                          // Call the child's handleKeyDownOnView method directly
                          const editableCell = cellRef.current?.querySelector(
                            ".qz__data-table__editable-cell--viewing"
                          );
                          if (editableCell) {
                            const event = new KeyboardEvent("keydown", {
                              key: "Enter",
                              bubbles: true,
                              cancelable: true,
                            });

                            editableCell.dispatchEvent(event);
                          }
                        }
                      }}
                      onMouseDown={() =>
                        allowRangeSelection &&
                        handleMouseDown(cell.row.id, cell.column.id)
                      }
                      onMouseEnter={() =>
                        allowRangeSelection &&
                        handleMouseEnter(cell.row.id, cell.column.id)
                      }
                      data-row-id={cell.row.id}
                      data-column-id={cell.column.id}
                      className={clsx({
                        "qz__data-table__cell--selected": isSelected,
                        "qz__data-table__cell--range": !isSelected && isInRange,
                        "qz__data-table__cell--editable": isEditable,
                      })}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </Table.Data>
                  );
                })}
              </Table.Row>
            ))
          ) : (
            <Table.Row>
              <Table.Data
                colSpan={table.getVisibleFlatColumns().length}
                className="qz__no-data-message"
              >
                No data.
              </Table.Data>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
    </div>
  );
}
