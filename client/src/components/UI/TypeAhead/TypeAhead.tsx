import React, { useState, useEffect, useCallback, useRef } from 'react';
import debounce from 'lodash.debounce';
import { Check, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
  // State
  const [inputValue, setInputValue] = useState(initialValue?.name || '');
  const [options, setOptions] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(initialValue?.id || null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  // Refs
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch options with debounce
  const fetchOptions = useCallback(
    debounce(async (value: string) => {
      if (!value || value.length < minInputLength || disabled) {
        setOptions([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await typeAheadAPI(route, column, value, { timeout: 5000 });
        setOptions(response);
      } catch (error) {
        console.error('Error fetching options:', error);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [route, column, disabled, minInputLength]
  );

  // Cleanup
  useEffect(() => {
    return () => {
      fetchOptions.cancel();
    };
  }, [fetchOptions]);

  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSelectedId(null);
    onSelect(null);
    setHighlightedIndex(-1);
    setIsOpen(true);
    fetchOptions(value);
  };

  // Option selection handler
  const handleSelectOption = (option: Option) => {
    setInputValue(option.name);
    setSelectedId(option.id);
    onSelect(option.id);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < options.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : prev
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && options[highlightedIndex]) {
          handleSelectOption(options[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            if (inputValue.length >= minInputLength) {
              setIsOpen(true);
              fetchOptions(inputValue);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pr-8"
          autoComplete="off"
        />
        <ChevronDown
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 transition",
            "text-muted-foreground",
            isOpen && "transform rotate-180"
          )}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground rounded-md border shadow-md">
          {isLoading ? (
            <div className="p-2 text-sm text-muted-foreground">Loading...</div>
          ) : options.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">{emptyMessage}</div>
          ) : (
            <div className="max-h-60 overflow-auto">
              {options.map((option, index) => (
                <div
                  key={option.id}
                  onClick={() => handleSelectOption(option)}
                  className={cn(
                    "flex items-center px-2 py-1.5 text-sm cursor-pointer",
                    "hover:bg-accent hover:text-accent-foreground",
                    highlightedIndex === index && "bg-accent text-accent-foreground",
                    selectedId === option.id && "bg-primary/10"
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedId === option.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.name}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Autocomplete;