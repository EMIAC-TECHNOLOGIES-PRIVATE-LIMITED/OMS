// import { Button } from "@/components/ui/button";
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandItem,
//   CommandList,
// } from "@/components/ui/command";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";

// import { ChevronRight, ChevronLeft } from 'lucide-react';


// interface PaginationControlsRecoilProps {
//   page: number;
//   pageSize: number;
//   totalPages: number;
//   handlePageChange: (page: number, pageSize: number) => void;
// }

// const pageSizeOptions = [
//   { value: 25, label: "25" },
//   { value: 50, label: "50" },
//   { value: 100, label: "100" },
// ];

// function PaginationControlsRecoil(
//   page: number,
//   pageSize: number,
//   totalPages: number,
//   handlePageChange: (page: number, pageSize: number) => void,
// ) {
//   return (
//     <div>
//       <div className="flex items-center space-x-2">
//         <span className="font-medium  text-muted-foreground">Page Size:</span>
//         <Popover>
//           <PopoverTrigger asChild>
//             <Button variant="secondaryFlat" size="sm"
//               role='combobox' className="w-[100px] justify">
//               {selectedPageSize ? selectedPageSize : "Select"}
//               <ArrowDown className="" size={16} />
//             </Button>

//           </PopoverTrigger>
//           <PopoverContent className="p-0" side="right" align="start">
//             <Command>
//               <CommandList>
//                 <CommandEmpty>No results found.</CommandEmpty>
//                 <CommandGroup>
//                   {pageSizeOptions.map((option) => (
//                     <CommandItem
//                       key={option.value}
//                       value={option.value.toString()}
//                       onSelect={(value) => {
//                         const newSize = parseInt(value, 10);
//                         setSelectedPageSize(newSize);
//                         setOpen(false);
//                         // Reset to first page when page size changes
//                         handlePageChange(1, newSize);
//                       }}
//                     >
//                       <span>{option.label}</span>
//                     </CommandItem>
//                   ))}
//                 </CommandGroup>
//               </CommandList>
//             </Command>
//           </PopoverContent>
//         </Popover>
//       </div>




//       <Button
//         variant={"secondaryFlat"}
//         disabled={page === 1}
//         onClick={() => handlePageChange(page - 1, pageSize)}
//       >
//         <ChevronLeft />
//       </Button>

//     </div>
//   )
// }

// export default PaginationControlsRecoil


import React from 'react'

function PaginationControlsRecoil() {
  return (
    <div>PaginationControlsRecoil</div>
  )
}

export default PaginationControlsRecoil