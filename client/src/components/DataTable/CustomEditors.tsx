import { Textarea } from "@/components/ui/textarea"
import { CustomCellEditorProps } from "ag-grid-react"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import debounce from 'lodash.debounce';

import { Calendar } from "@/components/ui/calendar"
import { getSiteCategories } from "@/utils/apiService/typeAheadAPI"
import { SiteCategory } from "@/types/adminTable"

export function LargeTextEditor(props: CustomCellEditorProps) {
  const [value, setValue] = useState(props.value)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textAreaRef.current?.focus()
  }, [])

  return (
    <Textarea
      ref={textAreaRef}
      value={value}
      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(e.target.value)
        props.onValueChange(e.target.value)
      }}
      className="scrollbar-thin hover:scrollbar-thumb-slate-600/50 dark:hover:scrollbar-thumb-slate-600/50 scrollbar-track-transparent "
      onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          props.stopEditing()
        }
      }}

      autoFocus
    />
  );
}

export function DateEditor(props: CustomCellEditorProps) {
  const originalValue = useRef(props.value)
  const [date, setDate] = useState<Date | undefined>(() => {
    // Properly parse the ISO string to Date object
    return props.value ? new Date(props.value) : undefined
  })
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Auto-open calendar on edit
  useEffect(() => {
    setIsCalendarOpen(true)
  }, [])

  // Handle clicks outside to close the calendar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false)
        // Make sure to save the current value before closing
        if (date) {
          const formattedDate = formatDate(date)
          props.onValueChange(formattedDate)
        }
        props.api.stopEditing()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [props.api, date])

  const formatDate = (date: Date | undefined) => {
    if (!date) return ''
    // Format as ISO string which AG Grid expects
    return date.toISOString()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.stopPropagation()
      if (!isCalendarOpen) {
        setIsCalendarOpen(true)
      }
    } else if (e.key === 'Escape') {
      e.stopPropagation()
      setDate(originalValue.current ? new Date(originalValue.current) : undefined)
      setIsCalendarOpen(false)
      props.stopEditing()
    }
  }

  return (
    <div
      className="relative w-full h-full flex items-center"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {isCalendarOpen && (
        <div
          ref={popoverRef}
          className="absolute z-50 mt-2 rounded-md shadow-lg bg-white border border-gray-200"
          style={{ top: '100%', left: '0' }}
        >
          <Calendar
            mode="single"
            selected={date}
            defaultMonth={date}
            onSelect={(newDate) => {
              setDate(newDate)
              setIsCalendarOpen(false)
              if (newDate) {
                props.onValueChange(newDate)
              }
              props.api.stopEditing()
            }}
            initialFocus
            className="rounded-md bg-white p-3"
          />
        </div>
      )}
    </div>
  )
}


export function CategoryCellEditor(props: CustomCellEditorProps) {

  const initialValue = props.data['site.categories'];
  const [selectedCategories, setSelectedCategories] = useState<SiteCategory[]>(initialValue);
  const [search, setSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SiteCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounced fetch function for category suggestions
  const fetchCategories = useCallback(
    debounce(async (input: string) => {
      if (input.length < 2) {
        setSuggestions([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await getSiteCategories(input);
        setSuggestions(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    inputRef.current?.focus();
    setIsDropdownOpen(true);
  }, []);

  // Handle clicks outside to save and stop editing
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        saveChanges();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedCategories]);

  // Fetch suggestions when search changes
  useEffect(() => {
    fetchCategories(search);
  }, [search, fetchCategories]);

  const removeCategory = (id: number) => {
    const newSelection = selectedCategories.filter((cat) => cat.id !== id);
    setSelectedCategories(newSelection);
    props.onValueChange(newSelection);
  };

  const addCategory = (category: SiteCategory) => {
    if (!selectedCategories.some(cat => cat.id === category.id)) {
      const newSelection = [...selectedCategories, category];
      setSelectedCategories(newSelection);
      props.onValueChange(newSelection);
      setSearch("");
      inputRef.current?.focus();
    }
  };

  const saveChanges = () => {
    props.onValueChange(selectedCategories);
    props.stopEditing();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      props.stopEditing();
    } else if (e.key === "Enter" && !isDropdownOpen) {
      saveChanges();
    } else if (e.key === "ArrowDown" && suggestions.length > 0) {
      e.preventDefault();
      setIsDropdownOpen(true);
    }
  };

  const filteredSuggestions = suggestions.filter(
    (category) => !selectedCategories.some(cat => cat.id === category.id)
  );

  const popupWidth = Math.max(props.column?.getActualWidth() || 250, 250);

  return (
    <div
      ref={wrapperRef}
      className="bg-white border rounded-md shadow-lg z-50 p-3 flex flex-col"
      style={{ width: `${popupWidth}px`, maxHeight: '400px' }}
      onKeyDown={handleKeyDown}
    >
      <Input
        ref={inputRef}
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setIsDropdownOpen(true);
        }}
        className="focus:ring-brand focus:border-brand mb-2"
        placeholder="Search categories..."
        autoFocus
        onFocus={() => setIsDropdownOpen(true)}
      />

      <div className="flex flex-wrap gap-1 mb-2 max-h-32 overflow-y-auto">
        {selectedCategories.map((category) => (
          <Badge
            key={category.id}
            className="bg-brand/20 text-brand hover:bg-brand/30 border border-brand/30 flex items-center gap-1"
          >
            {category.category}
            <X
              size={14}
              className="cursor-pointer hover:text-red-600"
              onClick={() => removeCategory(category.id)}
            />
          </Badge>
        ))}
      </div>

      {isDropdownOpen && (
        <div className="border border-gray-100 rounded-md max-h-40 overflow-y-auto">
          {loading ? (
            <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
          ) : filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((category) => (
              <div
                key={category.id}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                onClick={() => {
                  addCategory(category);
                  setIsDropdownOpen(true);
                }}
              >
                {category.category}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">
              {search ? "No categories found" : "Type to search categories"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// export function CategoryCellEditor(props: CustomCellEditorProps) {
//   const initialValue = Array.isArray(props.value) ? [...props.value] : [];
//   const [selectedCategories, setSelectedCategories] = useState<number[]>(initialValue);
//   const [search, setSearch] = useState("");
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const wrapperRef = useRef<HTMLDivElement>(null); 

//   const categoryOptions = Object.entries(siteCategories).map(([id, name]) => ({
//     id: parseInt(id),
//     name,
//   }));

//   const filteredCategories = categoryOptions
//     .filter(
//       (category) =>
//         !selectedCategories.includes(category.id) &&
//         category.name.toLowerCase().includes(search.toLowerCase())
//     )
//     .slice(0, 5);

//   useEffect(() => {
//     inputRef.current?.focus();
//     setIsDropdownOpen(true);
//   }, []);

//   // Handle clicks outside to save and stop editing
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
//         saveChanges();
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [selectedCategories]);

//   const removeCategory = (id: number) => {
//     const newSelection = selectedCategories.filter((catId) => catId !== id);
//     setSelectedCategories(newSelection);
//     props.onValueChange(newSelection);
//   };

//   const addCategory = (id: number) => {
//     if (!selectedCategories.includes(id)) {
//       const newSelection = [...selectedCategories, id];
//       setSelectedCategories(newSelection);
//       props.onValueChange(newSelection);
//       setSearch("");
//       inputRef.current?.focus();
//     }
//   };

//   const saveChanges = () => {
//     props.onValueChange(selectedCategories);
//     props.stopEditing();
//   };

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === "Escape") {
//       props.stopEditing();
//     } else if (e.key === "Enter" && !isDropdownOpen) {
//       saveChanges();
//     } else if (e.key === "ArrowDown" && filteredCategories.length > 0) {
//       e.preventDefault();
//       setIsDropdownOpen(true);
//     }
//   };

//   // Calculate popup width based on the cell's width
//   const popupWidth = Math.max(props.column?.getActualWidth() || 250, 250);

//   return (
//     <div 
//       ref={wrapperRef}
//       className="bg-white border rounded-md shadow-lg z-50 p-3 flex flex-col"
//       style={{ width: `${popupWidth}px`, maxHeight: '400px' }}
//       onKeyDown={handleKeyDown}
//     >
//       {/* Search Input */}
//       <Input
//         ref={inputRef}
//         type="text"
//         value={search}
//         onChange={(e) => {
//           setSearch(e.target.value);
//           setIsDropdownOpen(true);
//         }}
//         className="focus:ring-brand focus:border-brand mb-2"
//         placeholder="Search categories..."
//         autoFocus
//         onFocus={() => setIsDropdownOpen(true)}
//       />

//       {/* Selected Categories as Badges */}
//       <div className="flex flex-wrap gap-1 mb-2 max-h-32 overflow-y-auto">
//         {selectedCategories.map((id) => (
//           <Badge
//             key={id}
//             className="bg-brand/20 text-brand hover:bg-brand/30 border border-brand/30 flex items-center gap-1"
//           >
//             {siteCategories[id] || `Category ${id}`}
//             <X
//               size={14}
//               className="cursor-pointer hover:text-red-600"
//               onClick={() => removeCategory(id)}
//             />
//           </Badge>
//         ))}
//       </div>

//       {/* Custom Dropdown */}
//       {isDropdownOpen && (
//         <div className="border border-gray-100 rounded-md max-h-40 overflow-y-auto">
//           {filteredCategories.length > 0 ? (
//             filteredCategories.map((category) => (
//               <div
//                 key={category.id}
//                 className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
//                 onClick={() => {
//                   addCategory(category.id);
//                   setIsDropdownOpen(true); // Keep dropdown open for further selections
//                 }}
//               >
//                 {category.name}
//               </div>
//             ))
//           ) : (
//             search ? (
//               <div className="px-3 py-2 text-sm text-gray-500">
//                 No categories found
//               </div>
//             ) : (
//               <div className="px-3 py-2 text-sm text-gray-500">
//                 All categories selected
//               </div>
//             )
//           )}
//         </div>
//       )}
//     </div>
//   );
// }


