import { Textarea } from "@/components/ui/textarea"
import { CustomCellEditorProps } from "ag-grid-react"
import React, { useEffect, useRef, useState } from "react"

import { Calendar } from "@/components/ui/calendar"

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