import React, { useCallback } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  page: number;
  pageSize: number;
  totalPages: number;
  handlePageChange: (page: number, pageSize: number) => void;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  page,
  pageSize,
  totalPages,
  handlePageChange,
}) => {
  const handlePageSizeChange = useCallback((newSize: string) => {
    handlePageChange(1, parseInt(newSize));
  }, [handlePageChange]);

  const goToNextPage = useCallback(() => {
    handlePageChange(page + 1, pageSize);
  }, [page, pageSize, handlePageChange]);

  const goToPrevPage = useCallback(() => {
    handlePageChange(page - 1, pageSize);
  }, [page, pageSize, handlePageChange]);

  return (
    <div className="flex items-center justify-between py-2 px-1 ">
      <div className="flex items-center gap-4">

        <Select
          value={pageSize.toString()}
          onValueChange={handlePageSizeChange}

        >
          <SelectTrigger className="w-[120px] rounded-lg">
          <SelectValue>{`${pageSize} Rows`}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="25">25 Rows</SelectItem>
            <SelectItem value="50">50 Rows</SelectItem>
            <SelectItem value="100">100 Rows</SelectItem>
            {/* <SelectItem value="500">500 Rows</SelectItem> */}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrevPage}
          disabled={page <= 1}
          className="h-8 w-8 hover:bg-gray-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNextPage}
          disabled={page >= totalPages}
          className="h-8 w-8 hover:bg-gray-100"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PaginationControls;