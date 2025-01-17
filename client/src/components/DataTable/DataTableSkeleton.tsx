import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const TableSkeleton = ({ columns = 6, rows = 15 }) => {
    // Generate array of column numbers
    const columnArray = Array.from({ length: columns }, (_, i) => i);
    // Generate array of row numbers
    const rowArray = Array.from({ length: rows }, (_, i) => i);

    return (
        <div className="w-full h-full overflow-auto">
            <Table className="table-fixed border-collapse min-w-full w-full border border-slate-300 rounded-lg">
                <TableHeader className="bg-neutral-200/50">
                    <TableRow>
                        {columnArray.map((col) => (
                            <TableHead
                                key={`header-${col}`}
                                style={{ width: col === 0 ? '100px' : '150px' }}
                                className="py-3 px-6 border border-slate-300"
                            >
                                <div className="h-6 bg-gray-200 rounded animate-pulse" />
                            </TableHead>
                        ))}
                        <TableHead
                            style={{ width: '150px' }}
                            className="py-3 px-6 border border-slate-300"
                        >
                            <div className="h-6 bg-gray-200 rounded animate-pulse" />
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {rowArray.map((row) => (
                        <TableRow
                            key={`row-${row}`}
                            className="border border-slate-300"
                        >
                            {columnArray.map((col) => (
                                <TableCell
                                    key={`cell-${row}-${col}`}
                                    style={{ width: col === 0 ? '100px' : '150px' }}
                                    className="py-3 px-6 border border-slate-300"
                                >
                                    <div
                                        className="h-4 bg-gray-100 rounded animate-pulse"
                                        style={{
                                            animationDelay: `${(row * columns + col) * 0.1}s`
                                        }}
                                    />
                                </TableCell>
                            ))}
                            <TableCell
                                style={{ width: '150px' }}
                                className="py-3 px-6 border border-slate-300"
                            >
                                <div className="flex gap-4">
                                    <div className="h-8 w-20 bg-gray-100 rounded animate-pulse" />
                                    <div className="h-8 w-8 bg-gray-100 rounded animate-pulse" />
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default TableSkeleton;