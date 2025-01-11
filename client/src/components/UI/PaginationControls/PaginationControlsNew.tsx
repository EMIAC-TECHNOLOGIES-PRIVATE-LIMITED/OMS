"use client"

import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowBigDown, ArrowDown } from 'lucide-react';

const pageSizeOptions = [
  { value: 25, label: "25" },
  { value: 50, label: "50" },
  { value: 100, label: "100" },
];

interface PaginationControlsProps {
  page: number;
  pageSize: number;
  totalPages: number;
  handlePageChange: (page: number, pageSize: number) => void;
}

export default function PaginationControlsNew({
  page,
  pageSize,
  totalPages,
  handlePageChange,
}: PaginationControlsProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedPageSize, setSelectedPageSize] = React.useState<number>(pageSize);

  React.useEffect(() => {
    // Sync local state with prop updates if needed
    setSelectedPageSize(pageSize);
  }, [pageSize]);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages >= 1) pages.push(1);
    if (totalPages >= 2) pages.push(2);

    if (totalPages > 5 && page > 3) {
      pages.push('ellipsis-prev');
    }

    if (page > 2 && page < totalPages - 1) {
      pages.push(page - 1);
      pages.push(page);
      pages.push(page + 1);
    } else if (page === totalPages - 1) {
      pages.push(page - 1);
      pages.push(page);
      pages.push(page + 1);
    } else if (page === 1 || page === 2) {
      pages.push(3);
      if (totalPages > 5) pages.push('ellipsis-next');
    }

    if (totalPages > 4) {
      pages.push(totalPages - 1);
      pages.push(totalPages);
    }

    const uniquePages = Array.from(new Set(pages)).filter(
      (p) => p !== 'ellipsis-prev' && p !== 'ellipsis-next' && typeof p === 'number' && p >= 1 && p <= totalPages
    ) as number[];

    return uniquePages;
  };

  const onPageClick = (selectedPage: number) => {
    if (selectedPage !== page) {
      handlePageChange(selectedPage, selectedPageSize);
    }
  };

  return (
    <div className="pagination-controls mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
      {/* Page Size Dropdown using shadcn Popover and Command */}
      <div className="flex items-center space-x-2">
        <span className="font-medium  text-muted-foreground">Page Size:</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="secondaryFlat" size="sm"
              role='combobox' className="w-[100px] justify">
              {selectedPageSize ? selectedPageSize : "Select"}
              <ArrowDown className="" size={16} />
            </Button>

          </PopoverTrigger>
          <PopoverContent className="p-0" side="right" align="start">
            <Command>
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {pageSizeOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value.toString()}
                      onSelect={(value) => {
                        const newSize = parseInt(value, 10);
                        setSelectedPageSize(newSize);
                        setOpen(false);
                        // Reset to first page when page size changes
                        handlePageChange(1, newSize);
                      }}
                    >
                      <span>{option.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Pagination Component */}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={(e) => {
                e.preventDefault();
                if (page > 1) handlePageChange(page - 1, selectedPageSize);
              }}
              isActive={page > 1}
            />
          </PaginationItem>

          {getPageNumbers().map((pageNumber) => (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                href="#"
                isActive={pageNumber === page}
                onClick={(e) => {
                  e.preventDefault();
                  onPageClick(pageNumber);
                }}

              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={(e) => {
                e.preventDefault();
                if (page < totalPages) handlePageChange(page + 1, selectedPageSize);
              }}
              isActive={page < totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
