import React, { useState, useCallback } from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Download, Upload, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from '../../hooks/use-toast';
import Papa from 'papaparse';

interface BulkEditDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (newData: Record<string, any>[]) => Promise<{ success: boolean; message: string }>;
    columns: string[];
    availableColumnTypes: {
        [key: string]: string;
    };
}

interface ValidationError {
    row: number;
    column: string;
    value: string;
    error: string;
}

export const BulkEditDialog: React.FC<BulkEditDialogProps> = ({
    isOpen,
    onClose,
    onAdd,
    columns,
    availableColumnTypes,
}) => {
    const [errors, setErrors] = useState<ValidationError[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'error' | 'success'>('idle');
    const [serverError, setServerError] = useState<string | null>(null);

    const downloadBlankCSV = useCallback(() => {
        const headers = columns.filter(col => col !== 'id');
        const csv = Papa.unparse({
            fields: headers,
            data: []
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'bulk_edit_template.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }, [columns]);

    const validateDate = (value: string): boolean => {
        if (!value) return true;
        const date = new Date(value);
        return !isNaN(date.getTime());
    };

    const validateNumber = (value: string): boolean => {
        if (!value) return true;
        return !isNaN(Number(value));
    };

    const validateRow = (row: Record<string, any>, rowIndex: number): ValidationError[] => {
        const rowErrors: ValidationError[] = [];

        Object.entries(row).forEach(([column, value]) => {
            const columnType = availableColumnTypes[column]?.toLowerCase();
            if (!columnType) return;

            if (columnType.includes('date')) {
                if (value && !validateDate(value)) {
                    rowErrors.push({
                        row: rowIndex,
                        column,
                        value: String(value),
                        error: 'Invalid date format. Use YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss'
                    });
                }
            } else if (columnType.includes('int') || columnType.includes('number')) {
                if (value && !validateNumber(value)) {
                    rowErrors.push({
                        row: rowIndex,
                        column,
                        value: String(value),
                        error: 'Invalid number format'
                    });
                }
            }
        });

        return rowErrors;
    };

    const formatDataForSubmission = (data: Record<string, any>[]): Record<string, any>[] => {
        return data.map(row => {
            const formattedRow: Record<string, any> = {};

            Object.entries(row).forEach(([key, value]) => {
                const columnType = availableColumnTypes[key]?.toLowerCase();

                if (columnType?.includes('date')) {
                    if (!value) {
                        formattedRow[key] = undefined;
                    } else {
                        try {
                            formattedRow[key] = new Date(value).toISOString();
                        } catch (e) {
                            formattedRow[key] = undefined;
                        }
                    }
                } else if (columnType?.includes('int') || columnType?.includes('number')) {
                    formattedRow[key] = value ? Number(value) : undefined;
                } else {
                    formattedRow[key] = value || undefined;
                }
            });

            return formattedRow;
        });
    };

    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        setUploadStatus('processing');
        setErrors([]);
        setServerError(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const allErrors: ValidationError[] = [];

                // Validate headers
                const uploadedHeaders = Object.keys(results.data[0] || {});
                const invalidHeaders = uploadedHeaders.filter(
                    header => !columns.includes(header) || header === 'id'
                );

                if (invalidHeaders.length > 0) {
                    setErrors([{
                        row: 0,
                        column: invalidHeaders.join(', '),
                        value: '',
                        error: 'Invalid column headers detected'
                    }]);
                    setIsProcessing(false);
                    setUploadStatus('error');
                    return;
                }

                // Validate each row
                (results.data as Record<string, any>[]).forEach((row, index) => {
                    const rowErrors = validateRow(row, index + 1);
                    allErrors.push(...rowErrors);
                });

                if (allErrors.length > 0) {
                    setErrors(allErrors);
                    setIsProcessing(false);
                    setUploadStatus('error');
                    return;
                }

                try {
                    const formattedData = formatDataForSubmission(results.data as Record<string, any>[]);
                    const response = await onAdd(formattedData);

                    if (response.success) {
                        setUploadStatus('success');
                        toast({
                            variant: 'default',
                            duration: 3000,
                            title: 'Success',
                            description: response.message || 'Records added successfully',
                        });
                        setTimeout(() => {
                            onClose();
                            setUploadStatus('idle');
                            setErrors([]);
                            setServerError(null);
                        }, 1500);
                    } else {
                        setServerError(response.message || 'Failed to add records');
                        setUploadStatus('error');
                    }
                } catch (error) {
                    setServerError('An unexpected error occurred. Please try again.');
                    setUploadStatus('error');
                }
                setIsProcessing(false);
            },
            error: (error) => {
                setServerError(`Failed to parse CSV: ${error.message}`);
                setIsProcessing(false);
                setUploadStatus('error');
            }
        });

        event.target.value = '';
    }, [columns, onAdd, onClose, availableColumnTypes]);

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="max-w-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>Bulk Edit Records</AlertDialogTitle>
                    <AlertDialogDescription>
                        Download the template, fill it with your data, and upload it back to add multiple records at once.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="my-6 space-y-4">
                    <div className="flex justify-center space-x-4">
                        <Button
                            onClick={downloadBlankCSV}
                            variant="outline"
                            className="w-48"
                            disabled={isProcessing}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download Template
                        </Button>

                        <div className="relative w-48">
                            <Button
                                variant="outline"
                                className="w-full"
                                disabled={isProcessing}
                                type="button"
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Upload CSV
                            </Button>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={isProcessing}
                            />
                        </div>
                    </div>

                    {uploadStatus === 'processing' && (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Processing your file...
                            </AlertDescription>
                        </Alert>
                    )}

                    {uploadStatus === 'success' && (
                        <Alert className="bg-green-50 text-green-900 border-green-200">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Records added successfully!
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* {serverError && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {serverError}
                            </AlertDescription>
                        </Alert>
                    )} */}

                    {errors.length > 0 && (
                        <div className="space-y-2">
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Found {errors.length} error{errors.length > 1 ? 's' : ''}:
                                </AlertDescription>
                            </Alert>
                            <div className="max-h-40 overflow-y-auto space-y-2">
                                {errors.map((error, index) => (
                                    <Alert
                                        key={index}
                                        variant="destructive"
                                        className="text-sm"
                                    >
                                        <AlertDescription>
                                            {error.row > 0 ? `Row ${error.row}, ` : ''}
                                            {error.column && `Column: ${error.column}, `}
                                            {error.value && `Value: ${error.value}, `}
                                            Error: {error.error}
                                        </AlertDescription>
                                    </Alert>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel
                        disabled={isProcessing}
                        className="bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800/80"
                    >
                        Close
                    </AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default BulkEditDialog;