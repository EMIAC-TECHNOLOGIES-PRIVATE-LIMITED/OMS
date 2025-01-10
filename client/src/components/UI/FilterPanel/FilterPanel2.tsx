import { Popover, PopoverTrigger } from '@/components/ui/popover'
import React from 'react'
import { FilterConfig } from '../../../../../shared/src/types'
import { Button } from '@/components/ui/button'
import { ArrowUpDownIcon } from 'lucide-react'

function FilterPanel2(
  resource: string,
  filterConfig: FilterConfig,
  availableColumnTypes: { [key: string]: string },
  onFilterChange: (filter: FilterConfig) => void
) {
  const [isOpen, setIsOpen] = React.useState(false)
  return (
    <div className='reltive'>
      <Popover
        open={isOpen}
        onOpenChange={(open) => !open && handlePanelClose()}
      />
      <PopoverTrigger asChild>
        <Button
          variant="secondaryFlat"
          size="default"
          className={`
              flex items-center gap-2
              transition-colors duration-300 ease-in-out
              (
  (filterConfig.appliedFilters.AND && Object.keys(filterConfig.appliedFilters.AND).length > 0) || 
  (filterConfig.appliedFilters.OR && Object.keys(filterConfig.appliedFilters.OR).length > 0)
)

              ? "bg-blue-100 hover:bg-blue-200 dark:bg-red-900/30 dark:hover:bg-red-900/50"
              : ""}
            `}
          aria-label={`Toggle column visibility. ${filterConfig.appliedFilters.AND ? Object.keys(filterConfig.appliedFilters.AND).length : Object.keys(filterConfig.appliedFilters.OR).length} columns shown`}
          onClick={() => setIsOpen(true)}
        >
          <ArrowUpDownIcon className="w-4 h-4" /
          <span className="hidden sm:block">{`Sorting (${filterConfig.appliedSorting.length})`}</span>
        </Button>
      </PopoverTrigger>
    </div>
  )
}

export default FilterPanel2

function handlePanelClose() {

}