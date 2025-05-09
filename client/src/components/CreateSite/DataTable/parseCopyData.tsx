import type { Selection } from "./useCellSelection";
import type { Column, Row } from "@tanstack/react-table";

export function parseCopyData<TData>(
  selection: Selection,
  rows: Row<TData>[],
  columns: Column<TData>[]
) {
  const { start, end } = selection;

  const startRowIndex = rows.findIndex((row) => row.id === start.rowId);
  const endRowIndex = rows.findIndex((row) => row.id === end.rowId);
  const startColIndex = columns.findIndex((col) => col.id === start.columnId);
  const endColIndex = columns.findIndex((col) => col.id === end.columnId);

  return rows
    .slice(
      Math.min(startRowIndex, endRowIndex),
      Math.max(startRowIndex, endRowIndex) + 1
    )
    .map((row) =>
      row
        .getVisibleCells()
        .slice(
          Math.min(startColIndex, endColIndex),
          Math.max(startColIndex, endColIndex) + 1
        )
        .map((cell) => cell.getValue())
        .join("\t")
    )
    .join("\n");
}
