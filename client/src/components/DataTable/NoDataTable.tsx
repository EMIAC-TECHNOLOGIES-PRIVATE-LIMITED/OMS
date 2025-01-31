import React from 'react';
import { Search, Filter } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface NoDataTableProps {
    hasFilters?: boolean;
}

const NoDataTable: React.FC<NoDataTableProps> = ({ 
    hasFilters = false 
}) => {
    return (
        <Card className="w-full border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-slate-800">
                    No Records Found
                </CardTitle>
                <CardDescription className="text-slate-500">
                    {hasFilters 
                        ? "No data matches your current filter criteria." 
                        : "No records are currently available in the system."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table className="border border-slate-200 rounded-lg">
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableCell 
                                colSpan={1000} 
                                className="h-[400px] text-center align-middle"
                            >
                                <div className="flex flex-col items-center justify-center space-y-6">
                                    {hasFilters ? (
                                        <>
                                            <div className="relative">
                                                <Filter 
                                                    className="w-16 h-16 text-slate-300" 
                                                    strokeWidth={1.5} 
                                                />
                                                <Search 
                                                    className="w-8 h-8 text-slate-400 absolute -bottom-2 -right-2" 
                                                    strokeWidth={1.5} 
                                                />
                                            </div>
                                            <div className="max-w-md text-center space-y-2">
                                                <h3 className="text-lg font-medium text-slate-700">
                                                    No Matching Results
                                                </h3>
                                                <p className="text-sm text-slate-500">
                                                    Try adjusting your search or filter criteria to find what you're looking for.
                                                </p>
                                            </div>
                                           
                                        </>
                                    ) : (
                                        <>
                                            <Search 
                                                className="w-16 h-16 text-slate-300" 
                                                strokeWidth={1.5} 
                                            />
                                            <div className="max-w-md text-center space-y-2">
                                                <h3 className="text-lg font-medium text-slate-700">
                                                    No Data Available
                                                </h3>
                                                <p className="text-sm text-slate-500">
                                                    There are currently no records in the system. New records will appear here once they are added.
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* Empty tbody to maintain table structure */}
                        <TableRow>
                            <TableCell />
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default NoDataTable;