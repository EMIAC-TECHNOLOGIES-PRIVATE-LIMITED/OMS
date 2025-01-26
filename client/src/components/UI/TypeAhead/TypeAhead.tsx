import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import debounce from 'lodash.debounce';
import { Check, ChevronDown } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { typeAheadAPI } from '@/utils/apiService/typeAheadAPI';

type Option = {
  id: number;
  name: string;
};

type AutocompleteProps = {
  route: string;
  column: string;
  onSelect: (id: number | null) => void;
  placeholder?: string;
  emptyMessage?: string;
  initialValue?: { id: number; name: string };
  disabled?: boolean;
  minInputLength?: number;
};

export function Autocomplete({
  route,
  column,
  onSelect,
  placeholder = 'Search...',
  emptyMessage = 'No results found',
  initialValue,
  disabled = false,
  minInputLength = 2
}: AutocompleteProps) {
  const [searchValue, setSearchValue] = useState(initialValue?.name || '');
  const [options, setOptions] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(initialValue?.id || null);

  // AbortController to cancel ongoing requests
  const abortControllerRef = useRef<AbortController | null>(null);

  
  const debouncedFetchOptions = useMemo(() =>
    debounce(async (value: string) => {
      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new AbortController
      abortControllerRef.current = new AbortController();

      // Only fetch if input meets minimum length and not disabled
      if (!value || value.length < minInputLength || disabled) {
        setOptions([]);
        return;
      }

      setIsLoading(true);
      try {
        const signal = abortControllerRef.current.signal;
        const response = await typeAheadAPI(route, column, value, {
          timeout: 5000,
     
        });

        // Only update if request wasn't aborted
        if (!signal.aborted) {
          setOptions(response);
        }
      } catch (error : unknown) {
        // Handle aborted requests and other errors
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error fetching options:', error);
          setOptions([]);
        }
      } finally {
        setIsLoading(false);
      }
    }, 500),  // Increased delay for better performance
    [route, column, disabled, minInputLength]
  );

  // Stable callback for fetching options
  const handleFetchOptions = useCallback((value: string) => {
    debouncedFetchOptions(value);
  }, [debouncedFetchOptions]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      debouncedFetchOptions.cancel();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedFetchOptions]);

  // Trigger fetch on search value change
  useEffect(() => {
    if (searchValue && searchValue.length >= minInputLength) {
      handleFetchOptions(searchValue);
    } else {
      setOptions([]);
    }
  }, [searchValue, handleFetchOptions, minInputLength]);

  // Select handler with improved state management
  const handleSelect = useCallback((option: Option) => {
    if (disabled) return;

    setSearchValue(option.name);
    setSelectedId(option.id);
    onSelect(option.id);
    setOpen(false);
  }, [disabled, onSelect]);

  // Input change handler with more robust state update
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);

    // Reset selection when input changes
    if (selectedId !== null) {
      setSelectedId(null);
      onSelect(null);
    }

    setOpen(true);
  }, [onSelect, selectedId]);

  // Input focus handler
  const handleInputFocus = useCallback(() => {
    if (searchValue && options.length === 0 && searchValue.length >= minInputLength) {
      handleFetchOptions(searchValue);
    }
    setOpen(true);
  }, [searchValue, options.length, handleFetchOptions, minInputLength]);

  // Memoized options rendering
  const renderOptions = useMemo(() => {
    if (isLoading) {
      return Array(3).fill(0).map((_, index) => (
        <div key={index} className="p-1">
          <Skeleton className="h-6 w-full" />
        </div>
      ));
    }

    if (options.length === 0) {
      return <CommandEmpty>{emptyMessage}</CommandEmpty>;
    }

    return (
      <CommandGroup>
        {options.map((option) => (
          <CommandItem
            key={option.id}
            value={option.name}
            onSelect={() => handleSelect(option)}
            disabled={disabled}
          >
            <Check
              className={cn(
                "mr-2 h-4 w-4",
                selectedId === option.id
                  ? "opacity-100"
                  : "opacity-0"
              )}
            />
            {option.name}
          </CommandItem>
        ))}
      </CommandGroup>
    );
  }, [
    isLoading,
    options,
    emptyMessage,
    handleSelect,
    disabled,
    selectedId
  ]);

  return (
    <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Input
            value={searchValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            className="pr-8"
            disabled={disabled}
          />
          {!disabled && (
            <ChevronDown
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          <CommandList>
            {renderOptions}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default Autocomplete;