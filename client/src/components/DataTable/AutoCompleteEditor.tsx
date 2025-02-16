import {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from 'react';
import { ICellEditorParams } from 'ag-grid-community';
import debounce from 'lodash.debounce';
import { getSuggestions, getSearchResults } from '../../utils/apiService/typeAheadAPI';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandItem } from '@/components/ui/command';

export interface AutoCompleteEditorHandles {
  getValue: () => any;
  isPopup?: () => boolean;
  isCancelBeforeStart?: () => boolean;
  isCancelAfterEnd?: () => boolean;
}

interface AutoCompleteEditorProps extends ICellEditorParams {
  route: string;
  searchColumn: string;
  onDataSelected?: (data: Record<string, any>, node: any) => void;
}
const AutoCompleteEditor = forwardRef<AutoCompleteEditorHandles, AutoCompleteEditorProps>(
  (props, ref) => {
    const { value, route, searchColumn, onDataSelected } = props;
    const [query, setQuery] = useState<string>(String(value || ''));
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [open, setOpen] = useState<boolean>(true);
    const [isSelecting, setIsSelecting] = useState<boolean>(false);

    const debouncedFetchSuggestions = useMemo(
      () =>
        debounce(async (val: string) => {
          if (!isSelecting) {
            try {
              console.log('Fetching suggestions for:', val);
              const response = await getSuggestions(route, searchColumn, val);
              console.log('Received suggestions:', response);
              setSuggestions(response);

              if (response && response.length > 0) {
                setOpen(true);
              }
            } catch (error) {
              console.error('Error fetching suggestions:', error);
              setSuggestions([]);
            }
          }
        }, 300),
      [route, searchColumn, isSelecting]
    );

    useEffect(() => {
      if (query.length >= 2 && !isSelecting) {
        debouncedFetchSuggestions(query);
      } else {
        setSuggestions([]);
      }
      return () => {
        debouncedFetchSuggestions.cancel();
      };
    }, [query, debouncedFetchSuggestions, isSelecting]);

    const handleSelect = async (item: any) => {
      console.log('Selected item:', item);
      setIsSelecting(true);
      // Use the appropriate field based on the searchColumn
      const displayValue = item[searchColumn] || item.label || item.name || item.value;

      try {
        const result = await getSearchResults(route, item.id);
        console.log('Search results:', result);
        if (result) {
          const colField = props.colDef?.field;
          if (colField) {
            const [prefix] = colField.split('.');

            const updates: Record<string, any> = {
              [colField]: displayValue,
              [`${prefix}.id`]: item.id
            };

            Object.entries(result).forEach(([field, val]) => {
              if (field !== searchColumn) {
                updates[`${prefix}.${field}`] = val;
              }
            });

            const updatedData = { ...props.node.data };
            Object.entries(updates).forEach(([field, val]) => {
              updatedData[field] = val;
            });

            props.node.setData(updatedData);

            if (onDataSelected) {
              onDataSelected(result, props.node);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching full details:', error);
      }

      setQuery(displayValue);
      setOpen(false);

      setTimeout(() => {
        props.api?.stopEditing();
        setIsSelecting(false);
      }, 100);
    };

    const handleInputChange = (newValue: string) => {
      if (!isSelecting) {
        setQuery(newValue);
        setOpen(true);
      }
    };

    useImperativeHandle(ref, () => ({
      getValue: () => query,
      isPopup: () => true,
      isCancelBeforeStart: () => false,
      isCancelAfterEnd: () => false
    }));

    // Helper function to get display value
    const getDisplayValue = (item: any) => {
      return item[searchColumn] || item.label || item.name || item.value;
    };

    return (
      <Popover
        open={open}
        onOpenChange={(newOpen) => !isSelecting && setOpen(newOpen)}
      >
        <PopoverTrigger asChild>
          <input
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => !isSelecting && setOpen(true)}
            placeholder="Type to search..."
            className="w-full p-2 border border-gray-300 rounded"
            autoFocus
          />
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search..."
              value={query}
              onValueChange={handleInputChange}
            />
            <CommandList>
              {suggestions.length > 0 ? (
                suggestions.map((item: any) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => handleSelect(item)}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    {getDisplayValue(item)}
                  </CommandItem>
                ))
              ) : (
                <CommandItem disabled>No results found.</CommandItem>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

AutoCompleteEditor.displayName = 'AutoCompleteEditor';
export default AutoCompleteEditor;